import json
import statistics
from typing import List, Dict, Optional, Any

class DistributionPlanner:
    """
    分布规划器 (Distribution Planner)
    专注于监控数据分布状况（如长度范围），并动态调整生成建议以趋向目标分布。
    例如：追求 Q 长度在 100~500 之间的均匀分布。
    """
    
    def __init__(
        self,
        q_range: tuple = (20, 100),
        a_range: tuple = (50, 300),
        bins: int = 5,
        window_size: int = 20
    ):
        self.q_range = q_range
        self.a_range = a_range
        self.bins = bins
        self.window_size = window_size
        
        # 内部状态：历史长度数据
        self.history_q_lens: List[int] = []
        self.history_a_lens: List[int] = []
        self.total_count = 0

    def record_metrics(self, qas: List[Dict[str, str]]):
        """记录新生成的 QA 指标"""
        for qa in qas:
            q_text = str(qa.get("Q", ""))
            a_text = str(qa.get("A", ""))
            self.history_q_lens.append(len(q_text))
            self.history_a_lens.append(len(a_text))
            self.total_count += 1

    def _get_underserved_range(self, history: List[int], target_range: tuple) -> Optional[float]:
        """
        计算分布中最稀缺的区间。
        返回该区间的建议目标值。
        """
        if not history:
            return sum(target_range) / 2
            
        low, high = target_range
        step = (high - low) / self.bins
        
        # 统计各区间频次 (仅看最近窗口或全量，此处看全量以保证整体分布)
        counts = [0] * self.bins
        for val in history:
            idx = int((val - low) // step)
            if 0 <= idx < self.bins:
                counts[idx] += 1
            elif idx < 0:
                counts[0] += 1
            else:
                counts[-1] += 1
        
        # 找到频次最低的区间索引
        min_idx = counts.index(min(counts))
        # 返回该区间的中心值作为建议目标
        return low + (min_idx + 0.5) * step

    def get_adjustment_requirements(self) -> List[str]:
        """
        根据当前分布状态，寻找“稀缺”区间并给出补齐建议。
        """
        advice = []
        
        if self.total_count > 0:
            suggested_q = self._get_underserved_range(self.history_q_lens, self.q_range)
            suggested_a = self._get_underserved_range(self.history_a_lens, self.a_range)
            
            if suggested_q:
                advice.append(f"【分布规划】当前问题(Q)长度分布不均，请尝试构造一个长度约 {int(suggested_q)} 字的问题。")
            if suggested_a:
                advice.append(f"【分布规划】当前答案(A)长度分布不均，请尝试构造一个长度约 {int(suggested_a)} 字的详细回答。")
        
        return advice

    def get_stats(self) -> Dict[str, Any]:
        """展示分布统计摘要"""
        if not self.history_q_lens:
            return {"status": "no_data"}
            
        return {
            "total": self.total_count,
            "q_range": self.q_range,
            "a_range": self.a_range,
            "latest_q": self.history_q_lens[-1] if self.history_q_lens else 0,
            "latest_a": self.history_a_lens[-1] if self.history_a_lens else 0
        }

