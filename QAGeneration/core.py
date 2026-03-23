import json
import statistics
import os
from typing import List, Dict, Optional, Any
from OpenAIJsonWrapper import OpenAIJsonWrapper

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
        """计算分布中最稀缺的区间"""
        if not history:
            return sum(target_range) / 2
            
        low, high = target_range
        step = (high - low) / self.bins
        
        counts = [0] * self.bins
        for val in history:
            idx = int((val - low) // step)
            if 0 <= idx < self.bins:
                counts[idx] += 1
            elif idx < 0:
                counts[0] += 1
            else:
                counts[-1] += 1
        
        min_idx = counts.index(min(counts))
        return low + (min_idx + 0.5) * step

    def get_adjustment_requirements(self) -> List[str]:
        """给出补齐建议"""
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
            "latest_q": self.history_q_lens[-1],
            "latest_a": self.history_a_lens[-1]
        }

class QAGenerator:
    """
    自适应 QA 生成器 (QA Generator)。
    """
    
    def __init__(
        self,
        client: Any,
        model: str = "gpt-4o",
        background: Optional[str] = None,
        base_requirements: Optional[List[str]] = None
    ):
        self.background = background or "你是一个专业的知识库问答生成专家。你正在处理一段文本内容，需要将其转化为问答（QA）格式。"
        self.base_requirements = base_requirements or [
            "仔细阅读文本，识别并提取关键信息点。",
            "针对每个关键信息点，构造一个问题（Q）及其对应的答案（A）。",
            "确保每个 QA 对都有实际意义。"
        ]
        
        self.target_structure = [{"Q": "string", "A": "string"}]
        self.wrapper = OpenAIJsonWrapper(
            client, 
            model=model, 
            target_structure=self.target_structure,
            background=self.background
        )
        self.all_qas = []

    def generate_single(self, text: str, dynamic_requirements: Optional[List[str]] = None, **kwargs) -> List[Dict[str, str]]:
        total_reqs = self.base_requirements.copy()
        if dynamic_requirements:
            total_reqs.extend(dynamic_requirements)
        
        result = self.wrapper.chat(
            messages=[{"role": "user", "content": f"输入文本内容：\n{text}"}],
            requirements=total_reqs,
            **kwargs
        )
        
        qas = result.get("data") or []
        if isinstance(qas, dict):
            qas = [qas]
        self.all_qas.extend(qas)
        return qas

    def save_to_file(self, path: str):
        """保存为 JSONL 格式"""
        with open(path, "w", encoding="utf-8") as f:
            for qa in self.all_qas:
                f.write(json.dumps(qa, ensure_ascii=False) + "\n")

def load_chunks(path: str) -> List[str]:
    """加载文本片段 (支持 .json 和 .jsonl)"""
    if path.endswith(".jsonl"):
        chunks = []
        with open(path, "r", encoding="utf-8") as f:
            for line in f:
                if line.strip():
                    data = json.loads(line)
                    if isinstance(data, dict):
                        content = data.get("content") or data.get("text") or str(data)
                        chunks.append(content)
                    else:
                        chunks.append(str(data))
        return chunks
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)
