import React, { useState, useEffect } from 'react';
import { X, CalendarCheck2, Mic, Activity, Check } from 'lucide-react';
import { api } from '../../services/api';
import { useOffline } from '../../context/OfflineContext';
import { useLanguage } from '../../context/LanguageContext';
import VoiceInput from '../common/VoiceInput';

export default function RecordVisitModal({ isOpen, onClose, onSuccess, visit = null, beneficiaries = [] }) {
  const { queueAction, isOnline } = useOffline();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    beneficiaryName: '',
    beneficiaryType: 'PREGNANT_WOMAN',
    visitType: 'PREGNANCY_ANC',
    observations: '',
    servicesProvided: ['Vitals check', 'Health & nutrition counseling'],
    remarks: '',
    bloodPressure: '120/80',
    weightKg: '',
    temperature: '98.6°F',
    nextFollowUpDate: ''
  });

  useEffect(() => {
    if (visit) {
      setFormData(prev => ({
        ...prev,
        beneficiaryName: visit.beneficiaryName || '',
        beneficiaryType: visit.beneficiaryType || 'PREGNANT_WOMAN',
        visitType: visit.visitType || 'PREGNANCY_ANC',
        observations: visit.observations || '',
        remarks: visit.remarks || '',
        nextFollowUpDate: visit.nextFollowUpDate || ''
      }));
    }
  }, [visit]);

  if (!isOpen) return null;

  const toggleService = (srv) => {
    setFormData(prev => {
      const exists = prev.servicesProvided.includes(srv);
      return {
        ...prev,
        servicesProvided: exists
          ? prev.servicesProvided.filter(s => s !== srv)
          : [...prev.servicesProvided, srv]
      };
    });
  };

  const handleVoiceTranscript = (text) => {
    setFormData(prev => ({
      ...prev,
      observations: prev.observations ? `${prev.observations} ${text}` : text
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (visit && (visit._id || visit.id)) {
        const visitId = visit._id || visit.id;
        if (isOnline) {
          await api.recordVisit(visitId, formData);
        } else {
          await queueAction('RECORD_VISIT', { visitId, data: formData });
        }
      } else {
        // Schedule & complete new visit
        if (isOnline) {
          const newVisit = await api.scheduleVisit({
            ...formData,
            scheduledDate: new Date().toISOString().split('T')[0]
          });
          if (newVisit.visit?._id) {
            await api.recordVisit(newVisit.visit._id, formData);
          }
        } else {
          await queueAction('SCHEDULE_VISIT', formData);
        }
      }

      onSuccess?.();
      onClose();
    } catch (err) {
      alert(err.message || 'Failed to record visit');
    } finally {
      setLoading(false);
    }
  };

  const commonServices = [
    'Vitals check',
    'Health & nutrition counseling',
    'IFA / Calcium Tablets given',
    'Vaccination administered',
    'Growth measurement taken',
    'Institutional delivery discussion',
    'Hygiene & sanitation advisory'
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <CalendarCheck2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Record Field Visit</h3>
              <p className="text-xs text-slate-500">Capture vitals, voice field notes, and schedule follow-ups</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-4 overflow-y-auto pr-1 flex-1">
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Beneficiary Name *
              </label>
              <input
                type="text"
                required
                value={formData.beneficiaryName}
                onChange={e => setFormData({ ...formData, beneficiaryName: e.target.value })}
                placeholder="e.g. Priya Deshmukh"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Visit Type *
              </label>
              <select
                value={formData.visitType}
                onChange={e => setFormData({ ...formData, visitType: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="PREGNANCY_ANC">Pregnancy ANC Check</option>
                <option value="POSTNATAL_PNC">Postnatal PNC Check</option>
                <option value="CHILD_IMMUNIZATION">Child Immunization</option>
                <option value="CHILD_GROWTH">Child Growth Check</option>
                <option value="MEDICINE_DISTRIBUTION">Medicine Distribution</option>
                <option value="GENERAL_FAMILY">General Family Check</option>
                <option value="ELDERLY_CARE">Elderly Care</option>
              </select>
            </div>
          </div>

          {/* Vitals */}
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-emerald-600" />
              <span>Vitals & Key Measurements</span>
            </span>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] font-bold text-slate-500 block uppercase">Blood Pressure</label>
                <input
                  type="text"
                  placeholder="120/80"
                  value={formData.bloodPressure}
                  onChange={e => setFormData({ ...formData, bloodPressure: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs bg-white rounded-lg border border-slate-200 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 block uppercase">Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="e.g. 54.5"
                  value={formData.weightKg}
                  onChange={e => setFormData({ ...formData, weightKg: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs bg-white rounded-lg border border-slate-200 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 block uppercase">Temperature</label>
                <input
                  type="text"
                  placeholder="98.6°F"
                  value={formData.temperature}
                  onChange={e => setFormData({ ...formData, temperature: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs bg-white rounded-lg border border-slate-200 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Observations with Voice Note */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Field Observations & Notes
              </label>
              <VoiceInput onTranscript={handleVoiceTranscript} />
            </div>
            <textarea
              rows="3"
              value={formData.observations}
              onChange={e => setFormData({ ...formData, observations: e.target.value })}
              placeholder="Enter field observations, health complaints, or tap mic to speak in English/Hindi/Marathi..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Services Provided Badges */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Services & Counseling Provided
            </label>
            <div className="flex flex-wrap gap-1.5">
              {commonServices.map(srv => {
                const selected = formData.servicesProvided.includes(srv);
                return (
                  <button
                    key={srv}
                    type="button"
                    onClick={() => toggleService(srv)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
                      selected
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {selected && <Check className="w-3 h-3" />}
                    <span>{srv}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Next Follow-Up Date */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Next Follow-Up Date (Auto-generates task)
            </label>
            <input
              type="date"
              value={formData.nextFollowUpDate}
              onChange={e => setFormData({ ...formData, nextFollowUpDate: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-200 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Complete & Record Visit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
