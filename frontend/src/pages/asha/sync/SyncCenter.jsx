import React from 'react';
import { useOffline } from '../../../context/OfflineContext';
import { useLanguage } from '../../../context/LanguageContext';
import {
  RefreshCw,
  Wifi,
  WifiOff,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Database,
  Layers
} from 'lucide-react';

export default function SyncCenter() {
  const { isOnline, isSyncing, pendingQueue, pendingCount, lastSyncResult, triggerSync } = useOffline();
  const { t } = useLanguage();

  return (
    <div className="space-y-6 pb-20 lg:pb-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-teal-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-blue-700/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full">
              Field Resilience
            </span>
            <span className="text-blue-100 text-xs">Offline-First Data Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {t('offline.syncTitle')}
          </h1>
          <p className="text-blue-100 text-xs sm:text-sm mt-1 max-w-xl">
            View cached records, manage pending field mutations, and synchronize with server.
          </p>
        </div>

        <button
          type="button"
          disabled={!isOnline || isSyncing}
          onClick={triggerSync}
          className="px-6 py-3 rounded-2xl bg-white text-blue-800 font-bold text-xs shadow-lg hover:bg-blue-50 transition-all flex items-center gap-2 self-start md:self-center disabled:opacity-50 touch-press"
        >
          <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? 'Synchronizing...' : t('offline.syncNow')}</span>
        </button>
      </div>

      {/* Connectivity Status Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-3.5">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
            isOnline ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
          }`}>
            {isOnline ? <Wifi className="w-6 h-6" /> : <WifiOff className="w-6 h-6" />}
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Connection State</span>
            <strong className={`text-sm font-bold block ${isOnline ? 'text-emerald-700' : 'text-amber-700'}`}>
              {isOnline ? 'Online (Connected)' : 'Offline (Field Mode)'}
            </strong>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Pending Mutations</span>
            <strong className="text-lg font-extrabold text-blue-900 block">{pendingCount} Changes</strong>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">{t('offline.lastSynced')}</span>
            <strong className="text-xs font-bold text-slate-800 block">{lastSyncResult.lastSync}</strong>
          </div>
        </div>
      </div>

      {/* Pending Queue Breakdown */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-900">Local Queue Details (IndexedDB)</h3>
          <span className="text-xs text-slate-500 font-medium">Safe client storage</span>
        </div>

        {pendingQueue.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-xs text-slate-500">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="font-bold text-slate-800">All local changes are fully synchronized with the cloud.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {pendingQueue.map((item) => (
              <div key={item.id} className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
                <div>
                  <span className="font-extrabold text-slate-900 block uppercase tracking-tight">
                    {item.actionType?.replace(/_/g, ' ')}
                  </span>
                  <span className="text-[10px] text-slate-500">Queued: {new Date(item.timestamp).toLocaleTimeString()}</span>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                  item.status === 'FAILED' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
