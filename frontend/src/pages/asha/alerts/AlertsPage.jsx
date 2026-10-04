import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../../context/DataContext';
import { useLanguage } from '../../../context/LanguageContext';
import {
  Bell,
  AlertTriangle,
  Clock,
  Info,
  CheckCircle2,
  Phone,
  Eye,
  Check
} from 'lucide-react';

export default function AlertsPage() {
  const { alerts, resolveAlert } = useData();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('All');

  const counts = {
    All: alerts.filter(a => !a.resolved).length,
    HighRisk: alerts.filter(a => !a.resolved && a.type === 'High Risk').length,
    FollowUp: alerts.filter(a => !a.resolved && a.type === 'Follow-up').length,
    Info: alerts.filter(a => !a.resolved && a.type === 'Info').length
  };

  const tabs = [
    { key: 'All', label: `${t('alerts.all', 'All')} (${counts.All})` },
    { key: 'High Risk', label: `${t('alerts.highRisk', 'High Risk')} (${counts.HighRisk})` },
    { key: 'Follow-up', label: `${t('alerts.followUp', 'Follow-up')} (${counts.FollowUp})` },
    { key: 'Info', label: `${t('alerts.info', 'Info')} (${counts.Info})` }
  ];

  const filteredAlerts = alerts.filter(a => {
    if (a.resolved) return false;
    if (activeTab === 'High Risk') return a.type === 'High Risk';
    if (activeTab === 'Follow-up') return a.type === 'Follow-up';
    if (activeTab === 'Info') return a.type === 'Info';
    return true;
  });

  const getBadgeStyle = (type) => {
    switch (type) {
      case 'High Risk':
        return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'Follow-up':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Info':
      default:
        return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          {t('alerts.title', 'Alerts & Reminders')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          {t('alerts.subtitle', 'Critical health risks, pending follow-ups, and scheduled field actions')}
        </p>
      </div>

      {/* Tabs Filter matching Screen 10 */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === tab.key
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Alert Items matching Screen 10 */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400 text-xs">
            {t('alerts.empty', 'No active alerts under this category.')}
          </div>
        ) : (
          filteredAlerts.map((alt) => (
            <div
              key={alt.id}
              className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-300 transition-colors"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs shrink-0">
                  {alt.patientName.split(' ')[0][0]}{alt.patientName.split(' ')[1]?.[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      onClick={() => navigate(`/beneficiaries/${alt.beneficiaryId}`)}
                      className="text-xs sm:text-sm font-bold text-slate-900 hover:text-blue-600 cursor-pointer"
                    >
                      {alt.patientName}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getBadgeStyle(alt.type)}`}>
                      {alt.type === 'High Risk' ? t('alerts.highRisk', 'High Risk') : alt.type === 'Follow-up' ? t('alerts.followUp', 'Follow-up') : t('alerts.info', 'Info')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5 font-medium">{alt.message}</p>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-1">
                    <Clock className="w-3 h-3" />
                    {alt.date} {t('common.at', 'at')} {alt.time}
                  </span>
                </div>
              </div>

              {/* Action Buttons matching Screen 10: View & Contact / Mark */}
              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <button
                  onClick={() => navigate(`/beneficiaries/${alt.beneficiaryId}`)}
                  className="px-3.5 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  {t('common.view', 'View')}
                </button>

                <button
                  onClick={() => resolveAlert(alt.id)}
                  className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{t('alerts.markResolved', 'Mark Resolved')}</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
