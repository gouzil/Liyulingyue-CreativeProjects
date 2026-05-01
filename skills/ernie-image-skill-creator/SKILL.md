---
name: ernie-image-skill-creator
description: Create skills for generating images using AI text-to-image models. Specialized for creating skills that generate visual cards, templates, and compositions with structured layouts. Use when users want to create skills for generating recipe cards, visual templates, social media graphics, presentations, business cards, or any image composition with customizable layouts and styles.
---

# Ernie Image Skill Creator

A specialized skill creator for building skills that generate images using AI text-to-image models. This skill focuses on creating structured visual compositions with customizable layouts and styles.

## Core Concept

Traditional skills generate text or code. This skill creates skills that generate **visual templates** - images with structured layouts that can be customized for various purposes:
- Define layout structure with specific elements and positions
- Apply visual styles (modern, rustic, elegant, etc.)
- Generate consistent, professional-looking images based on user requirements

## When to Use This Skill

Use this skill when users want to:
1. Create a skill for generating visual cards or templates
2. Build skills that combine AI-generated imagery with user content
3. Design skills for recipe cards, social media posts, presentations, etc.
4. Create skills that optimize text-to-image prompts for specific visual styles

## Applicable Scenarios

This skill creator can be used to build various image generation skills, including but not limited to:

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

## Creating an Image Generation Skill

### Step 1: Understand the Visual Template

First, clarify what the user wants to create:
1. What is the purpose of the image? (recipe card, social media post, etc.)
2. What should be in the center/user-editable area?
3. What should surround the center? (ingredients, steps, decorations)
4. What visual style is desired? (realistic, cartoon, minimalist, etc.)

### Step 2: Design the Layout Structure

Create a clear layout description:
```
+---------------------------+
|      Background/Border    |
|  +---------------------+  |
|  |   Surrounding Area  |  |
|  |  +---------------+  |  |
|  |  | User Content  |  |  |
|  |  |   (Center)    |  |  |
|  |  +---------------+  |  |
|  |   More Surrounding  |  |
|  +---------------------+  |
|      Background/Border    |
+---------------------------+
```

### Step 3: Create the SKILL.md

The skill should include:

#### Frontmatter
```yaml
---
name: [skill-name]
description: [Detailed description including when to use this skill, what it generates, and specific phrases that should trigger it. Be "pushy" about triggering.]
---
```

#### Layout Specification
Define the exact layout with:
- **Center area**: Dimensions, position, what goes here (user's photo/content)
- **Surrounding elements**: What goes around the center (ingredients, steps, decorations)
- **Style guidelines**: Colors, fonts, visual style

#### Prompt Engineering
Include optimized prompts for the text-to-image model:
- Base prompt for the overall composition
- Specific prompts for different sections
- Negative prompts to avoid common issues

#### Customization Parameters
Define what users can customize:
- Content for the center area
- Specific surrounding elements
- Color schemes, styles
- Text overlays

### Step 4: Create Template Examples

For common use cases, create template files:

#### Recipe Card Template
```
Center: Empty plate/dish area for user's food photo
Surrounding: 
- Top: Recipe title
- Left: Ingredient list with icons
- Right: Step-by-step instructions
- Bottom: Preparation time, servings
```

#### Social Media Post Template
```
Center: User's photo/graphic area
Surrounding:
- Top: Caption/headline
- Bottom: Hashtags, call-to-action
- Sides: Decorative elements
```

### Step 5: Implement Prompt Optimization

The skill should guide users through:
1. **Initial prompt creation**: Based on their requirements
2. **Iterative refinement**: Testing and improving prompts
3. **Style consistency**: Ensuring generated images match the desired aesthetic
4. **Composition control**: Ensuring the center area remains clear for user content

## Example Skills

This skill creator can be used to build various image generation skills. Here are some examples:

### Example 1: Recipe Card Skill
[Full example below]

### SKILL.md Structure
```markdown
---
name: recipe-card-generator
description: Generate beautiful recipe cards with designated areas for your food photos. Creates professional-looking cards with ingredients list, cooking steps, and a central area for your actual dish photo. Use when users mention recipe cards, cooking guides, food templates, or want to document their recipes visually.
---

# Recipe Card Generator

## What This Skill Does
Generates recipe card templates where users can place their own food photos in the center, surrounded by ingredients and cooking instructions.

## Layout Structure
- **Center**: Empty plate/dish area (user places their photo here)
- **Top**: Recipe title with decorative elements
- **Left**: Ingredient list with measurements
- **Right**: Step-by-step cooking instructions
- **Bottom**: Preparation time, cooking time, servings

## Prompt Templates

### Base Prompt
"Professional recipe card template, clean white background, elegant typography, [cuisine type] recipe layout, center area left empty for food photo, surrounded by ingredient list and cooking steps, high quality, print-ready"

### Style Variations
- **Modern**: "minimalist design, sans-serif fonts, clean lines"
- **Rustic**: "vintage paper texture, handwritten-style fonts, warm colors"
- **Elegant**: "gourmet presentation, serif fonts, gold accents"

## Customization
Users can specify:
1. Cuisine type (Italian, Chinese, Mexican, etc.)
2. Visual style (modern, rustic, elegant, playful)
3. Color scheme
4. Specific ingredients to highlight
5. Number of steps

## Generation Process
1. User provides recipe name and ingredients
2. Skill optimizes prompt for chosen style
3. Generate image with clear center area
4. User places their food photo in the center
5. Final card is ready to share
```

### Example 2: Social Media Post Skill

Create a skill for generating social media post templates:
- **Center**: User's photo/graphic area
- **Top**: Caption/headline
- **Bottom**: Hashtags, call-to-action
- **Sides**: Decorative elements

### Example 3: Presentation Slide Skill

Create a skill for generating presentation slide templates:
- **Center**: Main content area
- **Top**: Title and subtitle
- **Bottom**: Key points or summary
- **Sides**: Visual elements and branding

### Example 4: Business Card Skill

Create a skill for generating business card templates:
- **Center**: Logo or visual element
- **Top**: Name and title
- **Bottom**: Contact information
- **Sides**: Professional design elements

### Example 5: Event Invitation Skill

Create a skill for generating event invitation templates:
- **Center**: Event details or photo
- **Top**: Event title
- **Bottom**: RSVP information
- **Sides**: Decorative elements matching event theme

## Advanced Features

### Multi-Image Composition
For complex templates, consider generating multiple layers:
1. Background layer
2. Surrounding elements layer
3. Center placeholder layer
User combines these with their own content.

### Template Library
Create a library of pre-designed templates:
- Recipe cards (breakfast, lunch, dinner, desserts)
- Social media posts (Instagram, Facebook, Twitter)
- Presentation slides
- Business cards
- Event invitations

### Style Transfer
Allow users to:
- Upload a reference image for style
- Choose from predefined styles
- Mix multiple styles

## Testing the Skill

### Test Cases
Create test prompts that verify:
1. Center area remains clear for user content
2. Surrounding elements are properly placed
3. Visual style matches specifications
4. Text is readable and well-positioned
5. Overall composition is balanced

### Evaluation Criteria
- **Center clarity**: Is the center area clearly defined and empty?
- **Element placement**: Are surrounding elements properly positioned?
- **Style consistency**: Does the output match the requested style?
- **Text readability**: Is all text clear and legible?
- **Overall balance**: Is the composition visually balanced?

## Resources

### Template Files
Create template files in `assets/templates/` for common use cases.

### Prompt Library
Store optimized prompts in `references/prompts.md` for different styles and layouts.

### Style Guides
Include style guides in `references/styles.md` for consistent visual output.

## API Integration

### Ernie Image API
This skill uses the Ernie Image API via OpenAI-compatible protocol. The API is accessed through the `openai` Python package.

#### API Configuration
- **Base URL**: `https://aistudio.baidu.com/llm/lmapi/v3`
- **Model**: `ernie-image-turbo`
- **Authentication**: API key from [Baidu AIStudio](https://aistudio.baidu.com/account/accessToken)

#### Environment Setup

**IMPORTANT: Check for virtual environment first!**

Before running any scripts, check if a `.venv` virtual environment exists in the current directory:

```bash
# Check if .venv exists
if [ -d ".venv" ]; then
    echo "Found .venv virtual environment, activating..."
    source .venv/bin/activate
fi

# Install dependencies
pip install openai Pillow numpy

# Set API key
export BAIDU_API_KEY="your_api_key"
```

Or manually:
1. Check for `.venv`: `ls -la | grep .venv`
2. If exists, activate: `source .venv/bin/activate`
3. Install dependencies: `pip install openai Pillow numpy`
4. Set API key: `export BAIDU_API_KEY="your_api_key"`
5. Or pass via parameter: `--api_key your_api_key`

### Using the Scripts

#### Image Generation Script
```bash
# Basic usage
python scripts/generate_image.py "Your prompt here" --save_path output.png

# With style optimization
python scripts/generate_image.py "Recipe card for Italian pasta" \
    --optimized --style modern --cuisine_type Italian \
    --save_path recipe_card.png

# Batch generation
python scripts/generate_image.py "Prompt 1" "Prompt 2" --output_dir batch_output
```

#### Recipe Template Generator
```bash
# Generate recipe card template
python scripts/generate_recipe_template.py "Italian" \
    --style elegant --color-scheme warm \
    --output_dir templates/

# Generate JSON specification
python scripts/generate_recipe_template.py "Chinese" \
    --style rustic --json
```

#### Image Validation
```bash
# Validate center area clarity
python scripts/validate_image.py generated_image.png --verbose

# Check composition quality
python scripts/validate_image.py recipe_card.png --center-ratio 0.5
```

## Creating a Complete Skill

### Step 1: Define the Skill Structure
```
my-image-skill/
├── SKILL.md
├── scripts/
│   ├── generate.py          # Main generation script
│   └── validate.py          # Validation script
├── assets/
│   └── templates/           # Pre-designed templates
└── references/
    ├── prompts.md           # Optimized prompts
    └── styles.md            # Style guides
```

### Step 2: Write the SKILL.md
Include:
- Clear description of what the skill generates
- Layout specifications with center area definition
- Prompt templates for different variations
- Customization parameters
- API integration instructions

### Step 3: Create Generation Scripts
Use the provided scripts as templates:
- `scripts/generate_image.py` - Core image generation
- `scripts/generate_recipe_template.py` - Recipe-specific generation
- `scripts/validate_image.py` - Quality validation

### Step 4: Test and Iterate
1. Generate test images with various parameters
2. Validate center area clarity
3. Refine prompts based on results
4. Create template library

## Quick Skill Creation

For rapid skill creation, use the `create_new_skill.py` script:

```bash
# Create a new skill with default settings
python scripts/create_new_skill.py "my-recipe-card-skill" \
    --description "Generate recipe cards with designated areas for food photos"

# Create a skill in a specific directory
python scripts/create_new_skill.py "social-media-template" \
    --description "Generate social media post templates" \
    --output_dir /path/to/skills
```

This script automatically:
1. Creates the directory structure
2. Copies core scripts (generate_image.py, validate_image.py)
3. Copies reference files (prompts.md, styles.md)
4. Creates SKILL.md with proper frontmatter
5. Creates an example generation script
6. Creates a README.md with usage instructions

## Tips for Success

1. **Keep prompts specific**: Include exact dimensions, positions, and styles
2. **Test with real content**: Use actual photos to verify center area works
3. **Iterate on style**: Refine prompts based on generated results
4. **Consider user workflow**: Make it easy for users to add their content
5. **Provide examples**: Show examples of completed cards with user content added
6. **Validate outputs**: Use validation scripts to ensure quality
7. **Document API usage**: Clear instructions for API setup and configuration

---

**Remember**: The goal is to create skills that generate beautiful, functional templates where users can easily add their own content to create professional-looking visual cards.
