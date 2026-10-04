import React, { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import { useLanguage } from '../../../context/LanguageContext';
import RecordVisitModal from '../../../components/forms/RecordVisitModal';
import {
  CalendarCheck2,
  Search,
  Plus,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Filter,
  Mic,
  Activity
} from 'lucide-react';

export default function VisitsDashboard() {
  const { t } = useLanguage();
  const [visits, setVisits] = useState([]);
  const [activeTab, setActiveTab] = useState('today'); // 'today', 'all', 'missed'
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState(null);

  const fetchVisits = async () => {
    try {
      setLoading(true);
      const params = {};
      if (activeTab === 'today') params.todayOnly = 'true';
      if (activeTab === 'missed') params.status = 'MISSED';

      const res = await api.getVisits(params);
      if (res.success) {
        setVisits(res.visits || []);
      }
    } catch (err) {
      console.error('Failed to load visits:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisits();
  }, [activeTab]);

  const handleOpenRecordModal = (v = null) => {
    setSelectedVisit(v);
    setModalOpen(true);
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6 pb-20 lg:pb-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-600 to-emerald-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-teal-600/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full">
              Field Activity
            </span>
            <span className="text-teal-100 text-xs">Cross-cutting Home Visits</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {t('visits.title')}
          </h1>
          <p className="text-teal-100 text-xs sm:text-sm mt-1 max-w-xl">
            {t('visits.subtitle')}
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleOpenRecordModal()}
          className="px-5 py-3 rounded-2xl bg-white text-teal-800 font-bold text-xs shadow-lg hover:bg-teal-50 transition-all flex items-center gap-2 self-start md:self-center touch-press"
        >
          <Plus className="w-4 h-4" />
          <span>{t('visits.scheduleNew')}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-200 w-full sm:w-auto">
        <button
          type="button"
          onClick={() => setActiveTab('today')}
          className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'today'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {t('visits.todayTab')} ({todayStr})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'all'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {t('visits.allTab')}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('missed')}
          className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'missed'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Missed Visits
        </button>
      </div>

      {/* Visits List */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">{t('common.loading')}</div>
      ) : visits.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-200">
          <CalendarCheck2 className="w-8 h-8 text-teal-300 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-700">{t('common.noData')}</p>
          <p className="text-xs text-slate-500 mt-1">Schedule a new visit using the button above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {visits.map((visit) => {
            const isCompleted = visit.status === 'COMPLETED';
            const isMissed = visit.status === 'MISSED';

            return (
              <div
                key={visit._id || visit.id}
                className={`bg-white p-5 rounded-3xl border transition-all flex flex-col justify-between ${
                  isCompleted
                    ? 'border-emerald-200 bg-emerald-50/20'
                    : isMissed
                    ? 'border-rose-200 bg-rose-50/20'
                    : 'border-slate-200 hover:border-teal-300 hover:shadow-md'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{visit.beneficiaryName}</h3>
                      <span className="text-xs text-slate-500 font-medium">
                        {visit.visitType?.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                      isCompleted
                        ? 'bg-emerald-100 text-emerald-800'
                        : isMissed
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {visit.status}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 mt-2 space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Scheduled Date:</span>
                      <strong className="text-slate-800">{visit.scheduledDate} ({visit.scheduledTime || '10:00 AM'})</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Location / Landmark:</span>
                      <strong className="text-slate-800">{visit.location || 'Household'}</strong>
                    </div>
                    {visit.vitals && visit.vitals.bloodPressure && (
                      <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                        <span className="text-slate-500">Recorded Vitals:</span>
                        <strong className="text-emerald-700">
                          BP: {visit.vitals.bloodPressure} {visit.vitals.weightKg ? `• ${visit.vitals.weightKg}kg` : ''}
                        </strong>
                      </div>
                    )}
                  </div>

                  {visit.observations && (
                    <p className="mt-2 text-xs text-slate-700 italic bg-white p-2 rounded-xl border border-slate-100">
                      "{visit.observations}"
                    </p>
                  )}

                  {visit.servicesProvided && visit.servicesProvided.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {visit.servicesProvided.map((s, idx) => (
                        <span key={idx} className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 border border-teal-100">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  {visit.nextFollowUpDate ? (
                    <span className="text-[11px] text-slate-500">
                      Next Follow-up: <strong className="text-slate-800">{visit.nextFollowUpDate}</strong>
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400">Family ID: {visit.familyId || 'N/A'}</span>
                  )}

                  {!isCompleted && (
                    <button
                      type="button"
                      onClick={() => handleOpenRecordModal(visit)}
                      className="px-4 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-sm"
                    >
                      Record Field Visit
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Record Visit Modal */}
      <RecordVisitModal
        isOpen={modalOpen}
        visit={selectedVisit}
        onClose={() => setModalOpen(false)}
        onSuccess={fetchVisits}
      />

    </div>
  );
}
