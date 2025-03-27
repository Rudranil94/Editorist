import torch
import torch.nn as nn
import torch.nn.functional as F
import torchvision.models as models
import torchvision.transforms as transforms
from typing import Dict, Optional
import numpy as np
from PIL import Image
import cv2
from app.core.config import settings

class StyleTransfer:
    def __init__(self):
        self.device = torch.device("cuda" if settings.USE_GPU and torch.cuda.is_available() else "cpu")
        self.model = self._load_model()
        self.transform = transforms.Compose([
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])
        self.inverse_transform = transforms.Compose([
            transforms.Normalize(mean=[-0.485/0.229, -0.456/0.224, -0.406/0.225],
                              std=[1/0.229, 1/0.224, 1/0.225]),
            transforms.ToPILImage()
        ])
        
    def _load_model(self) -> nn.Module:
        """Load a pre-trained VGG model for style transfer."""
        model = models.vgg19(pretrained=True).features
        model.eval()
        return model.to(self.device)
    
    def _get_features(self, image: torch.Tensor, model: nn.Module) -> Dict[str, torch.Tensor]:
        """Extract features from different layers of the VGG model."""
        features = {}
        x = image
        
        for name, layer in model._modules.items():
            x = layer(x)
            if name in ['3', '8', '17', '26', '35']:  # Selected layers for style and content
                features[name] = x
                
        return features
    
    def _gram_matrix(self, tensor: torch.Tensor) -> torch.Tensor:
        """Calculate the Gram matrix for style features."""
        b, c, h, w = tensor.size()
        features = tensor.view(b, c, h * w)
        features_t = features.transpose(1, 2)
        gram = features.bmm(features_t) / (c * h * w)
        return gram
    
    def apply_style(self, 
                   content_image: np.ndarray,
                   style_name: str = "cinematic",
                   strength: float = 0.5) -> np.ndarray:
        """Apply a predefined style to the content image."""
        # Convert numpy array to PIL Image
        content_pil = Image.fromarray(cv2.cvtColor(content_image, cv2.COLOR_BGR2RGB))
        
        # Transform content image
        content_tensor = self.transform(content_pil).unsqueeze(0).to(self.device)
        
        # Get style parameters based on preset
        style_params = self._get_style_params(style_name)
        
        # Apply style transfer
        with torch.no_grad():
            # Extract features
            content_features = self._get_features(content_tensor, self.model)
            
            # Apply style modifications
            styled_features = {}
            for layer_name, features in content_features.items():
                # Apply color grading
                features = self._apply_color_grading(features, style_params)
                
                # Apply contrast and brightness adjustments
                features = self._apply_contrast_brightness(features, style_params)
                
                styled_features[layer_name] = features
            
            # Reconstruct image
            output = self._reconstruct_image(styled_features)
            
            # Blend with original based on strength
            output = (1 - strength) * content_tensor + strength * output
        
        # Convert back to numpy array
        output_pil = self.inverse_transform(output.squeeze(0))
        output_np = np.array(output_pil)
        return cv2.cvtColor(output_np, cv2.COLOR_RGB2BGR)
    
    def _get_style_params(self, style_name: str) -> Dict:
        """Get predefined style parameters."""
        styles = {
            "cinematic": {
                "color_temperature": 0.1,  # Slightly warm
                "contrast": 1.2,
                "saturation": 1.1,
                "brightness": 1.05,
                "shadows": 0.9,
                "highlights": 1.1
            },
            "vibrant": {
                "color_temperature": 0.2,  # Warm
                "contrast": 1.3,
                "saturation": 1.4,
                "brightness": 1.1,
                "shadows": 0.95,
                "highlights": 1.2
            },
            "muted": {
                "color_temperature": -0.1,  # Cool
                "contrast": 1.1,
                "saturation": 0.9,
                "brightness": 1.0,
                "shadows": 1.05,
                "highlights": 0.95
            }
        }
        return styles.get(style_name, styles["cinematic"])
    
    def _apply_color_grading(self, features: torch.Tensor, params: Dict) -> torch.Tensor:
        """Apply color grading to features."""
        # Implement color grading logic here
        # This is a simplified version
        return features * (1 + params["color_temperature"])
    
    def _apply_contrast_brightness(self, features: torch.Tensor, params: Dict) -> torch.Tensor:
        """Apply contrast and brightness adjustments."""
        # Implement contrast and brightness adjustments
        return features * params["contrast"] + params["brightness"]
    
    def _reconstruct_image(self, features: Dict[str, torch.Tensor]) -> torch.Tensor:
        """Reconstruct the image from features."""
        # Implement image reconstruction logic
        # This is a simplified version
        return features["35"]  # Use the deepest layer features 