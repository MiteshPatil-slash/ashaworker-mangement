import React from 'react';
import { useOffline } from '../../context/OfflineContext';
import { useLanguage } from '../../context/LanguageContext';
import { WifiOff, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function OfflineBanner() {
  const { isOnline, pendingCount, isSyncing, triggerSync } = useOffline();
  const { t } = useLanguage();

  if (isOnline && pendingCount === 0) return null;

  return (
    <div className={`px-4 py-2 text-xs font-semibold flex items-center justify-between transition-colors ${
      !isOnline
        ? 'bg-amber-500 text-white'
        : 'bg-blue-600 text-white'
    }`}>
      <div className="flex items-center gap-2">
        {!isOnline ? (
          <>
            <WifiOff className="w-4 h-4" />
            <span>{t('offline.offline')} ({pendingCount} changes queued)</span>
          </>
        ) : (
          <>
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{pendingCount} offline records ready to sync with server.</span>
          </>
        )}
      </div>

      <div className="flex items-center gap-2">
        {isOnline && (
          <button
            type="button"
            onClick={triggerSync}
            disabled={isSyncing}
            className="bg-white text-blue-700 px-2.5 py-0.5 rounded-lg text-xs font-bold hover:bg-blue-50 transition-colors"
          >
            {isSyncing ? 'Syncing...' : 'Sync Now'}
          </button>
        )}
        <Link to="/sync" className="underline hover:text-slate-100">
          Sync Center
        </Link>
      </div>
    </div>
  );
}
