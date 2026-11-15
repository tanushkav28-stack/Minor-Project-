import React, { useEffect, useState } from 'react';
import { 
  FileText, 
  Plus, 
  Calendar, 
  Download
} from 'lucide-react';
import { api } from '../services/api';

export const ReportsPage: React.FC = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [reportTitle, setReportTitle] = useState('Cognivibe Mental Health Language Screening Report');

  const fetchReports = async () => {
    try {
      setLoading(true);
      const data = await api.listReports();
      setReports(data.reports || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    try {
      await api.generateReport({ title: reportTitle });
      await fetchReports();
      alert('Report generated successfully! You can now view or print to PDF.');
    } catch (err: any) {
      alert(err.message || 'Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };

  const handleOpenPrint = (reportId: string) => {
    window.open(`/api/reports/${reportId}/download`, '_blank');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-sky-100 pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-xs font-bold text-sky-700 uppercase tracking-wider mb-1">
          <FileText className="w-3.5 h-3.5 text-sky-600" />
          <span>Cognivibe Documentation & Exports</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 mt-1">Research & Clinical Reports</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Generate comprehensive screening summaries with distribution charts and ethical non-diagnostic disclaimers
        </p>
      </div>

      {/* Generator Card */}
      <div className="bg-white/90 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-sky-100 shadow-[0_4px_20px_-4px_rgba(14,165,233,0.08)] space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Generate New Report</h2>
        <form onSubmit={handleGenerate} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={reportTitle}
            onChange={(e) => setReportTitle(e.target.value)}
            placeholder="Report Title..."
            required
            className="flex-1 px-4 py-3 rounded-2xl border border-sky-200 text-sm focus:ring-2 focus:ring-sky-500 focus:border-transparent bg-sky-50/20"
          />
          <button
            type="submit"
            disabled={generating}
            className="flex items-center justify-center gap-2 px-7 py-3 bg-gradient-to-r from-sky-500 via-sky-600 to-teal-500 hover:from-sky-600 hover:to-teal-600 text-white font-bold rounded-2xl text-xs sm:text-sm shadow-md shadow-sky-500/20 transition-all disabled:opacity-50 hover:scale-105 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>{generating ? 'Compiling Report...' : 'Generate Report'}</span>
          </button>
        </form>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900">Previously Generated Reports</h2>

        {loading ? (
          <div className="p-12 text-center text-xs text-sky-700 font-medium">Loading reports...</div>
        ) : reports.length === 0 ? (
          <div className="bg-white/90 backdrop-blur-md p-12 rounded-3xl border border-sky-100 text-center text-slate-500">
            <p className="font-semibold text-sm">No reports generated yet.</p>
            <p className="text-xs mt-1">Click "Generate Report" above to compile your language screening summary.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reports.map((r) => (
              <div key={r.report_id} className="bg-white/90 backdrop-blur-md p-6 rounded-3xl border border-sky-100 shadow-[0_4px_20px_-4px_rgba(14,165,233,0.08)] flex flex-col justify-between space-y-4 hover:border-sky-300 transition-all">
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                    <span className="flex items-center gap-1 font-mono text-sky-800">
                      <Calendar className="w-3.5 h-3.5 text-sky-600" />
                      {r.generated_at ? r.generated_at.substring(0, 16).replace('T', ' ') : 'N/A'}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-200 font-bold text-[10px]">
                      COGNIVIBE PDF READY
                    </span>
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-base">{r.title}</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Analyzed sample metrics, emotion distributions, and confidence intervals.
                  </p>
                </div>

                <div className="pt-3 border-t border-sky-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-mono">ID: {r.report_id}</span>
                  <button
                    onClick={() => handleOpenPrint(r.report_id)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 font-bold rounded-xl text-xs transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-sky-600" />
                    <span>View & Download PDF</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
