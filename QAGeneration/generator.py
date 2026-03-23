import json
import os
from typing import List, Dict, Optional, Any
from OpenAIJsonWrapper import OpenAIJsonWrapper

class QAGenerator:
    """
    自适应 QA 生成器 (QA Generator)。
    专注于生成逻辑，可以通过 planner 接收分布规划建议，动态调整生成质量。
    """
    
    def __init__(
        self,
        client: Any,
        model: str = "gpt-4o",
        background: Optional[str] = None,
        base_requirements: Optional[List[str]] = None
    ):
        self.background = background or "你是一个专业的知识库问答生成专家。"
        self.base_requirements = base_requirements or [
            "仔细阅读文本，识别并提取关键信息点。",
            "针对每个关键信息点，构造一个问题（Q）及其对应的答案（A）。",
            "确保每个 QA 对都有实际意义。"
        ]
        
        # 初始化结构
        self.target_structure = [{"Q": "string", "A": "string"}]
        self.wrapper = OpenAIJsonWrapper(
            client, 
            model=model, 
            target_structure=self.target_structure,
            background=self.background
        )
        
        # 内部状态：生成结果
        self.all_qas = []

    def generate_single(self, text: str, dynamic_requirements: Optional[List[str]] = None, **kwargs) -> List[Dict[str, str]]:
        """
        针对单段文本生成 QA。
        :param text: 输入文本
        :param dynamic_requirements: 由外部规划器（DistributionPlanner）提供的动态调整项
        """
        # 合并基础需求与动态调整提案
        total_reqs = self.base_requirements.copy()
        if dynamic_requirements:
            total_reqs.extend(dynamic_requirements)
        
        # 调用核心包装器进行生成
        result = self.wrapper.chat(
            messages=[{"role": "user", "content": f"输入文本内容：\n{text}"}],
            requirements=total_reqs,
            **kwargs
        )
        
        qas = result.get("data") or []
        if isinstance(qas, dict):
            qas = [qas]
            
        # 内部缓存生成结果
        self.all_qas.extend(qas)
            
        return qas

    def save_to_file(self, path: str):
        """保存为 JSONL 格式以适配模型训练/评估"""
        with open(path, "w", encoding="utf-8") as f:
            for qa in self.all_qas:
                f.write(json.dumps(qa, ensure_ascii=False) + "\n")

