import json
from typing import List

def make_qa_prompt(text: str) -> str:
    """生成 QA 转换的提示词"""
    return f"输入文本内容如下：\n{text}"

def get_qa_requirements() -> List[str]:
    """获取 QA 生成的特定要求"""
    return [
        "仔细阅读文本，识别并提取出关键信息点。",
        "针对每个关键信息点，构造一个问题（Q）及其对应的答案（A）。",
        "如果没有发现有价值的信息，可以返回一个空数组。",
        "返回的QA对数量应尽可能多，但确保每个QA对都有实际意义。"
    ]

def get_qa_background() -> str:
    """获取 QA 生成的背景信息"""
    return "你正在处理一段文本内容，需要将其转化为问答（QA）格式。"

def load_chunks(path: str) -> List[str]:
    """加载文本片段 (支持 .json 和 .jsonl)"""
    if path.endswith(".jsonl"):
        chunks = []
        with open(path, "r", encoding="utf-8") as f:
            for line in f:
                if line.strip():
                    data = json.loads(line)
                    # 假设 jsonl 中每行是一个 dict，内容在 'content' 或 'text' 字段，或者就是字符串
                    if isinstance(data, dict):
                        content = data.get("content") or data.get("text") or str(data)
                        chunks.append(content)
                    else:
                        chunks.append(str(data))
        return chunks
    
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def save_results(data: List[dict], path: str) -> None:
    """保存结果到文件"""
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
