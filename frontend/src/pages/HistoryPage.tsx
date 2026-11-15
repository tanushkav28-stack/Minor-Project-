import React, { useEffect, useState } from 'react';
import { 
  History, 
  Trash2, 
  Search, 
  Filter, 
  Chrome, 
  AlertCircle, 
  CheckCircle2, 
  Layers 
} from 'lucide-react';
import { api } from '../services/api';
import { HistoryItem } from '../types';

export const HistoryPage: React.FC = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [filtered, setFiltered] = useState<HistoryItem[]>([]);
  const [search, setSearch] = useState('');
  const [filterEmotion, setFilterEmotion] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const data = await api.getHistory(100);
      setHistory(data.history || []);
      setFiltered(data.history || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    let list = [...history];
    if (search.trim()) {
      list = list.filter(item => 
        item.input_text.toLowerCase().includes(search.toLowerCase()) ||
        item.predicted_emotion.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (filterEmotion !== 'ALL') {
      list = list.filter(item => item.predicted_emotion === filterEmotion);
    }
    setFiltered(list);
  }, [search, filterEmotion, history]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this analysis record?')) return;
    try {
      await api.deleteAnalysis(id);
      setHistory(prev => prev.filter(h => h.analysis_id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete');
    }
  };

  const handleClearAll = async () => {
    if (!confirm('Are you sure you want to clear your ENTIRE analysis history? This action is permanent and GDPR-compliant.')) return;
    try {
      await api.clearHistory();
      setHistory([]);
    } catch (err: any) {
      alert(err.message || 'Failed to clear history');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-sky-100 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-xs font-bold text-sky-700 uppercase tracking-wider mb-1">
            <History className="w-3.5 h-3.5 text-sky-600" />
            <span>Cognivibe AI Audit Trail & Records</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 mt-1">Analysis History</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Historical logs of Hinglish posts analyzed via the Cognivibe extension or web application
          </p>
        </div>

        {history.length > 0 && (
          <button
            onClick={handleClearAll}
            className="flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear All History</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-sky-600 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search within analyzed texts or detected emotions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-sky-200 text-sm focus:ring-2 focus:ring-sky-500 focus:border-transparent bg-white/90"
          />
        </div>

        <select
          value={filterEmotion}
          onChange={(e) => setFilterEmotion(e.target.value)}
          className="px-4 py-2.5 rounded-2xl border border-sky-200 text-sm bg-white/90 text-slate-700 font-medium focus:ring-2 focus:ring-sky-500 focus:border-transparent"
        >
          <option value="ALL">All Emotions</option>
          <option value="Sadness">Sadness</option>
          <option value="Joy">Joy</option>
          <option value="Anger">Anger</option>
          <option value="Anxiety/Worry">Anxiety/Worry</option>
          <option value="Neutral">Neutral</option>
          <option value="Fear">Fear</option>
          <option value="Disgust">Disgust</option>
        </select>
      </div>

      {/* Records Table */}
      <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-sky-100 shadow-[0_4px_20px_-4px_rgba(14,165,233,0.08)] overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">Loading history records...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <p className="font-semibold text-sm">No analysis records match your query.</p>
            <p className="text-xs">Analyze a Hinglish post using the Live Analysis tab or the browser extension!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-sky-50/70 border-b border-sky-100 text-sky-900 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Date & Time</th>
                  <th className="py-3.5 px-4">Platform Source</th>
                  <th className="py-3.5 px-4">Input Text</th>
                  <th className="py-3.5 px-4">Task 1: Emotion</th>
                  <th className="py-3.5 px-4">Task 2: Depression</th>
                  <th className="py-3.5 px-4">Indicator</th>
                  <th className="py-3.5 px-4">Uncertainty</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filtered.map((item) => (
                  <tr key={item.analysis_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">
                      {item.created_at ? item.created_at.substring(0, 16).replace('T', ' ') : 'N/A'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-[10px]">
                        <Chrome className="w-3 h-3 text-blue-600" />
                        <span>{item.source_type.replace('browser_extension_', '').replace('web_dashboard_', '').toUpperCase()}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate font-medium text-slate-900" title={item.input_text}>
                      {item.input_text}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900">{item.predicted_emotion}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.depression_related === 1
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {item.depression_related === 1 ? 'FLAGGED' : 'NON-DEP'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-600">
                      {item.predicted_indicator ? item.predicted_indicator.replace('_', ' ') : 'none'}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500">
                      {Math.round(item.uncertainty_score * 100)}%
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDelete(item.analysis_id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

