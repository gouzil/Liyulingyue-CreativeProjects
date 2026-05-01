#!/usr/bin/env python3
"""
Test script for the recipe card generator skill.
"""

import os
import sys
import argparse
from pathlib import Path

def test_template_generation():
    """Test recipe template generation."""
    print("Testing recipe template generation...")
    
    # Test different cuisine types
    cuisines = ["Italian", "Chinese", "Mexican"]
    styles = ["modern", "rustic", "elegant"]
    
    for cuisine in cuisines:
        for style in styles:
            print(f"\nTesting {cuisine} cuisine with {style} style...")
            
            # Import and test the template generator
            try:
                sys.path.insert(0, str(Path(__file__).parent))
                from generate_recipe_template import create_recipe_card_template
                
                template = create_recipe_card_template(
                    cuisine_type=cuisine,
                    style=style,
                    output_dir="test_output"
                )
                
                print(f"  ✓ Generated template: {template['name']}")
                print(f"  ✓ Files: {template.get('files', {})}")
                
            except Exception as e:
                print(f"  ✗ Error: {e}")
                return False
    
    return True

def test_prompt_generation():
    """Test prompt generation."""
    print("\nTesting prompt generation...")
    
    try:
        sys.path.insert(0, str(Path(__file__).parent))
        from generate_recipe_template import generate_recipe_prompt
        
        # Test modern Italian prompt
        prompt = generate_recipe_prompt(
            cuisine_type="Italian",
            style="modern",
            color_scheme="warm"
        )
        
        print(f"  ✓ Generated prompt length: {len(prompt)} characters")
        print(f"  ✓ Contains 'Italian': {'Italian' in prompt}")
        print(f"  ✓ Contains 'modern': {'modern' in prompt or 'minimalist' in prompt}")
        
        return True
        
    except Exception as e:
        print(f"  ✗ Error: {e}")
        return False

def test_validation():
    """Test image validation (without actual image)."""
    print("\nTesting validation script import...")
    
    try:
        sys.path.insert(0, str(Path(__file__).parent))
        from validate_image import analyze_center_area, validate_composition
        
        print("  ✓ Validation functions imported successfully")
        
        return True
        
    except Exception as e:
        print(f"  ✗ Error: {e}")
        return False

def main():
    parser = argparse.ArgumentParser(description="Test recipe card generator skill")
    parser.add_argument("--verbose", action="store_true",
                       help="Print detailed test information")
    
    args = parser.parse_args()
    
    print("Recipe Card Generator Skill Test")
    print("=" * 40)
    
    # Run tests
    tests = [
        ("Template Generation", test_template_generation),
        ("Prompt Generation", test_prompt_generation),
        ("Validation Import", test_validation)
    ]
    
    results = []
    
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"\n✗ {test_name} failed with exception: {e}")
            results.append((test_name, False))
    
    # Print summary
    print("\n" + "=" * 40)
    print("Test Results:")
    
    all_passed = True
    for test_name, result in results:
        status = "✓ PASS" if result else "✗ FAIL"
        print(f"  {test_name}: {status}")
        if not result:
            all_passed = False
    
    print("\n" + "=" * 40)
    if all_passed:
        print("All tests passed! The skill is ready to use.")
    else:
        print("Some tests failed. Check the output above for details.")
    
    return 0 if all_passed else 1

if __name__ == "__main__":
    sys.exit(main())
