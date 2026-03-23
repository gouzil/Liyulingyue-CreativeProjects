# OpenAIJsonWrapper

轻量级的 OpenAI 响应解析封装。

## 安装

您可以直接将本项目以文件夹形式提交到仓库，或通过本地路径安装：

```bash
pip install -e .
```

或直接从本仓库的 GitHub Release 安装已构建的 wheel：

```bash
pip install "https://github.com/Liyulingyue/CreativeProjects/releases/download/OpenAIJsonWrapper/openai_json_wrapper-0.1.0-py3-none-any.whl"
```

## 打包与分发

如果您需要生成可分发的二进制包（.whl）：

1. 安装打包工具：
   ```bash
   pip install build
   ```
2. 在项目根目录下执行打包：
   ```bash
   python -m build
   ```
   打包完成后，在 `dist/` 目录下会生成 `.whl` 和 `.tar.gz` 文件。

## 功能与用法

提供一个 `OpenAIJsonWrapper` 对象，自动注入 System Prompt 并解析模型输出的 JSON。

```python
from openai import OpenAI
from OpenAIJsonWrapper import OpenAIJsonWrapper

client = OpenAI(api_key="sk-...", base_url="...")

# 定义需要的 JSON 结构
target_structure = {
    "user_info": {
        "name": "string",
        "age": "int",
        "hobbies": ["string"]
    },
    "summary": "string"
}

# 初始化 Wrapper (指定模型和结构)
wrapper = OpenAIJsonWrapper(client, model="gpt-4", target_structure=target_structure)

# 正常传入 messages，框架会自动注入 System Prompt
messages = [{"role": "user", "content": "你好，我是小明，今年 18 岁，喜欢打篮球和听歌。"}]

result = wrapper.chat(messages)

# 获取解析后的结果
if not result["error"]:
    print("解析后的数据:", result["data"])
    print("模型的思维链/正文内容:", result["reasoning"])
else:
    print("解析出错:", result["error"])
```

## 特性

- **自动提示词注入**: 自动在 System Prompt 中包含 JSON 结构定义和标准的 Markdown JSON 代码块标记。
- **健壮解析**: 使用正则表达式精准提取 ` ```json ` 块，并具备自动容错（修复末尾逗号等）和回退提取（寻找最后一个合法的 JSON 对象/数组）能力。
- **极简设计**: 专注于 LLM 工具调用/结构化数据提取任务。
