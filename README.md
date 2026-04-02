# Skin Cure AI

An AI-powered skin disease classifier built with Next.js and React. Upload a photo of a skin condition, get an instant structured analysis across 24 disease categories, and find nearby dermatologists — all in one flow.

The model is a SwinV2-Base Vision Transformer trained on 28,000+ medical images achieving ~78% validation accuracy.

---

## 📦 Technologies

- Next.js 14 (App Router)
- Python
- FastAPI
- Docker
- TypeScript
- Tailwind CSS
- Shadcn/ui
- Google Maps JavaScript API

---

## 🦄 Features

Here's what you can do with Skin Cure:

**Upload a Skin Photo:** Drag and drop or click to upload a JPG, PNG, or WEBP image. The app validates file size, format, and dimensions before sending to the AI.

**Get an AI Analysis:** The model analyses your photo and returns the most likely skin condition with a confidence score, severity rating, and a plain-language description. It also tells you what visual features it observed in your specific photo.

**Read Structured Results:** Each result includes the condition name, severity (safe to monitor / consult soon / see a doctor urgently), symptoms, causes, and a recommended action — all specific to the detected condition.

**See Other Possibilities:** The top 5 predictions are shown with individual confidence scores and severity indicators so you can see what else the model considered.

**Find Nearby Dermatologists:** Click Find Dermatologists Near You, allow location access, and the app instantly shows nearby skin specialists with their name, rating, distance, open/closed status, and a direct link to Google Maps directions.

**Photo Guidance:** A tips card above the upload zone tells you exactly how to take a photo for the best results — lighting, distance, and what to avoid.

---

## 🎯 How It Works

```
01  Upload Photo
    Take a clear photo of the affected skin area and upload it.

02  AI Analyses It
    The SwinV2-Base model classifies the condition across 24 categories.

03  Read Your Results
    Get a structured breakdown — disease, confidence, severity, symptoms, causes.

04  Find a Specialist
    Use the built-in doctor finder to locate dermatologists near you.
```

---

## 👩🏽‍🍳 The Process

I started by building and training the ML model on Kaggle using a merged dataset of 28,000+ images from DermNet and a custom skin disease dataset. The model went through 3 phases of progressive fine-tuning — frozen backbone warmup, partial unfreeze of the last transformer stage, then full fine-tuning with discriminative learning rates.

After hitting ~78% validation accuracy I exported the weights and built a FastAPI backend to serve predictions. The backend handles image validation, skin detection (rejects non-skin images), confidence thresholding, and Google Maps integration for the doctor finder.

On the frontend I focused on making the results feel trustworthy and clear rather than alarming. Health anxiety is real — every design decision was made to reduce friction and build confidence. The results card shows information in a progressive, structured way rather than dumping everything at once.

I also handled every error state explicitly — no-skin-detected, low confidence, location denied, network timeout — each with a specific message and actionable suggestion rather than a generic error.

---

## 📚 What I Learned

**Progressive Fine-Tuning:**
Training large vision transformers from scratch is impractical. I learned to freeze the backbone initially, warm up only the classification head, then gradually unfreeze deeper layers while using discriminative learning rates — lower for pretrained backbone layers, higher for the new head.

**Focal Loss for Class Imbalance:**
Standard cross-entropy treats all misclassifications equally. With a 6.5x class imbalance across 24 categories, this causes the model to ignore rare classes. Focal Loss mathematically down-weights easy examples and forces training attention onto hard, misclassified ones.

**NaN Loss Debugging:**
Mixed precision training (AMP) caused NaN loss that corrupted saved checkpoints. Disabling AMP and adding per-batch NaN guards before backpropagation fixed this completely.

**Geolocation API:**
The browser's native `navigator.geolocation` API is asynchronous and can be denied by the user. I learned to handle all states — requesting, granted, denied, unavailable, timeout — and give the user clear recovery instructions for each.

**Structured Error Handling:**
Instead of generic error messages, every backend error code maps to a specific user-facing message with a suggestion. `no_skin_detected` tells the user to zoom in. `low_confidence` tells them to improve lighting. This dramatically improves the experience compared to a generic "something went wrong."

**End-to-End Product Thinking:**
Building something that goes from raw data → trained model → API → frontend → deployment forced me to think about every layer. A 78% accurate model means 22% of predictions are wrong — the UI design, disclaimers, confidence scores, and urgency callouts all exist to communicate that uncertainty honestly to the user.

---

## 💭 How Can It Be Improved?

- Expand to 40+ disease classes with more training data
- Add Grad-CAM heatmap overlay to highlight which part of the image drove the prediction
- Add scalp-specific conditions (dandruff, folliculitis) — currently underrepresented
- Add Hindi / Hinglish disease names for Indian users
- PDF export of results to share with a doctor
- User history with auth — track skin condition changes over time
- Confidence breakdown chart showing all 24 class probabilities
- Dark mode

---

## ⚠️ Medical Disclaimer

Skin Cure is an educational tool and does not provide medical advice. The AI analysis is not a medical diagnosis. Always consult a qualified dermatologist for accurate diagnosis and treatment.
