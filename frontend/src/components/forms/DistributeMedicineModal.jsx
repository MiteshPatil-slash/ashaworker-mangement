import React, { useState } from 'react';
import { X, Pill, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';
import { useOffline } from '../../context/OfflineContext';
import { useLanguage } from '../../context/LanguageContext';

export default function DistributeMedicineModal({ isOpen, onClose, onSuccess, medicines = [] }) {
  const { queueAction, isOnline } = useOffline();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [selectedMedicineId, setSelectedMedicineId] = useState(medicines[0]?._id || '');
  const [formData, setFormData] = useState({
    quantity: 30,
    recipientName: '',
    familyId: 'FAM-MH-0101',
    beneficiaryType: 'PREGNANT_WOMAN',
    remarks: 'Routine supply'
  });

  if (!isOpen) return null;

  const currentMed = medicines.find(m => m._id === selectedMedicineId || m.id === selectedMedicineId) || medicines[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentMed) {
      alert('Please select a medicine');
      return;
    }

    if (currentMed.status === 'EXPIRED') {
      alert('Cannot distribute expired medicine. Selected batch is expired.');
      return;
    }

    if (Number(formData.quantity) > currentMed.availableQuantity) {
      alert(`Cannot distribute ${formData.quantity}. Only ${currentMed.availableQuantity} available.`);
      return;
    }

    setLoading(true);
    const payload = {
      medicineId: currentMed._id,
      quantity: Number(formData.quantity),
      recipientName: formData.recipientName,
      familyId: formData.familyId,
      beneficiaryType: formData.beneficiaryType,
      remarks: formData.remarks
    };

    try {
      if (isOnline) {
        await api.distributeMedicine(payload);
      } else {
        await queueAction('DISTRIBUTE_MEDICINE', payload);
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      alert(err.message || 'Failed to distribute medicine');
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
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Dispense Medicine</h3>
              <p className="text-xs text-slate-500">Record stock deduction & beneficiary distribution</p>
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
              Select Medicine Item *
            </label>
            <select
              value={selectedMedicineId}
              onChange={e => setSelectedMedicineId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
            >
              {medicines.map(m => (
                <option key={m._id} value={m._id} disabled={m.status === 'EXPIRED' || m.availableQuantity <= 0}>
                  {m.medicineName} ({m.availableQuantity} {m.unit || 'units'} left) - Exp: {m.expiryDate} {m.status === 'EXPIRED' ? '[EXPIRED]' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Current Stock Preview Card */}
          {currentMed && (
            <div className={`p-3 rounded-2xl border text-xs flex items-center justify-between ${
              currentMed.status === 'EXPIRED'
                ? 'bg-rose-50 border-rose-200 text-rose-800'
                : currentMed.availableQuantity <= currentMed.minThreshold
                ? 'bg-amber-50 border-amber-200 text-amber-800'
                : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}>
              <div>
                <span className="font-bold block">{currentMed.medicineName}</span>
                <span className="text-[11px] opacity-80">Batch: {currentMed.batchNo} | Exp: {currentMed.expiryDate}</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-extrabold block">{currentMed.availableQuantity} {currentMed.unit || 'units'}</span>
                <span className="text-[10px] uppercase font-bold">{currentMed.status.replace('_', ' ')}</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Quantity to Dispense *
              </label>
              <input
                type="number"
                min="1"
                required
                value={formData.quantity}
                onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Beneficiary Category
              </label>
              <select
                value={formData.beneficiaryType}
                onChange={e => setFormData({ ...formData, beneficiaryType: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
              >
                <option value="PREGNANT_WOMAN">Pregnant Woman</option>
                <option value="LACTATING_MOTHER">Lactating Mother</option>
                <option value="CHILD">Child</option>
                <option value="ADOLESCENT_GIRL">Adolescent Girl</option>
                <option value="GENERAL">General Family Member</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Recipient Name
              </label>
              <input
                type="text"
                value={formData.recipientName}
                onChange={e => setFormData({ ...formData, recipientName: e.target.value })}
                placeholder="e.g. Priya Deshmukh"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Family ID
              </label>
              <input
                type="text"
                value={formData.familyId}
                onChange={e => setFormData({ ...formData, familyId: e.target.value })}
                placeholder="FAM-MH-0101"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono uppercase"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Distribution Purpose & Remarks
            </label>
            <input
              type="text"
              value={formData.remarks}
              onChange={e => setFormData({ ...formData, remarks: e.target.value })}
              placeholder="e.g. Monthly IFA quota issued at ANC visit"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
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
              disabled={loading || currentMed?.status === 'EXPIRED'}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-200 disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Dispense & Deduct Stock'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
