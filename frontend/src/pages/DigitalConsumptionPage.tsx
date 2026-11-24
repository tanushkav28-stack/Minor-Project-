import React, { useEffect, useState } from 'react';
import { 
  Clock, 
  Layers, 
  Sparkles, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Smile, 
  Frown, 
  Meh, 
  Calendar, 
  Printer, 
  ShieldAlert, 
  ExternalLink,
  ChevronRight,
  Info,
  RefreshCw,
  Compass,
  Heart,
  Wind
} from 'lucide-react';
import { BreathingModal } from '../components/BreathingModal';
import { MoodVisualizations } from '../components/MoodVisualizations';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Legend, 
  LineChart, 
  Line,
  AreaChart,
  Area
} from 'recharts';
import { api } from '../services/api';
import { DailyReportResponse, WeeklyReportResponse, MoodCheckin } from '../types';

const MOOD_OPTIONS = [
  { key: 'happy', label: 'Happy', emoji: '😊', score: 5, color: 'hover:border-green-500 hover:bg-green-50', activeColor: 'border-green-500 bg-green-50 text-green-900' },
  { key: 'calm', label: 'Calm', emoji: '😌', score: 4, color: 'hover:border-teal-500 hover:bg-teal-50', activeColor: 'border-teal-500 bg-teal-50 text-teal-900' },
  { key: 'neutral', label: 'Neutral', emoji: '😐', score: 3, color: 'hover:border-slate-500 hover:bg-slate-50', activeColor: 'border-slate-500 bg-slate-50 text-slate-900' },
  { key: 'stressed', label: 'Stressed', emoji: '😫', score: 2, color: 'hover:border-amber-500 hover:bg-amber-50', activeColor: 'border-amber-500 bg-amber-50 text-amber-900' },
  { key: 'anxious', label: 'Anxious', emoji: '😰', score: 2, color: 'hover:border-purple-500 hover:bg-purple-50', activeColor: 'border-purple-500 bg-purple-50 text-purple-900' },
  { key: 'sad', label: 'Sad', emoji: '😢', score: 1, color: 'hover:border-rose-500 hover:bg-rose-50', activeColor: 'border-rose-500 bg-rose-50 text-rose-900' }
];

const TONE_COLORS = {
  positive: '#2F5E54', // deep eucalyptus
  neutral: '#8E9AAF',  // soft slate
  negative: '#D98880', // warm terracotta
  mixed: '#F4D06F'     // morning sun
};

export const DigitalConsumptionPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<'daily' | 'weekly'>('daily');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  
  const [dailyData, setDailyData] = useState<DailyReportResponse | null>(null);
  const [weeklyData, setWeeklyData] = useState<WeeklyReportResponse | null>(null);
  const [moodHistory, setMoodHistory] = useState<MoodCheckin[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Mood Checkin State
  const [selectedMood, setSelectedMood] = useState<string>('');
  const [moodNote, setMoodNote] = useState<string>('');
  const [moodSubmitting, setMoodSubmitting] = useState(false);
  const [moodSavedMsg, setMoodSavedMsg] = useState<string>('');

  // Doomscrolling Shield 30s Breathing Modal
  const [isBreathingOpen, setIsBreathingOpen] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('breathe') === 'true') {
      setIsBreathingOpen(true);
    }
  }, []);

  const loadData = async (dateStr: string) => {
    try {
      setLoading(true);
      const moodPromise = api.getMoodHistory(30).catch(() => ({ history: [] }));
      if (viewMode === 'daily') {
        const [data, moodRes] = await Promise.all([api.getDailyReport(dateStr), moodPromise]);
        setDailyData(data);
        setMoodHistory(moodRes.history || []);
        if (data.mood_checkin) {
          setSelectedMood(data.mood_checkin.mood);
          setMoodNote(data.mood_checkin.note || '');
        } else {
          setSelectedMood('');
          setMoodNote('');
        }
      } else {
        const [data, moodRes] = await Promise.all([api.getWeeklyReport(undefined, dateStr), moodPromise]);
        setWeeklyData(data);
        setMoodHistory(moodRes.history || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData(selectedDate);
  }, [viewMode, selectedDate]);

  const handleMoodSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMood) return;

    setMoodSubmitting(true);
    try {
      await api.recordMoodCheckin({
        mood: selectedMood,
        note: moodNote,
        date: selectedDate
      });
      setMoodSavedMsg('Mood check-in recorded! Re-evaluating consumption correlation...');
      setTimeout(() => setMoodSavedMsg(''), 4000);
      // Reload mood history after checkin
      const [updated, moodRes] = await Promise.all([
        api.getDailyReport(selectedDate),
        api.getMoodHistory(30).catch(() => ({ history: [] }))
      ]);
      setDailyData(updated);
      setMoodHistory(moodRes.history || []);
    } catch (err: any) {
      alert(err.message || 'Failed to submit mood check-in');
    } finally {
      setMoodSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Pie chart data for Daily Tone
  const pieData = dailyData ? [
    { name: 'Positive (+)', value: dailyData.emotional_distribution.positive_pct, color: TONE_COLORS.positive },
    { name: 'Neutral (=)', value: dailyData.emotional_distribution.neutral_pct, color: TONE_COLORS.neutral },
    { name: 'Negative (−)', value: dailyData.emotional_distribution.negative_pct, color: TONE_COLORS.negative }
  ] : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 print:p-0">
      
      {/* TOP HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-sky-100 pb-6 print:hidden">
        <div>
          <div className="flex items-center gap-2 text-xs font-black tracking-wider text-sky-700 uppercase">
            <Compass className="w-4 h-4 text-sky-600" />
            <span>Digital Wellbeing & Mood Intelligence</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 mt-1">Digital Consumption Intelligence</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Measuring the emotional nature, topics, and mental influence of the content you consume online
          </p>
        </div>

        {/* View Switcher & Controls */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Mode Switcher */}
          <div className="bg-sky-100/60 p-1 rounded-2xl flex items-center text-xs font-bold border border-sky-200/50">
            <button
              onClick={() => setViewMode('daily')}
              className={`px-3.5 py-1.5 rounded-xl transition-all ${
                viewMode === 'daily'
                  ? 'bg-white text-sky-900 shadow-sm border border-sky-200/50'
                  : 'text-slate-600 hover:text-sky-900'
              }`}
            >
              Daily Report
            </button>
            <button
              onClick={() => setViewMode('weekly')}
              className={`px-3.5 py-1.5 rounded-xl transition-all ${
                viewMode === 'weekly'
                  ? 'bg-white text-sky-900 shadow-sm border border-sky-200/50'
                  : 'text-slate-600 hover:text-sky-900'
              }`}
            >
              Weekly Trends
            </button>
          </div>

          {/* Date Picker */}
          <div className="flex items-center gap-1.5 bg-white border border-sky-200/80 rounded-2xl px-3 py-1.5 text-xs shadow-xs">
            <Calendar className="w-3.5 h-3.5 text-sky-600" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border-none bg-transparent text-xs text-slate-700 font-semibold focus:outline-none"
            />
          </div>

          <button
            onClick={() => { setRefreshing(true); loadData(selectedDate); }}
            title="Refresh"
            className="p-2 border border-sky-200/80 rounded-2xl bg-white text-sky-700 hover:text-sky-900 hover:bg-sky-50 transition-colors shadow-xs"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-sky-600' : ''}`} />
          </button>

          <button
            onClick={() => setIsBreathingOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#244B43] hover:bg-[#17332D] text-[#F8F6F0] rounded-2xl text-xs font-bold transition-all shadow-xs hover:scale-105"
            title="Take an interactive 30-second box breathing reset"
          >
            <Wind className="w-3.5 h-3.5 text-[#A9C4B2]" />
            <span>🌿 30s Mindful Breath</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 bg-white text-[#244B43] border border-[#A9C4B2]/60 rounded-2xl text-xs font-bold hover:bg-[#E9F0E7] transition-all shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {loading && !refreshing ? (
        <div className="py-24 text-center">
          <div className="w-12 h-12 border-4 border-[#244B43] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm font-semibold text-[#244B43]">Synthesizing Digital Wellbeing Intelligence...</p>
        </div>
      ) : viewMode === 'daily' && dailyData ? (
        /* ======================== DAILY REPORT VIEW ======================== */
        <div className="space-y-8">
          
          {/* HEADER HERO BANNER */}
          <div className="bg-gradient-to-r from-[#17332D] via-[#244B43] to-[#102420] text-[#F8F6F0] rounded-3xl p-6 sm:p-8 shadow-sanctuary relative overflow-hidden border border-[#A9C4B2]/40">
            <div className="relative z-10">
              <div className="flex items-center gap-2 text-[#A9C4B2] text-xs font-bold tracking-widest uppercase mb-1">
                <span>Daily Sanctuary Summary</span>
                <span>•</span>
                <span>{dailyData.day_of_week}, {dailyData.date}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black">Your Digital Consumption Profile</h2>
              <p className="text-[#E9F0E7]/85 text-sm max-w-2xl mt-1">
                {dailyData.ai_observations.overall_summary}
              </p>
            </div>

            {/* Background subtle glow */}
            <div className="absolute right-0 top-0 w-96 h-96 bg-[#A9C4B2]/10 rounded-full blur-3xl pointer-events-none"></div>
          </div>

          {/* DOOMSCROLLING SHIELD & 30-SECOND BREATHING BREAK BANNER */}
          <div className="bg-gradient-to-r from-[#1E3F38] via-[#244B43] to-[#17332D] border border-[#A9C4B2]/40 rounded-3xl p-6 sm:p-7 text-[#F8F6F0] shadow-sanctuary flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative overflow-hidden">
            <div className="space-y-2 relative z-10 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E9F0E7]/20 border border-[#A9C4B2]/40 text-[#A9C4B2] text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-[#A9C4B2]" />
                <span>Cognivibe Doomscrolling Shield • Ethical Micro-Intervention</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F8F6F0]">
                {dailyData.distressing_count > 0 || dailyData.emotional_distribution.negative_pct > 25
                  ? "Elevated distressing & negative narratives detected in reading stream."
                  : "Nervous System Reset: Ready for a mindful breathing break?"}
              </h3>
              <p className="text-xs sm:text-sm text-[#E9F0E7]/85 leading-relaxed">
                {dailyData.distressing_count > 0 || dailyData.emotional_distribution.negative_pct > 25
                  ? `Cognivibe AI observed ${dailyData.distressing_count} distressing items (${dailyData.emotional_distribution.negative_pct.toFixed(0)}% negative tone) today. Prolonged exposure to distressing news triggers physiological stress. Take a gentle 30-second box breathing pause to regulate autonomic tone.`
                  : "Continuous screen reading leads to cognitive overload. Take a guided 30-second box-breathing pause (Inhale 4s → Hold 4s → Exhale 4s → Rest 4s) to reset your focus and restore parasympathetic balance."}
              </p>
            </div>
            <div className="relative z-10 shrink-0">
              <button
                onClick={() => setIsBreathingOpen(true)}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#E9F0E7] hover:bg-white text-[#244B43] font-black text-xs shadow-md transition-all hover:scale-105"
              >
                <Wind className="w-4 h-4 text-[#244B43]" />
                <span>Take 30s Breathing Break</span>
              </button>
            </div>
            <div className="absolute -right-8 -bottom-8 w-60 h-60 bg-[#A9C4B2]/10 rounded-full blur-2xl pointer-events-none"></div>
          </div>

          {/* 4 CORE KPI METRIC CARDS */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Card 1: Total Consumption Time */}
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Total Consumption</span>
                <Clock className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900">
                {dailyData.total_consumption_formatted}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Active reading, watching & scrolling
              </div>
            </div>

            {/* Card 2: Items Analyzed */}
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Items Analyzed</span>
                <Layers className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900">
                {dailyData.total_items_analyzed}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Articles, videos, threads & posts
              </div>
            </div>

            {/* Card 3: Dominant Emotional Character */}
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Emotional Tone</span>
                <Sparkles className="w-4 h-4 text-amber-500" />
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xl sm:text-2xl font-black ${
                  dailyData.emotional_distribution.positive_pct > dailyData.emotional_distribution.negative_pct
                    ? 'text-green-600'
                    : 'text-rose-600'
                }`}>
                  {dailyData.emotional_distribution.positive_pct >= 35 ? '+ Uplifting' : (dailyData.emotional_distribution.negative_pct >= 25 ? '− Distressing' : '= Balanced')}
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {dailyData.distressing_count} items with distressing themes
              </div>
            </div>

            {/* Card 4: Self-Reported Mood */}
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Reported Mood</span>
                <Smile className="w-4 h-4 text-teal-600" />
              </div>
              <div className="flex items-center gap-2 text-xl sm:text-2xl font-black text-slate-900">
                {dailyData.mood_checkin ? (
                  <>
                    <span>{MOOD_OPTIONS.find(m => m.key === dailyData.mood_checkin?.mood)?.emoji}</span>
                    <span className="capitalize">{dailyData.mood_checkin.mood}</span>
                  </>
                ) : (
                  <span className="text-sm font-semibold text-amber-600">Pending Check-in</span>
                )}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {dailyData.mood_checkin ? 'Self-reported evening log' : 'Log your mood below'}
              </div>
            </div>
          </div>

          {/* SECTION: EMOTIONAL DISTRIBUTION & BREAKDOWN */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* LEFT: EMOTIONAL TONE PROGRESS BAR & DONUT CHART (7 COLS) */}
            <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black text-slate-900">Content Emotional Distribution</h3>
                  <span className="text-xs text-slate-400 font-semibold">100% of consumed media</span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Classified into uplifting positive, factual neutral, and distressing negative content
                </p>
              </div>

              {/* Progress bar visual */}
              <div className="space-y-2">
                <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
                  <div
                    style={{ width: `${dailyData.emotional_distribution.positive_pct}%` }}
                    className="bg-green-500 transition-all duration-500"
                    title={`Positive: ${dailyData.emotional_distribution.positive_pct}%`}
                  ></div>
                  <div
                    style={{ width: `${dailyData.emotional_distribution.neutral_pct}%` }}
                    className="bg-slate-400 transition-all duration-500"
                    title={`Neutral: ${dailyData.emotional_distribution.neutral_pct}%`}
                  ></div>
                  <div
                    style={{ width: `${dailyData.emotional_distribution.negative_pct}%` }}
                    className="bg-rose-500 transition-all duration-500"
                    title={`Negative: ${dailyData.emotional_distribution.negative_pct}%`}
                  ></div>
                </div>

                <div className="flex items-center justify-between text-xs font-bold pt-1">
                  <div className="flex items-center gap-1.5 text-green-700">
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
                    <span>+ Positive: {dailyData.emotional_distribution.positive_pct}%</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
                    <span>= Neutral: {dailyData.emotional_distribution.neutral_pct}%</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-rose-700">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                    <span>− Negative: {dailyData.emotional_distribution.negative_pct}%</span>
                  </div>
                </div>
              </div>

              {/* Pie Chart & Dimensions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-100 items-center">
                <div className="h-48 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: any) => `${value}%`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-green-50/70 border border-green-200 rounded-2xl">
                    <span className="font-bold text-green-900">+ Positive ({dailyData.emotional_distribution.positive_pct}%)</span>
                    <p className="text-green-700 mt-0.5">Inspiring, uplifting, joyful, and motivational media</p>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                    <span className="font-bold text-slate-800">= Neutral ({dailyData.emotional_distribution.neutral_pct}%)</span>
                    <p className="text-slate-600 mt-0.5">Educational tutorials, technical docs, and factual updates</p>
                  </div>
                  <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-2xl">
                    <span className="font-bold text-rose-900">− Negative ({dailyData.emotional_distribution.negative_pct}%)</span>
                    <p className="text-rose-700 mt-0.5">Distressing news, tragedy, crisis reports, and conflict</p>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT: CONTENT CATEGORIES WITH TIME SPENT (5 COLS) */}
            <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-5 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-900">Content Categories</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Time distribution across web genres and formats
                </p>
              </div>

              <div className="space-y-4">
                {dailyData.category_breakdown.map((cat, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span>{cat.category}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-900 font-extrabold">{cat.time_formatted}</span>
                        <span className="text-slate-400 font-medium">({cat.percentage}%)</span>
                      </div>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full transition-all duration-500"
                        style={{ width: `${cat.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}

                {dailyData.category_breakdown.length === 0 && (
                  <p className="text-xs text-slate-400 italic">No category data recorded for this day.</p>
                )}
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>
                  Browsing time is recorded only when the tab is focused and active, pausing automatically when idle.
                </span>
              </div>
            </div>
          </div>

          {/* SECTION: AI-GENERATED OBSERVATIONS & PATTERNS */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <h3 className="text-lg font-black text-slate-900">AI-Generated Intelligence Observations</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Observation 1: Something to Notice */}
              <div className="p-5 bg-amber-50/70 border border-amber-200 rounded-3xl space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-800 uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Something to notice</span>
                </div>
                <p className="text-sm text-slate-800 font-medium leading-relaxed">
                  {dailyData.ai_observations.something_to_notice}
                </p>
              </div>

              {/* Observation 2: A Positive Pattern */}
              <div className="p-5 bg-green-50/70 border border-green-200 rounded-3xl space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-green-800 uppercase tracking-wider">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>A positive pattern</span>
                </div>
                <p className="text-sm text-slate-800 font-medium leading-relaxed">
                  {dailyData.ai_observations.positive_pattern}
                </p>
              </div>
            </div>

            {/* Extra Multi-Dimensional Metrics: Constructiveness & Intensity */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100 text-center">
              <div className="p-3 bg-slate-50 rounded-2xl">
                <span className="block text-xs text-slate-500 font-semibold">High Intensity</span>
                <span className="text-lg font-black text-slate-900">{dailyData.emotional_intensity.high || 0} items</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl">
                <span className="block text-xs text-slate-500 font-semibold">Medium Intensity</span>
                <span className="text-lg font-black text-slate-900">{dailyData.emotional_intensity.medium || 0} items</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl">
                <span className="block text-xs text-slate-500 font-semibold">Informative</span>
                <span className="text-lg font-black text-slate-900">{dailyData.constructiveness.informative || 0} items</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl">
                <span className="block text-xs text-slate-500 font-semibold">Uplifting / Supportive</span>
                <span className="text-lg font-black text-slate-900">
                  {(dailyData.constructiveness.uplifting || 0) + (dailyData.constructiveness.supportive || 0)} items
                </span>
              </div>
            </div>
          </div>

          {/* SECTION: DIGITAL CONSUMPTION VS ACTUAL MOOD (SPECIAL FEATURE) */}
          <div className="bg-gradient-to-br from-indigo-50/80 via-white to-blue-50/60 p-6 sm:p-8 rounded-3xl border border-indigo-200/80 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-100 pb-4">
              <div>
                <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">Correlation Engine</span>
                <h3 className="text-xl font-black text-slate-900 mt-0.5">Digital Consumption vs. Actual Mood</h3>
              </div>
              <span className="text-xs px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full font-bold self-start">
                Personal Wellbeing Insight
              </span>
            </div>

            {/* AI Mood Correlation Box */}
            <div className="p-5 bg-white rounded-2xl border border-indigo-200 shadow-sm">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Correlation Observation
              </h4>
              <p className="text-sm sm:text-base text-slate-800 font-medium leading-relaxed">
                {dailyData.ai_observations.mood_correlation_insight}
              </p>
            </div>

            {/* Interactive "How did you feel today?" Form */}
            <form onSubmit={handleMoodSubmit} className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-slate-900">
                  How did you feel today?
                </label>
                {dailyData.mood_checkin && (
                  <span className="text-xs text-green-700 font-semibold">
                    ✓ Logged for {dailyData.date}
                  </span>
                )}
              </div>

              {/* Mood Buttons Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-2.5">
                {MOOD_OPTIONS.map((opt) => {
                  const isSelected = selectedMood === opt.key;
                  return (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => setSelectedMood(opt.key)}
                      className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1 ${
                        isSelected
                          ? `${opt.activeColor} ring-2 ring-blue-600/20 font-bold shadow-sm`
                          : `border-slate-200 bg-white text-slate-700 ${opt.color}`
                      }`}
                    >
                      <span className="text-2xl">{opt.emoji}</span>
                      <span className="text-xs font-semibold">{opt.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Optional Notes */}
              <div>
                <input
                  type="text"
                  value={moodNote}
                  onChange={(e) => setMoodNote(e.target.value)}
                  placeholder="Optional note: What influenced your mood today? (e.g., tough work deadline, great family dinner)"
                  className="w-full px-4 py-2.5 text-xs bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-800 shadow-sm"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="submit"
                  disabled={!selectedMood || moodSubmitting}
                  className="px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl text-xs hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
                >
                  {moodSubmitting ? 'Recording...' : (dailyData.mood_checkin ? 'Update Mood Check-in' : 'Save Daily Mood Check-in')}
                </button>

                {moodSavedMsg && (
                  <span className="text-xs font-bold text-green-600 animate-pulse">
                    {moodSavedMsg}
                  </span>
                )}
              </div>
            </form>

            {/* Ethical Disclaimer */}
            <div className="flex items-start gap-2 pt-2 text-[11px] text-slate-500">
              <ShieldAlert className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <span>
                {dailyData.disclaimer}
              </span>
            </div>
          </div>

          {/* SECTION: ITEMIZED CONTENT FEED (AUDIT LOG) */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-900">Analyzed Content Feed</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Recent digital items captured and classified across your sessions
                </p>
              </div>
              <span className="text-xs text-slate-400 font-semibold">
                Showing {dailyData.recent_items.length} items
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-3">Content Title</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3">Emotional Tone</th>
                    <th className="py-3 px-3">Intensity</th>
                    <th className="py-3 px-3">Topic</th>
                    <th className="py-3 px-3 text-right">Time Spent</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {dailyData.recent_items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 max-w-xs truncate font-semibold text-slate-900" title={item.title}>
                        <div className="truncate">{item.title}</div>
                        <div className="text-[10px] text-slate-400 truncate">{item.domain || item.platform}</div>
                      </td>
                      <td className="py-3 px-3 text-slate-600 font-medium">
                        {item.category}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          item.emotional_tone === 'positive'
                            ? 'bg-green-100 text-green-800'
                            : item.emotional_tone === 'negative'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-slate-100 text-slate-800'
                        }`}>
                          {item.emotional_tone === 'positive' ? '+ Positive' : (item.emotional_tone === 'negative' ? '− Negative' : '= Neutral')}
                        </span>
                      </td>
                      <td className="py-3 px-3 capitalize text-slate-500">
                        {item.emotional_intensity}
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        {item.topic}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-800">
                        {Math.floor(item.time_spent_seconds / 60)}m {item.time_spent_seconds % 60}s
                      </td>
                    </tr>
                  ))}
                  {dailyData.recent_items.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 italic">
                        No content items analyzed for this date.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      ) : viewMode === 'weekly' && weeklyData ? (
        /* ======================== WEEKLY REPORT VIEW ======================== */
        <div className="space-y-8">
          
          {/* WEEKLY HERO HEADER */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
            <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold tracking-widest uppercase mb-1">
              <span>Weekly Intelligence Report</span>
              <span>•</span>
              <span>{weeklyData.start_date} to {weeklyData.end_date}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black">{weeklyData.ai_observations.headline}</h2>
            <p className="text-indigo-100/90 text-sm max-w-3xl mt-1.5 leading-relaxed">
              {weeklyData.ai_observations.trend_analysis}
            </p>
          </div>

          {/* 3 HERO STATS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Weekly Screen Time</span>
              <div className="text-3xl font-black text-slate-900 mt-2">{weeklyData.total_time_formatted}</div>
              <p className="text-xs text-slate-500 mt-1">Total active browser engagement</p>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Content Items Evaluated</span>
              <div className="text-3xl font-black text-slate-900 mt-2">{weeklyData.total_items_analyzed}</div>
              <p className="text-xs text-slate-500 mt-1">Articles, videos, threads & news posts</p>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Weekly Positive Ratio</span>
              <div className="text-3xl font-black text-green-600 mt-2">{weeklyData.weekly_distribution.positive_pct}%</div>
              <p className="text-xs text-slate-500 mt-1">vs {weeklyData.weekly_distribution.negative_pct}% negative content</p>
            </div>
          </div>

          {/* 7-DAY STACKED BAR CHART: EMOTIONAL COMPOSITION OVER TIME */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <div>
              <h3 className="text-lg font-black text-slate-900">7-Day Emotional Tone Distribution</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Proportion of positive, neutral, and negative content consumed each day
              </p>
            </div>

            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData.timeline}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="day_name" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} unit="%" />
                  <Tooltip formatter={(value: any) => `${value}%`} />
                  <Legend />
                  <Bar dataKey="positive_pct" name="+ Positive" stackId="a" fill={TONE_COLORS.positive} radius={[0, 0, 0, 0]} />
                  <Bar dataKey="neutral_pct" name="= Neutral" stackId="a" fill={TONE_COLORS.neutral} radius={[0, 0, 0, 0]} />
                  <Bar dataKey="negative_pct" name="− Negative" stackId="a" fill={TONE_COLORS.negative} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* DIGITAL CONSUMPTION VS MOOD CORRELATION CHART */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 uppercase tracking-wider">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                <span>Correlation Analysis</span>
              </div>
              <h3 className="text-lg font-black text-slate-900 mt-0.5">
                Negative Content Consumption vs. Self-Reported Mood
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Comparing daily negative content % with evening self-reported mood score (1 = Sad, 5 = Happy)
              </p>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyData.timeline}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="day_name" stroke="#94a3b8" fontSize={12} />
                  <YAxis yAxisId="left" stroke="#ef4444" fontSize={12} unit="%" domain={[0, 100]} />
                  <YAxis yAxisId="right" orientation="right" stroke="#2563eb" fontSize={12} domain={[1, 5]} />
                  <Tooltip />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="negative_pct"
                    name="Negative Content %"
                    stroke="#ef4444"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="mood_score"
                    name="Mood Score (1-5)"
                    stroke="#2563eb"
                    strokeWidth={3}
                    dot={{ r: 5, fill: '#2563eb' }}
                    connectNulls
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="p-5 bg-indigo-50/70 border border-indigo-200 rounded-3xl space-y-1.5">
              <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider">
                Weekly Correlation Synthesis
              </span>
              <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                {weeklyData.ai_observations.correlation_summary}
              </p>
            </div>
          </div>

        </div>
      ) : null}

      {/* MOOD INTELLIGENCE VISUALIZATIONS */}
      {!loading && (
        <MoodVisualizations
          moodHistory={moodHistory}
          positivePct={dailyData?.emotional_distribution.positive_pct ?? weeklyData?.weekly_distribution.positive_pct ?? 32.4}
          neutralPct={dailyData?.emotional_distribution.neutral_pct ?? weeklyData?.weekly_distribution.neutral_pct ?? 43.4}
          negativePct={dailyData?.emotional_distribution.negative_pct ?? weeklyData?.weekly_distribution.negative_pct ?? 24.1}
        />
      )}

      {/* Cognivibe Doomscrolling Shield 30s Breathing Modal */}
      <BreathingModal
        isOpen={isBreathingOpen}
        onClose={() => setIsBreathingOpen(false)}
        triggerReason="Doomscrolling Shield: 30-Second box breathing micro-intervention to regulate nervous system and clear mental fatigue."
      />

    </div>
  );
};
