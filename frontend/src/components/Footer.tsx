import React from 'react';
import { ShieldAlert, Heart, PhoneCall } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">🧠</span>
              <span className="font-extrabold text-white text-lg">Cognivibe AI</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              A Context-Aware, Multitask AI System for Mental Health Language Analysis in Code-Mixed Hinglish Social Media Content.
              Final-Year B.Tech Major Project.
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3 text-amber-400 font-semibold text-sm">
              <ShieldAlert className="w-4 h-4" />
              <span>Ethical Non-Diagnostic Notice</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Cognivibe AI is an assistive research and screening exploration tool. It does <strong>not</strong> make clinical psychiatric diagnoses, prescribe treatments, or substitute professional psychiatric care.
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3 text-red-400 font-semibold text-sm">
              <PhoneCall className="w-4 h-4" />
              <span>Emergency 24x7 Helplines (India)</span>
            </div>
            <ul className="text-xs text-slate-400 space-y-1.5">
              <li>• <strong>Tele-MANAS:</strong> 14416 / 1800-891-4416 (Govt of India, Toll-Free)</li>
              <li>• <strong>KIRAN Helpline:</strong> 1800-599-0019 (24x7 Multi-lingual)</li>
              <li>• <strong>Vandrevala Foundation:</strong> +91 9999 666 555</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500">
          <div>© {new Date().getFullYear()} Cognivibe AI / MannSetu AI Project. All rights reserved.</div>
          <div className="flex items-center gap-1 mt-2 sm:mt-0 text-slate-400">
            <span>Built with ethical privacy & research integrity</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 ml-1" />
          </div>
        </div>
      </div>
    </footer>
  );
};

