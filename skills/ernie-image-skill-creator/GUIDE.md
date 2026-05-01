# Ernie Image Skill Creator - 使用指南

## 概述

Ernie Image Skill Creator 是一个专门用于创建文生图技能的工具。它基于传统的 skill-creator，但专门针对文生图业务进行了优化，特别是创建带有中心留白区域的视觉模板。

## 核心功能

1. **创建文生图技能**：帮助用户创建专门用于生成图片的技能
2. **优化提示词**：提供优化的文生图提示词模板
3. **验证输出质量**：检查生成的图片是否符合要求
4. **模板系统**：提供预设的模板和样式

## 快速开始

### 1. 使用现有的 recipe-card-generator

```bash
# 进入 recipe-card-generator 目录
cd recipe-card-generator

# 设置 API 密钥
export BAIDU_API_KEY="your_api_key"

# 生成意大利食谱卡片
python scripts/generate_recipe_template.py "Italian" \
    --style modern \
    --output_dir output/

# 验证生成的图片
python scripts/validate_image.py output/italian_recipe_card.png --verbose
```

### 2. 创建新的文生图技能

#### 步骤 1：定义技能结构

```
my-image-skill/
├── SKILL.md                    # 技能文档
├── scripts/
│   ├── generate_image.py       # 核心图片生成脚本
│   ├── generate_template.py    # 模板生成脚本
│   └── validate_image.py       # 图片验证脚本
├── assets/
│   └── templates/              # 预设模板
└── references/
    ├── prompts.md              # 优化的提示词
    └── styles.md               # 样式指南
```

#### 步骤 2：创建 SKILL.md

```markdown
---
name: my-image-skill
description: 生成带有中心留白区域的视觉模板，用于放置用户自己的内容。
---

# My Image Skill

## 功能
- 生成带有中心留白区域的图片模板
- 支持多种视觉样式
- 提供优化的文生图提示词

## 使用方法
1. 调用生成脚本创建模板
2. 验证中心区域是否清晰
3. 用户在中心区域放置自己的内容
```

#### 步骤 3：复制核心脚本

从 ernie-image-skill-creator 复制以下脚本：

```bash
cp ../ernie-image-skill-creator/scripts/generate_image.py scripts/
cp ../ernie-image-skill-creator/scripts/validate_image.py scripts/
```

#### 步骤 4：创建自定义生成脚本

基于 `generate_recipe_template.py` 创建适合你需求的生成脚本。

## 核心脚本说明

### 1. generate_image.py

核心图片生成脚本，使用 Ernie Image API。

```bash
# 基本使用
python scripts/generate_image.py "Your prompt here" --save_path output.png

# 使用优化的提示词
python scripts/generate_image.py "Recipe card" \
    --optimized --style modern --cuisine_type Italian \
    --save_path recipe_card.png
```

### 2. validate_image.py

验证生成的图片质量。

```bash
# 验证中心区域清晰度
python scripts/validate_image.py image.png --verbose

# 检查特定中心区域比例
python scripts/validate_image.py image.png --center-ratio 0.5
```

### 3. generate_recipe_template.py

食谱卡片模板生成器（示例）。

```bash
# 生成食谱卡片模板
python scripts/generate_recipe_template.py "Italian" \
    --style modern --color-scheme warm \
    --output_dir templates/

# 生成 JSON 规格
python scripts/generate_recipe_template.py "Chinese" \
    --style rustic --json
```

## 提示词优化

### 基础提示词结构

```
[主题描述], [样式描述], [颜色方案], [布局要求], [质量要求]
```

### 示例

```
Professional recipe card template, 
minimalist design, clean lines, sans-serif fonts, 
warm earth tones, golden accents, 
center area taking 40% of total space, clear boundaries, 
high quality, print-ready, 300 DPI
```

### 样式关键词

- **现代**：minimalist, clean lines, sans-serif, white space
- **复古**：vintage, handwritten, aged, organic
- **优雅**：elegant, serif, gold accents, premium
- **活泼**：playful, bright colors, rounded, energetic

## 验证标准

### 中心区域清晰度

- 中心区域应该足够空旷，便于用户放置自己的内容
- 中心区域与周围元素应该有清晰的边界
- 中心区域的亮度应该与周围区域有适当对比

### 整体构图

- 视觉平衡：各个部分的视觉重量应该均衡
- 文本可读性：所有文本应该清晰易读
- 样式一致性：整体风格应该统一

## 最佳实践

### 1. 提示词设计

- **具体明确**：包含具体的尺寸、位置、样式描述
- **避免歧义**：使用清晰的描述，避免模糊词汇
- **测试迭代**：多次测试，根据结果优化提示词

### 2. 布局设计

- **中心区域**：确保中心区域足够大且清晰
- **周围元素**：合理安排周围的装饰元素
- **视觉层次**：建立清晰的视觉层次结构

### 3. 质量控制

- **验证输出**：使用验证脚本检查生成质量
- **用户测试**：让用户测试实际使用体验
- **持续改进**：根据反馈持续优化

## 常见问题

### Q: 中心区域不够清晰怎么办？

A: 尝试以下方法：
1. 增加中心区域比例：`--center-ratio 0.5`
2. 在提示词中强调 "center area completely empty"
3. 尝试不同的样式，有些样式效果更好

### Q: 文本不可读怎么办？

A: 尝试以下方法：
1. 增加对比度
2. 使用更简单的字体样式
3. 在提示词中指定 "high contrast text"

### Q: 样式不符合预期怎么办？

A: 尝试以下方法：
1. 使用更具体的样式描述
2. 组合多个样式关键词
3. 测试不同的样式组合

## 扩展阅读

- `references/prompts.md` - 优化的提示词库
- `references/styles.md` - 详细的样式指南
- `SKILL.md` - 完整的技能文档

## 支持

如有问题，请：
1. 查看本文档的常见问题部分
2. 测试简单提示词
3. 使用验证脚本检查输出
4. 参考现有示例
