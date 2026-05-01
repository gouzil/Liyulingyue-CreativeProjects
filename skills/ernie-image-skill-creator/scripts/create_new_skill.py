#!/usr/bin/env python3
"""
Create a new image generation skill based on ernie-image-skill-creator.
"""

import os
import sys
import argparse
import shutil
from pathlib import Path

def create_skill_structure(skill_name: str, output_dir: str = "."):
    """
    Create a new skill directory structure.
    
    Args:
        skill_name: Name of the new skill
        output_dir: Output directory
    """
    skill_path = Path(output_dir) / skill_name
    
    # Create directory structure
    directories = [
        skill_path,
        skill_path / "scripts",
        skill_path / "assets" / "templates",
        skill_path / "references"
    ]
    
    for directory in directories:
        directory.mkdir(parents=True, exist_ok=True)
        print(f"Created directory: {directory}")
    
    return skill_path

def copy_scripts(skill_path: Path, ernie_skill_path: Path):
    """
    Copy core scripts from ernie-image-skill-creator.
    
    Args:
        skill_path: Path to the new skill
        ernie_skill_path: Path to ernie-image-skill-creator
    """
    scripts_to_copy = [
        "generate_image.py",
        "validate_image.py"
    ]
    
    for script in scripts_to_copy:
        src = ernie_skill_path / "scripts" / script
        dst = skill_path / "scripts" / script
        
        if src.exists():
            shutil.copy2(src, dst)
            print(f"Copied script: {script}")
        else:
            print(f"Warning: Script not found: {src}")

def copy_references(skill_path: Path, ernie_skill_path: Path):
    """
    Copy reference files from ernie-image-skill-creator.
    
    Args:
        skill_path: Path to the new skill
        ernie_skill_path: Path to ernie-image-skill-creator
    """
    refs_to_copy = [
        "prompts.md",
        "styles.md"
    ]
    
    for ref in refs_to_copy:
        src = ernie_skill_path / "references" / ref
        dst = skill_path / "references" / ref
        
        if src.exists():
            shutil.copy2(src, dst)
            print(f"Copied reference: {ref}")
        else:
            print(f"Warning: Reference not found: {src}")

def create_skill_md(skill_path: Path, skill_name: str, description: str):
    """
    Create SKILL.md file.
    
    Args:
        skill_path: Path to the new skill
        skill_name: Name of the skill
        description: Skill description
    """
    skill_md_content = f"""---
name: {skill_name}
description: {description}
---

# {skill_name.replace('-', ' ').title()}

{description}

## 功能

- 生成带有中心留白区域的视觉模板
- 支持多种视觉样式
- 提供优化的文生图提示词
- 验证生成图片质量

## 快速开始

### 1. 设置 API 密钥

```bash
export BAIDU_API_KEY="your_api_key"
```

### 2. 生成图片模板

```bash
python scripts/generate_image.py "Your prompt here" \\
    --optimized --style modern \\
    --save_path output.png
```

### 3. 验证生成质量

```bash
python scripts/validate_image.py output.png --verbose
```

## 自定义生成脚本

基于 `generate_image.py` 创建适合你需求的生成脚本。

## 参考文档

- `references/prompts.md` - 优化的提示词库
- `references/styles.md` - 详细的样式指南
"""
    
    skill_md_path = skill_path / "SKILL.md"
    with open(skill_md_path, 'w') as f:
        f.write(skill_md_content)
    
    print(f"Created SKILL.md: {skill_md_path}")

def create_example_script(skill_path: Path, skill_name: str):
    """
    Create an example generation script.
    
    Args:
        skill_path: Path to the new skill
        skill_name: Name of the skill
    """
    script_content = f'''#!/usr/bin/env python3
"""
Example generation script for {skill_name}.
"""

import os
import sys
import argparse
from pathlib import Path

# Add scripts directory to path
sys.path.insert(0, str(Path(__file__).parent))

from generate_image import generate_image_with_optimized_prompt

def main():
    parser = argparse.ArgumentParser(description="Generate images for {skill_name}")
    parser.add_argument("prompt", help="Base prompt for image generation")
    parser.add_argument("--style", default="modern",
                       choices=["modern", "rustic", "elegant", "playful"],
                       help="Visual style")
    parser.add_argument("--save_path", default="output.png",
                       help="Path to save the generated image")
    parser.add_argument("--center_ratio", type=float, default=0.4,
                       help="Center area ratio (0.0 to 1.0)")
    parser.add_argument("--api_key", default=os.getenv("BAIDU_API_KEY"),
                       help="API key (or set BAIDU_API_KEY env var)")
    
    args = parser.parse_args()
    
    if not args.api_key:
        print("Error: API key not provided. Set BAIDU_API_KEY environment variable or use --api_key")
        return
    
    # Generate image with optimized prompt
    result = generate_image_with_optimized_prompt(
        base_prompt=args.prompt,
        style=args.style,
        center_area_ratio=args.center_ratio,
        api_key=args.api_key,
        save_path=args.save_path
    )
    
    if result["success"]:
        print(f"Image generated successfully!")
        print(f"Saved to: {{result['save_path']}}")
        print(f"Size: {{result['size']}}")
        
        # Validate the generated image
        from validate_image import analyze_center_area, validate_composition
        
        center_result = analyze_center_area(args.save_path, args.center_ratio)
        comp_result = validate_composition(args.save_path)
        
        if center_result["success"] and comp_result["success"]:
            print("\\nValidation Results:")
            print(f"  Center clear: {{'✓' if center_result['center_clear'] else '✗'}}")
            print(f"  Good aspect: {{'✓' if comp_result['good_aspect'] else '✗'}}")
            print(f"  Good contrast: {{'✓' if comp_result['good_contrast'] else '✗'}}")
            print(f"  Good balance: {{'✓' if comp_result['good_balance'] else '✗'}}")
    else:
        print(f"Error: {{result['error']}}")

if __name__ == "__main__":
    main()
'''
    
    script_path = skill_path / "scripts" / "generate_my_image.py"
    with open(script_path, 'w') as f:
        f.write(script_content)
    
    # Make script executable
    os.chmod(script_path, 0o755)
    
    print(f"Created example script: {script_path}")

def create_readme(skill_path: Path, skill_name: str, description: str):
    """
    Create README.md file.
    
    Args:
        skill_path: Path to the new skill
        skill_name: Name of the skill
        description: Skill description
    """
    readme_content = f"""# {skill_name.replace('-', ' ').title()}

{description}

## 功能

- 生成带有中心留白区域的视觉模板
- 支持多种视觉样式
- 提供优化的文生图提示词
- 验证生成图片质量

## 快速开始

### 前置条件

1. Python 3.7+
2. 依赖包：`pip install openai Pillow numpy`
3. API 密钥：从 [Baidu AIStudio](https://aistudio.baidu.com/account/accessToken) 获取

### 设置

```bash
# 设置 API 密钥
export BAIDU_API_KEY="your_api_key"

# 进入技能目录
cd {skill_name}
```

### 生成图片

```bash
# 基本使用
python scripts/generate_my_image.py "Your prompt here" \\
    --style modern \\
    --save_path output.png

# 验证生成质量
python scripts/validate_image.py output.png --verbose
```

## 自定义选项

### 视觉样式

- **现代**：简洁线条，无衬线字体，极简主义
- **复古**：复古纹理，手写字体，温暖色调
- **优雅**：衬线字体，金色点缀，高端质感
- **活泼**：明亮色彩，圆润形状，趣味排版

### 中心区域比例

调整中心留白区域的大小：

```bash
python scripts/generate_my_image.py "Your prompt" \\
    --center_ratio 0.5 \\
    --save_path output.png
```

## 文件结构

```
{skill_name}/
├── SKILL.md                    # 技能文档
├── README.md                   # 本文件
├── scripts/
│   ├── generate_image.py       # 核心图片生成脚本
│   ├── generate_my_image.py    # 自定义生成脚本示例
│   └── validate_image.py       # 图片验证脚本
├── assets/
│   └── templates/              # 预设模板
└── references/
    ├── prompts.md              # 优化的提示词库
    └── styles.md               # 样式指南
```

## 参考文档

- `references/prompts.md` - 优化的提示词库
- `references/styles.md` - 详细的样式指南
- `SKILL.md` - 完整的技能文档

## 支持

如有问题，请：
1. 查看参考文档
2. 测试简单提示词
3. 使用验证脚本检查输出
4. 参考现有示例
"""
    
    readme_path = skill_path / "README.md"
    with open(readme_path, 'w') as f:
        f.write(readme_content)
    
    print(f"Created README.md: {readme_path}")

def main():
    parser = argparse.ArgumentParser(description="Create a new image generation skill")
    parser.add_argument("skill_name", help="Name of the new skill")
    parser.add_argument("--description", 
                       default="A skill for generating images with designated areas for user content.",
                       help="Skill description")
    parser.add_argument("--output_dir", default=".",
                       help="Output directory")
    parser.add_argument("--ernie_skill_path", 
                       default="/home/liyulingyue/.agents/skills/ernie-image-skill-creator",
                       help="Path to ernie-image-skill-creator")
    
    args = parser.parse_args()
    
    print(f"Creating new skill: {args.skill_name}")
    print("=" * 50)
    
    # Create skill structure
    skill_path = create_skill_structure(args.skill_name, args.output_dir)
    
    # Copy scripts
    print("\nCopying scripts...")
    copy_scripts(skill_path, Path(args.ernie_skill_path))
    
    # Copy references
    print("\nCopying references...")
    copy_references(skill_path, Path(args.ernie_skill_path))
    
    # Create SKILL.md
    print("\nCreating SKILL.md...")
    create_skill_md(skill_path, args.skill_name, args.description)
    
    # Create example script
    print("\nCreating example script...")
    create_example_script(skill_path, args.skill_name)
    
    # Create README.md
    print("\nCreating README.md...")
    create_readme(skill_path, args.skill_name, args.description)
    
    print("\n" + "=" * 50)
    print(f"Skill '{args.skill_name}' created successfully!")
    print(f"Location: {skill_path}")
    print("\nNext steps:")
    print(f"1. cd {skill_path}")
    print("2. export BAIDU_API_KEY='your_api_key'")
    print("3. python scripts/generate_my_image.py 'Your prompt' --save_path test.png")

if __name__ == "__main__":
    main()
