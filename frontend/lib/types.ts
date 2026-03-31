export type AppState = 'idle' | 'processing' | 'results' | 'error'

export interface VisualAnalysis {
  observed:   string  // "The model observed redness with rough texture..."
  comparison: string  // "These features are consistent with psoriasis..."
}

export interface TopPrediction {
  disease:          string              // raw class name — never show to user
  disease_label:    string              // plain English — USE THIS in UI
  confidence:       number              // 0-100
  severity:         'low' | 'medium' | 'high'
  severity_label:   string             // "Safe to monitor at home" etc.
  severity_color:   string             // hex e.g. "#22c55e"
  description:      string
  symptoms:         string[]
  causes:           string[]
  urgency:          string
  visual_analysis:  VisualAnalysis
}

export interface SecondaryPrediction {
  disease:        string
  disease_label:  string              // use this, not disease
  confidence:     number
  severity:       'low' | 'medium' | 'high'
}

export interface PredictResponse {
  success:                boolean
  low_confidence_warning: string | null  // null if confidence is fine
  top_prediction:         TopPrediction
  all_predictions:        SecondaryPrediction[]
  disclaimer:             string
}

export interface PredictErrorDetail {
  error:            'no_skin_detected' | 'low_confidence' | string
  message:          string
  suggestion:       string
  skin_percentage?: number
  top_confidence?:  number
}

export interface Doctor {
  name:          string
  address:       string
  rating:        number | null
  total_ratings: number | null
  open_now:      boolean | null
  distance_km:   number
  maps_url:      string
}

export class AppError extends Error {
  constructor(
    public code:        string,
    public userMessage: string,
    public suggestion:  string
  ) {
    super(userMessage)
  }
}
