import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Brain, 
  Chrome, 
  Sparkles, 
  ShieldCheck, 
  BarChart3, 
  ArrowRight, 
  Layers, 
  Search, 
  HeartHandshake,
  CheckCircle2
} from 'lucide-react';
import { api } from '../services/api';
import { AnalysisResponse } from '../types';

export const LandingPage: React.FC = () => {
  const [demoText, setDemoText] = useState('Mujhe bhot akelapan feel hota h, kisi se baat karne ka mann nahi karta.');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResponse | null>(null);

  const samplePrompts = [
    { label: 'Loneliness (Hinglish)', text: 'Mujhe bhot akelapan feel hota h, kisi se baat karne ka mann nahi karta.' },
    { label: 'Hopelessness (Hinglish)', text: 'I don\'t think mai kabhi happy ho paungi. Future bilkul dark lagta hai.' },
    { label: 'Emotional Exhaustion', text: 'Sab kuch overwhelming lag raha hai. Bas rone ka mann karta hai har waqt.' },
    { label: 'Joy / Celebration', text: 'Yay! Finally cracked the Google Summer of Code internship! Mehnat rang layi 🎉✨' },
    { label: 'Situational Exam Stress', text: 'Exam kal subah hai and my heart is beating like crazy! Bhot nervousness ho rahi h 😰' }
  ];

  const handleQuickAnalyze = async () => {
    if (!demoText.trim()) return;
    setLoading(true);
    try {
      const data = await api.analyzeText({ text: demoText, source_type: 'landing_page_demo' });
      setResult(data);
    } catch (e) {
      alert('Ensure the Python backend is running on http://localhost:8000');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-24 py-12">
      {/* HERO SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold tracking-wide animate-pulse">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Major Project • Multitask Code-Mixed Mental Health AI</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight">
          Context-Aware Mental Health Language Analysis for{' '}
          <span className="bg-gradient-to-r from-blue-700 via-indigo-600 to-sky-600 bg-clip-text text-transparent">
            Hinglish Social Media
          </span>
        </h1>

        <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Indian youth express emotional distress using Romanized Hindi and code-mixed vocabulary. 
          Cognivibe AI combines a browser extension and shared multilingual encoder to identify emotional trajectories and depression-related linguistic cues in real time.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-blue-500/25 transition-all hover:scale-105"
          >
            <span>Open Research Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="#interactive-demo"
            className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 font-bold px-6 py-3 rounded-xl border border-slate-300 shadow-sm transition-all"
          >
            <span>Try Interactive Demo</span>
          </a>
        </div>
      </section>

      {/* THREE PILLARS OVERVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-5">
              <Chrome className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Browser Extension (Primary)</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Seamlessly integrates with Reddit, Twitter/X, Instagram, and YouTube. Analyzes selected texts and visible posts without manual copy-pasting.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-5">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Multitask Neural Engine</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Shared encoder with two parallel heads: Task 1 Emotion Classification (7 classes) and Task 2 Depression Indicator Classification (loneliness, hopelessness, etc.).
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center mb-5">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Contextual Dashboard</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Evaluates longitudinal trajectories across multiple turns to differentiate temporary bad days from chronic persistent distress, with downloadable PDF reports.
            </p>
          </div>
        </div>
      </section>

      {/* INTERACTIVE DEMO SANDBOX */}
      <section id="interactive-demo" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
          <div className="bg-slate-900 text-white p-6 sm:p-8 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-sky-400 text-xs font-bold tracking-wide uppercase">
                <Sparkles className="w-4 h-4" />
                <span>Live Preprocessing & Inference Sandbox</span>
              </div>
              <h2 className="text-2xl font-black mt-1">Test Code-Mixed Hinglish Inputs</h2>
            </div>
            <span className="hidden sm:inline-block px-3 py-1 bg-slate-800 rounded-lg text-xs text-slate-300 font-mono">
              FastAPI + Multitask Engine
            </span>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* Quick sample buttons */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                Click a sample Hinglish expression to test:
              </label>
              <div className="flex flex-wrap gap-2">
                {samplePrompts.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => { setDemoText(s.text); setResult(null); }}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 border border-slate-200 transition-colors"
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Input area */}
            <div>
              <textarea
                value={demoText}
                onChange={(e) => setDemoText(e.target.value)}
                rows={3}
                className="w-full p-4 rounded-xl border border-slate-300 text-slate-900 focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm"
                placeholder="Enter or paste social media text in Hinglish or English..."
              />
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleQuickAnalyze}
                disabled={loading}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl shadow-md transition-all disabled:opacity-50"
              >
                {loading ? 'Evaluating Model Representations...' : 'Run Multitask Inference'}
              </button>
            </div>

            {/* Results display */}
            {result && (
              <div className="mt-6 pt-6 border-t border-slate-200 space-y-4 animate-in fade-in duration-200">
                <div className="bg-slate-50 p-3 rounded-lg text-xs font-mono text-slate-600">
                  <strong>Normalized Text:</strong> "{result.normalized_text}"
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl">
                    <div className="text-[11px] font-bold uppercase text-blue-700 mb-1">Task 1: Emotion</div>
                    <div className="text-xl font-extrabold text-blue-950">{result.task_1_emotion.predicted_emotion}</div>
                    <div className="text-xs text-blue-600 mt-1">
                      Confidence: {Math.round(result.task_1_emotion.confidence * 100)}%
                    </div>
                  </div>

                  <div className={`p-4 rounded-xl border ${
                    result.task_2_depression_language.depression_related 
                      ? 'bg-rose-50 border-rose-200' 
                      : 'bg-emerald-50 border-emerald-200'
                  }`}>
                    <div className="text-[11px] font-bold uppercase mb-1 text-slate-600">
                      Task 2: Depression Language
                    </div>
                    <div className={`text-xl font-extrabold ${
                      result.task_2_depression_language.depression_related ? 'text-rose-900' : 'text-emerald-900'
                    }`}>
                      {result.task_2_depression_language.depression_related ? 'Flagged Language' : 'Non-Depressive'}
                    </div>
                    <div className="text-xs text-slate-600 mt-1">
                      Indicator: <strong>{result.task_2_depression_language.indicator.replace('_', ' ')}</strong>
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
                    <div className="text-[11px] font-bold uppercase text-slate-600 mb-1">Model Uncertainty</div>
                    <div className="text-xl font-extrabold text-slate-900">
                      {Math.round(result.uncertainty.score * 100)}%
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      Status: <strong>{result.uncertainty.status}</strong>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl text-xs text-slate-700 space-y-1.5">
                  <span className="font-bold text-slate-900">Detected Linguistic Indicators:</span>
                  <ul className="list-disc pl-5 space-y-0.5">
                    {result.linguistic_cues.map((cue, idx) => (
                      <li key={idx}>{cue}</li>
                    ))}
                  </ul>
                </div>

                {result.task_2_depression_language.depression_related && (
                  <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-xs text-amber-900">
                    <strong>Supportive Resources Available:</strong> Tele-MANAS (14416) • KIRAN (1800-599-0019) • Vandrevala Foundation (+91 9999 666 555)
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* EXTENSION SETUP CALLOUT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white rounded-3xl p-8 sm:p-12 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-800 text-blue-200 text-xs font-bold">
              <Chrome className="w-3.5 h-3.5" />
              <span>Google Chrome & Microsoft Edge Ready</span>
            </div>
            <h2 className="text-3xl font-extrabold leading-tight">
              Analyze Social Media Directly While Browsing
            </h2>
            <p className="text-sm text-blue-200 leading-relaxed">
              No need to copy and paste. Install our Manifest V3 browser extension and screen posts across Reddit, Twitter/X, Instagram, and YouTube with a single highlight.
            </p>
            <div className="flex items-center gap-3 pt-2 text-xs text-blue-300 font-mono">
              <span>chrome://extensions → Load unpacked → select 'browser-extension'</span>
            </div>
          </div>
          <Link
            to="/settings"
            className="bg-white text-blue-900 hover:bg-blue-50 font-extrabold px-8 py-4 rounded-2xl shadow-xl transition-transform hover:scale-105 shrink-0"
          >
            Get Extension Token
          </Link>
        </div>
      </section>
    </div>
  );
};

