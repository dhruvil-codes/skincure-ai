---
title: Skin Cure API
emoji: 🩺
colorFrom: green
colorTo: blue
sdk: docker
pinned: false
app_file: main.py
---

# Skin Cure API

FastAPI backend for the [Skin Cure](https://skincure-ai.vercel.app) application.
AI-powered skin disease classifier using a SwinV2-Base transformer model.

## Endpoints

- `GET /` — API status
- `GET /health` — Health check
- `POST /predict` — Skin disease classification from uploaded image
- `GET /doctors` — Nearby dermatologists via Google Places API
