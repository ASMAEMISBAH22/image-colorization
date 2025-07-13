import asyncio
import cv2
import numpy as np
from PIL import Image
import aiofiles
from pathlib import Path
import logging
from typing import Optional

logger = logging.getLogger(__name__)

async def process_image(image_path: str, colorizer) -> np.ndarray:
    """Process image colorization asynchronously"""
    try:
        # Run colorization in thread pool to avoid blocking
        loop = asyncio.get_event_loop()
        colorized_image = await loop.run_in_executor(
            None, colorizer.colorize, image_path
        )
        
        logger.info(f"Image colorization completed for {image_path}")
        return colorized_image
        
    except Exception as e:
        logger.error(f"Error processing image {image_path}: {e}")
        raise

async def save_image(image_array: np.ndarray, output_path: str) -> None:
    """Save colorized image asynchronously"""
    try:
        # Ensure output directory exists
        Path(output_path).parent.mkdir(parents=True, exist_ok=True)
        
        # Convert RGB to BGR for OpenCV
        if len(image_array.shape) == 3 and image_array.shape[2] == 3:
            image_bgr = cv2.cvtColor(image_array, cv2.COLOR_RGB2BGR)
        else:
            image_bgr = image_array
        
        # Save image
        success = cv2.imwrite(output_path, image_bgr)
        
        if not success:
            raise Exception(f"Failed to save image to {output_path}")
        
        logger.info(f"Image saved successfully to {output_path}")
        
    except Exception as e:
        logger.error(f"Error saving image to {output_path}: {e}")
        raise

def validate_image(image_path: str) -> bool:
    """Validate if the image file is valid and supported"""
    try:
        # Check if file exists
        if not Path(image_path).exists():
            return False
        
        # Try to open with PIL
        with Image.open(image_path) as img:
            # Check if it's a valid image format
            img.verify()
        
        # Check file size (max 10MB)
        file_size = Path(image_path).stat().st_size
        if file_size > 10 * 1024 * 1024:  # 10MB
            return False
        
        return True
        
    except Exception as e:
        logger.warning(f"Image validation failed for {image_path}: {e}")
        return False

def convert_to_grayscale(image_path: str, output_path: str) -> None:
    """Convert color image to grayscale"""
    try:
        # Read image
        image = cv2.imread(image_path)
        if image is None:
            raise ValueError(f"Could not read image from {image_path}")
        
        # Convert to grayscale
        gray_image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        # Save grayscale image
        cv2.imwrite(output_path, gray_image)
        
        logger.info(f"Converted {image_path} to grayscale: {output_path}")
        
    except Exception as e:
        logger.error(f"Error converting image to grayscale: {e}")
        raise

def resize_image(image_path: str, output_path: str, max_size: int = 512) -> None:
    """Resize image while maintaining aspect ratio"""
    try:
        # Read image
        image = cv2.imread(image_path)
        if image is None:
            raise ValueError(f"Could not read image from {image_path}")
        
        # Get dimensions
        height, width = image.shape[:2]
        
        # Calculate new dimensions
        if height > width:
            new_height = max_size
            new_width = int(width * max_size / height)
        else:
            new_width = max_size
            new_height = int(height * max_size / width)
        
        # Resize image
        resized_image = cv2.resize(image, (new_width, new_height), interpolation=cv2.INTER_AREA)
        
        # Save resized image
        cv2.imwrite(output_path, resized_image)
        
        logger.info(f"Resized {image_path} to {new_width}x{new_height}: {output_path}")
        
    except Exception as e:
        logger.error(f"Error resizing image: {e}")
        raise

def enhance_image(image_array: np.ndarray) -> np.ndarray:
    """Apply basic image enhancement"""
    try:
        # Convert to float for processing
        image_float = image_array.astype(np.float32) / 255.0
        
        # Apply contrast enhancement
        enhanced = cv2.convertScaleAbs(image_float, alpha=1.2, beta=0.1)
        
        # Apply slight sharpening
        kernel = np.array([[-1,-1,-1], [-1,9,-1], [-1,-1,-1]])
        enhanced = cv2.filter2D(enhanced, -1, kernel)
        
        # Convert back to uint8
        enhanced = np.clip(enhanced, 0, 255).astype(np.uint8)
        
        return enhanced
        
    except Exception as e:
        logger.warning(f"Image enhancement failed: {e}")
        return image_array

def create_side_by_side_comparison(original_path: str, colorized_path: str, output_path: str) -> None:
    """Create a side-by-side comparison of original and colorized images"""
    try:
        # Read images
        original = cv2.imread(original_path)
        colorized = cv2.imread(colorized_path)
        
        if original is None or colorized is None:
            raise ValueError("Could not read one or both images")
        
        # Ensure same size
        height, width = original.shape[:2]
        colorized = cv2.resize(colorized, (width, height))
        
        # Create side-by-side image
        comparison = np.hstack([original, colorized])
        
        # Add labels
        font = cv2.FONT_HERSHEY_SIMPLEX
        cv2.putText(comparison, 'Original', (10, 30), font, 1, (255, 255, 255), 2)
        cv2.putText(comparison, 'Colorized', (width + 10, 30), font, 1, (255, 255, 255), 2)
        
        # Save comparison
        cv2.imwrite(output_path, comparison)
        
        logger.info(f"Created comparison image: {output_path}")
        
    except Exception as e:
        logger.error(f"Error creating comparison image: {e}")
        raise 