---
name: recipe-card-generator
description: Generate beautiful recipe cards with designated areas for your food photos. Creates professional-looking cards with ingredients list, cooking steps, and a central area for your actual dish photo. Use when users mention recipe cards, cooking guides, food templates, or want to document their recipes visually. Always use this skill when users want to create visual recipe documentation, food templates, or cooking guides with images.
---

# Recipe Card Generator

Generate professional recipe card templates where you can place your own food photos in the center, surrounded by ingredients and cooking instructions.

## What This Skill Does

This skill generates recipe card templates with:
- **Center area**: Empty space for your actual food photo
- **Surrounding elements**: Ingredients list, cooking steps, recipe title
- **Professional design**: Consistent style and typography
- **Customizable options**: Cuisine type, visual style, color scheme

## Quick Start

### 0. Environment Setup (IMPORTANT)

**Check for virtual environment first!**

```bash
# Check if .venv exists and activate
if [ -d ".venv" ]; then
    echo "Found .venv, activating..."
    source .venv/bin/activate
fi

# Install dependencies
pip install openai Pillow numpy

# Set API key
export BAIDU_API_KEY="your_api_key_from_aistudio"
```

### 1. Generate a Recipe Card
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

### 2. Validate the Generated Image
```bash
# Check if center area is clear for your food photo
python scripts/validate_image.py output/italian_recipe_card.png --verbose
```

### 3. Add Your Food Photo
1. Open the generated recipe card image
2. Place your food photo in the center area
3. Add recipe title, ingredients, and steps text
4. Save and share your completed recipe card

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

## Example Prompts

### Italian Recipe Card (Modern)
```
Professional recipe card template, minimalist design, clean lines, 
sans-serif fonts, white space, geometric elements, warm earth tones, 
Italian cuisine recipe layout, center area taking 40% of total space, 
clear boundaries, completely empty for user food photo, surrounded by 
ingredient list and cooking steps, high quality, print-ready, 300 DPI, 
professional typography, clear hierarchy, balanced composition
```

### Chinese Recipe Card (Rustic)
```
Professional recipe card template, vintage paper texture, 
handwritten-style fonts, warm earth tones, aged look, artisan feel, 
organic shapes, Chinese cuisine recipe layout, center area taking 
40% of total space, clear boundaries, completely empty for user food 
photo, surrounded by ingredient list and cooking steps, high quality, 
print-ready, 300 DPI, professional typography, clear hierarchy, 
balanced composition
```

## Advanced Features

### Multi-Step Recipes
For complex recipes with many steps:
```bash
python scripts/generate_recipe_template.py "French" \
    --style elegant \
    --num-steps 10 \
    --output_dir output/
```

### Custom Elements
Add specific elements to your recipe card:
```bash
python scripts/generate_recipe_template.py "Japanese" \
    --style modern \
    --custom-elements "nutritional-info" "cooking-tips" "serving-suggestions" \
    --output_dir output/
```

### Different Center Ratios
Adjust the size of the center area for your food photo:
```bash
python scripts/generate_recipe_template.py "Mexican" \
    --style playful \
    --center-ratio 0.5 \
    --output_dir output/
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

## Integration with Other Tools

### Image Editing Software
After generating the template:
1. Open in Photoshop, GIMP, or Canva
2. Place your food photo in the center
3. Add text overlays for recipe details
4. Export final recipe card

### Automated Workflow
Create a complete workflow:
1. Generate template with this skill
2. Use image processing to add your food photo
3. Add text with recipe details
4. Save and share automatically

## Examples

### Completed Recipe Card
```
1. Generate: Italian recipe card, modern style
2. Add: Photo of your pasta dish
3. Add: Title "Spaghetti Carbonara"
4. Add: Ingredients list
5. Add: Cooking steps
6. Result: Professional recipe card ready to share
```

### Recipe Collection
Create a collection of recipe cards:
```bash
# Generate multiple cards
for cuisine in Italian Chinese Mexican Japanese; do
    python scripts/generate_recipe_template.py "$cuisine" \
        --style modern \
        --output_dir recipe_collection/
done
```

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review the API documentation
3. Test with simple prompts first
4. Validate outputs with the validation script

---

**Remember**: The goal is to create beautiful, functional recipe cards where you can easily add your own food photos to create professional-looking visual recipes.
