import React from 'react';
import { ShieldAlert, Heart, PhoneCall, Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-b from-[#17332D] via-[#102420] to-[#0A1815] text-[#E9F0E7] border-t border-[#244B43] mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <div className="flex items-center gap-2.5 mb-3.5">
              <div className="w-8 h-8 rounded-xl bg-[#244B43] border border-[#A9C4B2]/40 flex items-center justify-center text-white shadow-xs">
                <span>🌿</span>
              </div>
              <span className="font-black text-[#F8F6F0] text-xl tracking-tight">Cognivibe AI</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#244B43] text-[#A9C4B2] border border-[#A9C4B2]/30">
                Wellbeing Sanctuary
              </span>
            </div>
            <p className="text-xs text-[#E9F0E7]/70 leading-relaxed max-w-sm">
              Empathetic, context-aware digital wellbeing sanctuary for code-mixed Hinglish and everyday digital life. 
              Designed to illuminate emotional balance with privacy and human care.
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3.5 text-[#F4D06F] font-semibold text-sm">
              <ShieldAlert className="w-4 h-4 text-[#F4D06F]" />
              <span>Ethical Non-Diagnostic Notice</span>
            </div>
            <p className="text-xs text-[#E9F0E7]/70 leading-relaxed">
              Cognivibe AI is an assistive digital reflection and emotional sanctuary tool. It does <strong>not</strong> make clinical psychiatric diagnoses, prescribe treatments, or substitute professional psychiatric or medical care.
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3.5 text-[#D98880] font-semibold text-sm">
              <PhoneCall className="w-4 h-4 text-[#D98880]" />
              <span>Emergency 24x7 Helplines (India)</span>
            </div>
            <ul className="text-xs text-[#E9F0E7]/80 space-y-2">
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#A9C4B2]"></span>
                <span><strong>Tele-MANAS:</strong> 14416 / 1800-891-4416 (Toll-Free)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D9E9E5]"></span>
                <span><strong>KIRAN Helpline:</strong> 1800-599-0019 (24x7 Multi-lingual)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E8D8CC]"></span>
                <span><strong>Vandrevala Foundation:</strong> +91 9999 666 555</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-[#244B43]/60 flex flex-col sm:flex-row justify-between items-center text-xs text-[#E9F0E7]/60">
          <div>© {new Date().getFullYear()} Cognivibe AI. Your Digital Wellbeing Sanctuary.</div>
          <div className="flex items-center gap-1 mt-3 sm:mt-0 text-[#E9F0E7]/60">
            <span>Built with empathy, privacy & calm technology</span>
            <Heart className="w-3.5 h-3.5 text-[#D98880] fill-[#D98880] ml-1 inline" />
          </div>
        </div>
      </div>
    </footer>
  );
};
