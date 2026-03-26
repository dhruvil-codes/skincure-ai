export type AppState = 'idle' | 'processing' | 'results' | 'error';

export interface TopPrediction {
  disease: string;
  confidence: number;   // 0-100
  severity: 'low' | 'medium' | 'high';
  description: string;
  urgency: string;
  color: string;
  symptoms?: string[];
  what_we_saw?: string;
}

export interface AnalysisResult {
  top_prediction: TopPrediction;
  all_predictions: TopPrediction[];
  disclaimer: string;
}

export interface Doctor {
  name: string;
  address: string;
  rating: number;
  distance_km: number;
  open_now: boolean;
  maps_url: string;
}

export interface DoctorsResult {
  doctors: Doctor[];
}
