import React, { useState } from 'react';
import { X, Sparkles, BookOpen, CheckCircle2, Feather } from 'lucide-react';

interface JournalModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPrompt?: string;
  initialMood?: string;
}

const INSPIRATIONAL_PROMPTS = [
  "What is bringing you weight today, and what is one small thing that gave you peace?",
  "What drained your energy today, and how can you be gentle with yourself this evening?",
  "Write three thoughts you want to put down so your mind can rest.",
  "Describe how you feel right now in 3 honest words, without judging yourself."
];

export const JournalModal: React.FC<JournalModalProps> = ({
  isOpen,
  onClose,
  defaultPrompt,
  initialMood
}) => {
  const [selectedPrompt, setSelectedPrompt] = useState(defaultPrompt || INSPIRATIONAL_PROMPTS[0]);
  const [journalText, setJournalText] = useState('');
  const [mood, setMood] = useState(initialMood || 'calm');
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!journalText.trim()) return;
    try {
      const existing = JSON.parse(localStorage.getItem('cognivibe_journal_entries') || '[]');
      const newEntry = {
        id: 'jnl_' + Date.now(),
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        mood,
        prompt: selectedPrompt,
        text: journalText.trim()
      };
      localStorage.setItem('cognivibe_journal_entries', JSON.stringify([newEntry, ...existing]));
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        setJournalText('');
        onClose();
      }, 1600);
    } catch (e) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#102420]/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-gradient-to-b from-[#F8F6F0] via-[#F2F7F1] to-[#E9F0E7] rounded-3xl border border-[#A9C4B2]/70 shadow-2xl p-6 sm:p-8 text-left overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-[#244B43]/50 hover:text-[#244B43] hover:bg-[#E9F0E7] transition-colors"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Tag */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E9F0E7] border border-[#A9C4B2] text-[#244B43] text-xs font-bold uppercase tracking-wider mb-3">
          <Feather className="w-3.5 h-3.5 text-[#244B43]" />
          <span>A Quiet Moment For You • Reflective Journal</span>
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-[#244B43] tracking-tight">
          Write How You Feel
        </h2>
        <p className="text-xs text-[#244B43]/70 mt-0.5 mb-4 leading-relaxed">
          This is your private, safe sanctuary. Your words stay on your device and are never sent anywhere.
        </p>

        {saved ? (
          <div className="py-12 text-center space-y-3 animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-2xl bg-[#E9F0E7] text-[#244B43] flex items-center justify-center mx-auto shadow-xs border border-[#A9C4B2]">
              <CheckCircle2 className="w-8 h-8 text-[#244B43]" />
            </div>
            <h3 className="text-xl font-bold text-[#244B43]">Reflection Saved Gently</h3>
            <p className="text-xs text-[#244B43]/70 max-w-sm mx-auto">
              You did something kind for your mind today. Take a deep, relaxed breath.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Prompt Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#244B43] uppercase tracking-wider">
                Reflection Prompt
              </label>
              <select
                value={selectedPrompt}
                onChange={(e) => setSelectedPrompt(e.target.value)}
                className="w-full text-xs font-medium text-[#244B43] bg-white border border-[#A9C4B2]/70 rounded-2xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#A9C4B2] shadow-xs"
              >
                {INSPIRATIONAL_PROMPTS.map((p, i) => (
                  <option key={i} value={p}>{p}</option>
                ))}
              </select>
            </div>

            {/* Quick Mood Chips */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#244B43] uppercase tracking-wider">
                Current Feeling
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { key: 'happy', emoji: '😊', label: 'Good' },
                  { key: 'calm', emoji: '😌', label: 'Calm' },
                  { key: 'neutral', emoji: '😐', label: 'Neutral' },
                  { key: 'stressed', emoji: '😫', label: 'Heavy' },
                  { key: 'sad', emoji: '😢', label: 'Down' },
                  { key: 'anxious', emoji: '😰', label: 'Anxious' }
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setMood(item.key)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      mood === item.key
                        ? 'bg-[#244B43] text-[#F8F6F0] border-[#244B43] shadow-xs'
                        : 'bg-white text-[#244B43]/80 border-[#A9C4B2]/40 hover:border-[#A9C4B2] hover:bg-[#E9F0E7]'
                    }`}
                  >
                    <span>{item.emoji}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Reflection Text Area */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#244B43] uppercase tracking-wider">
                Your Thoughts
              </label>
              <textarea
                value={journalText}
                onChange={(e) => setJournalText(e.target.value)}
                placeholder="Write whatever comes to mind... It doesn't have to be structured or neat. You can just let your thoughts flow freely here."
                rows={5}
                className="w-full text-xs sm:text-sm text-[#244B43] bg-white border border-[#A9C4B2]/60 rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-[#A9C4B2] shadow-xs leading-relaxed resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-[#244B43]/60 font-medium">
                {journalText.length} characters • 100% private on device
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#244B43] bg-white border border-[#A9C4B2]/50 hover:bg-[#E9F0E7] transition-colors"
                >
                  Maybe Later
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={!journalText.trim()}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-[#F8F6F0] bg-[#244B43] hover:bg-[#17332D] disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-[#244B43]/20 transition-all hover:scale-105"
                >
                  Save Reflection
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
