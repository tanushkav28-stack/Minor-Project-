import React, { useEffect, useState } from 'react';
import { 
  Settings, 
  Chrome, 
  Copy, 
  Check, 
  ShieldCheck, 
  Trash2, 
  User, 
  Lock 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const SettingsPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [copied, setCopied] = useState(false);
  const [privacy, setPrivacy] = useState<any>({
    consent_status: 1,
    retention_days: 30,
    allow_extension_analysis: 1
  });
  const [savingPrivacy, setSavingPrivacy] = useState(false);

  useEffect(() => {
    async function loadPrivacy() {
      try {
        const data = await api.getPrivacySettings();
        setPrivacy(data);
      } catch (e) {
        console.error(e);
      }
    }
    loadPrivacy();
  }, []);

  const handleCopyToken = () => {
    if (user?.extension_token) {
      navigator.clipboard.writeText(user.extension_token);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSavePrivacy = async () => {
    setSavingPrivacy(true);
    try {
      await api.updatePrivacySettings({
        consent_status: privacy.consent_status ? 1 : 0,
        retention_days: Number(privacy.retention_days),
        allow_extension_analysis: privacy.allow_extension_analysis ? 1 : 0
      });
      alert('Privacy & data retention preferences saved successfully.');
    } catch (err: any) {
      alert(err.message || 'Failed to save settings');
    } finally {
      setSavingPrivacy(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('CAUTION: Are you sure you want to permanently delete your account and all associated analysis records? This cannot be undone.')) return;
    try {
      await api.deleteAccount();
      logout();
      window.location.href = '/';
    } catch (err: any) {
      alert(err.message || 'Failed to delete account');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6">
        <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider">
          <Settings className="w-4 h-4" />
          <span>Account & Security</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 mt-1">Profile & Privacy Preferences</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage your browser extension pairing, research consent, and automated data retention
        </p>
      </div>

      {/* BROWSER EXTENSION PAIRING TOKEN */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-6 sm:p-8 rounded-3xl shadow-lg space-y-4">
        <div className="flex items-center gap-2 text-sky-400 text-xs font-bold uppercase tracking-wider">
          <Chrome className="w-4 h-4" />
          <span>Chrome & Edge Browser Extension Pairing</span>
        </div>
        <h2 className="text-xl font-extrabold">Your Extension API Token</h2>
        <p className="text-xs text-blue-200 leading-relaxed max-w-xl">
          Paste this token inside the Cognivibe Extension Popup (Settings tab) to synchronize your browsing post analyses directly to your personal research dashboard.
        </p>
        <div className="flex items-center gap-2 bg-slate-950/70 p-2.5 rounded-xl border border-blue-400/30 font-mono text-xs max-w-lg">
          <span className="truncate flex-1 text-sky-200">{user?.extension_token || 'ext_demo_token_key'}</span>
          <button
            onClick={handleCopyToken}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-sans font-bold text-xs transition-colors shrink-0"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy Token'}</span>
          </button>
        </div>
      </div>

      {/* USER PROFILE CARD */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <User className="w-4 h-4 text-blue-600" />
          <span>User Profile</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="text-slate-500 font-semibold block mb-1">Full Name</label>
            <input
              type="text"
              readOnly
              value={user?.name || ''}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium"
            />
          </div>
          <div>
            <label className="text-slate-500 font-semibold block mb-1">Email Address</label>
            <input
              type="email"
              readOnly
              value={user?.email || ''}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium"
            />
          </div>
        </div>
      </div>

      {/* PRIVACY & RETENTION CARD */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Consent & Data Retention Controls</span>
        </h2>

        <div className="space-y-4 text-xs">
          <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
            <div>
              <div className="font-bold text-slate-900">Analysis & Research Consent</div>
              <div className="text-slate-500">Allow system to save classification results for longitudinal tracking.</div>
            </div>
            <input
              type="checkbox"
              checked={Boolean(privacy.consent_status)}
              onChange={(e) => setPrivacy({ ...privacy, consent_status: e.target.checked ? 1 : 0 })}
              className="w-4 h-4 text-blue-600 rounded"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
            <div>
              <div className="font-bold text-slate-900">Browser Extension Content Sync</div>
              <div className="text-slate-500">Allow analyses initiated from Reddit, Twitter, etc., to sync to account.</div>
            </div>
            <input
              type="checkbox"
              checked={Boolean(privacy.allow_extension_analysis)}
              onChange={(e) => setPrivacy({ ...privacy, allow_extension_analysis: e.target.checked ? 1 : 0 })}
              className="w-4 h-4 text-blue-600 rounded"
            />
          </label>

          <div className="p-3 rounded-xl border border-slate-200 space-y-2">
            <div className="font-bold text-slate-900">Automatic Data Retention Period</div>
            <div className="text-slate-500">Old analysis records will be permanently purged after this duration:</div>
            <select
              value={privacy.retention_days}
              onChange={(e) => setPrivacy({ ...privacy, retention_days: e.target.value })}
              className="p-2 border border-slate-300 rounded-lg bg-white text-slate-800 text-xs font-semibold"
            >
              <option value="7">7 Days (Strict Minimal Retention)</option>
              <option value="30">30 Days (Standard Research Period)</option>
              <option value="90">90 Days (Longitudinal Research)</option>
              <option value="0">Do Not Save Texts (Zero Retention Mode)</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleSavePrivacy}
          disabled={savingPrivacy}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
        >
          {savingPrivacy ? 'Saving...' : 'Save Privacy Preferences'}
        </button>
      </div>

      {/* DANGER ZONE */}
      <div className="bg-rose-50/50 p-6 sm:p-8 rounded-3xl border border-rose-200 space-y-4">
        <h2 className="text-base font-bold text-rose-900 flex items-center gap-2">
          <Trash2 className="w-4 h-4 text-rose-600" />
          <span>Danger Zone • Right to Erasure</span>
        </h2>
        <p className="text-xs text-rose-700 leading-relaxed">
          In compliance with ethical research practices and data protection regulations, you can delete your account and all associated prediction history at any time.
        </p>
        <button
          onClick={handleDeleteAccount}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
        >
          Delete Account & Purge All Data
        </button>
      </div>
    </div>
  );
};

