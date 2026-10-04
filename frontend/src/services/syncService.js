import { getPendingActions, removePendingAction, updatePendingAction } from './offlineDb';
import { api } from './api';

export async function processSyncQueue() {
  const pending = await getPendingActions();
  if (!pending || pending.length === 0) {
    return { synced: 0, failed: 0, total: 0 };
  }

  let synced = 0;
  let failed = 0;

  for (const item of pending) {
    try {
      switch (item.actionType) {
        case 'RECORD_VISIT':
          await api.recordVisit(item.payload.visitId, item.payload.data);
          break;
        case 'SCHEDULE_VISIT':
          await api.scheduleVisit(item.payload);
          break;
        case 'REGISTER_PREGNANCY':
          await api.registerPregnancy(item.payload);
          break;
        case 'ADD_ANC_VISIT':
          await api.addAncVisit(item.payload.pregnancyId, item.payload.data);
          break;
        case 'REGISTER_BIRTH':
          await api.registerBirth(item.payload);
          break;
        case 'RECORD_VACCINE':
          await api.recordVaccine(item.payload.childId, item.payload.data);
          break;
        case 'DISTRIBUTE_MEDICINE':
          await api.distributeMedicine(item.payload);
          break;
        case 'CREATE_FAMILY':
          await api.createFamily(item.payload);
          break;
        default:
          console.warn('Unknown sync action:', item.actionType);
      }

      await removePendingAction(item.id);
      synced++;
    } catch (err) {
      console.error('Failed to sync queue item:', item, err);
      await updatePendingAction(item.id, {
        status: 'FAILED',
        error: err.message || 'Network error'
      });
      failed++;
    }
  }

  return { synced, failed, total: pending.length, lastSync: new Date().toLocaleTimeString() };
}
