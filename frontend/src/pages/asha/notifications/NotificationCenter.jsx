import React, { useState } from 'react';
import { useData } from '../../../context/DataContext';
import { useLanguage } from '../../../context/LanguageContext';
import PriorityBadge from '../../../components/common/PriorityBadge';
import {
  Bell,
  CheckCheck,
  Clock
} from 'lucide-react';

export default function NotificationCenter() {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useData();
  const { t } = useLanguage();
  const [priorityFilter, setPriorityFilter] = useState('');
  const unreadCount = notifications.filter(n => !n.read).length;

  const filteredNotifs = priorityFilter
    ? notifications.filter(n => n.priority === priorityFilter)
    : notifications;

  return (
    <div className="space-y-6 pb-20 lg:pb-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
      
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">{t('nav.notifications')}</h1>
            <p className="text-xs text-slate-500">{t('notifications.centerSubtitle', 'Centralized high-priority alerts and system reminders')}</p>
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAllNotificationsRead}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <CheckCheck className="w-4 h-4 text-emerald-600" />
            <span>{t('notifications.markAllRead', 'Mark all read')}</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setPriorityFilter('')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            priorityFilter === ''
              ? 'bg-slate-900 text-white'
              : 'bg-white text-slate-600 border border-slate-200'
          }`}
        >
          {t('notifications.all', 'All')} ({notifications.length})
        </button>
        <button
          type="button"
          onClick={() => setPriorityFilter('URGENT')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            priorityFilter === 'URGENT'
              ? 'bg-rose-600 text-white'
              : 'bg-white text-rose-700 border border-rose-200'
          }`}
        >
          🔴 Urgent
        </button>
        <button
          type="button"
          onClick={() => setPriorityFilter('HIGH')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            priorityFilter === 'HIGH'
              ? 'bg-amber-600 text-white'
              : 'bg-white text-amber-700 border border-amber-200'
          }`}
        >
          🟠 High
        </button>
        <button
          type="button"
          onClick={() => setPriorityFilter('NORMAL')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            priorityFilter === 'NORMAL'
              ? 'bg-emerald-600 text-white'
              : 'bg-white text-emerald-700 border border-emerald-200'
          }`}
        >
          🟡 Normal
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifs.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-200 text-xs text-slate-400">
            {t('notifications.noCategory', 'No notifications in this category.')}
          </div>
        ) : (
          filteredNotifs.map((n) => (
            <div
              key={n._id || n.id}
              className={`p-4 rounded-3xl border transition-all flex items-start justify-between gap-3 ${
                !n.read
                  ? 'bg-white border-rose-200 shadow-sm ring-1 ring-rose-100'
                  : 'bg-slate-50/60 border-slate-200 opacity-80'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="mt-0.5">
                  <PriorityBadge level={n.priority} showIcon={false} />
                </span>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">{n.title}</h4>
                  <p className="text-xs text-slate-600 mt-0.5">{n.message || n.description || n.desc}</p>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    {n.time || new Date(n.timestamp || Date.now()).toLocaleString()}
                    {n.module ? ` • Module: ${n.module}` : ''}
                  </span>
                </div>
              </div>

              {!n.read && (
                <button
                  type="button"
                  onClick={() => markNotificationRead(n.id)}
                  className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 text-xs font-bold flex-shrink-0"
                  title={t('notifications.markAsRead', 'Mark as read')}
                >
                  <CheckCheck className="w-4 h-4" />
                </button>
              )}
            </div>
          ))
        )}
      </div>

    </div>
  );
}
