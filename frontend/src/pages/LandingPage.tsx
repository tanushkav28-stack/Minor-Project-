import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  Heart, 
  Calendar, 
  ShieldCheck, 
  Feather, 
  Smile, 
  Compass, 
  PhoneCall, 
  Lock, 
  RefreshCw, 
  Wind, 
  CheckCircle2, 
  ArrowRight, 
  ChevronRight, 
  Info, 
  ExternalLink,
  MessageCircle,
  Clock,
  Coffee,
  Sun,
  Shield,
  Layers
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line, 
  Tooltip as RechartsTooltip, 
  XAxis, 
  YAxis 
} from 'recharts';
import { api } from '../services/api';
import { AnalysisResponse } from '../types';
import { BreathingModal } from '../components/BreathingModal';
import { JournalModal } from '../components/JournalModal';

// Days of the week data for the Mood History strip (inspired by reference design)
const MOOD_HISTORY_DAYS = [
  { day: 'Mon', date: '10', emoji: '😣', label: 'Tense', bg: 'bg-rose-50 border-rose-200 text-rose-700', note: 'Heavy workload & reading stress' },
  { day: 'Tue', date: '11', emoji: '🥺', label: 'Tired', bg: 'bg-pink-50 border-pink-200 text-pink-700', note: 'Needed an afternoon pause' },
  { day: 'Wed', date: '12', emoji: '🤐', label: 'Quiet', bg: 'bg-sky-50 border-sky-200 text-sky-700', note: 'Reflective and low energy' },
  { day: 'Thu', date: '13', emoji: '😫', label: 'Heavy', bg: 'bg-amber-50 border-amber-200 text-amber-700', note: 'Doomscrolling news thread detected' },
  { day: 'Fri', date: '14', emoji: '🌿', label: 'Calm', bg: 'bg-teal-50 border-teal-200 text-teal-700', note: 'Took 30s box breathing reset' },
  { day: 'Sat', date: '15', emoji: '😊', label: 'Good', bg: 'bg-emerald-50 border-emerald-200 text-emerald-700', isToday: true, note: 'Present, grounded, balanced' },
  { day: 'Sun', date: '16', emoji: '✨', label: 'Peaceful', bg: 'bg-indigo-50 border-indigo-200 text-indigo-700', note: 'Rest & recovery day' },
];

const EMOTIONAL_DISTRIBUTION = [
  { name: 'Uplifting & Positive', value: 38, color: '#14b8a6' },
  { name: 'Neutral / Informative', value: 44, color: '#38bdf8' },
  { name: 'Sensitive / Heavy', value: 18, color: '#f43f5e' }
];

const WEEKLY_TREND = [
  { day: 'Mon', positive: 25, heavy: 40, calm: 35 },
  { day: 'Tue', positive: 30, heavy: 35, calm: 35 },
  { day: 'Wed', positive: 45, heavy: 20, calm: 35 },
  { day: 'Thu', positive: 20, heavy: 45, calm: 35 },
  { day: 'Fri', positive: 50, heavy: 15, calm: 35 },
  { day: 'Sat', positive: 65, heavy: 10, calm: 25 },
  { day: 'Sun', positive: 60, heavy: 12, calm: 28 },
];

export const LandingPage: React.FC = () => {
  // Modals state
  const [isBreathingOpen, setIsBreathingOpen] = useState(false);
  const [isJournalOpen, setIsJournalOpen] = useState(false);
  const [reflectionDismissed, setReflectionDismissed] = useState(false);

  // Selected mood dial state: 'good' | 'calm' | 'heavy'
  const [selectedDialMood, setSelectedDialMood] = useState<'good' | 'calm' | 'heavy'>('good');
  const [selectedHistoryDay, setSelectedHistoryDay] = useState<number>(5); // Default to Saturday (Today)

  // Interactive Hinglish demo sandbox state
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

  const currentDayInfo = MOOD_HISTORY_DAYS[selectedHistoryDay];

  return (
    <div className="space-y-12 sm:space-y-16 py-6 pb-20">
      
      {/* =========================================================================
          TOP DATE RIBBON (From reference design)
          ========================================================================= */}
      <div className="max-w-4xl mx-auto px-4 flex items-center justify-center">
        <div className="inline-flex items-center gap-1.5 sm:gap-2.5 p-1.5 bg-white/90 backdrop-blur-md border border-sky-100 rounded-full shadow-xs text-xs font-bold text-slate-500 overflow-x-auto">
          {['10', '11', '12', '13', '14'].map((d) => (
            <span key={d} className="px-3 py-1.5 rounded-full hover:bg-sky-50 transition-colors cursor-pointer">
              {d}
            </span>
          ))}
          <span className="px-4 py-1.5 rounded-full bg-gradient-to-r from-teal-500/15 via-sky-500/15 to-teal-500/15 border border-teal-300 text-teal-900 font-extrabold shadow-xs">
            Today, 15 Nov
          </span>
          {['16', '17', '18'].map((d) => (
            <span key={d} className="px-3 py-1.5 rounded-full hover:bg-sky-50 transition-colors cursor-pointer text-slate-400">
              {d}
            </span>
          ))}
        </div>
      </div>

      {/* =========================================================================
          THE FIRST SCREEN: WARM WELCOME & DAILY INSPIRATION
          ========================================================================= */}
      <section className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-4">
        {/* Ambient atmospheric watercolor blur */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[320px] bg-gradient-to-tr from-sky-200/35 via-teal-100/30 to-blue-200/30 blur-3xl -z-10 rounded-full pointer-events-none"></div>

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-50 border border-teal-200/70 text-teal-800 text-xs font-bold tracking-wide shadow-xs">
          <Feather className="w-3.5 h-3.5 text-teal-600" />
          <span>Cognivibe AI • A gentle space for your mind</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-[1.2]">
          Hello, take a moment for yourself.
        </h1>

        <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
          A quiet, compassionate space to pause, reflect on your digital day, and gently reset your nervous system without pressure or medical jargon.
        </p>

        {/* Daily Calming Quote Card */}
        <div className="max-w-xl mx-auto mt-6 bg-gradient-to-r from-sky-50/80 via-teal-50/50 to-sky-50/80 border border-sky-200/60 rounded-3xl p-5 sm:p-6 shadow-sm text-left flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-2xl bg-white text-teal-600 flex items-center justify-center shrink-0 shadow-xs border border-sky-100 mt-0.5">
            <Sun className="w-4 h-4 text-teal-600" />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-teal-700">Today's Calming Thought</span>
            <p className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed italic">
              "You don't have to carry the weight of everything you see online today. It is completely okay to step away, take a soft breath, and just be."
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION A: MOOD HISTORY (From the uploaded image reference)
          ========================================================================= */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-sky-100 shadow-[0_4px_25px_-5px_rgba(14,165,233,0.08)] p-6 sm:p-8 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span>Mood History</span>
                <span className="text-xs font-normal text-slate-400">• Past 7 Days</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Notice the natural rhythm of your feelings — every emotion is valid and temporary.
              </p>
            </div>
            <button
              onClick={() => setIsJournalOpen(true)}
              className="text-xs font-bold text-sky-700 hover:text-sky-900 hover:underline flex items-center gap-1"
            >
              <span>+ Add Entry</span>
            </button>
          </div>

          {/* 7-Day Emoji Cards Strip (Directly matching uploaded image) */}
          <div className="grid grid-cols-7 gap-2 sm:gap-3.5 pt-1">
            {MOOD_HISTORY_DAYS.map((item, idx) => {
              const isSelected = selectedHistoryDay === idx;
              return (
                <button
                  key={item.day}
                  type="button"
                  onClick={() => setSelectedHistoryDay(idx)}
                  className={`flex flex-col items-center justify-center p-2.5 sm:p-4 rounded-2xl border transition-all ${
                    isSelected 
                      ? 'border-sky-400 bg-sky-50/90 shadow-md scale-105' 
                      : `${item.bg} hover:scale-102 hover:shadow-xs`
                  }`}
                >
                  <span className="text-2xl sm:text-3xl mb-1 filter drop-shadow-xs">{item.emoji}</span>
                  <span className="text-[11px] font-extrabold text-slate-800">{item.day}</span>
                  <span className="text-[9px] font-semibold text-slate-500">{item.date}</span>
                </button>
              );
            })}
          </div>

          {/* Selected day feedback preview */}
          {currentDayInfo && (
            <div className="bg-sky-50/50 border border-sky-100/80 rounded-2xl px-4 py-2.5 flex items-center justify-between text-xs text-slate-700 animate-in fade-in duration-200">
              <div className="flex items-center gap-2">
                <span className="text-base">{currentDayInfo.emoji}</span>
                <span>
                  <strong>{currentDayInfo.day}, Nov {currentDayInfo.date}:</strong> {currentDayInfo.label} — {currentDayInfo.note}
                </span>
              </div>
              <button
                onClick={() => setIsJournalOpen(true)}
                className="text-[11px] font-bold text-sky-700 hover:underline shrink-0"
              >
                Reflect on this day →
              </button>
            </div>
          )}
        </div>
      </section>

      {/* =========================================================================
          SECTION B: DAILY REFLECTION & INTERACTIVE MOOD DIAL (From image reference)
          ========================================================================= */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-gradient-to-b from-white via-sky-50/20 to-teal-50/20 rounded-3xl border border-sky-200/70 shadow-sm p-6 sm:p-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            
            {/* Left: Text & Explanation */}
            <div className="space-y-3 max-w-md text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-[11px] font-bold uppercase tracking-wider">
                <Coffee className="w-3.5 h-3.5 text-teal-600" />
                <span>Daily Gentle Check-In</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Daily Reflection: What is your mood today?
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Tune in with your inner state. Move the circular selector to acknowledge where your mind is resting today.
              </p>

              {/* Three Quick Select Buttons */}
              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedDialMood('good')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold border transition-all ${
                    selectedDialMood === 'good'
                      ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm scale-105'
                      : 'bg-white text-slate-700 border-sky-100 hover:bg-emerald-50/50'
                  }`}
                >
                  <span>😊</span>
                  <span>Good / Cheerful</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDialMood('calm')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold border transition-all ${
                    selectedDialMood === 'calm'
                      ? 'bg-sky-500 text-white border-sky-500 shadow-sm scale-105'
                      : 'bg-white text-slate-700 border-sky-100 hover:bg-sky-50/50'
                  }`}
                >
                  <span>😌</span>
                  <span>Shield / Calm</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDialMood('heavy')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold border transition-all ${
                    selectedDialMood === 'heavy'
                      ? 'bg-rose-500 text-white border-rose-500 shadow-sm scale-105'
                      : 'bg-white text-slate-700 border-sky-100 hover:bg-rose-50/50'
                  }`}
                >
                  <span>😫</span>
                  <span>Heavy / Stressed</span>
                </button>
              </div>
            </div>

            {/* Right: Circular Mood Wheel (Directly matching uploaded image dial) */}
            <div className="relative flex items-center justify-center">
              {/* Outer circle with dashed guide */}
              <div className="relative w-56 h-56 rounded-full border-4 border-dashed border-sky-200/80 flex items-center justify-center p-3 bg-white shadow-inner">
                
                {/* Arc: GOOD (Top) */}
                <button
                  onClick={() => setSelectedDialMood('good')}
                  title="Select Good Mood"
                  className={`absolute -top-3 left-1/2 -translate-x-1/2 w-11 h-11 rounded-2xl flex items-center justify-center text-xl shadow-md transition-all ${
                    selectedDialMood === 'good'
                      ? 'bg-emerald-500 text-white scale-110 ring-4 ring-emerald-200'
                      : 'bg-emerald-50 border border-emerald-200 text-emerald-800 hover:scale-105'
                  }`}
                >
                  😊
                </button>

                {/* Arc: CALM / SHIELD (Left) */}
                <button
                  onClick={() => setSelectedDialMood('calm')}
                  title="Select Calm / Shield Mood"
                  className={`absolute -left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-2xl flex items-center justify-center text-xl shadow-md transition-all ${
                    selectedDialMood === 'calm'
                      ? 'bg-sky-500 text-white scale-110 ring-4 ring-sky-200'
                      : 'bg-sky-50 border border-sky-200 text-sky-800 hover:scale-105'
                  }`}
                >
                  😌
                </button>

                {/* Arc: STRESSED / HEAVY (Right) */}
                <button
                  onClick={() => setSelectedDialMood('heavy')}
                  title="Select Stressed Mood"
                  className={`absolute -right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-2xl flex items-center justify-center text-xl shadow-md transition-all ${
                    selectedDialMood === 'heavy'
                      ? 'bg-rose-500 text-white scale-110 ring-4 ring-rose-200'
                      : 'bg-rose-50 border border-rose-200 text-rose-800 hover:scale-105'
                  }`}
                >
                  😫
                </button>

                {/* Center Core Dial */}
                <div className={`w-32 h-32 rounded-full flex flex-col items-center justify-center transition-all duration-300 shadow-md ${
                  selectedDialMood === 'good'
                    ? 'bg-gradient-to-tr from-emerald-100 to-teal-50 border-2 border-emerald-300 text-emerald-950'
                    : selectedDialMood === 'calm'
                    ? 'bg-gradient-to-tr from-sky-100 to-blue-50 border-2 border-sky-300 text-sky-950'
                    : 'bg-gradient-to-tr from-rose-100 to-amber-50 border-2 border-rose-300 text-rose-950'
                }`}>
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Mood</span>
                  <span className="text-xl font-black mt-0.5 capitalize">
                    {selectedDialMood === 'good' ? 'Good 😊' : selectedDialMood === 'calm' ? 'Calm 😌' : 'Heavy 😫'}
                  </span>
                  <span className="text-[9px] font-bold opacity-75 mt-0.5">
                    {selectedDialMood === 'good' ? 'Uplifted' : selectedDialMood === 'calm' ? 'Protected' : 'Supported'}
                  </span>
                </div>
              </div>

              {/* Floating Journal Button (Speech bubble with chat icon from reference image) */}
              <button
                onClick={() => setIsJournalOpen(true)}
                title="Write a private reflection"
                className="absolute -bottom-2 -right-2 w-12 h-12 rounded-full bg-gradient-to-tr from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 text-white flex items-center justify-center shadow-lg shadow-purple-500/25 transition-all hover:scale-110"
              >
                <MessageCircle className="w-6 h-6" />
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION C: SUPPORTIVE REFLECTION (From Dribbble reference by Lika Chernysheva)
          ========================================================================= */}
      {!reflectionDismissed && (
        <section className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="bg-gradient-to-r from-[#17332D] via-[#244B43] to-[#102420] text-[#F8F6F0] rounded-3xl p-6 sm:p-8 shadow-xl border border-[#A9C4B2]/40 relative overflow-hidden">
            <div className="relative z-10 space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E9F0E7]/15 border border-[#A9C4B2]/40 text-[#A9C4B2] text-xs font-bold uppercase tracking-wider">
                <span>🌿</span>
                <span>A little moment for yourself</span>
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-[#F8F6F0] tracking-tight">
                "We noticed some patterns of frustration or heavy content in your recent interactions. Would you like to reflect on what's been happening?"
              </h3>

              <p className="text-xs sm:text-sm text-[#E9F0E7]/80 leading-relaxed max-w-2xl">
                You are never forced to engage. Taking just 30 seconds to breathe or write one thought down helps down-regulate stress before returning to work.
              </p>

              {/* Three Gentle Actions */}
              <div className="flex flex-wrap items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsJournalOpen(true)}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-2xl bg-[#E9F0E7] hover:bg-white text-[#244B43] font-black text-xs shadow-md transition-all hover:scale-105"
                >
                  <Feather className="w-3.5 h-3.5 text-[#244B43]" />
                  <span>Write how I feel</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsBreathingOpen(true)}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-[#F8F6F0] font-bold text-xs border border-white/20 transition-all hover:scale-105"
                >
                  <Wind className="w-3.5 h-3.5 text-[#A9C4B2]" />
                  <span>Take a short break (30s)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setReflectionDismissed(true)}
                  className="px-4 py-2.5 rounded-2xl text-xs font-semibold text-[#A9C4B2] hover:text-[#F8F6F0] transition-colors"
                >
                  Maybe later
                </button>
              </div>
            </div>

            {/* Background subtle glowing orb */}
            <div className="absolute right-0 top-0 w-80 h-80 bg-[#A9C4B2]/10 rounded-full blur-3xl pointer-events-none"></div>
          </div>
        </section>
      )}

      {/* =========================================================================
          SECTION D: EMOTIONAL OVERVIEW & TRENDS (freud AI Dribbble style)
          ========================================================================= */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-3xl border border-[#A9C4B2]/40 shadow-sanctuary p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-[#E9F0E7] pb-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-black tracking-wider text-[#2F5E54] uppercase">
                <Compass className="w-3.5 h-3.5 text-[#2F5E54]" />
                <span>Emotional Overview & Trends</span>
              </div>
              <h3 className="text-xl font-black text-[#244B43] mt-0.5">
                Weekly Content & Emotional Trajectory
              </h3>
            </div>
            <span className="text-xs font-semibold text-[#244B43] bg-[#E9F0E7] px-3 py-1 rounded-full border border-[#A9C4B2]/50">
              Non-Diagnostic Reflection
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Left: Emotional Distribution Bars */}
            <div className="space-y-4">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Detected Content Tone Balance
              </span>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs font-bold text-[#244B43] mb-1">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#2F5E54]"></span>
                      <span>Uplifting / Positive Cues</span>
                    </span>
                    <span>38%</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-[#E9F0E7] overflow-hidden">
                    <div className="h-full bg-[#2F5E54] rounded-full" style={{ width: '38%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-[#244B43] mb-1">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#8E9AAF]"></span>
                      <span>Informative / Neutral Content</span>
                    </span>
                    <span>44%</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-[#E9F0E7] overflow-hidden">
                    <div className="h-full bg-[#8E9AAF] rounded-full" style={{ width: '44%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-[#244B43] mb-1">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#D98880]"></span>
                      <span>Sensitive / Heavy Topics</span>
                    </span>
                    <span>18%</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-[#E9F0E7] overflow-hidden">
                    <div className="h-full bg-[#D98880] rounded-full" style={{ width: '18%' }}></div>
                  </div>
                </div>
              </div>

              <p className="text-xs text-[#244B43]/70 leading-relaxed pt-1">
                Cognivibe tracks gentle shifts in reading patterns to support you, never to judge or clinically diagnose.
              </p>
            </div>

            {/* Right: Gentle Weekly Curve */}
            <div className="bg-[#E9F0E7]/40 border border-[#A9C4B2]/40 rounded-2xl p-4">
              <span className="text-xs font-bold text-[#244B43] uppercase tracking-wider block mb-2 text-center">
                7-Day Trajectory: Uplifting vs. Sensitive
              </span>
              <div className="h-40 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={WEEKLY_TREND}>
                    <XAxis dataKey="day" stroke="#244B43" opacity={0.6} fontSize={11} tickLine={false} />
                    <YAxis hide domain={[0, 100]} />
                    <RechartsTooltip />
                    <Line type="monotone" dataKey="positive" name="Uplifting" stroke="#2F5E54" strokeWidth={3} dot={{ r: 3, fill: '#2F5E54' }} />
                    <Line type="monotone" dataKey="heavy" name="Sensitive" stroke="#D98880" strokeWidth={2} strokeDasharray="3 3" dot={{ r: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION E: SUPPORTIVE CARE & 24/7 HELPLINES
          ========================================================================= */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-[#E9F0E7] border border-[#A9C4B2]/60 rounded-3xl p-6 sm:p-7 shadow-sanctuary">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[#2F5E54] text-xs font-bold uppercase tracking-wider">
                <PhoneCall className="w-3.5 h-3.5 text-[#2F5E54]" />
                <span>24x7 India Free & Confidential Support Helplines</span>
              </div>
              <h4 className="text-base sm:text-lg font-black text-[#244B43]">
                You are never alone. Professional, gentle listeners are here.
              </h4>
              <p className="text-xs text-[#244B43]/70 leading-relaxed">
                If online content or everyday thoughts feel heavy, reach out anytime free of charge.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-2.5 shrink-0">
              <a
                href="tel:14416"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#244B43] hover:bg-[#17332D] text-[#F8F6F0] text-xs font-extrabold shadow-sm transition-all hover:scale-105"
              >
                <span>Tele-MANAS: 14416</span>
              </a>
              <a
                href="tel:18005990019"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-[#244B43] border border-[#A9C4B2] hover:bg-[#E9F0E7] text-xs font-bold transition-colors"
              >
                <span>KIRAN: 1800-599-0019</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION F: PRIVACY FIRST BY DESIGN
          ========================================================================= */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-3xl border border-[#A9C4B2]/40 p-6 sm:p-8 shadow-sanctuary space-y-4 text-left">
          <div className="flex items-center gap-2 text-xs font-black tracking-wider text-[#2F5E54] uppercase">
            <Lock className="w-3.5 h-3.5 text-[#2F5E54]" />
            <span>Ethical Privacy Safeguards by Design</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-1">
            <div className="p-4 rounded-2xl bg-[#E9F0E7]/50 border border-[#A9C4B2]/40 space-y-1">
              <span className="text-xs font-bold text-[#244B43] block">1. What is Analysed</span>
              <p className="text-[11px] text-[#244B43]/70 leading-relaxed">
                Public page titles, topics, and general text snippets. Banking and logins are excluded strictly at origin.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#E9F0E7]/50 border border-[#A9C4B2]/40 space-y-1">
              <span className="text-xs font-bold text-[#244B43] block">2. When Analysis Runs</span>
              <p className="text-[11px] text-[#244B43]/70 leading-relaxed">
                Only while viewing active browser tabs. No background keystroke monitoring or screen capture.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#E9F0E7]/50 border border-[#A9C4B2]/40 space-y-1">
              <span className="text-xs font-bold text-[#244B43] block">3. Non-Diagnostic</span>
              <p className="text-[11px] text-[#244B43]/70 leading-relaxed">
                We never send alarming alerts or clinical diagnoses like "Depression Level Increased".
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#E9F0E7]/50 border border-[#A9C4B2]/40 space-y-1">
              <span className="text-xs font-bold text-[#244B43] block">4. Total User Control</span>
              <p className="text-[11px] text-[#244B43]/70 leading-relaxed">
                Pause tracking anytime from the extension popup, or delete your entire history in Settings with 1 click.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          INTERACTIVE CODE-MIXED HINGLISH DEMO SANDBOX (Academic / Viva Testing)
          ========================================================================= */}
      <section id="interactive-demo" className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-3xl border border-[#A9C4B2]/50 shadow-sanctuary overflow-hidden">
          <div className="bg-gradient-to-r from-[#17332D] via-[#244B43] to-[#102420] text-white p-6 sm:p-7 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-[#A9C4B2] text-xs font-bold tracking-wider uppercase">
                <Sparkles className="w-4 h-4 text-[#A9C4B2]" />
                <span>Multitask Hinglish Model Sandbox</span>
              </div>
              <h3 className="text-xl font-black mt-1 text-[#F8F6F0]">Evaluate Code-Mixed Hindi Expressions</h3>
            </div>
            <span className="hidden sm:inline-block px-3 py-1 bg-[#102420] border border-[#A9C4B2]/30 rounded-xl text-xs text-[#A9C4B2] font-mono">
              Cognivibe Core Model
            </span>
          </div>

          <div className="p-6 sm:p-8 space-y-5">
            <div>
              <label className="text-xs font-bold text-[#244B43] uppercase tracking-wider block mb-2">
                Sample Code-Mixed Expressions:
              </label>
              <div className="flex flex-wrap gap-2">
                {samplePrompts.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => { setDemoText(s.text); setResult(null); }}
                    className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-[#E9F0E7] hover:bg-[#D9E9E5] text-[#244B43] border border-[#A9C4B2]/40 transition-all hover:scale-[1.02]"
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <textarea
                value={demoText}
                onChange={(e) => setDemoText(e.target.value)}
                rows={3}
                className="w-full p-4 rounded-2xl border border-[#A9C4B2]/50 text-[#244B43] focus:ring-2 focus:ring-[#A9C4B2] focus:border-transparent text-sm bg-[#F8F6F0]/40"
                placeholder="Enter or paste social media text in Hinglish or English..."
              />
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleQuickAnalyze}
                disabled={loading}
                className="flex items-center gap-2 bg-[#244B43] hover:bg-[#17332D] text-[#F8F6F0] font-bold px-7 py-3 rounded-2xl shadow-md shadow-[#244B43]/20 transition-all disabled:opacity-50 hover:scale-105 active:scale-95 text-xs"
              >
                {loading ? 'Evaluating Model...' : 'Run Multitask Inference'}
              </button>
            </div>

            {/* Results display */}
            {result && (
              <div className="mt-5 pt-5 border-t border-sky-100 space-y-4 animate-in fade-in duration-300">
                <div className="bg-sky-50/70 border border-sky-200/70 p-3.5 rounded-2xl text-xs font-mono text-sky-900">
                  <strong className="text-sky-700">Normalized Hinglish:</strong> "{result.normalized_text}"
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div className="bg-sky-50/90 border border-sky-200 p-4 rounded-2xl">
                    <div className="text-[10px] font-bold uppercase text-sky-700 mb-1">Task 1: Emotion</div>
                    <div className="text-xl font-black text-sky-950 capitalize">{result.task_1_emotion.predicted_emotion}</div>
                    <div className="text-xs text-sky-600 font-medium mt-0.5">
                      Confidence: {Math.round(result.task_1_emotion.confidence * 100)}%
                    </div>
                  </div>

                  <div className={`p-4 rounded-2xl border ${
                    result.task_2_depression_language.depression_related 
                      ? 'bg-rose-50/90 border-rose-200' 
                      : 'bg-teal-50/90 border-teal-200'
                  }`}>
                    <div className="text-[10px] font-bold uppercase mb-1 text-slate-600">
                      Task 2: Distress Indicator
                    </div>
                    <div className={`text-xl font-black ${
                      result.task_2_depression_language.depression_related ? 'text-rose-900' : 'text-teal-900'
                    }`}>
                      {result.task_2_depression_language.depression_related ? 'Flagged Language' : 'Non-Depressive'}
                    </div>
                    <div className="text-xs text-slate-600 font-medium mt-0.5">
                      Pattern: <strong>{result.task_2_depression_language.indicator.replace('_', ' ')}</strong>
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl">
                    <div className="text-[10px] font-bold uppercase text-slate-600 mb-1">Model Uncertainty</div>
                    <div className="text-xl font-black text-slate-900">
                      {Math.round(result.uncertainty.score * 100)}%
                    </div>
                    <div className="text-xs text-slate-500 font-medium mt-0.5">
                      Status: <strong>{result.uncertainty.status}</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* =========================================================================
          MODALS: 30s Breathing Modal & Journaling Modal
          ========================================================================= */}
      <BreathingModal
        isOpen={isBreathingOpen}
        onClose={() => setIsBreathingOpen(false)}
        triggerReason="Taking a conscious 30-second pause to regulate your nervous system and clear mental fatigue."
      />

      <JournalModal
        isOpen={isJournalOpen}
        onClose={() => setIsJournalOpen(false)}
        initialMood={selectedDialMood === 'good' ? 'happy' : selectedDialMood === 'calm' ? 'calm' : 'stressed'}
      />

    </div>
  );
};
