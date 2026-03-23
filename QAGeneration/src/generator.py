import json
from typing import Any, Dict, List, Optional
from OpenAIJsonWrapper import OpenAIJsonWrapper

class QAGenerator:
    """
    自适应 QA 生成器 (QA Generator)。
    专注于生成逻辑，可以通过外部提供动态需求。
    """
    
    def __init__(
        self,
        client: Any,
        model: str = "gpt-4o",
        background: Optional[str] = None,
        base_requirements: Optional[List[str]] = None,
        output_path: Optional[str] = None
    ):
        self.background = background or "你是一个专业的知识库问答生成专家。你正在处理一段文本内容，需要将其转化为问答（QA）格式。"
        self.base_requirements = base_requirements or [
            "仔细阅读文本，识别并提取关键信息点。",
            "针对每个关键信息点，构造一个问题（Q）及其对应的答案（A）。",
            "确保每个 QA 对都有实际意义。"
        ]
        
        self.output_path = output_path
        self.target_structure = [{"Q": "string", "A": "string"}]
        self.wrapper = OpenAIJsonWrapper(
            client, 
            model=model, 
            target_structure=self.target_structure,
            background=self.background
        )
        self.all_qas = []

    def generate_single(self, text: str, dynamic_requirements: Optional[List[str]] = None, **kwargs) -> List[Dict[str, str]]:
        """
        针对单段文本生成 QA。
        """
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
        
        if qas:
            self.all_qas.extend(qas)
            # 如果指定了输出路径，则立即追加写入文件
            if self.output_path:
                self._append_to_file(qas)
                
        return qas

    def _append_to_file(self, qas: List[Dict[str, str]]):
        """流式追加写入文件"""
        with open(self.output_path, "a", encoding="utf-8") as f:
            for qa in qas:
                f.write(json.dumps(qa, ensure_ascii=False) + "\n")

    def save_to_file(self, path: str = None):
        """保存所有 QA。如果已经流式写入过，则此操作通常是可选的或用于另存为。"""
        target_path = path or self.output_path
        if not target_path:
            return
            
        with open(target_path, "w", encoding="utf-8") as f:
            for qa in self.all_qas:
                f.write(json.dumps(qa, ensure_ascii=False) + "\n")
