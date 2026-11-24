import React, { useEffect, useRef, useState } from 'react';
import {
  FileText,
  Plus,
  Calendar,
  Download,
  Eye,
  Printer,
  Trash2,
  X,
  CheckCircle2,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { api } from '../services/api';

const REPORT_TYPES = [
  { value: 'comprehensive', label: 'Comprehensive Wellbeing & Screening' },
  { value: 'mood_wellbeing', label: 'Mood & Digital Consumption Summary' },
  { value: 'clinical_screening', label: 'Clinical Language Screening (Task 1 & 2)' },
];

export const ReportsPage: React.FC = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [openingId, setOpeningId] = useState<string | null>(null);
  const [reportTitle, setReportTitle] = useState('Cognivibe Mental Health & Mood Wellbeing Report');
  const [reportType, setReportType] = useState('comprehensive');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Preview Modal State
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState<string>('');
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const data = await api.listReports();
      setReports(data.reports || []);
    } catch (e: any) {
      setFeedback({ type: 'error', message: e.message || 'Unable to load reports.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const openReportPreview = async (reportId: string, title: string) => {
    setOpeningId(reportId);
    setFeedback(null);
    try {
      const html = await api.downloadReportHtml(reportId);
      setPreviewTitle(title);
      setPreviewHtml(html);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to open report.' });
    } finally {
      setOpeningId(null);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportTitle.trim()) return;
    setGenerating(true);
    setFeedback(null);
    try {
      const created = await api.generateReport({
        title: reportTitle.trim(),
        report_type: reportType
      });
      await fetchReports();
      setFeedback({
        type: 'success',
        message: `Report "${created.title}" generated successfully!`
      });
      if (created.report_id) {
        await openReportPreview(created.report_id, created.title);
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to generate report. Make sure the backend server is running.'
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadHtmlFile = () => {
    if (!previewHtml) return;
    const blob = new Blob([previewHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(previewTitle || 'cognivibe-report').toLowerCase().replace(/[^a-z0-9]+/g, '-')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleOpenInNewTab = async (reportId: string) => {
    setOpeningId(reportId);
    try {
      const html = await api.downloadReportHtml(reportId);
      const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      const blobUrl = URL.createObjectURL(blob);
      const win = window.open(blobUrl, '_blank');
      if (!win) {
        setPreviewTitle('Report Preview');
        setPreviewHtml(html);
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Could not open report.' });
    } finally {
      setOpeningId(null);
    }
  };

  const handlePrintPreview = () => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.focus();
      iframeRef.current.contentWindow.print();
    }
  };

  const handleDelete = async (reportId: string) => {
    if (!confirm('Delete this saved report?')) return;
    try {
      await api.deleteReport(reportId);
      setReports((prev) => prev.filter((r) => r.report_id !== reportId));
      setFeedback({ type: 'success', message: 'Report deleted.' });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to delete report.' });
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-[#A9C4B2]/40 pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E9F0E7] border border-[#A9C4B2]/60 text-xs font-bold text-[#244B43] uppercase tracking-wider mb-1">
          <FileText className="w-3.5 h-3.5 text-[#2F5E54]" />
          <span>Cognivibe Documentation &amp; Exports</span>
        </div>
        <h1 className="text-3xl font-black text-[#244B43] mt-1">Research &amp; Wellbeing Reports</h1>
        <p className="text-xs sm:text-sm text-[#244B43]/75 mt-1">
          Generate comprehensive mood, digital wellbeing, and Hinglish language screening summaries ready to preview or print as PDF.
        </p>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between gap-3 text-xs font-semibold ${
            feedback.type === 'success'
              ? 'bg-[#E9F0E7] border-[#A9C4B2] text-[#244B43]'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-[#2F5E54] shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="p-1 rounded-lg hover:bg-black/5">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Generator Card */}
      <div className="bg-white/95 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-[#A9C4B2]/40 shadow-sanctuary space-y-4">
        <div>
          <h2 className="text-lg font-extrabold text-[#244B43]">Generate New Report</h2>
          <p className="text-xs text-[#244B43]/70 mt-0.5">
            Compiles your emotion distribution, depressive linguistic indicators, mood check-in history, and weekly consumption summary.
          </p>
        </div>
        <form onSubmit={handleGenerate} className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <input
            type="text"
            value={reportTitle}
            onChange={(e) => setReportTitle(e.target.value)}
            placeholder="Report Title..."
            required
            className="md:col-span-6 px-4 py-3 rounded-2xl border border-[#A9C4B2]/60 text-sm text-[#244B43] focus:outline-none focus:ring-2 focus:ring-[#244B43]/40 bg-[#F8F6F0]/60"
          />
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="md:col-span-3 px-4 py-3 rounded-2xl border border-[#A9C4B2]/60 text-xs sm:text-sm font-semibold text-[#244B43] focus:outline-none focus:ring-2 focus:ring-[#244B43]/40 bg-[#F8F6F0]/60"
          >
            {REPORT_TYPES.map((rt) => (
              <option key={rt.value} value={rt.value}>
                {rt.label}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={generating}
            className="md:col-span-3 flex items-center justify-center gap-2 px-6 py-3 bg-[#244B43] hover:bg-[#17332D] text-[#F8F6F0] font-bold rounded-2xl text-xs sm:text-sm shadow-md shadow-[#244B43]/20 transition-all disabled:opacity-50 hover:scale-[1.02] active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>{generating ? 'Compiling Report...' : 'Generate Report'}</span>
          </button>
        </form>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold text-[#244B43]">Previously Generated Reports</h2>
          <span className="text-xs font-semibold text-[#244B43]/60">{reports.length} saved</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-[#244B43]/70 font-medium">Loading reports...</div>
        ) : reports.length === 0 ? (
          <div className="bg-white/90 backdrop-blur-md p-12 rounded-3xl border border-[#A9C4B2]/40 text-center text-[#244B43]/70">
            <p className="font-bold text-sm text-[#244B43]">No reports generated yet.</p>
            <p className="text-xs mt-1">Click &ldquo;Generate Report&rdquo; above to compile your wellbeing and language screening summary.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reports.map((r) => (
              <div
                key={r.report_id}
                className="bg-white/95 backdrop-blur-md p-6 rounded-3xl border border-[#A9C4B2]/40 shadow-sanctuary flex flex-col justify-between space-y-4 hover:border-[#2F5E54]/50 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-[#244B43]/70 mb-2 gap-2">
                    <span className="flex items-center gap-1.5 font-mono text-[#244B43]">
                      <Calendar className="w-3.5 h-3.5 text-[#2F5E54]" />
                      {r.generated_at ? r.generated_at.substring(0, 16).replace('T', ' ') : 'N/A'}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#E9F0E7] text-[#244B43] border border-[#A9C4B2]/60 font-bold text-[10px] uppercase">
                      {(r.report_type || 'summary').replace(/_/g, ' ')}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-[#244B43] text-base">{r.title}</h3>
                  <p className="text-xs text-[#244B43]/70 mt-1">
                    Includes emotion distributions, mood check-in insights, and confidence metrics.
                  </p>
                </div>

                <div className="pt-3 border-t border-[#E9F0E7] flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[11px] text-[#244B43]/50 font-mono">ID: {r.report_id}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openReportPreview(r.report_id, r.title)}
                      disabled={openingId === r.report_id}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#244B43] hover:bg-[#17332D] text-[#F8F6F0] font-bold rounded-xl text-xs transition-colors disabled:opacity-50"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{openingId === r.report_id ? 'Loading...' : 'Preview & PDF'}</span>
                    </button>
                    <button
                      onClick={() => handleOpenInNewTab(r.report_id)}
                      disabled={openingId === r.report_id}
                      title="Open in new tab"
                      className="p-2 bg-[#E9F0E7] hover:bg-[#D9E9E5] text-[#244B43] border border-[#A9C4B2]/60 rounded-xl transition-colors disabled:opacity-50"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(r.report_id)}
                      title="Delete report"
                      className="p-2 text-[#244B43]/50 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Interactive Report Preview & PDF Modal */}
      {previewHtml && (
        <div className="fixed inset-0 z-50 bg-[#102420]/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
          <div className="bg-[#F8F6F0] rounded-3xl border border-[#A9C4B2]/60 shadow-2xl w-full max-w-5xl h-[88vh] flex flex-col overflow-hidden">
            {/* Modal Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 bg-[#E9F0E7] border-b border-[#A9C4B2]/50">
              <div className="min-w-0">
                <div className="text-xs font-black uppercase tracking-wider text-[#2F5E54]">Report Preview</div>
                <div className="text-sm font-extrabold text-[#244B43] truncate">{previewTitle}</div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintPreview}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#244B43] hover:bg-[#17332D] text-[#F8F6F0] text-xs font-bold shadow-xs transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print / Save PDF</span>
                </button>
                <button
                  onClick={handleDownloadHtmlFile}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-[#F2F7F1] text-[#244B43] border border-[#A9C4B2] text-xs font-bold transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download HTML</span>
                </button>
                <button
                  onClick={() => setPreviewHtml(null)}
                  aria-label="Close report preview"
                  className="p-2 rounded-xl text-[#244B43]/70 hover:text-[#244B43] hover:bg-white/70 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Rendered HTML Report Frame */}
            <div className="flex-1 bg-white">
              <iframe
                ref={iframeRef}
                title="Cognivibe Report Preview"
                srcDoc={previewHtml}
                className="w-full h-full border-0"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
