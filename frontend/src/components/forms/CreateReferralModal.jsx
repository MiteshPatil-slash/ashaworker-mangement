import React, { useState, useEffect } from 'react';
import { X, Send, Hospital, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';
import { useOffline } from '../../context/OfflineContext';
import { useLanguage } from '../../context/LanguageContext';

export default function CreateReferralModal({ isOpen, onClose, onSuccess, patient = null, facilities = [] }) {
  const { isOnline } = useOffline();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    patientName: '',
    patientId: '',
    reason: 'Elevated BP & Severe Headache in 3rd Trimester',
    priority: 'HIGH',
    facilityId: '',
    facilityName: '',
    remarks: 'Referred for specialist OBGYN evaluation.'
  });

  useEffect(() => {
    if (patient) {
      setFormData(prev => ({
        ...prev,
        patientName: patient.womanName || patient.name || '',
        patientId: patient._id || patient.id || ''
      }));
    }
    if (facilities.length > 0) {
      setFormData(prev => ({
        ...prev,
        facilityId: facilities[0]._id || facilities[0].id,
        facilityName: facilities[0].name
      }));
    }
  }, [patient, facilities]);

  if (!isOpen) return null;

  const handleFacilityChange = (facId) => {
    const fac = facilities.find(f => f._id === facId || f.id === facId);
    if (fac) {
      setFormData(prev => ({
        ...prev,
        facilityId: fac._id || fac.id,
        facilityName: fac.name
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.reason || !formData.facilityId) {
      alert('Please fill reason and select a healthcare facility');
      return;
    }

    setLoading(true);
    try {
      if (formData.patientId) {
        await api.createReferral(formData.patientId, formData);
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      alert(err.message || 'Failed to create referral');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Hospital className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Health Facility Referral</h3>
              <p className="text-xs text-slate-500">Generates formal referral record & auto follow-up task</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-4 overflow-y-auto pr-1 flex-1">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Patient / Beneficiary Name
            </label>
            <input
              type="text"
              readOnly
              value={formData.patientName}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 font-bold text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Select Referral Healthcare Facility *
            </label>
            <select
              value={formData.facilityId}
              onChange={e => handleFacilityChange(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
            >
              {facilities.map(f => (
                <option key={f._id || f.id} value={f._id || f.id}>
                  {f.name} ({f.type}) - {f.contactNumber}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Referral Priority Level
              </label>
              <select
                value={formData.priority}
                onChange={e => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white font-bold"
              >
                <option value="HIGH" className="text-rose-600">🔴 HIGH (Urgent Emergency / OBGYN)</option>
                <option value="NORMAL" className="text-amber-600">🟡 NORMAL (Routine Specialist Check)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Emergency Transport Needed?
              </label>
              <div className="flex items-center gap-2 pt-2 text-xs font-bold text-slate-700">
                <span className="bg-rose-50 text-rose-700 px-2.5 py-1 rounded-lg border border-rose-200">
                  Call 108 / 102
                </span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Clinical Reason for Referral *
            </label>
            <textarea
              rows="2"
              required
              value={formData.reason}
              onChange={e => setFormData({ ...formData, reason: e.target.value })}
              placeholder="e.g. High BP (>140/90) with severe headache in 35th week..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Advice / Follow-up Remarks
            </label>
            <input
              type="text"
              value={formData.remarks}
              onChange={e => setFormData({ ...formData, remarks: e.target.value })}
              placeholder="e.g. Accompany patient with MCP card to Civil Hospital"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
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
              className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md shadow-amber-200 disabled:opacity-50 flex items-center gap-1.5"
            >
              <Send className="w-4 h-4" />
              <span>{loading ? 'Creating...' : 'Create & Dispatch Referral'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
