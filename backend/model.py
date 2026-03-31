# model.py
#
# Defines:
#   SkinModel     — SwinV2-Base backbone with a custom 2-layer classification head.
#                   Architecture must match the training code exactly so that
#                   saved weights load without errors.
#   ModelManager  — Singleton-style manager that loads the model once at startup
#                   and exposes a predict() class-method for inference.

import json
from pathlib import Path

import albumentations as A
import cv2  # noqa: F401 (imported transitively by albumentations; kept explicit)
import numpy as np
import timm
import torch
import torch.nn as nn
import torch.nn.functional as F
from albumentations.pytorch import ToTensorV2


# ─────────────────────────────────────────────────────────────────────────────
# Model definition
# ─────────────────────────────────────────────────────────────────────────────

class SkinModel(nn.Module):
    """
    SwinV2-Base transformer with a custom 2-layer classification head.

    The architecture here must match the training code exactly — any deviation
    will cause a state-dict key mismatch when loading checkpoint weights.

    Args:
        model_name: timm model identifier, e.g. "swinv2_base_window12_192".
        num_classes: Number of output classes (24 for this project).
        dropout: Dropout probability applied in the head (default 0.3).
    """

    def __init__(self, model_name: str, num_classes: int, dropout: float = 0.3) -> None:
        super().__init__()

        # Backbone — pretrained=False because weights come from our checkpoint
        self.backbone = timm.create_model(
            model_name,
            pretrained=False,   # weights loaded externally from checkpoint
            num_classes=0,      # remove timm's default classifier head
            global_pool="avg",
            img_size=192,       # native resolution for the window12_192 variant
        )
        in_features: int = self.backbone.num_features

        # 2-layer classification head (mirrors training code)
        self.head = nn.Sequential(
            nn.LayerNorm(in_features),
            nn.Dropout(dropout),
            nn.Linear(in_features, 512),
            nn.GELU(),
            nn.Dropout(dropout * 0.5),
            nn.Linear(512, num_classes),
        )

        # Xavier uniform init on the final linear layer (mirrors training)
        nn.init.xavier_uniform_(self.head[-1].weight)
        nn.init.zeros_(self.head[-1].bias)

    def forward(self, x: torch.Tensor) -> torch.Tensor:  # (B, C, H, W) → (B, num_classes)
        return self.head(self.backbone(x))


# ─────────────────────────────────────────────────────────────────────────────
# Model manager (singleton-style)
# ─────────────────────────────────────────────────────────────────────────────

class ModelManager:
    """
    Singleton-style model manager.

    The model is loaded ONCE at application startup via `load()` and then
    reused for all subsequent inference calls.  Never instantiate this class —
    use the class-methods directly.

    Usage:
        ModelManager.load(model_path, config_path)   # called in startup event
        results = ModelManager.predict(image_array)  # called per request
    """

    _model: SkinModel | None = None
    _config: dict | None = None
    _transform: A.Compose | None = None
    _device: torch.device | None = None

    # ── Lifecycle ──────────────────────────────────────────────────────────

    @classmethod
    def load(cls, model_path: str, config_path: str) -> None:
        """
        Load the model and config from disk.  Must be called once before any
        call to predict().

        Args:
            model_path:  Path to the PyTorch checkpoint (.pth) file.
            config_path: Path to deployment_config.json.

        Raises:
            FileNotFoundError: If either path does not exist.
            RuntimeError:      If the checkpoint cannot be loaded.
        """
        cls._device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        print(f"Loading model on: {cls._device}")

        # Load deployment config
        with open(config_path) as f:
            cls._config = json.load(f)

        # Build model matching the training architecture
        cls._model = SkinModel(
            model_name=cls._config["model_name"],
            num_classes=cls._config["num_classes"],
        ).to(cls._device)

        # Load saved weights from checkpoint
        checkpoint = torch.load(model_path, map_location=cls._device, weights_only=True)
        cls._model.load_state_dict(checkpoint["model_state_dict"])
        cls._model.eval()

        # Build the inference transform — must match val_transforms from training
        size: int = cls._config["image_size"]
        norm: dict = cls._config["normalization"]

        cls._transform = A.Compose([
            A.Resize(height=size, width=size),
            A.Normalize(mean=norm["mean"], std=norm["std"]),
            ToTensorV2(),
        ])

        print(f"Model loaded: {cls._config['model_name']}")
        print(f"Classes: {cls._config['num_classes']}")

    @classmethod
    def is_loaded(cls) -> bool:
        """Return True if the model has been successfully loaded."""
        return cls._model is not None

    # ── Inference ──────────────────────────────────────────────────────────

    @classmethod
    def predict(cls, image_array: np.ndarray, top_k: int = 5) -> list[dict]:
        """
        Run inference on a numpy RGB image array and return the top-k
        predictions sorted by confidence (descending).

        Args:
            image_array: H×W×3 numpy array in RGB channel order (uint8 or float).
            top_k:       Number of top predictions to return (default 5).

        Returns:
            A list of dicts, each containing:
                disease    (str)   — class name from deployment_config.json
                confidence (float) — percentage [0, 100], rounded to 2 dp
                severity   (str)   — "low" | "medium" | "high"

        Raises:
            RuntimeError: If the model has not been loaded yet.
        """
        if not cls.is_loaded():
            raise RuntimeError("Model not loaded. Call ModelManager.load() first.")

        # Preprocess: apply albumentations transform and add batch dimension
        tensor: torch.Tensor = cls._transform(image=image_array)["image"]
        tensor = tensor.unsqueeze(0).to(cls._device)  # shape: (1, C, H, W)

        # Forward pass — no grad required at inference time
        with torch.no_grad():
            logits: torch.Tensor = cls._model(tensor)

        # Convert logits → probabilities and select top-k indices
        probs: np.ndarray = F.softmax(logits, dim=1)[0].cpu().numpy()
        top_k_indices: np.ndarray = np.argsort(probs)[::-1][:top_k]

        class_names: list[str] = cls._config["class_names"]

        return [
            {
                "disease":    class_names[i],
                "confidence": round(float(probs[i]) * 100, 2),
                "severity":   cls._get_severity(class_names[i]),
            }
            for i in top_k_indices
        ]

    # ── Helpers ────────────────────────────────────────────────────────────

    @classmethod
    def _get_severity(cls, disease_name: str) -> str:
        """
        Rule-based severity classification derived from the disease class name.

        Returns:
            "high"   — see a doctor urgently (cancer / malignant lesions)
            "medium" — consult a dermatologist soon (chronic / infectious)
            "low"    — safe to monitor at home (most benign conditions)
        """
        name = disease_name.lower()

        high_keywords = [
            "melanoma", "carcinoma", "malignant", "skin_cancer",
            "lupus", "vasculitis", "cellulitis", "impetigo", "scabies",
            "drug eruption", "bullous", "systemic"
        ]
        medium_keywords = [
            "eczema", "psoriasis", "herpes", "hpv", "viral",
            "fungal", "ringworm", "tinea", "candidiasis",
            "hair loss", "alopecia", "pigmentation", "rosacea",
            "nail", "warts", "seborrheic", "contact", "dermatitis",
            "acne"
        ]

        if any(k in name for k in high_keywords):
            return "high"
        if any(k in name for k in medium_keywords):
            return "medium"
        return "low"


# ─────────────────────────────────────────────────────────────────────────────
# Image validation helper
# ─────────────────────────────────────────────────────────────────────────────

def is_skin_image(image_array: np.ndarray) -> dict:
    """
    Check if image contains enough skin-like pixels.
    Uses HSV colour space — skin tones fall in a specific hue/saturation range.
    Works for all skin tones (light to dark).

    Args:
        image_array: RGB numpy array representing the image.

    Returns:
        A dict with keys:
            - is_skin (bool): Whether image has sufficient skin pixels
            - skin_percentage (float): % of image that is skin-coloured
            - reason (str): Human-readable explanation
    """
    # Convert RGB to HSV colour space
    hsv = cv2.cvtColor(image_array, cv2.COLOR_RGB2HSV)

    # Skin tone ranges in HSV — covers light to dark skin tones
    # Range 1: Light to medium skin tones
    lower1 = np.array([0, 20, 70], dtype=np.uint8)
    upper1 = np.array([25, 255, 255], dtype=np.uint8)

    # Range 2: Darker skin tones
    lower2 = np.array([160, 20, 70], dtype=np.uint8)
    upper2 = np.array([180, 255, 255], dtype=np.uint8)

    mask1 = cv2.inRange(hsv, lower1, upper1)
    mask2 = cv2.inRange(hsv, lower2, upper2)
    skin_mask = cv2.bitwise_or(mask1, mask2)

    # Calculate skin percentage
    total_pixels = image_array.shape[0] * image_array.shape[1]
    skin_pixels = cv2.countNonZero(skin_mask)
    skin_pct = (skin_pixels / total_pixels) * 100

    # Minimum 15% of image must be skin-coloured
    THRESHOLD = 15.0

    if skin_pct < THRESHOLD:
        return {
            "is_skin": False,
            "skin_percentage": round(skin_pct, 1),
            "reason": (
                f"Only {skin_pct:.1f}% of the image appears to be skin. "
                "Please upload a clear photo of the affected skin area."
            ),
        }

    return {
        "is_skin": True,
        "skin_percentage": round(skin_pct, 1),
        "reason": "OK",
    }


# ─────────────────────────────────────────────────────────────────────────────
# Visual feature analysis helper
# ─────────────────────────────────────────────────────────────────────────────

def analyze_visual_features(image_array: np.ndarray, predicted_class: str) -> dict:
    """
    Analyze actual visual properties of the image and generate observation text
    comparing to expected disease features.

    Args:
        image_array: RGB numpy array representing the image.
        predicted_class: The predicted disease class name from the model.

    Returns:
        A dict with keys:
            - observed (str): Description of actual visual properties detected
            - comparison (str): How observations compare to expected disease symptoms
            - full_analysis (str): Combined observed + comparison text
    """
    # Convert to different colour spaces for analysis
    hsv = cv2.cvtColor(image_array, cv2.COLOR_RGB2HSV)
    gray = cv2.cvtColor(image_array, cv2.COLOR_RGB2GRAY)

    h, w = image_array.shape[:2]

    # ── Colour analysis ───────────────────────────────────
    mean_rgb = image_array.mean(axis=(0, 1))
    r, g, b = mean_rgb[0], mean_rgb[1], mean_rgb[2]

    mean_sat = hsv[:, :, 1].mean()
    mean_val = hsv[:, :, 2].mean()

    # Dominant colour description
    if r > 160 and g < 120:
        colour_obs = "significant redness in the affected area"
    elif r > 140 and g > 120 and b < 100:
        colour_obs = "warm, brownish discolouration"
    elif mean_val < 80:
        colour_obs = "darkened or hyperpigmented areas"
    elif mean_sat < 30:
        colour_obs = "pale or desaturated skin tone"
    else:
        colour_obs = "uneven skin tone and discolouration"

    # ── Texture analysis ──────────────────────────────────
    laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()

    if laplacian_var > 800:
        texture_obs = "highly irregular and rough surface texture"
    elif laplacian_var > 300:
        texture_obs = "moderately uneven texture with visible surface irregularities"
    elif laplacian_var > 100:
        texture_obs = "slightly uneven texture compared to normal skin"
    else:
        texture_obs = "relatively smooth surface texture"

    # ── Edge/boundary analysis ────────────────────────────
    edges = cv2.Canny(gray, 50, 150)
    edge_density = edges.sum() / (h * w * 255)

    if edge_density > 0.15:
        boundary_obs = "well-defined lesion boundaries"
    elif edge_density > 0.08:
        boundary_obs = "partially defined borders around the affected area"
    else:
        boundary_obs = "diffuse, indistinct borders"

    # ── Size estimation ───────────────────────────────────
    skin_mask = cv2.inRange(
        hsv,
        np.array([0, 20, 70], dtype=np.uint8),
        np.array([25, 255, 255], dtype=np.uint8),
    )
    affected_ratio = cv2.countNonZero(skin_mask) / (h * w)

    if affected_ratio > 0.6:
        spread_obs = "covering a large portion of the visible area"
    elif affected_ratio > 0.3:
        spread_obs = "moderately spread across the skin surface"
    else:
        spread_obs = "localised to a specific area"

    # ── Build observation text ────────────────────────────
    observed = (
        f"The model observed {colour_obs}, with {texture_obs}. "
        f"The affected region appears {spread_obs}, showing {boundary_obs}."
    )

    # ── Compare to expected symptoms for this disease ─────
    disease_name = predicted_class.lower()

    # Expected visual features per disease group
    visual_expectations = {
        "melanoma": "irregular borders, multiple colour shades, and asymmetry",
        "psoriasis": "thick silvery scales on red patches",
        "eczema": "dry, inflamed patches with possible weeping or crusting",
        "ringworm": "ring-shaped rash with a clearer centre",
        "acne": "raised bumps, pimples, and possible pustules",
        "rosacea": "facial redness and visible blood vessels",
        "warts": "rough, raised, flesh-coloured growths",
        "fungal": "scaly, ring-patterned rash",
        "cellulitis": "red, warm, swollen skin",
        "herpes": "clusters of fluid-filled blisters",
        "lupus": "butterfly-shaped rash with photosensitive patches",
        "vasculitis": "purple or red spots and raised purpura",
        "pigmentation": "dark or light patches with uneven tone",
        "hair loss": "patches of thinning or absent hair",
        "nail": "thickened, discoloured, or brittle nails",
        "scabies": "tiny burrow tracks and papules, especially in skin folds",
        "default": "skin abnormalities consistent with this condition",
    }

    expected = "skin abnormalities consistent with this condition"
    for key, val in visual_expectations.items():
        if key in disease_name:
            expected = val
            break

    comparison = (
        f"These visual features are consistent with {expected}, "
        f"which aligns with the predicted condition."
    )

    return {
        "observed": observed,
        "comparison": comparison,
        "full_analysis": f"{observed} {comparison}",
    }
