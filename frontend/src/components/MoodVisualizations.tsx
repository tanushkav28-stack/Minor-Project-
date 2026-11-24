import React, { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  ReferenceLine
} from 'recharts';
import { Sparkles, Activity, CalendarDays, HeartPulse, BarChart3 } from 'lucide-react';
import { MoodCheckin } from '../types';

export interface MoodVisualizationsProps {
  moodHistory: MoodCheckin[];
  positivePct?: number;
  negativePct?: number;
  neutralPct?: number;
  onQuickMoodLog?: (mood: string) => Promise<void>;
  compact?: boolean;
}

const MOOD_META: Record<
  string,
  { label: string; emoji: string; score: number; color: string; bg: string; tile: string }
> = {
  happy: {
    label: 'Happy',
    emoji: '😊',
    score: 5,
    color: '#10b981',
    bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    tile: 'bg-emerald-500 text-white'
  },
  calm: {
    label: 'Calm',
    emoji: '😌',
    score: 4,
    color: '#2F5E54',
    bg: 'bg-[#E9F0E7] text-[#244B43] border-[#A9C4B2]',
    tile: 'bg-[#2F5E54] text-white'
  },
  neutral: {
    label: 'Neutral',
    emoji: '😐',
    score: 3,
    color: '#8E9AAF',
    bg: 'bg-slate-100 text-slate-700 border-slate-200',
    tile: 'bg-slate-400 text-white'
  },
  stressed: {
    label: 'Stressed',
    emoji: '😫',
    score: 2,
    color: '#D99B52',
    bg: 'bg-amber-50 text-amber-800 border-amber-200',
    tile: 'bg-amber-400 text-slate-900'
  },
  anxious: {
    label: 'Anxious',
    emoji: '😰',
    score: 2,
    color: '#8B7EC8',
    bg: 'bg-purple-50 text-purple-800 border-purple-200',
    tile: 'bg-purple-400 text-white'
  },
  sad: {
    label: 'Sad',
    emoji: '😢',
    score: 1,
    color: '#D98880',
    bg: 'bg-rose-50 text-rose-800 border-rose-200',
    tile: 'bg-[#D98880] text-white'
  }
};

// Fallback sample check-ins when a newly created account has 0 mood entries yet
function buildSampleMoods(days: number): MoodCheckin[] {
  const pattern: Array<{ mood: MoodCheckin['mood']; score: number; note: string }> = [
    { mood: 'calm', score: 4, note: 'Quiet morning routine and focused study' },
    { mood: 'happy', score: 5, note: 'Great progress on project & evening walk' },
    { mood: 'neutral', score: 3, note: 'Regular weekday mix of classes & reading' },
    { mood: 'stressed', score: 2, note: 'Heavy news feed before bedtime' },
    { mood: 'calm', score: 4, note: 'Took a 30s breathing break and unplugged early' },
    { mood: 'anxious', score: 2, note: 'Upcoming assignment deadlines' },
    { mood: 'happy', score: 5, note: 'Caught up with friends and felt recharged' }
  ];
  const today = new Date();
  const list: MoodCheckin[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const p = pattern[(days - 1 - i) % pattern.length];
    list.push({
      mood: p.mood,
      mood_score: p.score,
      note: p.note,
      checkin_date: d.toISOString().split('T')[0]
    });
  }
  return list;
}

export const MoodVisualizations: React.FC<MoodVisualizationsProps> = ({
  moodHistory,
  positivePct = 32.4,
  negativePct = 24.1,
  onQuickMoodLog,
  compact = false
}) => {
  const [rangeDays, setRangeDays] = useState<7 | 14 | 30>(14);
  const [selectedTile, setSelectedTile] = useState<MoodCheckin | null>(null);
  const [loggingMood, setLoggingMood] = useState<string | null>(null);

  const isSampleMode = moodHistory.length === 0;

  const effectiveHistory = useMemo(() => {
    const source = isSampleMode ? buildSampleMoods(rangeDays) : moodHistory;
    const sorted = [...source].sort((a, b) => a.checkin_date.localeCompare(b.checkin_date));
    return sorted.slice(-rangeDays);
  }, [moodHistory, rangeDays, isSampleMode]);

  // 1. Area trajectory series with 3-point rolling average
  const trajectoryData = useMemo(() => {
    return effectiveHistory.map((item, idx, arr) => {
      const windowSlice = arr.slice(Math.max(0, idx - 2), idx + 1);
      const rolling =
        windowSlice.reduce((sum, cur) => sum + (cur.mood_score || 3), 0) / windowSlice.length;
      const meta = MOOD_META[item.mood] || MOOD_META.neutral;
      return {
        date: item.checkin_date.slice(5),
        fullDate: item.checkin_date,
        score: item.mood_score,
        rollingAvg: Number(rolling.toFixed(2)),
        mood: meta.label,
        emoji: meta.emoji,
        note: item.note || 'No reflection note'
      };
    });
  }, [effectiveHistory]);

  // 2. Mood distribution donut & bar counts
  const distributionData = useMemo(() => {
    const counts: Record<string, number> = {};
    effectiveHistory.forEach((m) => {
      const k = (m.mood || 'neutral').toLowerCase();
      counts[k] = (counts[k] || 0) + 1;
    });
    const total = Math.max(effectiveHistory.length, 1);
    return Object.entries(MOOD_META)
      .map(([key, meta]) => ({
        key,
        name: meta.label,
        emoji: meta.emoji,
        count: counts[key] || 0,
        pct: Math.round(((counts[key] || 0) / total) * 100),
        color: meta.color
      }))
      .filter((d) => d.count > 0)
      .sort((a, b) => b.count - a.count);
  }, [effectiveHistory]);

  // 3. Weekday mood pattern (Mon - Sun average score)
  const weekdayData = useMemo(() => {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const buckets: Record<string, { sum: number; count: number }> = {};
    dayNames.forEach((d) => {
      buckets[d] = { sum: 0, count: 0 };
    });
    effectiveHistory.forEach((item) => {
      const dt = new Date(`${item.checkin_date}T00:00:00`);
      const name = dayNames[dt.getDay()];
      if (buckets[name]) {
        buckets[name].sum += item.mood_score || 3;
        buckets[name].count += 1;
      }
    });
    return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => ({
      day: d,
      avgScore: buckets[d].count > 0 ? Number((buckets[d].sum / buckets[d].count).toFixed(2)) : 0,
      entries: buckets[d].count
    }));
  }, [effectiveHistory]);

  // 4. Emotional Dimension Radar
  const radarData = useMemo(() => {
    const n = Math.max(effectiveHistory.length, 1);
    const avgScore =
      effectiveHistory.reduce((acc, m) => acc + (m.mood_score || 3), 0) / n;
    const calmOrHappy =
      effectiveHistory.filter((m) => m.mood === 'calm' || m.mood === 'happy').length / n;
    const variance =
      effectiveHistory.reduce((acc, m) => acc + Math.pow((m.mood_score || 3) - avgScore, 2), 0) / n;
    const stability = Math.max(20, Math.min(100, Math.round(100 - variance * 28)));
    const consistency = Math.min(100, Math.round((effectiveHistory.length / rangeDays) * 100));

    return [
      { axis: 'Calmness', value: Math.round(calmOrHappy * 85 + 15) },
      { axis: 'Positivity', value: Math.min(100, Math.round((avgScore / 5) * 75 + positivePct * 0.25)) },
      { axis: 'Stability', value: stability },
      { axis: 'Media Balance', value: Math.max(15, Math.round(100 - negativePct)) },
      { axis: 'Consistency', value: Math.max(25, consistency) },
      { axis: 'Resilience', value: Math.min(100, Math.round((avgScore / 5) * 60 + stability * 0.4)) }
    ];
  }, [effectiveHistory, rangeDays, positivePct, negativePct]);

  // Summary metrics
  const stats = useMemo(() => {
    const n = effectiveHistory.length;
    const avg = n > 0 ? (effectiveHistory.reduce((s, m) => s + m.mood_score, 0) / n).toFixed(1) : '—';
    const topMood = distributionData[0];
    const upliftDays = effectiveHistory.filter((m) => m.mood_score >= 4).length;
    return { avg, topMood, upliftDays, total: n };
  }, [effectiveHistory, distributionData]);

  const handleQuickLog = async (moodKey: string) => {
    if (!onQuickMoodLog) return;
    setLoggingMood(moodKey);
    try {
      await onQuickMoodLog(moodKey);
    } finally {
      setLoggingMood(null);
    }
  };

  return (
    <section className="bg-white rounded-3xl border border-[#A9C4B2]/45 shadow-sanctuary p-6 sm:p-9 space-y-8">
      {/* Header + Time Range Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E9F0E7] pb-5">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#2F5E54]">
            <HeartPulse className="w-4 h-4" />
            <span>Mood Analytics &amp; Emotional Spectrum</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#244B43] tracking-tight mt-1">
            Mood Intelligence Visualizations
          </h2>
          <p className="text-xs sm:text-sm text-[#244B43]/70 mt-0.5">
            Track mood stability, emotional radar balance, weekday rhythm, and daily check-in patterns
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {isSampleMode && (
            <span className="text-[11px] font-bold px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200">
              Showing baseline preview — log a mood below to personalize
            </span>
          )}
          <div className="bg-[#E9F0E7]/70 p-1 rounded-2xl border border-[#A9C4B2]/50 flex items-center text-xs font-bold">
            {([7, 14, 30] as const).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setRangeDays(d)}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  rangeDays === d
                    ? 'bg-[#244B43] text-[#F8F6F0] shadow-xs'
                    : 'text-[#244B43]/75 hover:text-[#244B43]'
                }`}
              >
                {d}D
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Mood Check-in Strip */}
      {onQuickMoodLog && (
        <div className="p-4 sm:p-5 rounded-2xl bg-[#F8F6F0] border border-[#A9C4B2]/45 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <div className="text-xs font-extrabold text-[#244B43]">Quick Mood Check-in for Today</div>
            <div className="text-[11px] text-[#244B43]/70">Tap how you feel right now to update all mood charts live</div>
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(MOOD_META).map(([key, meta]) => (
              <button
                key={key}
                type="button"
                disabled={loggingMood !== null}
                onClick={() => handleQuickLog(key)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-[#E9F0E7] border border-[#A9C4B2]/60 text-xs font-bold text-[#244B43] transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
              >
                <span>{meta.emoji}</span>
                <span>{loggingMood === key ? 'Saving...' : meta.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 3 Mini Mood KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-[#E9F0E7]/65 border border-[#A9C4B2]/40 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#244B43]/70">Average Mood Score</div>
            <div className="text-2xl font-black text-[#244B43] mt-0.5">{stats.avg} <span className="text-xs font-semibold text-[#244B43]/60">/ 5.0</span></div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white/80 flex items-center justify-center text-xl">
            {Number(stats.avg) >= 4 ? '🌿' : Number(stats.avg) >= 3 ? '🌤️' : '🌧️'}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#D9E9E5]/60 border border-[#A9C4B2]/40 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#244B43]/70">Dominant Mood</div>
            <div className="text-2xl font-black text-[#244B43] mt-0.5 flex items-center gap-1.5">
              <span>{stats.topMood ? stats.topMood.emoji : '😌'}</span>
              <span>{stats.topMood ? stats.topMood.name : 'Calm'}</span>
            </div>
          </div>
          <div className="text-xs font-extrabold text-[#2F5E54] bg-white/80 px-2.5 py-1 rounded-xl">
            {stats.topMood ? `${stats.topMood.pct}%` : '—'}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#F2F7F1] border border-[#A9C4B2]/45 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#244B43]/70">Positive / Calm Days</div>
            <div className="text-2xl font-black text-[#244B43] mt-0.5">
              {stats.upliftDays} <span className="text-xs font-semibold text-[#244B43]/60">of {stats.total} logged</span>
            </div>
          </div>
          <Sparkles className="w-6 h-6 text-[#2F5E54]" />
        </div>
      </div>

      {/* Charts Grid Row 1: Mood Area Trend + Mood Distribution Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 1. Mood Trajectory & Rolling Average */}
        <div className="lg:col-span-7 p-5 rounded-3xl bg-[#F8F6F0]/75 border border-[#A9C4B2]/35 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-[#244B43] flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#2F5E54]" />
                <span>Mood Score &amp; Rolling Stability Trend</span>
              </h3>
              <p className="text-[11px] text-[#244B43]/65">
                Daily mood score (1 = Sad, 5 = Happy) with 3-day rolling trendline
              </p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trajectoryData} margin={{ top: 10, right: 12, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="moodAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2F5E54" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#2F5E54" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#dce8e0" />
                <XAxis dataKey="date" stroke="#244B43" opacity={0.65} fontSize={11} tickLine={false} />
                <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} stroke="#244B43" opacity={0.65} fontSize={11} tickLine={false} />
                <ReferenceLine y={3} stroke="#8E9AAF" strokeDasharray="4 4" />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload || !payload.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div className="bg-white/95 border border-[#A9C4B2] rounded-2xl p-3 shadow-lg text-xs max-w-[220px]">
                        <div className="font-extrabold text-[#244B43] flex items-center gap-1.5">
                          <span>{d.emoji}</span>
                          <span>{d.mood} ({d.score}/5)</span>
                        </div>
                        <div className="text-[10px] text-[#244B43]/60 mt-0.5">{d.fullDate} • 3-day avg: {d.rollingAvg}</div>
                        <div className="text-[11px] text-[#244B43]/85 mt-1.5 italic">&ldquo;{d.note}&rdquo;</div>
                      </div>
                    );
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="score"
                  name="Daily Mood"
                  stroke="#2F5E54"
                  strokeWidth={2.5}
                  fill="url(#moodAreaGrad)"
                  dot={{ r: 4, fill: '#244B43', strokeWidth: 2, stroke: '#F8F6F0' }}
                  activeDot={{ r: 6 }}
                />
                <Area
                  type="monotone"
                  dataKey="rollingAvg"
                  name="3-Day Rolling Avg"
                  stroke="#D99B52"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  fill="none"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Mood Breakdown Donut + Spectrum List */}
        <div className="lg:col-span-5 p-5 rounded-3xl bg-[#F8F6F0]/75 border border-[#A9C4B2]/35 space-y-3 flex flex-col justify-between">
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-[#244B43]">Mood Spectrum Breakdown</h3>
            <p className="text-[11px] text-[#244B43]/65">Proportion of emotional states logged in this window</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={42}
                    outerRadius={66}
                    paddingAngle={4}
                    dataKey="count"
                  >
                    {distributionData.map((entry, idx) => (
                      <Cell key={`mood-cell-${idx}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val: any, _name: any, props: any) => [`${val} days (${props.payload.pct}%)`, `${props.payload.emoji} ${props.payload.name}`]} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2">
              {distributionData.map((item) => (
                <div key={item.key} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-[#244B43]">
                    <span className="flex items-center gap-1.5">
                      <span>{item.emoji}</span>
                      <span>{item.name}</span>
                    </span>
                    <span>{item.pct}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-[#E9F0E7] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${item.pct}%`, backgroundColor: item.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid Row 2: Emotional Dimension Radar + Weekday Mood Rhythm */}
      {!compact && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* 3. Emotional Balance Radar */}
          <div className="lg:col-span-6 p-5 rounded-3xl bg-[#F8F6F0]/75 border border-[#A9C4B2]/35 space-y-2">
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-[#244B43]">Emotional Balance Radar</h3>
              <p className="text-[11px] text-[#244B43]/65">
                6-axis synthesis of calmness, stability, media balance, and check-in rhythm
              </p>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="72%" data={radarData}>
                  <PolarGrid stroke="#cde0d4" />
                  <PolarAngleAxis dataKey="axis" tick={{ fill: '#244B43', fontSize: 11, fontWeight: 700 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar
                    name="Wellbeing Index"
                    dataKey="value"
                    stroke="#244B43"
                    fill="#2F5E54"
                    fillOpacity={0.35}
                    strokeWidth={2}
                  />
                  <Tooltip formatter={(val: any) => [`${val}/100`, 'Score']} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 4. Day-of-Week Mood Rhythm */}
          <div className="lg:col-span-6 p-5 rounded-3xl bg-[#F8F6F0]/75 border border-[#A9C4B2]/35 space-y-2">
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-[#244B43] flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#2F5E54]" />
                <span>Mood by Day of Week</span>
              </h3>
              <p className="text-[11px] text-[#244B43]/65">
                Spot which days of the week tend to feel lighter or heavier
              </p>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weekdayData} margin={{ top: 12, right: 12, left: -18, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#dce8e0" />
                  <XAxis dataKey="day" stroke="#244B43" opacity={0.7} fontSize={11} tickLine={false} />
                  <YAxis domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} stroke="#244B43" opacity={0.7} fontSize={11} tickLine={false} />
                  <Tooltip
                    formatter={(val: any, _name: any, props: any) => [
                      `${val}/5 (${props.payload.entries} check-ins)`,
                      'Avg Mood'
                    ]}
                  />
                  <Bar dataKey="avgScore" radius={[10, 10, 4, 4]}>
                    {weekdayData.map((entry, idx) => (
                      <Cell
                        key={`wd-${idx}`}
                        fill={
                          entry.avgScore >= 4
                            ? '#2F5E54'
                            : entry.avgScore >= 3
                            ? '#6d9d80'
                            : entry.avgScore > 0
                            ? '#D98880'
                            : '#dce8e0'
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* 5. Interactive Daily Mood Mosaic / Check-in Timeline */}
      <div className="p-5 rounded-3xl bg-[#F8F6F0]/75 border border-[#A9C4B2]/35 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-[#244B43] flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-[#2F5E54]" />
              <span>Daily Mood Mosaic ({effectiveHistory.length} Days)</span>
            </h3>
            <p className="text-[11px] text-[#244B43]/65">
              Click any day tile to inspect your logged emotion and reflection note
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold text-[#244B43]/75">
            {Object.entries(MOOD_META).map(([k, m]) => (
              <span key={k} className="inline-flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: m.color }} />
                <span>{m.label}</span>
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {effectiveHistory.map((item, idx) => {
            const meta = MOOD_META[item.mood] || MOOD_META.neutral;
            const isSelected = selectedTile?.checkin_date === item.checkin_date;
            return (
              <button
                key={`${item.checkin_date}-${idx}`}
                type="button"
                onClick={() => setSelectedTile(item)}
                title={`${item.checkin_date}: ${meta.label} (${item.mood_score}/5)`}
                className={`px-3 py-2 rounded-2xl border text-left transition-all flex items-center gap-2 ${
                  isSelected
                    ? 'ring-2 ring-[#244B43] scale-105 shadow-sm ' + meta.bg
                    : meta.bg + ' hover:scale-105'
                }`}
              >
                <span className="text-base">{meta.emoji}</span>
                <div>
                  <div className="text-[10px] font-extrabold leading-tight">{item.checkin_date.slice(5)}</div>
                  <div className="text-[10px] opacity-80 leading-tight">{meta.label}</div>
                </div>
              </button>
            );
          })}
        </div>

        {selectedTile && (
          <div className="p-3.5 rounded-2xl bg-white border border-[#A9C4B2]/50 flex items-start justify-between gap-3 text-xs">
            <div className="space-y-0.5">
              <div className="font-extrabold text-[#244B43] flex items-center gap-1.5">
                <span>{(MOOD_META[selectedTile.mood] || MOOD_META.neutral).emoji}</span>
                <span>
                  {selectedTile.checkin_date} — {(MOOD_META[selectedTile.mood] || MOOD_META.neutral).label} ({selectedTile.mood_score}/5)
                </span>
              </div>
              <p className="text-[#244B43]/80">
                {selectedTile.note || 'No reflection note recorded for this day.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedTile(null)}
              className="text-[11px] font-bold text-[#244B43]/60 hover:text-[#244B43] px-2 py-1"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
