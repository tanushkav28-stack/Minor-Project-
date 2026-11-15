import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('demo@cognivibe.ai');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await api.login({ email, password });
      login(data.access_token, data.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setEmail('demo@cognivibe.ai');
    setPassword('password123');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-7 bg-white/95 backdrop-blur-xl p-8 sm:p-10 rounded-3xl border border-sky-100 shadow-[0_10px_40px_-10px_rgba(14,165,233,0.15)]">
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-tr from-sky-500 via-sky-400 to-teal-400 text-white rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-sky-500/25 mb-3.5">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Welcome to Cognivibe AI</h2>
          <p className="text-xs text-sky-800/80 mt-1 font-medium">Sign in to your research & wellbeing account</p>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-2xl border border-sky-200 text-sm focus:ring-2 focus:ring-sky-500 focus:border-transparent bg-sky-50/20"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-2xl border border-sky-200 text-sm focus:ring-2 focus:ring-sky-500 focus:border-transparent bg-sky-50/20"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-sky-500 via-sky-600 to-teal-500 hover:from-sky-600 hover:to-teal-600 text-white font-bold rounded-2xl shadow-md shadow-sky-500/25 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 text-sm flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
          </button>
        </form>

        <div className="pt-1">
          <button
            type="button"
            onClick={handleFillDemo}
            className="w-full py-2.5 px-3 bg-sky-50/80 hover:bg-sky-100 text-sky-800 font-semibold rounded-2xl text-xs flex items-center justify-center gap-1.5 transition-colors border border-sky-200/80"
          >
            <Sparkles className="w-3.5 h-3.5 text-sky-600" />
            <span>Auto-fill Demo Credentials (demo@cognivibe.ai)</span>
          </button>
        </div>

        <div className="text-center text-xs text-slate-500">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-sky-600 hover:text-sky-700 hover:underline">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
};
