import torch
import torch.nn as nn
import torch.nn.functional as F
import numpy as np
from PIL import Image
import cv2
from typing import Optional, Tuple
import logging

logger = logging.getLogger(__name__)

class DoubleConv(nn.Module):
    """Double convolution block with batch normalization and ReLU"""
    
    def __init__(self, in_channels: int, out_channels: int, mid_channels: Optional[int] = None):
        super().__init__()
        if not mid_channels:
            mid_channels = out_channels
        self.double_conv = nn.Sequential(
            nn.Conv2d(in_channels, mid_channels, kernel_size=3, padding=1, bias=False),
            nn.BatchNorm2d(mid_channels),
            nn.ReLU(inplace=True),
            nn.Conv2d(mid_channels, out_channels, kernel_size=3, padding=1, bias=False),
            nn.BatchNorm2d(out_channels),
            nn.ReLU(inplace=True)
        )

    def forward(self, x):
        return self.double_conv(x)

class Down(nn.Module):
    """Downscaling with maxpool then double conv"""
    
    def __init__(self, in_channels: int, out_channels: int):
        super().__init__()
        self.maxpool_conv = nn.Sequential(
            nn.MaxPool2d(2),
            DoubleConv(in_channels, out_channels)
        )

    def forward(self, x):
        return self.maxpool_conv(x)

class Up(nn.Module):
    """Upscaling then double conv"""
    
    def __init__(self, in_channels: int, out_channels: int, bilinear: bool = True):
        super().__init__()
        
        if bilinear:
            self.up = nn.Upsample(scale_factor=2, mode='bilinear', align_corners=True)
            self.conv = DoubleConv(in_channels, out_channels, in_channels // 2)
        else:
            self.up = nn.ConvTranspose2d(in_channels, in_channels // 2, kernel_size=2, stride=2)
            self.conv = DoubleConv(in_channels, out_channels)

    def forward(self, x1, x2):
        x1 = self.up(x1)
        
        # Input is CHW
        diffY = x2.size()[2] - x1.size()[2]
        diffX = x2.size()[3] - x1.size()[3]

        x1 = F.pad(x1, [diffX // 2, diffX - diffX // 2,
                        diffY // 2, diffY - diffY // 2])
        
        x = torch.cat([x2, x1], dim=1)
        return self.conv(x)

class OutConv(nn.Module):
    """Output convolution layer"""
    
    def __init__(self, in_channels: int, out_channels: int):
        super(OutConv, self).__init__()
        self.conv = nn.Conv2d(in_channels, out_channels, kernel_size=1)

    def forward(self, x):
        return self.conv(x)

class UNet(nn.Module):
    """U-Net architecture for image colorization"""
    
    def __init__(self, n_channels: int = 1, n_classes: int = 3, bilinear: bool = False):
        super(UNet, self).__init__()
        self.n_channels = n_channels
        self.n_classes = n_classes
        self.bilinear = bilinear

        self.inc = (DoubleConv(n_channels, 64))
        self.down1 = (Down(64, 128))
        self.down2 = (Down(128, 256))
        self.down3 = (Down(256, 512))
        factor = 2 if bilinear else 1
        self.down4 = (Down(512, 1024 // factor))
        self.up1 = (Up(1024, 512 // factor, bilinear))
        self.up2 = (Up(512, 256 // factor, bilinear))
        self.up3 = (Up(256, 128 // factor, bilinear))
        self.up4 = (Up(128, 64, bilinear))
        self.outc = (OutConv(64, n_classes))

    def forward(self, x):
        x1 = self.inc(x)
        x2 = self.down1(x1)
        x3 = self.down2(x2)
        x4 = self.down3(x3)
        x5 = self.down4(x4)
        x = self.up1(x5, x4)
        x = self.up2(x, x3)
        x = self.up3(x, x2)
        x = self.up4(x, x1)
        logits = self.outc(x)
        return logits

class UNetColorizer:
    """Wrapper class for U-Net colorization model"""
    
    def __init__(self, model_path: Optional[str] = None, device: str = "cpu"):
        self.device = torch.device(device if torch.cuda.is_available() else "cpu")
        self.model = UNet(n_channels=1, n_classes=3, bilinear=False)
        
        # Load pre-trained weights if available
        if model_path and torch.load(model_path, map_location=self.device):
            try:
                self.model.load_state_dict(torch.load(model_path, map_location=self.device))
                logger.info(f"Loaded pre-trained model from {model_path}")
            except Exception as e:
                logger.warning(f"Failed to load pre-trained model: {e}")
        
        self.model.to(self.device)
        self.model.eval()
        
        logger.info(f"U-Net model initialized on device: {self.device}")
    
    def preprocess_image(self, image_path: str) -> torch.Tensor:
        """Preprocess image for model input"""
        # Load image and convert to grayscale
        image = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
        
        if image is None:
            raise ValueError(f"Could not load image from {image_path}")
        
        # Resize to model input size (256x256)
        image = cv2.resize(image, (256, 256))
        
        # Normalize to [0, 1]
        image = image.astype(np.float32) / 255.0
        
        # Add batch and channel dimensions
        image = torch.from_numpy(image).unsqueeze(0).unsqueeze(0)
        
        return image.to(self.device)
    
    def postprocess_output(self, output: torch.Tensor) -> np.ndarray:
        """Postprocess model output to color image"""
        # Remove batch dimension and move to CPU
        output = output.squeeze(0).cpu().detach().numpy()
        
        # Transpose from (C, H, W) to (H, W, C)
        output = np.transpose(output, (1, 2, 0))
        
        # Convert from [-1, 1] to [0, 255] range
        output = ((output + 1) * 127.5).clip(0, 255).astype(np.uint8)
        
        # Convert from LAB to RGB (simplified - in practice you'd use proper color space conversion)
        # For now, we'll treat it as RGB
        return output
    
    def colorize(self, image_path: str) -> np.ndarray:
        """Colorize a grayscale image"""
        with torch.no_grad():
            # Preprocess input
            input_tensor = self.preprocess_image(image_path)
            
            # Run inference
            output = self.model(input_tensor)
            
            # Postprocess output
            colorized_image = self.postprocess_output(output)
            
            return colorized_image
    
    def colorize_pil(self, image: Image.Image) -> Image.Image:
        """Colorize a PIL Image"""
        # Convert PIL to numpy array
        image_array = np.array(image.convert('L'))
        
        # Save temporarily and process
        temp_path = "/tmp/temp_image.jpg"
        cv2.imwrite(temp_path, image_array)
        
        try:
            colorized_array = self.colorize(temp_path)
            return Image.fromarray(colorized_array)
        finally:
            # Clean up temp file
            import os
            if os.path.exists(temp_path):
                os.remove(temp_path)

# Example usage and model initialization
if __name__ == "__main__":
    # Initialize model
    colorizer = UNetColorizer()
    
    # Test with a sample image
    test_image_path = "sample_grayscale.jpg"
    if os.path.exists(test_image_path):
        colorized = colorizer.colorize(test_image_path)
        cv2.imwrite("colorized_output.jpg", cv2.cvtColor(colorized, cv2.COLOR_RGB2BGR))
        print("Colorization completed!")
    else:
        print("Test image not found. Please provide a grayscale image for testing.") 