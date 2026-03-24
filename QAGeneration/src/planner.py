import random
from typing import List, Dict, Optional, Any
from .logger import get_logger

logger = get_logger(__name__)

class DistributionPlanner:
    """
    分布规划器 (Distribution Planner)
    专注于监控数据分布状况（如长度范围），并动态调整生成建议以趋向目标分布。
    """
    
    def __init__(
        self,
        q_range: tuple = (20, 200),
        a_range: tuple = (50, 500),
        bins: int = 5,
        q_bins: Optional[int] = None,
        a_bins: Optional[int] = None,
        window_size: int = 20,
        joint: bool = False,
    ):
        self.q_range = q_range
        self.a_range = a_range
        # 支持独立的 q_bins 和 a_bins；若未指定则回退到通用 bins
        self.bins = bins
        self.q_bins = int(q_bins) if q_bins is not None else bins
        self.a_bins = int(a_bins) if a_bins is not None else bins
        self.window_size = window_size
        self.joint = joint
        
        # 内部状态
        self.total_count = 0
        self.latest_q_len = 0
        self.latest_a_len = 0
        
        # joint count matrix
        if self.joint:
            bx, by = self.q_bins, self.a_bins
            self.joint_counts = [[0 for _ in range(by)] for _ in range(bx)]
        else:
            # 在非 joint 模式下，我们维护两个一维计数列表
            self.q_counts = [0] * self.q_bins
            self.a_counts = [0] * self.a_bins
            self.joint_counts = None

    def record_metrics(self, qas: List[Dict[str, str]]):
        """记录新生成的 QA 指标"""
        for qa in qas:
            q_text = str(qa.get("Q", ""))
            a_text = str(qa.get("A", ""))
            qval, aval = len(q_text), len(a_text)
            
            self.latest_q_len = qval
            self.latest_a_len = aval
            self.total_count += 1

            # 统一计算索引
            qlow, qhigh = self.q_range
            alow, ahigh = self.a_range
            
            q_step = (qhigh - qlow) / self.q_bins if self.q_bins > 0 else 1
            a_step = (ahigh - alow) / self.a_bins if self.a_bins > 0 else 1
            
            q_idx = max(0, min(self.q_bins - 1, int((qval - qlow) // q_step)))
            a_idx = max(0, min(self.a_bins - 1, int((aval - alow) // a_step)))

            # 更新计数
            if self.joint and self.joint_counts is not None:
                self.joint_counts[q_idx][a_idx] += 1
            else:
                self.q_counts[q_idx] += 1
                self.a_counts[a_idx] += 1

    def _get_underserved_range(self, target_range: tuple) -> Optional[float]:
        """计算分布中最稀缺的区间"""
        low, high = target_range
        is_q = (target_range == self.q_range)
        bins_count = self.q_bins if is_q else self.a_bins

        if self.joint and self.joint_counts:
            # 从 joint 矩阵降维求和
            if is_q:
                counts = [sum(row) for row in self.joint_counts]
            else:
                counts = [sum(self.joint_counts[i][j] for i in range(self.q_bins)) for j in range(self.a_bins)]
        else:
            # 从独立的一维计数中获取
            counts = self.q_counts if is_q else self.a_counts

        step = (high - low) / bins_count if bins_count > 0 else (high - low)
        min_idx = counts.index(min(counts))
        return low + (min_idx + 0.5) * step

    def _get_underserved_joint(self) -> Optional[tuple]:
        """基于“轮盘赌”采样建议下一个 Q/A 长度组合，概率与 (1-当前占比) 成正比"""
        if not self.joint or not self.joint_counts or self.total_count == 0:
            return None
        
        bx, by = self.q_bins, self.a_bins
        candidates = []
        weights = []
        
        for i in range(bx):
            for j in range(by):
                count = self.joint_counts[i][j]
                ratio = count / self.total_count
                # 反概率权重：占比越小，权重越大。给个 epsilon 防止全 0
                weight = max(0.001, 1.0 - ratio)
                weights.append(weight)
                candidates.append((i, j))

        # 轮盘赌采样一个单元格索引
        chosen_idx = random.choices(candidates, weights=weights, k=1)[0]
        qi, aj = chosen_idx

        # 计算该单元格对应的数值中心点
        qlow, qhigh = self.q_range
        alow, ahigh = self.a_range
        q_step = (qhigh - qlow) / bx if bx > 0 else 1
        a_step = (ahigh - alow) / by if by > 0 else 1
        
        q_center = int(qlow + (qi + 0.5) * q_step)
        a_center = int(alow + (aj + 0.5) * a_step)
        return (q_center, a_center)

    def _get_level_desc(self, length: int, is_q: bool = False) -> str:
        """根据长度返回语义化的等级描述"""
        if length <= 80:
            typ = "概念定义/单一事实" if not is_q else "简短提问"
            return f"[短篇/简练型] (建议目标: {typ}，约{length}字，1-2句)"
        elif length <= 200:
            typ = "原理解析/多点说明" if not is_q else "深度引导提问"
            return f"[中篇/精炼型] (建议目标: {typ}，约{length}字，4-6句)"
        else:
            typ = "综合综述/长篇总结" if not is_q else "全局性综述提问"
            return f"[长篇/详尽型] (建议目标: {typ}，至少{length}字，必须分段并包含背景/推导)"

    def get_adjustment_requirements(self) -> List[str]:
        """给出补齐建议"""
        advice = []
        if self.total_count > 0:
            # joint 优先
            if self.joint:
                joint_sugg = self._get_underserved_joint()
                if joint_sugg:
                    q_target, a_target = joint_sugg
                    q_desc = self._get_level_desc(q_target, is_q=True)
                    a_desc = self._get_level_desc(a_target, is_q=False)
                    advice.append(f"【分布规划】为了平衡数据分布，请严格按照以下【任务类型】构造本组 QA：\n- 问题(Q)风格: {q_desc}\n- 答案(A)风格: {a_desc}")
                    return advice
            
            suggested_q = self._get_underserved_range(self.q_range)
            suggested_a = self._get_underserved_range(self.a_range)
            
            if suggested_q:
                advice.append(f"【分布规则：Q】请尝试构造一个 {self._get_level_desc(int(suggested_q), is_q=True)}")
            if suggested_a:
                advice.append(f"【分布规则：A】请尝试构造一个 {self._get_level_desc(int(suggested_a), is_q=False)}")
        return advice

    def get_stats(self) -> Dict[str, Any]:
        """展示分布统计摘要"""
        if self.total_count == 0:
            return {"status": "no_data"}
        return {
            "total": self.total_count,
            "q_range": self.q_range,
            "a_range": self.a_range,
            "latest_q": self.latest_q_len,
            "latest_a": self.latest_a_len,
            "joint_enabled": self.joint,
            "joint_dims": (self.q_bins, self.a_bins) if self.joint else None,
            "q_bins": self.q_bins,
            "a_bins": self.a_bins,
        }

    def show_distribution(self):
        """记录当前分布的可视化矩阵（以总数为基准的比值显示，防止数值爆炸）到日志"""
        if self.total_count == 0:
            logger.info("Distribution: No data yet.")
            return

        lines = []
        lines.append("\n" + "="*30)
        lines.append(f" DATA DISTRIBUTION (Total: {self.total_count})")
        lines.append("="*30)

        if self.joint and self.joint_counts:
            lines.append(f"Joint Grid Ratio (Q-rows x A-cols):")
            # 打印列序号 (A bins)
            header = "      " + "  ".join(f"A{i:<4}" for i in range(self.a_bins))
            lines.append(header)
            for i, row in enumerate(self.joint_counts):
                # 计算比值并打印
                ratios = [c / self.total_count for c in row]
                line = f"Q{i:<2} | " + "  ".join(f"{r:.2f}" for r in ratios)
                lines.append(line)
        else:
            q_ratios = [c / self.total_count for c in self.q_counts]
            a_ratios = [c / self.total_count for c in self.a_counts]
            lines.append(f"Q Ratio Dist: {[f'{r:.2f}' for r in q_ratios]}")
            lines.append(f"A Ratio Dist: {[f'{r:.2f}' for r in a_ratios]}")
        lines.append("="*30 + "\n")
        
        logger.info("\n".join(lines))
