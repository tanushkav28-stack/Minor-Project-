export interface User {
  user_id: string;
  name: string;
  email: string;
  extension_token?: string;
  created_at?: string;
}

export interface EmotionPrediction {
  predicted_emotion: string;
  confidence: number;
  entropy: number;
  all_probabilities: Record<string, number>;
}

export interface DepressionPrediction {
  depression_related: boolean;
  probability: number;
  indicator: string;
  indicator_confidence: number;
  all_probabilities: Record<string, number>;
}

export interface UncertaintyData {
  score: number;
  is_uncertain: boolean;
  status: string;
  explanation: string;
}

export interface AnalysisResponse {
  analysis_id?: string;
  input_text: string;
  normalized_text: string;
  metadata: {
    is_code_mixed: boolean;
    devanagari_ratio: number;
    latin_ratio: number;
    crisis_flag: boolean;
  };
  task_1_emotion: EmotionPrediction;
  task_2_depression_language: DepressionPrediction;
  uncertainty: UncertaintyData;
  context_analysis: {
    context_applied: boolean;
    history_length: number;
    total_evaluated_turns?: number;
    chronic_risk_flag?: boolean;
    trajectory: string;
    persistence_ratio: number;
    dominant_indicator?: string;
    contextual_adjustment: string;
  };
  linguistic_cues: string[];
  ethical_disclaimer: string;
  supportive_resources: Array<{
    name: string;
    number: string;
    available: string;
  }>;
  saved_to_history?: boolean;
}

export interface HistoryItem {
  analysis_id: string;
  user_id: string;
  source_type: string;
  input_text: string;
  normalized_text: string;
  is_code_mixed: number;
  uncertainty_score: number;
  is_uncertain: number;
  created_at: string;
  predicted_emotion: string;
  emotion_confidence: number;
  depression_related: number;
  predicted_indicator: string;
  dep_confidence: number;
  is_crisis: number;
}

export interface DashboardSummary {
  total_analyses: number;
  avg_uncertainty: number;
  depression_language_count: number;
  depression_percentage: number;
  emotion_distribution: Record<string, number>;
  indicator_distribution: Record<string, number>;
  source_distribution: Record<string, number>;
}

