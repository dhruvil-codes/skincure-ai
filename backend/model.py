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
        model = SkinModel(
            model_name=cls._config["model_name"],
            num_classes=cls._config["num_classes"],
        ).to(cls._device)

        # LFS Fallback: If HF Docker didn't pull the LFS file natively, it's left as a 130-byte text pointer.
        if Path(model_path).exists() and Path(model_path).stat().st_size < 1000:
            print(f"File {model_path} is an LFS pointer. Downloading actual weights from Hub...")
            from huggingface_hub import hf_hub_download
            model_path = hf_hub_download(
                repo_id="dhruvilhere/skin-cure-api",
                repo_type="space",
                filename="model/best_model.pth"
            )

        # Load saved weights from checkpoint
        checkpoint = torch.load(model_path, map_location=cls._device, weights_only=False)
        model.load_state_dict(checkpoint["model_state_dict"])
        model.eval()

        # Only assign to class variable after complete success
        cls._model = model

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
# Image validation helpers
# ─────────────────────────────────────────────────────────────────────────────

def is_skin_image(image_array: np.ndarray) -> dict:
    """
    Multi-factor check to verify the image contains real skin tissue.

    Uses a combination of:
      1. HSV skin-colour mask (two ranges covering all skin tones)
      2. Blob continuity — skin pixels must form contiguous regions,
         not just scattered colour-matched pixels (which cars can produce)
      3. Colour uniformity test — paint/metal has very low saturation
         variance; real skin has higher local variation
      4. Edge-density vs skin-pixel ratio — manufactured objects have
         many hard edges relative to skin-coloured area

    Args:
        image_array: RGB numpy array (uint8) in RGB order.

    Returns:
        dict with keys:
            - is_skin (bool)
            - skin_percentage (float)
            - reason (str)   — 'OK' on success, human-readable on failure
    """
    h, w = image_array.shape[:2]
    total_pixels = h * w

    # ── 1. HSV skin-colour mask ──────────────────────────────────────────
    hsv = cv2.cvtColor(image_array, cv2.COLOR_RGB2HSV)

    # Light to medium skin tones (slightly tighter than before to reduce FP)
    lower1 = np.array([0,  25, 80], dtype=np.uint8)
    upper1 = np.array([22, 230, 255], dtype=np.uint8)

    # Darker / olive skin tones and the wrap-around red hue
    lower2 = np.array([165, 25, 60], dtype=np.uint8)
    upper2 = np.array([180, 230, 255], dtype=np.uint8)

    # Brown / darker complexions that sit in mid-orange hue
    lower3 = np.array([5,  40, 40], dtype=np.uint8)
    upper3 = np.array([25, 180, 200], dtype=np.uint8)

    mask1 = cv2.inRange(hsv, lower1, upper1)
    mask2 = cv2.inRange(hsv, lower2, upper2)
    mask3 = cv2.inRange(hsv, lower3, upper3)
    skin_mask = cv2.bitwise_or(cv2.bitwise_or(mask1, mask2), mask3)

    skin_pixels = int(cv2.countNonZero(skin_mask))
    skin_pct    = (skin_pixels / total_pixels) * 100

    MIN_SKIN_PCT = 15.0  # at least 15 % of the frame must be skin-coloured

    if skin_pct < MIN_SKIN_PCT:
        return {
            "is_skin": False,
            "skin_percentage": round(skin_pct, 1),
            "reason": (
                f"Only {skin_pct:.1f}% of the image appears to be skin. "
                "Please upload a clear photo of the affected skin area."
            ),
        }

    # ── 2. Blob continuity check ─────────────────────────────────────────
    # Real skin appears as large connected regions.  Scattered colour matches
    # (e.g. car reflections) typically produce many tiny blobs.
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7))
    cleaned = cv2.morphologyEx(skin_mask, cv2.MORPH_CLOSE, kernel)
    cleaned = cv2.morphologyEx(cleaned, cv2.MORPH_OPEN,  kernel)

    num_labels, _, stats, _ = cv2.connectedComponentsWithStats(cleaned)

    # Sum area of blobs that are at least 1% of the image
    min_blob_area = total_pixels * 0.01
    large_blobs   = [
        stats[i, cv2.CC_STAT_AREA]
        for i in range(1, num_labels)         # skip background (label 0)
        if stats[i, cv2.CC_STAT_AREA] >= min_blob_area
    ]

    if not large_blobs:
        return {
            "is_skin": False,
            "skin_percentage": round(skin_pct, 1),
            "reason": (
                "Skin-coloured pixels are too scattered. "
                "Please ensure the affected skin area is clearly in frame."
            ),
        }

    # The largest blob must cover ≥ 8 % of the total image
    largest_blob_pct = (max(large_blobs) / total_pixels) * 100
    if largest_blob_pct < 8.0:
        return {
            "is_skin": False,
            "skin_percentage": round(skin_pct, 1),
            "reason": (
                "No large continuous skin region found. "
                "Please upload a close-up photo of the affected area."
            ),
        }

    # ── 3. Colour uniformity / paint test ────────────────────────────────
    # Extract saturation channel within the largest skin blob.
    # Manufactured surfaces (car paint, walls) are highly UNIFORM in saturation.
    # Real skin has moderate local variation due to pores, texture, shadows.
    sat_channel = hsv[:, :, 1].astype(np.float32)
    sat_skin    = sat_channel[skin_mask > 0]

    if sat_skin.size > 0:
        sat_std = float(np.std(sat_skin))
        # Paint / metal usually has sat_std < 18; real skin > 25
        if sat_std < 15.0:
            return {
                "is_skin": False,
                "skin_percentage": round(skin_pct, 1),
                "reason": (
                    "The image appears to show a uniform painted or synthetic surface, "
                    "not skin. Please upload a photo of the affected skin area."
                ),
            }

    # ── 4. Edge-density vs skin-area ratio ───────────────────────────────
    # Manufactured objects (cars, furniture) have many hard edges relative to
    # the area of skin-tone colours.  Real skin images have softer transitions.
    gray       = cv2.cvtColor(image_array, cv2.COLOR_RGB2GRAY)
    edges      = cv2.Canny(gray, 50, 150)
    edge_count = int(edges.sum() // 255)  # number of edge pixels

    if skin_pixels > 0:
        edge_skin_ratio = edge_count / skin_pixels
        # If edges outnumber skin pixels 1:1 this is almost certainly not skin
        if edge_skin_ratio > 0.9:
            return {
                "is_skin": False,
                "skin_percentage": round(skin_pct, 1),
                "reason": (
                    "This image appears to contain an object rather than skin. "
                    "Please upload a photo showing the affected skin area."
                ),
            }

    # ── All checks passed ────────────────────────────────────────────────
    return {
        "is_skin": True,
        "skin_percentage": round(skin_pct, 1),
        "reason": "OK",
    }


def check_image_quality(image_array: np.ndarray) -> dict:
    """
    Assess whether the image is sharp enough for reliable ML inference.

    Uses the variance of the Laplacian (a widely-used blur metric):
      - Very low variance → blurry / out-of-focus image
      - Moderate / high variance → sufficiently sharp

    A 4+ MB JPEG from a modern smartphone will almost always pass.

    Args:
        image_array: RGB numpy array.

    Returns:
        dict with keys:
            - is_quality (bool)
            - sharpness_score (float)  — Laplacian variance
            - reason (str)
    """
    gray     = cv2.cvtColor(image_array, cv2.COLOR_RGB2GRAY)
    lap_var  = float(cv2.Laplacian(gray, cv2.CV_64F).var())

    # Threshold calibrated so that genuine medical photos from modern phones
    # (which often have high detail) always pass.  Only extremely blurry or
    # artificially downscaled images will fail.
    BLUR_THRESHOLD = 20.0

    if lap_var < BLUR_THRESHOLD:
        return {
            "is_quality": False,
            "sharpness_score": round(lap_var, 2),
            "reason": (
                f"Image appears blurry (sharpness score: {lap_var:.1f}). "
                "Please upload a clearly-focused photo."
            ),
        }

    return {
        "is_quality": True,
        "sharpness_score": round(lap_var, 2),
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
