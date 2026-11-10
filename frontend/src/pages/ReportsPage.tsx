import React, { useEffect, useState } from 'react';
import { 
  FileText, 
  FileDown, 
  Plus, 
  Calendar, 
  Download, 
  ExternalLink,
  ShieldAlert
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
      <div className="border-b border-slate-200 pb-6">
        <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider">
          <FileText className="w-4 h-4" />
          <span>Documentation & Exports</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 mt-1">Research & Clinical Reports</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Generate comprehensive screening summaries with distribution charts and ethical non-diagnostic disclaimers
        </p>
      </div>

      {/* Generator Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Generate New Report</h2>
        <form onSubmit={handleGenerate} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={reportTitle}
            onChange={(e) => setReportTitle(e.target.value)}
            placeholder="Report Title..."
            required
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={generating}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm shadow-md transition-all disabled:opacity-50"
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
          <div className="p-12 text-center text-xs text-slate-500">Loading reports...</div>
        ) : reports.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center text-slate-500">
            <p className="font-semibold text-sm">No reports generated yet.</p>
            <p className="text-xs mt-1">Click "Generate Report" above to compile your language screening summary.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reports.map((r) => (
              <div key={r.report_id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4 hover:border-blue-300 transition-colors">
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                    <span className="flex items-center gap-1 font-mono">
                      <Calendar className="w-3.5 h-3.5" />
                      {r.generated_at ? r.generated_at.substring(0, 16).replace('T', ' ') : 'N/A'}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold text-[10px]">
                      RESEARCH PDF READY
                    </span>
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-base">{r.title}</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Analyzed sample metrics, emotion distributions, and confidence intervals.
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-mono">ID: {r.report_id}</span>
                  <button
                    onClick={() => handleOpenPrint(r.report_id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg text-xs transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
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

