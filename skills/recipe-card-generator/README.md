# Recipe Card Generator

A skill for generating beautiful recipe card templates with designated areas for your food photos.

## Features

- **Professional Templates**: Generate high-quality recipe card templates
- **Center Area**: Clear space in the center for your actual food photos
- **Customizable Styles**: Modern, rustic, elegant, and playful designs
- **Multiple Cuisines**: Support for various cuisine types
- **Quality Validation**: Tools to verify template quality

## Quick Start

### Prerequisites

1. **Python 3.7+**
2. **Dependencies**: `pip install openai Pillow numpy`
3. **API Key**: Get your key from [Baidu AIStudio](https://aistudio.baidu.com/account/accessToken)

### Setup

```bash
# Set your API key
export BAIDU_API_KEY="your_api_key_here"

# Navigate to the skill directory
cd recipe-card-generator
```

### Generate a Recipe Card

```bash
# Generate Italian recipe card with modern style
python scripts/generate_recipe_template.py "Italian" \
    --style modern \
    --color-scheme warm \
    --output_dir output/

# Generate Chinese recipe card with rustic style
python scripts/generate_recipe_template.py "Chinese" \
    --style rustic \
    --output_dir output/
```

### Validate the Generated Image

```bash
# Check if center area is clear for your food photo
python scripts/validate_image.py output/italian_recipe_card.png --verbose
```

## Layout Structure

```
+---------------------------+
|      Recipe Title         |
|  +---------------------+  |
|  | Ingredients | Steps |  |
|  |    List     |       |  |
|  |             |       |  |
|  |  +---------------+  |  |
|  |  | Your Food     |  |  |
|  |  | Photo Here    |  |  |
|  |  +---------------+  |  |
|  |             |       |  |
|  +---------------------+  |
|   Prep Time | Servings    |
+---------------------------+
```

## Customization Options

### Cuisine Types
- Italian, Chinese, Mexican, Japanese, Indian
- French, Thai, Mediterranean, American, Korean

### Visual Styles
- **Modern**: Clean lines, sans-serif fonts, minimalist
- **Rustic**: Vintage texture, handwritten fonts, warm tones
- **Elegant**: Serif fonts, gold accents, premium feel
- **Playful**: Bright colors, rounded shapes, fun typography

### Color Schemes
- **Warm**: Earth tones, golden accents, cozy atmosphere
- **Cool**: Blues and greens, fresh, calm
- **Neutral**: Grays and beiges, professional, balanced
- **Vibrant**: Bright, saturated, eye-catching

## Example Commands

### Basic Recipe Card
```bash
python scripts/generate_recipe_template.py "Italian" \
    --style modern \
    --output_dir output/
```

### Advanced Recipe Card
```bash
python scripts/generate_recipe_template.py "Japanese" \
    --style elegant \
    --color-scheme cool \
    --center-ratio 0.5 \
    --num-steps 8 \
    --custom-elements "nutritional-info" "cooking-tips" \
    --output_dir output/
```

### Batch Generation
```bash
# Generate multiple recipe cards
for cuisine in Italian Chinese Mexican Japanese; do
    python scripts/generate_recipe_template.py "$cuisine" \
        --style modern \
        --output_dir recipe_collection/
done
```

## Validation and Quality Control

### Center Area Validation
The validation script checks:
- **Clear center**: Is the center area empty and ready for your photo?
- **Good contrast**: Is text readable?
- **Balanced composition**: Is the layout visually balanced?
- **Proper aspect ratio**: Is the card properly proportioned?

### Quality Checklist
- [ ] Center area is clear for food photo
- [ ] Text is readable and well-positioned
- [ ] Visual style matches specification
- [ ] Composition is balanced
- [ ] Colors are harmonious

## File Structure

```
recipe-card-generator/
├── SKILL.md                    # Skill documentation
├── README.md                   # This file
├── scripts/
│   ├── generate_image.py       # Core image generation
│   ├── generate_recipe_template.py  # Recipe template generator
│   ├── validate_image.py       # Image validation
│   └── test_skill.py           # Test script
├── assets/
│   └── templates/              # Pre-designed templates
└── references/
    ├── prompts.md              # Optimized prompts
    └── styles.md               # Style guides
```

## API Integration

### Ernie Image API
This skill uses the Ernie Image API via OpenAI-compatible protocol.

#### Configuration
- **Base URL**: `https://aistudio.baidu.com/llm/lmapi/v3`
- **Model**: `ernie-image-turbo`
- **Authentication**: API key from Baidu AIStudio

#### Supported Image Sizes
- 1024x1024 (square)
- 1376x768 (16:9 landscape)
- 1264x848 (3:2 landscape)
- 1200x896 (4:3 landscape)
- 768x1376 (9:16 portrait)
- 848x1264 (2:3 portrait)
- 896x1200 (3:4 portrait)

## Troubleshooting

### Common Issues

**Center area is not clear**
- Increase center ratio: `--center-ratio 0.5`
- Simplify the prompt: focus on "center area completely empty"
- Try a different style: some styles work better than others

**Text is not readable**
- Increase contrast in the prompt
- Specify "high contrast text" in the prompt
- Use simpler typography styles

**Style doesn't match expectations**
- Be more specific in style description
- Use multiple style keywords
- Test with different style combinations

### API Issues

**Authentication error**
- Verify your API key is correct
- Check if the key has expired
- Ensure proper environment variable setup

**Generation fails**
- Check internet connection
- Verify API endpoint is accessible
- Try with a simpler prompt first

## Testing

Run the test script to verify everything is working:

```bash
python scripts/test_skill.py --verbose
```

## Examples

### Completed Recipe Card
1. Generate: Italian recipe card, modern style
2. Add: Photo of your pasta dish
3. Add: Title "Spaghetti Carbonara"
4. Add: Ingredients list
5. Add: Cooking steps
6. Result: Professional recipe card ready to share

### Recipe Collection
Create a collection of recipe cards for different cuisines and styles.

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review the API documentation
3. Test with simple prompts first
4. Validate outputs with the validation script

## License

This skill is provided as-is for educational and personal use.

---

**Remember**: The goal is to create beautiful, functional recipe cards where you can easily add your own food photos to create professional-looking visual recipes.
