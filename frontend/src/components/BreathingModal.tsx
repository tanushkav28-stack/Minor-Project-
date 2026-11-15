import React, { useState, useEffect } from 'react';
import { X, Sparkles, RefreshCw, CheckCircle2 } from 'lucide-react';

interface BreathingModalProps {
  isOpen: boolean;
  onClose: () => void;
  triggerReason?: string;
}

type Phase = 'Inhale' | 'Hold' | 'Exhale' | 'Rest';

const PHASES: { name: Phase; duration: number; instruction: string; scale: string; color: string }[] = [
  { name: 'Inhale', duration: 4, instruction: 'Breathe in slowly through your nose...', scale: 'scale-125', color: 'from-[#244B43] to-[#A9C4B2]' },
  { name: 'Hold', duration: 4, instruction: 'Hold your breath gently. Relax your shoulders...', scale: 'scale-125', color: 'from-[#2F5E54] to-[#A9C4B2]' },
  { name: 'Exhale', duration: 4, instruction: 'Slowly release all tension through your mouth...', scale: 'scale-90', color: 'from-[#244B43] to-[#8E9AAF]' },
  { name: 'Rest', duration: 4, instruction: 'Pause and let your body settle into peace...', scale: 'scale-90', color: 'from-[#A9C4B2] to-[#E9F0E7]' }
];

export const BreathingModal: React.FC<BreathingModalProps> = ({ isOpen, onClose, triggerReason }) => {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [secondsRemaining, setSecondsRemaining] = useState(4);
  const [cycle, setCycle] = useState(1);
  const totalCycles = 2; // 2 full box cycles = 32 seconds (~30s mindful pause)
  const [isCompleted, setIsCompleted] = useState(false);
  const [isRunning, setIsRunning] = useState(true);

  useEffect(() => {
    if (!isOpen) {
      setPhaseIndex(0);
      setSecondsRemaining(4);
      setCycle(1);
      setIsCompleted(false);
      setIsRunning(true);
      return;
    }

    if (!isRunning || isCompleted) return;

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev > 1) {
          return prev - 1;
        }

        setPhaseIndex((currPhase) => {
          if (currPhase === PHASES.length - 1) {
            if (cycle >= totalCycles) {
              setIsCompleted(true);
              return currPhase;
            } else {
              setCycle((c) => c + 1);
              return 0;
            }
          } else {
            return currPhase + 1;
          }
        });

        return 4;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, isRunning, isCompleted, cycle]);

  if (!isOpen) return null;

  const currentPhase = PHASES[phaseIndex];

  const handleRestart = () => {
    setPhaseIndex(0);
    setSecondsRemaining(4);
    setCycle(1);
    setIsCompleted(false);
    setIsRunning(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#102420]/65 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-[#F8F6F0] via-[#F2F7F1] to-[#E9F0E7] rounded-3xl border border-[#A9C4B2]/60 shadow-2xl p-8 sm:p-10 text-center overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-[#244B43]/50 hover:text-[#244B43] hover:bg-[#E9F0E7] transition-colors"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Tag */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E9F0E7] border border-[#A9C4B2] text-[#244B43] text-xs font-bold uppercase tracking-wider mb-3">
          <span>🌿</span>
          <span>Digital Sanctuary • 30s Mindful Breath</span>
        </div>

        {triggerReason && (
          <p className="text-xs text-[#244B43]/80 font-medium mb-6 max-w-sm mx-auto leading-relaxed">
            {triggerReason}
          </p>
        )}

        {!isCompleted ? (
          <div className="space-y-6">
            {/* Animated Breathing Orb */}
            <div className="relative w-56 h-56 mx-auto flex items-center justify-center my-4">
              {/* Outer atmospheric glowing ring */}
              <div
                className={`absolute inset-0 rounded-full bg-gradient-to-tr ${currentPhase.color} opacity-20 blur-xl transition-all duration-1000 ${currentPhase.scale}`}
              ></div>

              {/* Pulsing Guide Ring */}
              <div
                className={`w-44 h-44 rounded-full border-2 border-dashed border-[#A9C4B2] flex items-center justify-center transition-all duration-1000 ${currentPhase.scale}`}
              >
                {/* Center Core Circle */}
                <div
                  className={`w-36 h-36 rounded-full bg-gradient-to-tr ${currentPhase.color} text-white shadow-xl flex flex-col items-center justify-center transition-all duration-1000 ${currentPhase.scale}`}
                >
                  <span className="text-xs font-black uppercase tracking-widest text-[#F8F6F0]/90">
                    {currentPhase.name}
                  </span>
                  <span className="text-3xl font-black mt-0.5 font-mono text-white">{secondsRemaining}s</span>
                </div>
              </div>
            </div>

            {/* Instruction Text */}
            <div className="space-y-1">
              <p className="text-sm font-bold text-[#244B43] transition-all duration-300">
                {currentPhase.instruction}
              </p>
              <div className="flex items-center justify-center gap-1.5 text-xs text-[#2F5E54] font-semibold pt-1">
                <span>Cycle {cycle} of {totalCycles}</span>
                <span>•</span>
                <span>(Inhale 4s → Hold 4s → Exhale 4s → Rest 4s)</span>
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setIsRunning(!isRunning)}
                className="px-5 py-2 rounded-xl text-xs font-bold text-[#244B43] bg-white border border-[#A9C4B2]/70 hover:bg-[#E9F0E7] shadow-xs transition-colors"
              >
                {isRunning ? 'Pause' : 'Resume'}
              </button>
              <button
                onClick={handleRestart}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-[#244B43] bg-[#E9F0E7] hover:bg-[#D9E9E5] border border-[#A9C4B2]/70 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Restart</span>
              </button>
            </div>
          </div>
        ) : (
          /* Completion State */
          <div className="space-y-6 py-6 animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-2xl bg-[#E9F0E7] text-[#244B43] mx-auto flex items-center justify-center shadow-xs border border-[#A9C4B2]">
              <CheckCircle2 className="w-9 h-9 text-[#244B43]" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-black text-[#244B43] tracking-tight">
                Breath Complete. Well Done.
              </h3>
              <p className="text-xs text-[#244B43]/70 max-w-sm mx-auto leading-relaxed">
                You took a conscious pause to regulate your nervous system. Notice how your body feels right now before returning to browsing.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={onClose}
                className="px-7 py-3 rounded-2xl bg-[#244B43] hover:bg-[#17332D] text-[#F8F6F0] font-bold text-xs shadow-md shadow-[#244B43]/20 transition-all hover:scale-105"
              >
                Return Grounded
              </button>
              <button
                onClick={handleRestart}
                className="px-5 py-3 rounded-2xl bg-white text-[#244B43] hover:bg-[#E9F0E7] font-bold text-xs border border-[#A9C4B2]/70 transition-colors"
              >
                Another Cycle
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
