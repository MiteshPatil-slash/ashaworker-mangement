import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { addPendingAction, getPendingActions } from '../services/offlineDb';
import { processSyncQueue } from '../services/syncService';

const OfflineContext = createContext(null);

export function OfflineProvider({ children }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingQueue, setPendingQueue] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState({
    synced: 0,
    failed: 0,
    total: 0,
    lastSync: localStorage.getItem('asha_last_sync') || 'Never'
  });

  const refreshPendingCount = useCallback(async () => {
    try {
      const items = await getPendingActions();
      setPendingQueue(items || []);
    } catch (err) {
      console.error('Failed to load pending queue:', err);
    }
  }, []);

  const triggerSync = useCallback(async () => {
    if (!navigator.onLine || isSyncing) return;
    setIsSyncing(true);
    try {
      const result = await processSyncQueue();
      const now = new Date().toLocaleTimeString();
      localStorage.setItem('asha_last_sync', now);
      setLastSyncResult(prev => ({ ...prev, ...result, lastSync: now }));
      await refreshPendingCount();
    } catch (err) {
      console.error('Sync execution failed:', err);
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing, refreshPendingCount]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      triggerSync();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    refreshPendingCount();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [triggerSync, refreshPendingCount]);

  const queueAction = async (actionType, payload) => {
    await addPendingAction({ actionType, payload });
    await refreshPendingCount();

    // If online, attempt immediate sync
    if (navigator.onLine) {
      triggerSync();
    }
  };

  return (
    <OfflineContext.Provider
      value={{
        isOnline,
        isSyncing,
        pendingQueue,
        pendingCount: pendingQueue.length,
        lastSyncResult,
        triggerSync,
        queueAction,
        refreshPendingCount
      }}
    >
      {children}
    </OfflineContext.Provider>
  );
}

export function useOffline() {
  const context = useContext(OfflineContext);
  if (!context) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  return context;
}
