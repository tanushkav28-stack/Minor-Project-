import { DailyReportResponse, WeeklyReportResponse } from '../types';

const API_BASE = '/api';

export function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('aura_auth_token') || localStorage.getItem('cognivibe_auth_token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const api = {
  // Auth
  async login(credentials: { email: string; password: string }) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to login');
    }
    return res.json();
  },

  async register(data: { name: string; email: string; password: string }) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to register');
    }
    return res.json();
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Not authenticated');
    return res.json();
  },

  // Analysis
  async analyzeText(payload: { text: string; source_type?: string; include_context?: boolean }) {
    const res = await fetch(`${API_BASE}/analysis/text`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Analysis request failed');
    }
    return res.json();
  },

  async getHistory(limit = 50) {
    const res = await fetch(`${API_BASE}/analysis/history?limit=${limit}`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch history');
    return res.json();
  },

  async deleteAnalysis(id: string) {
    const res = await fetch(`${API_BASE}/analysis/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to delete analysis');
    return res.json();
  },

  async clearHistory() {
    const res = await fetch(`${API_BASE}/analysis/history`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to clear history');
    return res.json();
  },

  // Dashboard
  async getDashboardSummary() {
    const res = await fetch(`${API_BASE}/dashboard/summary`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch dashboard summary');
    return res.json();
  },

  async getDashboardTrends(days = 14) {
    const res = await fetch(`${API_BASE}/dashboard/trends?days=${days}`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch trends');
    return res.json();
  },

  async getBenchmarks() {
    const res = await fetch(`${API_BASE}/dashboard/benchmarks`);
    if (!res.ok) throw new Error('Failed to fetch benchmarks');
    return res.json();
  },

  // Reports
  async generateReport(payload: { title: string; report_type?: string }) {
    const res = await fetch(`${API_BASE}/reports/generate`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to generate report');
    }
    return res.json();
  },

  async listReports() {
    const res = await fetch(`${API_BASE}/reports/list`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to list reports');
    return res.json();
  },

  async downloadReportHtml(reportId: string): Promise<string> {
    const res = await fetch(`${API_BASE}/reports/${reportId}/download`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to load report content');
    }
    return res.text();
  },

  async deleteReport(reportId: string) {
    const res = await fetch(`${API_BASE}/reports/${reportId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to delete report');
    }
    return res.json();
  },

  // Settings & Privacy
  async getPrivacySettings() {
    const res = await fetch(`${API_BASE}/users/privacy`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to get privacy settings');
    return res.json();
  },

  async updatePrivacySettings(payload: { consent_status: number; retention_days: number; allow_extension_analysis: number }) {
    const res = await fetch(`${API_BASE}/users/privacy`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to update privacy settings');
    return res.json();
  },

  async deleteAccount() {
    const res = await fetch(`${API_BASE}/users/account`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to delete account');
    return res.json();
  },

  // Digital Consumption & Mood Intelligence
  async getDailyReport(date?: string): Promise<DailyReportResponse> {
    const query = date ? `?date=${date}` : '';
    const res = await fetch(`${API_BASE}/consumption/daily-report${query}`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch daily report');
    return res.json();
  },

  async getWeeklyReport(startDate?: string, endDate?: string): Promise<WeeklyReportResponse> {
    let query = '';
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    if (params.toString()) query = `?${params.toString()}`;

    const res = await fetch(`${API_BASE}/consumption/weekly-report${query}`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch weekly report');
    return res.json();
  },

  async recordMoodCheckin(payload: { mood: string; note?: string; date?: string }) {
    const res = await fetch(`${API_BASE}/consumption/mood-checkin`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to record mood check-in');
    return res.json();
  },

  async getMoodHistory(days = 30) {
    const res = await fetch(`${API_BASE}/consumption/mood-history?days=${days}`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch mood history');
    return res.json();
  },

  async clearConsumptionLogs() {
    const res = await fetch(`${API_BASE}/consumption/clear`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to clear consumption logs');
    return res.json();
  }
};

