import React, { useState } from 'react';
import { 
  Sparkles, 
  HelpCircle, 
  History, 
  PhoneCall, 
  CheckCircle2, 
  AlertCircle,
  Activity
} from 'lucide-react';
import { api } from '../services/api';
import { AnalysisResponse } from '../types';

export const AnalysisPage: React.FC = () => {
  const [text, setText] = useState('');
  const [includeContext, setIncludeContext] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResponse | null>(null);

  const samplePrompts = [
    { label: 'Loneliness', text: 'Mujhe bhot akelapan feel hota h, kisi se baat karne ka mann nahi karta.' },
    { label: 'Hopelessness', text: 'Koi ummeed nahi bachi ab, sab kuch try kar ke dekh liya nothing gets better.' },
    { label: 'Emotional Exhaustion', text: 'Mentally exhausted ho chuka hu. Sleeping 12 hours still waking up drained.' },
    { label: 'Negative Self-Perception', text: 'Mai kisi kaam ka nahi hu, bas sabke upar ek burden banke reh gaya hu.' },
    { label: 'Loss of Interest', text: 'Pehle guitar bajana accha lagta tha, ab kuch bhi feel nahi hota. Pure numbness.' },
    { label: 'Situational Stress', text: 'Exam kal subah hai and my heart is beating like crazy! Bhot nervousness ho rahi h 😰' },
    { label: 'Joy / Achievement', text: 'Yay! Finally cracked the Google Summer of Code internship! Mehnat rang layi 🎉✨' }
  ];

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const data = await api.analyzeText({
        text,
        source_type: 'web_dashboard_manual',
        include_context: includeContext
      });
      setResult(data);
    } catch (err: any) {
      alert(err.message || 'Analysis failed. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-xs font-bold text-sky-700 uppercase tracking-wider mb-1">
          <Sparkles className="w-3.5 h-3.5 text-sky-600" />
          <span>Cognivibe AI Live Language Inference</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 mt-1">Live Language Analysis Console</h1>
        <p className="text-xs text-slate-500 mt-1">
          Input Hindi-English code-mixed (Hinglish) or English social media text to run real-time multitask emotion & depression screening.
        </p>
      </div>

      {/* Input Console */}
      <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-sky-100 p-6 sm:p-8 shadow-[0_4px_25px_-5px_rgba(14,165,233,0.08)] space-y-6">
        <div>
          <label className="text-xs font-bold text-sky-900 uppercase tracking-wider block mb-2.5">
            Preset Hinglish Samples:
          </label>
          <div className="flex flex-wrap gap-2">
            {samplePrompts.map((s, idx) => (
              <button
                key={idx}
                onClick={() => { setText(s.text); setResult(null); }}
                className="text-xs font-semibold px-3.5 py-1.5 rounded-xl bg-sky-50/80 hover:bg-sky-100 text-sky-800 border border-sky-200/70 transition-all hover:scale-[1.02]"
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1.5">Input Text</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            placeholder="Type or paste Hinglish text (e.g., 'Sab kuch overwhelming lag raha hai. Bas rone ka mann karta hai har waqt.')..."
            className="w-full p-4 rounded-2xl border border-sky-200 text-slate-900 text-sm focus:ring-2 focus:ring-sky-500 focus:border-transparent leading-relaxed bg-sky-50/20"
          />
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-2">
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={includeContext}
              onChange={(e) => setIncludeContext(e.target.checked)}
              className="rounded-lg border-sky-300 text-sky-600 focus:ring-sky-500 w-4 h-4"
            />
            <span>Include Recent Context History (Evaluates user's longitudinal trajectory)</span>
          </label>

          <button
            onClick={handleAnalyze}
            disabled={loading || !text.trim()}
            className="w-full sm:w-auto bg-gradient-to-r from-sky-500 via-sky-600 to-teal-500 hover:from-sky-600 hover:to-teal-600 text-white font-bold px-7 py-3 rounded-2xl text-xs sm:text-sm shadow-md shadow-sky-500/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2 hover:scale-105 active:scale-95"
          >
            {loading ? 'Evaluating Model...' : 'Analyze Language'}
          </button>
        </div>
      </div>

      {/* RESULTS DISPLAY */}
      {result && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Top Classification Badges */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Task 1 Emotion */}
            <div className="bg-white/90 backdrop-blur-md p-6 rounded-3xl border border-sky-100 shadow-[0_4px_20px_-4px_rgba(14,165,233,0.08)] space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[11px] font-bold uppercase text-sky-700 tracking-wider">Task 1: Emotion</span>
                  <div className="text-2xl font-black text-slate-900 mt-1 capitalize">{result.task_1_emotion.predicted_emotion}</div>
                </div>
                <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-800 border border-sky-200">
                  {Math.round(result.task_1_emotion.confidence * 100)}% Confidence
                </span>
              </div>

              {/* Emotion Probability Bars */}
              <div className="space-y-2 pt-2 border-t border-sky-100">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Class Probabilities:</div>
                {Object.entries(result.task_1_emotion.all_probabilities).map(([emo, prob]) => (
                  <div key={emo} className="space-y-0.5">
                    <div className="flex justify-between text-xs text-slate-600">
                      <span>{emo}</span>
                      <span className="font-mono">{Math.round(prob * 100)}%</span>
                    </div>
                    <div className="h-2 w-full bg-sky-50 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-sky-500 to-teal-400 rounded-full transition-all duration-500"
                        style={{ width: `${Math.round(prob * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Task 2 Depression Language */}
            <div className={`p-6 rounded-3xl border shadow-[0_4px_20px_-4px_rgba(14,165,233,0.08)] space-y-4 ${
              result.task_2_depression_language.depression_related
                ? 'bg-rose-50/70 border-rose-200'
                : 'bg-teal-50/70 border-teal-200'
            }`}>
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                    Task 2: Distress Indicator Language
                  </span>
                  <div className={`text-2xl font-black mt-1 ${
                    result.task_2_depression_language.depression_related ? 'text-rose-900' : 'text-teal-900'
                  }`}>
                    {result.task_2_depression_language.depression_related ? 'Flagged Language' : 'Non-Depressive'}
                  </div>
                </div>
                <span className={`px-3.5 py-1 rounded-full text-xs font-bold border ${
                  result.task_2_depression_language.depression_related
                    ? 'bg-rose-100 text-rose-900 border-rose-300'
                    : 'bg-teal-100 text-teal-900 border-teal-300'
                }`}>
                  Indicator: {result.task_2_depression_language.indicator.replace('_', ' ').toUpperCase()}
                </span>
              </div>

              {/* Specific indicator probabilities */}
              <div className="space-y-2 pt-2 border-t border-slate-200/50">
                <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Linguistic Indicators:</div>
                {Object.entries(result.task_2_depression_language.all_probabilities).map(([ind, prob]) => (
                  <div key={ind} className="space-y-0.5">
                    <div className="flex justify-between text-xs text-slate-700">
                      <span>{ind.replace('_', ' ').toUpperCase()}</span>
                      <span className="font-mono">{Math.round(prob * 100)}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-200/50 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          result.task_2_depression_language.depression_related ? 'bg-rose-500' : 'bg-teal-500'
                        }`}
                        style={{ width: `${Math.round(prob * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Context & Uncertainty Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Uncertainty & Entropy */}
            <div className="bg-white/90 backdrop-blur-md p-6 rounded-3xl border border-sky-100 shadow-[0_4px_20px_-4px_rgba(14,165,233,0.08)] space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-sky-800 uppercase tracking-wider">
                <HelpCircle className="w-4 h-4 text-sky-600" />
                <span>Model Uncertainty (Normalized Shannon Entropy)</span>
              </div>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-black text-slate-900">
                  {Math.round(result.uncertainty.score * 100)}%
                </span>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-lg ${
                  result.uncertainty.is_uncertain ? 'bg-amber-100 text-amber-900' : 'bg-teal-100 text-teal-900'
                }`}>
                  {result.uncertainty.status.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {result.uncertainty.explanation}
              </p>
            </div>

            {/* Context Trajectory */}
            <div className="bg-white/90 backdrop-blur-md p-6 rounded-3xl border border-sky-100 shadow-[0_4px_20px_-4px_rgba(14,165,233,0.08)] space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-teal-800 uppercase tracking-wider">
                <History className="w-4 h-4 text-teal-600" />
                <span>Context-Aware Trajectory Analysis</span>
              </div>
              <div className="text-sm font-bold text-slate-800">
                Trajectory: <span className="text-teal-700 font-extrabold">{result.context_analysis.trajectory}</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {result.context_analysis.contextual_adjustment}
              </p>
            </div>
          </div>

          {/* Linguistic Preprocessing Breakdown */}
          <div className="bg-white/90 backdrop-blur-md p-6 rounded-3xl border border-sky-100 shadow-[0_4px_20px_-4px_rgba(14,165,233,0.08)] space-y-3">
            <span className="text-xs font-bold text-sky-900 uppercase tracking-wider block">
              Code-Mixed Hinglish Preprocessing & Cues
            </span>
            <div className="bg-sky-50/50 border border-sky-100 p-3.5 rounded-2xl font-mono text-xs text-slate-800 space-y-1">
              <div><strong>Input Text:</strong> {result.input_text}</div>
              <div><strong>Normalized:</strong> {result.normalized_text}</div>
              <div><strong>Code-Mixed:</strong> {result.metadata.is_code_mixed ? 'Yes (Hinglish detected)' : 'No (predominantly English)'}</div>
            </div>
            <div className="space-y-1 text-xs text-slate-700">
              <div className="font-bold text-slate-800">Salient Cues Identified:</div>
              <ul className="list-disc pl-5 space-y-0.5 text-slate-600">
                {result.linguistic_cues.map((cue, idx) => (
                  <li key={idx}>{cue}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Crisis / Distress Supportive Resources Card */}
          {result.supportive_resources && result.supportive_resources.length > 0 && (
            <div className="bg-rose-50/80 border border-rose-200 rounded-3xl p-6 sm:p-8 space-y-4">
              <div className="flex items-center gap-2 text-rose-800 font-extrabold text-base">
                <PhoneCall className="w-5 h-5 text-rose-600" />
                <span>Supportive Crisis Intervention Resources</span>
              </div>
              <p className="text-xs text-rose-800 leading-relaxed">
                {result.ethical_disclaimer}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {result.supportive_resources.map((hl, idx) => (
                  <div key={idx} className="bg-white p-3.5 rounded-2xl border border-rose-200 shadow-xs">
                    <div className="text-xs font-bold text-slate-900">{hl.name}</div>
                    <div className="text-sm font-extrabold text-rose-600 mt-0.5">{hl.number}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{hl.available}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
