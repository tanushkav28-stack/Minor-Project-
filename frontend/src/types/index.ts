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

export interface ConsumptionCategory {
  category: string;
  time_spent_seconds: number;
  time_formatted: string;
  count: number;
  percentage: number;
}

export interface ConsumptionItem {
  log_id?: string;
  title: string;
  content_snippet?: string;
  domain?: string;
  url?: string;
  platform?: string;
  category: string;
  emotional_tone: 'positive' | 'neutral' | 'negative' | 'mixed';
  topic: string;
  emotional_intensity: 'low' | 'medium' | 'high';
  is_distressing: number;
  distressing_theme?: string;
  constructiveness: string;
  time_spent_seconds: number;
  date?: string;
  timestamp?: string;
}

export interface MoodCheckin {
  checkin_id?: string;
  mood: 'happy' | 'calm' | 'neutral' | 'stressed' | 'sad' | 'anxious';
  mood_score: number;
  note?: string;
  checkin_date: string;
  created_at?: string;
}

export interface DailyReportResponse {
  user_id: string;
  user_name: string;
  date: string;
  day_of_week: string;
  total_content_consumption_seconds: number;
  total_consumption_formatted: string;
  total_items_analyzed: number;
  emotional_distribution: {
    positive_pct: number;
    neutral_pct: number;
    negative_pct: number;
    mixed_pct: number;
    raw_counts: Record<string, number>;
  };
  category_breakdown: ConsumptionCategory[];
  topic_counts: Record<string, number>;
  emotional_intensity: Record<string, number>;
  constructiveness: Record<string, number>;
  distressing_count: number;
  ai_observations: {
    something_to_notice: string;
    positive_pattern: string;
    overall_summary: string;
    mood_correlation_insight: string;
  };
  mood_checkin: MoodCheckin | null;
  recent_items: ConsumptionItem[];
  disclaimer: string;
}

export interface WeeklyTimelineDay {
  date: string;
  day_name: string;
  total_items: number;
  total_minutes: number;
  positive_pct: number;
  neutral_pct: number;
  negative_pct: number;
  mood: string | null;
  mood_score: number | null;
  note: string | null;
}

export interface WeeklyReportResponse {
  user_id: string;
  user_name: string;
  start_date: string;
  end_date: string;
  total_items_analyzed: number;
  total_time_seconds: number;
  total_time_formatted: string;
  weekly_distribution: {
    positive_pct: number;
    neutral_pct: number;
    negative_pct: number;
    raw_counts: Record<string, number>;
  };
  category_time_distribution: Record<string, number>;
  timeline: WeeklyTimelineDay[];
  correlation_points: Array<{
    date: string;
    negative_pct: number;
    positive_pct: number;
    mood_score: number;
    mood: string;
  }>;
  ai_observations: {
    headline: string;
    trend_analysis: string;
    correlation_summary: string;
  };
  disclaimer: string;
}

