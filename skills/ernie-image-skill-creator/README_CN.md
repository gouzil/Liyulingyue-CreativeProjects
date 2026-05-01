# Ernie Image Skill Creator

一个专门用于创建文生图技能的工具，基于 Ernie Image API，可用于生成各种类型的视觉模板。

## 功能特点

- **创建文生图技能**：快速创建专业的图片生成技能
- **优化提示词**：提供针对不同样式的优化提示词模板
- **验证输出质量**：自动检查生成图片的构图和质量
- **模板系统**：内置多种预设模板和视觉样式
- **灵活布局**：支持自定义布局结构，满足不同场景需求

## 快速开始

### 前置条件

1. Python 3.7+
2. 依赖包：`pip install openai Pillow numpy`
3. API 密钥：从 [Baidu AIStudio](https://aistudio.baidu.com/account/accessToken) 获取

### 环境配置（重要）

**请先检测虚拟环境！**

```bash
# 检测并激活虚拟环境（如果存在）
if [ -d ".venv" ]; then
    echo "检测到 .venv 虚拟环境，正在激活..."
    source .venv/bin/activate
fi

# 安装依赖
pip install openai Pillow numpy

# 设置 API 密钥
export BAIDU_API_KEY="your_api_key"
```

### 创建新技能

```bash
# 使用一键创建脚本
python scripts/create_new_skill.py "my-skill" \
    --description "我的自定义图片生成技能"

# 创建完成后进入目录
cd my-skill
export BAIDU_API_KEY="your_api_key"
python scripts/generate_my_image.py "Your prompt" --save_path test.png
```

### 使用示例技能

**示例1：生成食谱卡片**
```bash
cd recipe-card-generator
python scripts/generate_recipe_template.py "Italian" \
    --style modern \
    --output_dir output/
```

**示例2：创建自定义技能**
```bash
# 创建社交媒体帖子生成器
python scripts/create_new_skill.py "social-media-post" \
    --description "生成社交媒体帖子模板"

# 创建演示文稿幻灯片生成器
python scripts/create_new_skill.py "presentation-slide" \
    --description "生成演示文稿幻灯片模板"

# 创建名片生成器
python scripts/create_new_skill.py "business-card" \
    --description "生成名片模板"

# 创建活动邀请函生成器
python scripts/create_new_skill.py "event-invitation" \
    --description "生成活动邀请函模板"
```

### 验证图片质量

```bash
python scripts/validate_image.py output/image.png --verbose
```

## 适用场景

本技能创建工具可用于创建各种图片生成技能，包括但不限于：

| 场景 | 示例 | 说明 |
|------|------|------|
| **食谱卡片** | recipe-card-generator | 已内置的示例，生成带有食材清单和步骤的食谱卡片 |
| **社交媒体帖子** | social-media-post | 生成带有标题、标签和装饰元素的社交媒体图片 |
| **演示文稿幻灯片** | presentation-slide | 生成带有标题、内容和视觉元素的幻灯片模板 |
| **名片** | business-card | 生成带有Logo、姓名和联系方式的名片模板 |
| **活动邀请函** | event-invitation | 生成带有活动详情和装饰元素的邀请函模板 |
| **产品展示** | product-showcase | 生成带有产品图片和描述的展示卡片 |
| **证书模板** | certificate | 生成带有姓名、日期和装饰边框的证书模板 |
| **海报** | poster | 生成带有标题、图片和文字的海报模板 |

每个技能可以根据具体需求定义自己的布局结构、视觉样式和自定义选项。

## 目录结构

```
ernie-image-skill-creator/
├── SKILL.md                    # 技能文档
├── README_CN.md                # 中文说明文档
├── GUIDE.md                    # 详细使用指南
├── scripts/
│   ├── generate_image.py       # 核心图片生成脚本
│   ├── generate_recipe_template.py  # 食谱卡片模板生成器
│   ├── validate_image.py       # 图片验证脚本
│   └── create_new_skill.py     # 新技能创建脚本
├── assets/                     # 资源文件目录
└── references/
    ├── prompts.md              # 优化的提示词库
    └── styles.md               # 样式指南
```

## 核心脚本

### generate_image.py

核心图片生成脚本，调用 Ernie Image API。

```bash
# 基本使用
python scripts/generate_image.py "Your prompt" --save_path output.png

# 使用优化提示词
python scripts/generate_image.py "Recipe card" \
    --optimized --style modern --cuisine_type Italian \
    --save_path recipe.png
```

### generate_recipe_template.py

食谱卡片模板生成器，支持多种菜系和样式。

```bash
python scripts/generate_recipe_template.py "Chinese" \
    --style rustic --color-scheme warm \
    --output_dir output/
```

### validate_image.py

图片质量验证脚本，检查中心区域清晰度。

```bash
python scripts/validate_image.py image.png --verbose --center-ratio 0.4
```

### create_new_skill.py

一键创建新技能，自动复制脚本和文档。

```bash
python scripts/create_new_skill.py "my-skill" --description "技能描述"
```

## 视觉样式

| 样式 | 描述 | 关键词 |
|------|------|--------|
| 现代 | 简洁线条，无衬线字体 | minimalist, clean, sans-serif |
| 复古 | 手写字体，温暖色调 | vintage, handwritten, aged |
| 优雅 | 衬线字体，金色点缀 | elegant, serif, gold |
| 活泼 | 明亮色彩，圆润形状 | playful, bright, rounded |

## API 配置

- **Base URL**: `https://aistudio.baidu.com/llm/lmapi/v3`
- **Model**: `ernie-image-turbo`
- **认证**: Baidu AIStudio API Key

## 常见问题

### 中心区域不够清晰

```bash
# 增加中心区域比例
--center-ratio 0.5

# 或在提示词中强调
"center area completely empty and clear"
```

### 文本不可读

在提示词中添加：
```
high contrast text, clear typography, readable fonts
```

### API 认证失败

```bash
# 检查环境变量
echo $BAIDU_API_KEY

# 或显式传递
--api_key your_api_key
```

## 示例

### 创建食谱卡片技能

```bash
# 1. 创建技能
python scripts/create_new_skill.py "italian-recipe-card" \
    --description "生成意大利食谱卡片"

# 2. 进入目录
cd italian-recipe-card

# 3. 生成卡片
python scripts/generate_my_image.py "Italian pasta recipe card" \
    --style elegant \
    --save_path italian_recipe.png

# 4. 验证质量
python scripts/validate_image.py italian_recipe.png --verbose
```

## 相关文档

- [SKILL.md](SKILL.md) - 完整技能文档
- [GUIDE.md](GUIDE.md) - 详细使用指南
- [提示词库](references/prompts.md) - 优化的提示词模板
- [样式指南](references/styles.md) - 视觉样式详解

## 许可证

MIT License
