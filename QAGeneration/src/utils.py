from typing import Iterable, List, Optional
import json

def load_chunks_gen(path: str, chunk_size: int = 1500) -> Iterable[str]:
    """以生成器方式加载文本片段 (支持 .json 和 .jsonl)，适合超大数据集"""
    if path.endswith(".jsonl"):
        with open(path, "r", encoding="utf-8") as f:
            for line in f:
                if not line.strip():
                    continue
                data = json.loads(line)
                content = ""
                if isinstance(data, dict):
                    content = data.get("content") or data.get("text") or str(data)
                else:
                    content = str(data)
                
                # 对当前行的内容进行切分并 yield
                if len(content) <= chunk_size:
                    yield content
                else:
                    for i in range(0, len(content), chunk_size):
                        yield content[i : i + chunk_size]
    else:
        # JSON 暂不支持流式读取整个大列表，但仍保持切分逻辑
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
            raw_contents = []
            if isinstance(data, list):
                raw_contents = [str(x) for x in data]
            else:
                raw_contents = [str(data)]
            
            for text in raw_contents:
                if len(text) <= chunk_size:
                    yield text
                else:
                    for i in range(0, len(text), chunk_size):
                        yield text[i : i + chunk_size]

def load_chunks(path: str, chunk_size: int = 1500) -> List[str]:
    """保留原函数，内部改用生成器实现"""
    return list(load_chunks_gen(path, chunk_size))
