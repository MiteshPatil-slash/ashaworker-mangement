import React, { useState, useEffect } from 'react';
import { X, Heart, Calendar, AlertTriangle } from 'lucide-react';
import { api } from '../../services/api';
import { useOffline } from '../../context/OfflineContext';
import { useLanguage } from '../../context/LanguageContext';

export default function RegisterPregnancyModal({ isOpen, onClose, onSuccess, families = [] }) {
  const { queueAction, isOnline } = useOffline();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    womanName: '',
    age: 24,
    mobile: '',
    address: '',
    familyId: families[0]?.familyId || 'FAM-MH-0101',
    lmpDate: '',
    bloodGroup: 'B+',
    gravida: 1,
    parity: 0,
    systolicBP: 120,
    diastolicBP: 80,
    hemoglobin: 11.0,
    hasBleeding: false,
    hasSevereHeadache: false,
    hasBlurredVision: false,
    hasSwelling: false,
    notes: ''
  });

  const [eddPreview, setEddPreview] = useState('');
  const [weeksPreview, setWeeksPreview] = useState(0);

  // Auto-calculate EDD and gestation weeks when LMP changes
  useEffect(() => {
    if (formData.lmpDate) {
      const lmp = new Date(formData.lmpDate);
      if (!isNaN(lmp.getTime())) {
        const edd = new Date(lmp.getTime() + 280 * 24 * 60 * 60 * 1000);
        setEddPreview(edd.toISOString().split('T')[0]);

        const diffDays = Math.max(0, Math.floor((new Date().getTime() - lmp.getTime()) / (24 * 60 * 60 * 1000)));
        setWeeksPreview(Math.floor(diffDays / 7));
      }
    } else {
      setEddPreview('');
      setWeeksPreview(0);
    }
  }, [formData.lmpDate]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.womanName || !formData.lmpDate || !formData.familyId) {
      alert('Please fill woman name, LMP date, and Family ID');
      return;
    }

    setLoading(true);
    try {
      if (isOnline) {
        await api.registerPregnancy(formData);
      } else {
        await queueAction('REGISTER_PREGNANCY', formData);
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      alert(err.message || 'Failed to register pregnancy');
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
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Register Pregnant Woman</h3>
              <p className="text-xs text-slate-500">Maternal care tracking and automated EDD calculation</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-4 overflow-y-auto pr-1 flex-1">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Woman's Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.womanName}
                onChange={e => setFormData({ ...formData, womanName: e.target.value })}
                placeholder="e.g. Priya Deshmukh"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Age (Yrs) *
              </label>
              <input
                type="number"
                required
                value={formData.age}
                onChange={e => setFormData({ ...formData, age: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
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
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono uppercase"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Mobile Number
              </label>
              <input
                type="tel"
                value={formData.mobile}
                onChange={e => setFormData({ ...formData, mobile: e.target.value })}
                placeholder="10-digit mobile"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>

          {/* LMP Date & Auto EDD Preview */}
          <div className="bg-rose-50/70 p-3.5 rounded-2xl border border-rose-100 space-y-2">
            <div>
              <label className="block text-xs font-bold text-rose-900 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-rose-600" />
                <span>Last Menstrual Period (LMP Date) *</span>
              </label>
              <input
                type="date"
                required
                value={formData.lmpDate}
                onChange={e => setFormData({ ...formData, lmpDate: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-rose-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            {eddPreview && (
              <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                <div className="bg-white p-2 rounded-xl border border-rose-200">
                  <span className="text-[10px] text-slate-500 font-bold block uppercase">Calculated EDD</span>
                  <span className="font-bold text-rose-700">{eddPreview}</span>
                </div>
                <div className="bg-white p-2 rounded-xl border border-rose-200">
                  <span className="text-[10px] text-slate-500 font-bold block uppercase">Gestational Age</span>
                  <span className="font-bold text-emerald-700">~{weeksPreview} Weeks</span>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Blood Group
              </label>
              <select
                value={formData.bloodGroup}
                onChange={e => setFormData({ ...formData, bloodGroup: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
              >
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Gravida (G)
              </label>
              <input
                type="number"
                min="1"
                value={formData.gravida}
                onChange={e => setFormData({ ...formData, gravida: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Parity (P)
              </label>
              <input
                type="number"
                min="0"
                value={formData.parity}
                onChange={e => setFormData({ ...formData, parity: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>

          {/* Vitals */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Systolic BP
              </label>
              <input
                type="number"
                value={formData.systolicBP}
                onChange={e => setFormData({ ...formData, systolicBP: Number(e.target.value) })}
                placeholder="120"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Diastolic BP
              </label>
              <input
                type="number"
                value={formData.diastolicBP}
                onChange={e => setFormData({ ...formData, diastolicBP: Number(e.target.value) })}
                placeholder="80"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Hb (g/dL)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.hemoglobin}
                onChange={e => setFormData({ ...formData, hemoglobin: Number(e.target.value) })}
                placeholder="11.0"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>

          {/* Protocol Alert Symptom Checkboxes */}
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
              Protocol Risk Indicators (if present):
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-700">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.hasBleeding}
                  onChange={e => setFormData({ ...formData, hasBleeding: e.target.checked })}
                  className="rounded text-rose-600 focus:ring-rose-500"
                />
                <span>Vaginal Bleeding</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.hasSevereHeadache}
                  onChange={e => setFormData({ ...formData, hasSevereHeadache: e.target.checked })}
                  className="rounded text-rose-600 focus:ring-rose-500"
                />
                <span>Severe Headache / Vision blur</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.hasSwelling}
                  onChange={e => setFormData({ ...formData, hasSwelling: e.target.checked })}
                  className="rounded text-rose-600 focus:ring-rose-500"
                />
                <span>Pedal Swelling / Edema</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Address / Residence Details
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
              placeholder="House #, Street, Village sector"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
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
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-200 disabled:opacity-50"
            >
              {loading ? 'Registering...' : 'Save Pregnancy Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
