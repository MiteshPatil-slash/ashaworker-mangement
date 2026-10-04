import React, { useState } from 'react';
import { X, Baby, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';
import { useOffline } from '../../context/OfflineContext';
import { useLanguage } from '../../context/LanguageContext';

export default function RegisterBirthModal({ isOpen, onClose, onSuccess, pregnancies = [] }) {
  const { queueAction, isOnline } = useOffline();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [selectedPregnancy, setSelectedPregnancy] = useState('');
  const [formData, setFormData] = useState({
    childName: '',
    dateOfBirth: new Date().toISOString().split('T')[0],
    gender: 'Female',
    motherName: '',
    fatherName: '',
    familyId: 'FAM-MH-0101',
    pregnancyId: '',
    birthWeightKg: 3.1,
    birthHeightCm: 50,
    placeOfBirth: 'Chandrapur Rural PHC',
    deliveryType: 'Normal Institutional',
    birthVaccinesGiven: true,
    notes: ''
  });

  if (!isOpen) return null;

  const handlePregnancySelect = (pregId) => {
    setSelectedPregnancy(pregId);
    if (!pregId) return;

    const preg = pregnancies.find(p => p._id === pregId || p.id === pregId);
    if (preg) {
      setFormData(prev => ({
        ...prev,
        motherName: preg.womanName,
        familyId: preg.familyId,
        pregnancyId: preg._id
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.childName || !formData.dateOfBirth || !formData.familyId) {
      alert('Please fill child name, date of birth, and Family ID');
      return;
    }

    setLoading(true);
    try {
      if (isOnline) {
        await api.registerBirth(formData);
      } else {
        await queueAction('REGISTER_BIRTH', formData);
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      alert(err.message || 'Failed to register birth');
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
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Baby className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Register New Birth</h3>
              <p className="text-xs text-slate-500">Auto-generates Child ID & links to Maternal Record</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-4 overflow-y-auto pr-1 flex-1">
          
          {/* Optional Pregnancy Link */}
          {pregnancies.length > 0 && (
            <div className="bg-blue-50/70 p-3 rounded-2xl border border-blue-100">
              <label className="block text-xs font-bold text-blue-900 uppercase tracking-wider mb-1">
                Link to Mother's Active Pregnancy (Optional)
              </label>
              <select
                value={selectedPregnancy}
                onChange={e => handlePregnancySelect(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-blue-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Select Mother's Record --</option>
                {pregnancies.filter(p => p.status === 'ACTIVE').map(p => (
                  <option key={p._id} value={p._id}>
                    {p.womanName} (Family: {p.familyId}) - EDD: {p.expectedDeliveryDate}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Child's Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.childName}
                onChange={e => setFormData({ ...formData, childName: e.target.value })}
                placeholder="e.g. Aarav Patil"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Gender *
              </label>
              <select
                value={formData.gender}
                onChange={e => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Date of Birth (DOB) *
              </label>
              <input
                type="date"
                required
                value={formData.dateOfBirth}
                onChange={e => setFormData({ ...formData, dateOfBirth: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Family ID *
              </label>
              <input
                type="text"
                required
                value={formData.familyId}
                onChange={e => setFormData({ ...formData, familyId: e.target.value })}
                placeholder="e.g. FAM-MH-0101"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono uppercase"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Mother's Name
              </label>
              <input
                type="text"
                value={formData.motherName}
                onChange={e => setFormData({ ...formData, motherName: e.target.value })}
                placeholder="Mother's name"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Father's Name
              </label>
              <input
                type="text"
                value={formData.fatherName}
                onChange={e => setFormData({ ...formData, fatherName: e.target.value })}
                placeholder="Father's name"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Birth Weight (kg)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.birthWeightKg}
                onChange={e => setFormData({ ...formData, birthWeightKg: Number(e.target.value) })}
                placeholder="3.0"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Delivery Type
              </label>
              <select
                value={formData.deliveryType}
                onChange={e => setFormData({ ...formData, deliveryType: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="Normal Institutional">Normal Institutional</option>
                <option value="Caesarean (C-Section)">Caesarean (C-Section)</option>
                <option value="Assisted Forceps/Vacuum">Assisted</option>
                <option value="Home Delivery (Clean)">Home Delivery</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Place of Birth
            </label>
            <input
              type="text"
              value={formData.placeOfBirth}
              onChange={e => setFormData({ ...formData, placeOfBirth: e.target.value })}
              placeholder="e.g. Primary Health Centre / Sub-Centre"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Birth Vaccine Dose Checkbox */}
          <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-200 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-emerald-900 block">Birth Dose Immunization Given?</span>
              <span className="text-[11px] text-emerald-700">BCG, OPV-0, and Hepatitis-B (Birth Dose)</span>
            </div>
            <input
              type="checkbox"
              checked={formData.birthVaccinesGiven}
              onChange={e => setFormData({ ...formData, birthVaccinesGiven: e.target.checked })}
              className="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500"
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
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-200 disabled:opacity-50"
            >
              {loading ? 'Registering...' : 'Register Birth & Child'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
