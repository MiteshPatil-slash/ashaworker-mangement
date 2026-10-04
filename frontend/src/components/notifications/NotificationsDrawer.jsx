import React from 'react';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  X,
  Bell,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  ClipboardList,
  Check,
  Clock
} from 'lucide-react';

export default function NotificationsDrawer({ isOpen, onClose }) {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useData();
  const { t } = useLanguage();

  if (!isOpen) return null;

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />;
      case 'info':
      default:
        return <Bell className="w-4 h-4 text-blue-500 shrink-0" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
      />

      <div className="absolute inset-y-0 right-0 max-w-sm w-full bg-white shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">{t('nav.notifications', 'Notifications')}</h3>
              <p className="text-[11px] text-slate-500">{t('notifications.subtitle', 'Real-time alerts and system updates')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {notifications.some(n => !n.read) && (
              <button
                onClick={markAllNotificationsRead}
                className="text-[11px] text-blue-600 hover:text-blue-700 font-semibold cursor-pointer"
                title={t('notifications.markAllAsRead', 'Mark all as read')}
              >
                {t('notifications.markAllRead', 'Mark all read')}
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              {t('notifications.empty', 'No notifications at this time.')}
            </div>
          ) : (
            notifications.map((item) => (
              <div
                key={item.id}
                onClick={() => markNotificationRead(item.id)}
                className={`p-3 rounded-xl transition-all cursor-pointer flex gap-3 ${
                  item.read ? 'opacity-70 hover:bg-slate-50' : 'bg-blue-50/50 hover:bg-blue-50 border border-blue-100/80 mb-1'
                }`}
              >
                <div className="mt-0.5">{getIcon(item.type)}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-800">{item.title}</h4>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      {item.time}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">{item.desc}</p>
                </div>
                {!item.read && (
                  <span className="w-2 h-2 rounded-full bg-blue-600 self-center shrink-0" />
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 text-center">
          <p className="text-[11px] text-slate-400">{t('notifications.syncedWithDistrict', 'Synced with District Health Authority Portal')}</p>
        </div>
      </div>
    </div>
  );
}
