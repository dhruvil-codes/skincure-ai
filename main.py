# main.py
#
# FastAPI application for the Skin Cure API.
#
# Routes:
#   GET  /          → API status
#   GET  /health    → Health check (model loaded status)
#   POST /predict   → Skin disease classification from uploaded image
#   GET  /doctors   → Nearby dermatologists via Google Places API

import os
from pathlib import Path

import cv2
import httpx
import numpy as np
from dotenv import load_dotenv
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from disease_info import get_disease_info, get_friendly_name
from model import ModelManager, is_skin_image, analyze_visual_features

# Load environment variables from .env (no-op in production where vars are injected)
load_dotenv()


# ── Application setup ─────────────────────────────────────────────────────────

app = FastAPI(
    title="Skin Cure API",
    description="AI-powered skin disease classifier backend",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        os.getenv("FRONTEND_URL", "*"),
        "http://localhost:3000",
        "http://localhost:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Constants ─────────────────────────────────────────────────────────────────

MAX_FILE_SIZE: int = 10 * 1024 * 1024  # 10 MB

ALLOWED_CONTENT_TYPES: set[str] = {
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
}

# Severity metadata surfaced to the frontend for colour-coded display
SEVERITY_LABELS: dict[str, dict[str, str]] = {
    "low":    {"label": "Safe to monitor at home",             "color": "#22c55e"},
    "medium": {"label": "Consider consulting a dermatologist", "color": "#f59e0b"},
    "high":   {"label": "Please see a doctor soon",            "color": "#ef4444"},
}


# ── Startup event ─────────────────────────────────────────────────────────────

@app.on_event("startup")
async def startup_event() -> None:
    """
    Load the ML model once when the server starts.
    If the model file is missing, the server still starts but /predict
    will return 503 until the model is placed and the server is restarted.
    """
    model_path  = os.getenv("MODEL_PATH",  "./model/best_model.pth")
    config_path = os.getenv("CONFIG_PATH", "./model/deployment_config.json")

    if not Path(model_path).exists():
        print(f"WARNING: Model weights not found at {model_path}")
        print("Place best_model.pth in ./model/ to enable predictions.")
        return

    try:
        ModelManager.load(model_path, config_path)
        print("✅ Model ready")
    except Exception as exc:
        print(f"❌ Model failed to load: {exc}")


# ── Routes ────────────────────────────────────────────────────────────────────

@app.get("/")
def root() -> dict:
    """Return basic API metadata."""
    return {
        "name":    "Skin Cure API",
        "version": "1.0.0",
        "status":  "running",
    }


@app.get("/health")
def health() -> dict:
    """
    Health check endpoint.

    Returns model_loaded status and the device (cpu/cuda) the model is on.
    Useful for verifying a fresh deployment is ready to serve predictions.
    """
    return {
        "status":       "ok",
        "model_loaded": ModelManager.is_loaded(),
        "device":       str(ModelManager._device) if ModelManager._device else "not loaded",
    }


@app.post("/predict")
async def predict(file: UploadFile = File(...)) -> dict:
    """
    Accept a skin image upload, run ML inference, and return a structured
    prediction enriched with disease information.

    **Request**
    - Content-Type: multipart/form-data
    - Body field: `file` (JPEG / PNG / WEBP, max 10 MB)

    **Response (200)**
    ```json
    {
      "success": true,
      "top_prediction": { ... },
      "all_predictions": [ ... ],
      "disclaimer": "..."
    }
    ```

    **Error codes**
    - 400 — invalid file type or file too large or corrupt image
    - 503 — model not yet loaded on the server
    - 500 — unexpected inference error
    """

    # ── 1. Validate MIME type ─────────────────────────────────────────────
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Invalid file type: {file.content_type}. "
                "Accepted: JPG, PNG, WEBP"
            ),
        )

    # ── 2. Read and size-check the uploaded bytes ─────────────────────────
    contents: bytes = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail="File too large. Maximum size is 10 MB.",
        )

    # ── 3. Decode image bytes → numpy RGB array ───────────────────────────
    nparr = np.frombuffer(contents, np.uint8)
    img   = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if img is None:
        raise HTTPException(
            status_code=400,
            detail="Could not decode image. Please upload a valid image file.",
        )

    # cv2 reads as BGR; convert to RGB before passing to the model
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

    # ── 4. Skin validation — reject non-skin images ───────────────────────
    skin_check = is_skin_image(img)
    if not skin_check["is_skin"]:
        raise HTTPException(
            status_code=422,
            detail={
                "error": "no_skin_detected",
                "message": "We couldn't detect skin in your photo.",
                "suggestion": "Please upload a clear, close-up photo of the affected skin area.",
                "skin_percentage": skin_check["skin_percentage"],
            },
        )

    # ── 5. Guard — ensure model is available ──────────────────────────────
    if not ModelManager.is_loaded():
        raise HTTPException(
            status_code=503,
            detail="Model not loaded. Please check server configuration.",
        )

    # ── 6. Run inference ──────────────────────────────────────────────────
    try:
        predictions = ModelManager.predict(img, top_k=5)
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Inference failed: {exc}",
        )

    # ── 7. Validate confidence threshold ──────────────────────────────────
    top_confidence = predictions[0]["confidence"]

    # Hard reject only truly uncertain predictions
    if top_confidence < 25.0:
        raise HTTPException(
            status_code=422,
            detail={
                "error": "low_confidence",
                "message": "We couldn't confidently identify a skin condition in this photo.",
                "suggestion": "Please upload a clear, close-up photo of the affected skin area in good lighting.",
                "top_confidence": top_confidence,
            },
        )

    # Soft warning for borderline confidence
    low_confidence_warning = None
    if top_confidence < 45.0:
        low_confidence_warning = (
            "The AI has low confidence in this result. "
            "The photo may be too close, too dark, or the condition may be mild. "
            "Please treat this as a rough indicator only."
        )

    # ── 8. Enrich top prediction with disease database info ───────────────
    top: dict = predictions[0]
    info: dict = get_disease_info(top["disease"])
    severity_meta: dict = SEVERITY_LABELS.get(top["severity"], SEVERITY_LABELS["low"])

    # ── 9. Generate visual analysis ────────────────────────────────────────
    visual_analysis: dict = analyze_visual_features(img, top["disease"])

    return {
        "success": True,
        "top_prediction": {
            "disease":        top["disease"],
            "disease_label":  get_friendly_name(top["disease"]),
            "confidence":     top["confidence"],
            "severity":       top["severity"],
            "severity_label": severity_meta["label"],
            "severity_color": severity_meta["color"],
            "description":    info["description"],
            "symptoms":       info["symptoms"],
            "causes":         info["causes"],
            "urgency":        info["urgency"],
            "visual_analysis": visual_analysis["full_analysis"],
            "confidence_warning": low_confidence_warning,
        },
        "all_predictions": [
            {
                "disease":       p["disease"],
                "disease_label": get_friendly_name(p["disease"]),
                "confidence":    p["confidence"],
                "severity":      p["severity"],
            }
            for p in predictions
        ],
        "disclaimer": (
            "This analysis is generated by an AI model and is not a medical diagnosis. "
            "Always consult a qualified dermatologist for accurate diagnosis and treatment."
        ),
    }


@app.get("/doctors")
async def get_nearby_doctors(lat: float, lng: float, radius: int = 5000) -> dict:
    """
    Find nearby dermatologists using the Google Places Nearby Search API.

    **Query parameters**
    - `lat`    (float, required) — user latitude
    - `lng`    (float, required) — user longitude
    - `radius` (int, optional)  — search radius in metres (default: 5000 = 5 km)

    **Response (200)**
    ```json
    {
      "doctors": [
        {
          "name": "...",
          "address": "...",
          "rating": 4.5,
          "total_ratings": 120,
          "open_now": true,
          "distance_km": 1.2,
          "maps_url": "https://www.google.com/maps/place/?q=place_id:..."
        }
      ]
    }
    ```

    Returns mock data when no valid `GOOGLE_MAPS_API_KEY` is configured,
    allowing local development without a live API key.
    """
    api_key: str | None = os.getenv("GOOGLE_MAPS_API_KEY")

    # ── Mock data for local development (no API key required) ─────────────
    if not api_key or api_key == "your_google_maps_api_key_here":
        return {
            "doctors": [
                {
                    "name":          "Sample Dermatology Clinic",
                    "address":       "123 Medical Street",
                    "rating":        4.5,
                    "total_ratings": 120,
                    "open_now":      True,
                    "distance_km":   1.2,
                    "maps_url":      "https://maps.google.com/?q=dermatologist+near+me",
                }
            ],
            "note": "Mock data — add GOOGLE_MAPS_API_KEY to .env for real results",
        }

    # ── Call Google Places Nearby Search API ──────────────────────────────
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                "https://maps.googleapis.com/maps/api/place/nearbysearch/json",
                params={
                    "location": f"{lat},{lng}",
                    "radius":   radius,
                    "type":     "doctor",
                    "keyword":  "dermatologist skin specialist",
                    "key":      api_key,
                },
            )
        data: dict = response.json()
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="Maps API request timed out")
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Maps API error: {exc}")

    if data.get("status") not in ("OK", "ZERO_RESULTS"):
        raise HTTPException(
            status_code=502,
            detail=f"Google Maps error: {data.get('status')}",
        )

    # ── Format up to 10 results ───────────────────────────────────────────
    doctors: list[dict] = []

    for place in data.get("results", [])[:10]:
        loc: dict = place["geometry"]["location"]

        # Approximate Euclidean distance in km (sufficient for nearby search)
        d_lat = loc["lat"] - lat
        d_lng = loc["lng"] - lng
        dist_km = round(((d_lat ** 2 + d_lng ** 2) ** 0.5) * 111, 1)

        doctors.append({
            "name":          place.get("name"),
            "address":       place.get("vicinity"),
            "rating":        place.get("rating"),
            "total_ratings": place.get("user_ratings_total"),
            "open_now":      place.get("opening_hours", {}).get("open_now"),
            "distance_km":   dist_km,
            "maps_url": (
                f"https://www.google.com/maps/place/?q=place_id:"
                f"{place.get('place_id')}"
            ),
        })

    # Sort results by ascending distance so the closest appears first
    doctors.sort(key=lambda d: d["distance_km"])

    return {"doctors": doctors}
