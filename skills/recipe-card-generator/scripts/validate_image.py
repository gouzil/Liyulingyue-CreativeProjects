#!/usr/bin/env python3
"""
Validate generated images for center area clarity and composition.
"""

import argparse
import sys
from pathlib import Path

def analyze_center_area(image_path, center_ratio=0.4):
    """
    Analyze if the center area of an image is clear enough for user content.
    
    Args:
        image_path: Path to the image file
        center_ratio: Ratio of center area to analyze (0.0 to 1.0)
    
    Returns:
        dict with analysis results
    """
    try:
        from PIL import Image
        import numpy as np
    except ImportError:
        return {
            "success": False,
            "error": "PIL and numpy are required. Install with: pip install Pillow numpy"
        }
    
    try:
        img = Image.open(image_path)
        img_array = np.array(img)
        
        height, width = img_array.shape[:2]
        
        # Calculate center region
        center_h = int(height * center_ratio)
        center_w = int(width * center_ratio)
        start_h = (height - center_h) // 2
        start_w = (width - center_w) // 2
        
        center_region = img_array[start_h:start_h+center_h, start_w:start_w+center_w]
        
        # Calculate statistics for center region
        center_mean = np.mean(center_region)
        center_std = np.std(center_region)
        
        # Calculate edge region for comparison
        edge_region = np.concatenate([
            img_array[:start_h, :].flatten(),
            img_array[start_h+center_h:, :].flatten(),
            img_array[start_h:start_h+center_h, :start_w].flatten(),
            img_array[start_h:start_h+center_h, start_w+center_w:].flatten()
        ])
        
        edge_mean = np.mean(edge_region)
        edge_std = np.std(edge_region)
        
        # Determine if center is clear
        # A clear center should have:
        # 1. Lower standard deviation (less variation)
        # 2. Higher mean (brighter, less busy)
        center_clear = (center_std < edge_std * 1.2) and (center_mean > edge_mean * 0.8)
        
        return {
            "success": True,
            "center_clear": center_clear,
            "center_mean": float(center_mean),
            "center_std": float(center_std),
            "edge_mean": float(edge_mean),
            "edge_std": float(edge_std),
            "image_size": (width, height),
            "center_region": (start_w, start_h, center_w, center_h)
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

def validate_composition(image_path):
    """
    Validate the overall composition of the image.
    
    Args:
        image_path: Path to the image file
    
    Returns:
        dict with validation results
    """
    try:
        from PIL import Image
        import numpy as np
    except ImportError:
        return {
            "success": False,
            "error": "PIL and numpy are required. Install with: pip install Pillow numpy"
        }
    
    try:
        img = Image.open(image_path)
        img_array = np.array(img)
        
        height, width = img_array.shape[:2]
        
        # Check aspect ratio
        aspect_ratio = width / height
        good_aspect = 0.5 <= aspect_ratio <= 2.0
        
        # Check for text readability (simplified)
        gray = np.mean(img_array, axis=2) if len(img_array.shape) == 3 else img_array
        contrast = np.std(gray)
        good_contrast = contrast > 30
        
        # Check for balanced composition
        # Divide into 4 quadrants
        mid_h, mid_w = height // 2, width // 2
        quadrants = [
            img_array[:mid_h, :mid_w],
            img_array[:mid_h, mid_w:],
            img_array[mid_h:, :mid_w],
            img_array[mid_h:, mid_w:]
        ]
        
        quadrant_means = [np.mean(q) for q in quadrants]
        balance_score = 1.0 - (np.std(quadrant_means) / np.mean(quadrant_means))
        good_balance = balance_score > 0.7
        
        return {
            "success": True,
            "aspect_ratio": aspect_ratio,
            "good_aspect": good_aspect,
            "contrast": contrast,
            "good_contrast": good_contrast,
            "balance_score": balance_score,
            "good_balance": good_balance,
            "overall_quality": good_aspect and good_contrast and good_balance
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

def main():
    parser = argparse.ArgumentParser(description="Validate image composition")
    parser.add_argument("image_path", help="Path to image file")
    parser.add_argument("--center-ratio", type=float, default=0.4,
                       help="Ratio of center area to analyze (0.0 to 1.0)")
    parser.add_argument("--verbose", action="store_true",
                       help="Print detailed analysis")
    
    args = parser.parse_args()
    
    if not Path(args.image_path).exists():
        print(f"Error: Image file not found: {args.image_path}")
        sys.exit(1)
    
    # Analyze center area
    center_result = analyze_center_area(args.image_path, args.center_ratio)
    if not center_result["success"]:
        print(f"Error analyzing center area: {center_result['error']}")
        sys.exit(1)
    
    # Validate composition
    comp_result = validate_composition(args.image_path)
    if not comp_result["success"]:
        print(f"Error validating composition: {comp_result['error']}")
        sys.exit(1)
    
    # Print results
    print("Image Validation Results")
    print("=" * 40)
    
    print(f"\nCenter Area Analysis:")
    print(f"  Clear for user content: {'✓' if center_result['center_clear'] else '✗'}")
    if args.verbose:
        print(f"  Center mean brightness: {center_result['center_mean']:.1f}")
        print(f"  Center variation (std): {center_result['center_std']:.1f}")
        print(f"  Edge mean brightness: {center_result['edge_mean']:.1f}")
        print(f"  Edge variation (std): {center_result['edge_std']:.1f}")
    
    print(f"\nComposition Validation:")
    print(f"  Aspect ratio: {comp_result['aspect_ratio']:.2f} {'✓' if comp_result['good_aspect'] else '✗'}")
    print(f"  Contrast: {comp_result['contrast']:.1f} {'✓' if comp_result['good_contrast'] else '✗'}")
    print(f"  Balance score: {comp_result['balance_score']:.2f} {'✓' if comp_result['good_balance'] else '✗'}")
    
    print(f"\nOverall Quality: {'✓ PASS' if comp_result['overall_quality'] and center_result['center_clear'] else '✗ FAIL'}")
    
    if not (comp_result['overall_quality'] and center_result['center_clear']):
        print("\nRecommendations:")
        if not center_result['center_clear']:
            print("  - Make center area clearer and less busy")
        if not comp_result['good_aspect']:
            print("  - Adjust aspect ratio to be more standard")
        if not comp_result['good_contrast']:
            print("  - Increase contrast for better readability")
        if not comp_result['good_balance']:
            print("  - Improve visual balance across the image")

if __name__ == "__main__":
    main()
