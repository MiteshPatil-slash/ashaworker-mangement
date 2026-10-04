import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useData } from '../../context/DataContext';
import {
  User,
  Globe,
  Bell,
  Lock,
  Wifi,
  Save,
  CheckCircle2,
  RefreshCw,
  Database
} from 'lucide-react';

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { isSimulatedOffline, toggleOfflineMode, offlineQueue, syncOfflineQueue, lastSyncTime } = useData();

  const [activeTab, setActiveTab] = useState('Profile');
  const [formData, setFormData] = useState({
    name: user?.name || 'Sunita Patil',
    mobile: user?.phone || '9876543210',
    email: user?.email || 'sunita@asha.gov.in',
    selectedLanguage: language
  });
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    updateUser({
      name: formData.name,
      phone: formData.mobile,
      email: formData.email
    });
    setLanguage(formData.selectedLanguage);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Settings & Profile
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Manage your account profile, language preferences, and offline synchronization
        </p>
      </div>

      {/* Tabs matching Screen 15 */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1">
        {['Profile', 'Language', 'Notifications', 'Security', 'Offline Sync'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2.5 px-4 text-xs font-bold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === tab
                ? 'border-blue-600 text-blue-600 font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {saveSuccess && (
        <div className="p-3.5 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Settings and profile details updated successfully!</span>
        </div>
      )}

      {/* Profile Tab matching Screen 15 Form */}
      {activeTab === 'Profile' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
          <form onSubmit={handleSave} className="space-y-5 max-w-lg">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Mobile Number
              </label>
              <input
                type="tel"
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Language
              </label>
              <select
                value={formData.selectedLanguage}
                onChange={(e) => setFormData({ ...formData, selectedLanguage: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              >
                <option value="en">English</option>
                <option value="mr">मराठी (Marathi)</option>
                <option value="hi">हिंदी (Hindi)</option>
              </select>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Language Tab */}
      {activeTab === 'Language' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
          <h2 className="text-sm font-extrabold text-slate-900">Interface Language</h2>
          <p className="text-xs text-slate-500">Select your preferred working language across the portal</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            {[
              { code: 'en', label: 'English', sub: 'English Language' },
              { code: 'mr', label: 'मराठी', sub: 'मराठी भाषा (Maharashtra)' },
              { code: 'hi', label: 'हिंदी', sub: 'हिंदी भाषा (National)' }
            ].map((l) => (
              <button
                key={l.code}
                onClick={() => setLanguage(l.code)}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  language === l.code
                    ? 'border-blue-600 bg-blue-50/80 text-blue-900 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="font-extrabold text-sm">{l.label}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">{l.sub}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Offline Sync Diagnostics Tab */}
      {activeTab === 'Offline Sync' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900">Offline Field Cache Diagnostics</h2>
              <p className="text-xs text-slate-500">Monitor local cache and queued unsynchronized records</p>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
              isSimulatedOffline ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
            }`}>
              {isSimulatedOffline ? 'Offline Active' : 'Connected to Central Hub'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-slate-400 block text-[11px]">Queued Unsynced Records</span>
              <strong className="text-lg font-black text-slate-800 mt-1 block">{offlineQueue.length}</strong>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-slate-400 block text-[11px]">Last Sync Timestamp</span>
              <strong className="text-xs font-bold text-slate-800 mt-2 block">{lastSyncTime}</strong>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-slate-400 block text-[11px]">Storage Engine</span>
              <strong className="text-xs font-bold text-slate-800 mt-2 block">IndexedDB + LocalStorage</strong>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-3">
            <button
              onClick={toggleOfflineMode}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                isSimulatedOffline ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-amber-500 text-white border-amber-500'
              }`}
            >
              {isSimulatedOffline ? 'Switch to Online Mode' : 'Simulate Offline Mode'}
            </button>

            <button
              onClick={() => syncOfflineQueue()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Force Synchronize Now</span>
            </button>
          </div>
        </div>
      )}

      {/* Security & Notifications Tabs */}
      {(activeTab === 'Security' || activeTab === 'Notifications') && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs text-xs text-slate-600">
          <h2 className="text-sm font-extrabold text-slate-900 mb-2">{activeTab} Preferences</h2>
          <p>Two-factor OTP authentication and high-priority SMS alerts are enabled by default for community health safety.</p>
        </div>
      )}
    </div>
  );
}
