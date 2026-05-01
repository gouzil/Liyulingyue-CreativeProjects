# Ernie Image Skill Creator

A specialized tool for creating image generation skills based on Ernie Image API, which can be used to generate various types of visual templates.

## Features

- **Create Image Generation Skills**: Quickly create professional image generation skills
- **Optimize Prompts**: Provide optimized prompt templates for different styles
- **Validate Output Quality**: Automatically check image composition and quality
- **Template System**: Built-in preset templates and visual styles
- **Flexible Layout**: Support custom layout structures for different scenarios

## Quick Start

### Prerequisites

1. Python 3.7+
2. Dependencies: `pip install openai Pillow numpy`
3. API Key: Get from [Baidu AIStudio](https://aistudio.baidu.com/account/accessToken)

### Environment Setup (Important)

**Please check for virtual environment first!**

```bash
# Check and activate virtual environment if exists
if [ -d ".venv" ]; then
    echo "Found .venv virtual environment, activating..."
    source .venv/bin/activate
fi

# Install dependencies
pip install openai Pillow numpy

# Set API key
export BAIDU_API_KEY="your_api_key"
```

### Create New Skill

```bash
# Use one-click creation script
python scripts/create_new_skill.py "my-skill" \
    --description "My custom image generation skill"

# Enter directory after creation
cd my-skill
export BAIDU_API_KEY="your_api_key"
python scripts/generate_my_image.py "Your prompt" --save_path test.png
```

### Use Example Skill

**Example 1: Generate Recipe Card**
```bash
cd recipe-card-generator
python scripts/generate_recipe_template.py "Italian" \
    --style modern \
    --output_dir output/
```

**Example 2: Create Custom Skills**
```bash
# Create social media post generator
python scripts/create_new_skill.py "social-media-post" \
    --description "Generate social media post templates"

# Create presentation slide generator
python scripts/create_new_skill.py "presentation-slide" \
    --description "Generate presentation slide templates"

# Create business card generator
python scripts/create_new_skill.py "business-card" \
    --description "Generate business card templates"

# Create event invitation generator
python scripts/create_new_skill.py "event-invitation" \
    --description "Generate event invitation templates"
```

### Validate Image Quality

```bash
python scripts/validate_image.py output/image.png --verbose
```

## Applicable Scenarios

This skill creation tool can be used to create various image generation skills, including but not limited to:

| Scenario | Example | Description |
|----------|---------|-------------|
| **Recipe Cards** | recipe-card-generator | Built-in example, generates recipe cards with ingredients and steps |
| **Social Media Posts** | social-media-post | Generate social media images with captions, hashtags, and decorative elements |
| **Presentation Slides** | presentation-slide | Generate slide templates with titles, content, and visual elements |
| **Business Cards** | business-card | Generate business card templates with logo, name, and contact info |
| **Event Invitations** | event-invitation | Generate invitation templates with event details and decorative elements |
| **Product Showcases** | product-showcase | Generate product showcase cards with product images and descriptions |
| **Certificates** | certificate | Generate certificate templates with names, dates, and decorative borders |
| **Posters** | poster | Generate poster templates with titles, images, and text |

Each skill can define its own layout structure, visual style, and customization options based on specific requirements.

## Directory Structure

```
ernie-image-skill-creator/
├── SKILL.md                    # Skill documentation
├── README.md                   # Chinese documentation
├── README_en.md                # English documentation
├── GUIDE.md                    # Detailed usage guide
├── scripts/
│   ├── generate_image.py       # Core image generation script
│   ├── generate_recipe_template.py  # Recipe card template generator
│   ├── validate_image.py       # Image validation script
│   └── create_new_skill.py     # New skill creation script
├── assets/                     # Resource files directory
└── references/
    ├── prompts.md              # Optimized prompt library
    └── styles.md               # Style guide
```

## Core Scripts

### generate_image.py

Core image generation script, calls Ernie Image API.

```bash
# Basic usage
python scripts/generate_image.py "Your prompt" --save_path output.png

# Use optimized prompts
python scripts/generate_image.py "Recipe card" \
    --optimized --style modern --cuisine_type Italian \
    --save_path recipe.png
```

### generate_recipe_template.py

Recipe card template generator, supports multiple cuisines and styles.

```bash
python scripts/generate_recipe_template.py "Chinese" \
    --style rustic --color-scheme warm \
    --output_dir output/
```

### validate_image.py

Image quality validation script, checks center area clarity.

```bash
python scripts/validate_image.py image.png --verbose --center-ratio 0.4
```

### create_new_skill.py

One-click new skill creation, automatically copies scripts and documentation.

```bash
python scripts/create_new_skill.py "my-skill" --description "Skill description"
```

## Visual Styles

| Style | Description | Keywords |
|-------|-------------|----------|
| Modern | Clean lines, sans-serif fonts | minimalist, clean, sans-serif |
| Vintage | Handwritten fonts, warm tones | vintage, handwritten, aged |
| Elegant | Serif fonts, gold accents | elegant, serif, gold |
| Playful | Bright colors, rounded shapes | playful, bright, rounded |

## API Configuration

- **Base URL**: `https://aistudio.baidu.com/llm/lmapi/v3`
- **Model**: `ernie-image-turbo`
- **Authentication**: Baidu AIStudio API Key

## FAQ

### Center area not clear enough

```bash
# Method 1: Increase center area ratio
--center-ratio 0.5

# Method 2: Emphasize in prompt
"center area completely empty and clear"
```

### Text not readable

Add to prompt:
```
high contrast text, clear typography, readable fonts
```

### API authentication failed

```bash
# Check environment variable
echo $BAIDU_API_KEY

# Or pass explicitly
--api_key your_api_key
```

## Examples

### Create Recipe Card Skill

```bash
# 1. Create skill
python scripts/create_new_skill.py "italian-recipe-card" \
    --description "Generate Italian recipe cards"

# 2. Enter directory
cd italian-recipe-card

# 3. Generate card
python scripts/generate_my_image.py "Italian pasta recipe card" \
    --style elegant \
    --save_path italian_recipe.png

# 4. Validate quality
python scripts/validate_image.py italian_recipe.png --verbose
```

## Related Documentation

- [SKILL.md](SKILL.md) - Complete skill documentation
- [GUIDE.md](GUIDE.md) - Detailed usage guide
- [Prompt Library](references/prompts.md) - Optimized prompt templates
- [Style Guide](references/styles.md) - Visual style details

## License

MIT License
