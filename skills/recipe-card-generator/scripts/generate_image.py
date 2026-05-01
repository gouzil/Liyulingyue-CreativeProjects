#!/usr/bin/env python3
"""
Generate images using Ernie Image API via OpenAI-compatible protocol.
"""

import os
import base64
import argparse
import json
from pathlib import Path
from typing import Optional, Dict, Any, List

def generate_image(
    prompt: str,
    api_key: str,
    base_url: str = "https://aistudio.baidu.com/llm/lmapi/v3",
    model: str = "ernie-image-turbo",
    size: str = "1024x1024",
    seed: int = 42,
    save_path: Optional[str] = None,
    response_format: str = "b64_json",
    **kwargs
) -> Dict[str, Any]:
    """
    Generate an image using Ernie Image API.
    
    Args:
        prompt: Text prompt for image generation
        api_key: API key for authentication
        base_url: API base URL
        model: Model name
        size: Image size (e.g., "1024x1024", "1376x768")
        seed: Random seed for reproducibility
        save_path: Path to save the generated image
        response_format: Response format ("b64_json" or "url")
        **kwargs: Additional parameters for the API
    
    Returns:
        Dictionary with generation results
    """
    try:
        from openai import OpenAI
    except ImportError:
        return {
            "success": False,
            "error": "openai package not installed. Run: pip install openai"
        }
    
    try:
        client = OpenAI(
            api_key=api_key,
            base_url=base_url
        )
        
        # Prepare extra body parameters
        extra_body = {
            "seed": seed,
            "use_pe": True,
            "num_inference_steps": 8,
            "guidance_scale": 1.0,
            **kwargs
        }
        
        response = client.images.generate(
            model=model,
            prompt=prompt,
            n=1,
            size=size,
            response_format=response_format,
            extra_body=extra_body
        )
        
        if response_format == "b64_json":
            b64_data = response.data[0].b64_json
            image_bytes = base64.b64decode(b64_data)
            
            if save_path:
                save_dir = Path(save_path).parent
                save_dir.mkdir(parents=True, exist_ok=True)
                
                with open(save_path, 'wb') as f:
                    f.write(image_bytes)
            
            return {
                "success": True,
                "image_bytes": image_bytes,
                "save_path": save_path,
                "size": size,
                "prompt": prompt
            }
        else:
            url = response.data[0].url
            return {
                "success": True,
                "url": url,
                "size": size,
                "prompt": prompt
            }
            
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

def generate_image_with_optimized_prompt(
    base_prompt: str,
    style: str = "modern",
    cuisine_type: Optional[str] = None,
    center_area_ratio: float = 0.4,
    api_key: Optional[str] = None,
    save_path: Optional[str] = None,
    **kwargs
) -> Dict[str, Any]:
    """
    Generate an image with an optimized prompt for recipe cards or templates.
    
    Args:
        base_prompt: Base description of what to generate
        style: Visual style (modern, rustic, elegant, playful)
        cuisine_type: Type of cuisine for recipe cards
        center_area_ratio: Ratio of center area for user content
        api_key: API key (or set BAIDU_API_KEY env var)
        save_path: Path to save the generated image
        **kwargs: Additional parameters
    
    Returns:
        Dictionary with generation results
    """
    # Style enhancements
    style_enhancements = {
        "modern": "minimalist design, clean lines, sans-serif fonts, white space, geometric elements, contemporary feel",
        "rustic": "vintage paper texture, handwritten-style fonts, warm earth tones, aged look, artisan feel, organic shapes",
        "elegant": "gourmet presentation, serif fonts, gold or silver accents, premium materials, sophisticated color palette, high-end finish",
        "playful": "bright colors, rounded shapes, playful typography, cartoon elements, energetic composition, youthful vibe"
    }
    
    # Build optimized prompt
    style_desc = style_enhancements.get(style, style_enhancements["modern"])
    
    optimized_prompt = f"{base_prompt}, {style_desc}"
    
    if cuisine_type:
        optimized_prompt += f", {cuisine_type} cuisine"
    
    # Add center area specification
    center_percent = int(center_area_ratio * 100)
    optimized_prompt += f", center area taking {center_percent}% of total space, clear boundaries, completely empty for user content"
    
    # Add quality specifications
    optimized_prompt += ", high quality, print-ready, 300 DPI, professional typography, clear hierarchy, balanced composition"
    
    # Get API key from environment if not provided
    if not api_key:
        api_key = os.getenv("BAIDU_API_KEY")
    
    if not api_key:
        return {
            "success": False,
            "error": "API key not provided. Set BAIDU_API_KEY environment variable or pass api_key parameter."
        }
    
    return generate_image(
        prompt=optimized_prompt,
        api_key=api_key,
        save_path=save_path,
        **kwargs
    )

def batch_generate_images(
    prompts: List[str],
    api_key: str,
    output_dir: str = "generated_images",
    **kwargs
) -> List[Dict[str, Any]]:
    """
    Generate multiple images from a list of prompts.
    
    Args:
        prompts: List of text prompts
        api_key: API key for authentication
        output_dir: Directory to save generated images
        **kwargs: Additional parameters for generation
    
    Returns:
        List of generation results
    """
    results = []
    
    for i, prompt in enumerate(prompts):
        save_path = os.path.join(output_dir, f"image_{i+1}.png")
        
        result = generate_image(
            prompt=prompt,
            api_key=api_key,
            save_path=save_path,
            **kwargs
        )
        
        results.append(result)
        
        if result["success"]:
            print(f"Generated image {i+1}/{len(prompts)}: {save_path}")
        else:
            print(f"Failed to generate image {i+1}/{len(prompts)}: {result['error']}")
    
    return results

def main():
    parser = argparse.ArgumentParser(description="Generate images using Ernie Image API")
    parser.add_argument("prompt", help="Text prompt for image generation")
    parser.add_argument("--api_key", default=os.getenv("BAIDU_API_KEY"),
                       help="API key (or set BAIDU_API_KEY env var)")
    parser.add_argument("--base_url", default="https://aistudio.baidu.com/llm/lmapi/v3",
                       help="API base URL")
    parser.add_argument("--model", default="ernie-image-turbo",
                       help="Model name")
    parser.add_argument("--size", default="1024x1024",
                       help="Image size (e.g., 1024x1024, 1376x768)")
    parser.add_argument("--seed", type=int, default=42,
                       help="Random seed")
    parser.add_argument("--save_path", default="generated_image.png",
                       help="Path to save the generated image")
    parser.add_argument("--style", 
                       choices=["modern", "rustic", "elegant", "playful"],
                       help="Visual style (for optimized prompts)")
    parser.add_argument("--cuisine_type",
                       help="Cuisine type (for recipe cards)")
    parser.add_argument("--center_ratio", type=float, default=0.4,
                       help="Center area ratio (0.0 to 1.0)")
    parser.add_argument("--optimized", action="store_true",
                       help="Use optimized prompt generation")
    parser.add_argument("--json", action="store_true",
                       help="Output result as JSON")
    
    args = parser.parse_args()
    
    if not args.api_key:
        print("Error: API key not provided. Set BAIDU_API_KEY environment variable or use --api_key")
        return
    
    if args.optimized:
        result = generate_image_with_optimized_prompt(
            base_prompt=args.prompt,
            style=args.style or "modern",
            cuisine_type=args.cuisine_type,
            center_area_ratio=args.center_ratio,
            api_key=args.api_key,
            base_url=args.base_url,
            model=args.model,
            size=args.size,
            seed=args.seed,
            save_path=args.save_path
        )
    else:
        result = generate_image(
            prompt=args.prompt,
            api_key=args.api_key,
            base_url=args.base_url,
            model=args.model,
            size=args.size,
            seed=args.seed,
            save_path=args.save_path
        )
    
    if args.json:
        # Remove image_bytes from JSON output if present
        output_result = {k: v for k, v in result.items() if k != "image_bytes"}
        print(json.dumps(output_result, indent=2))
    else:
        if result["success"]:
            print(f"Image generated successfully!")
            if "save_path" in result:
                print(f"Saved to: {result['save_path']}")
            print(f"Size: {result['size']}")
            print(f"Prompt: {result['prompt']}")
        else:
            print(f"Error: {result['error']}")

if __name__ == "__main__":
    main()
