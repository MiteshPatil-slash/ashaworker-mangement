import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useData } from '../../../context/DataContext';
import { useLanguage } from '../../../context/LanguageContext';
import {
  Share2,
  Plus,
  Clock,
  CheckCircle2,
  Building,
  AlertCircle,
  X
} from 'lucide-react';

export default function ReferralsPage() {
  const [searchParams] = useSearchParams();
  const { beneficiaries, referrals, createReferral, updateReferralStatus } = useData();
  const { t } = useLanguage();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    beneficiaryId: searchParams.get('beneficiaryId') || beneficiaries[0]?.id || '',
    reason: 'High Blood Pressure',
    healthCentre: 'PHC Rampur',
    priority: 'Urgent',
    notes: 'Requires doctor assessment and clinical diagnostic checks.'
  });

  useEffect(() => {
    if (searchParams.get('create') === 'true') {
      setIsModalOpen(true);
    }
  }, [searchParams]);

  const handleSubmit = (e) => {
    e.preventDefault();
    createReferral(formData);
    setIsModalOpen(false);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Referred':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Pending':
      default:
        return 'bg-amber-100 text-amber-800 border-amber-200';
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {t('referrals.title', 'Referral System')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            {t('referrals.subtitle', 'Facilitate and track clinical escalations to Primary Health Centres and District Hospitals')}
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{t('referrals.create', 'Create Referral')}</span>
        </button>
      </div>

      {/* Referrals List Table matching Screen 11 */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-slate-900">{t('referrals.active', 'Active Referrals')} ({referrals.length})</h2>
          <span className="text-xs text-slate-400">{t('referrals.helpline', 'Integrated with 108/102 Health Helpline')}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px]">
              <tr>
                <th className="py-3 px-4">{t('referrals.beneficiary', 'Beneficiary')}</th>
                <th className="py-3 px-4">{t('referrals.worker', 'ASHA Worker')}</th>
                <th className="py-3 px-4">{t('referrals.reason', 'Reason')}</th>
                <th className="py-3 px-4">{t('referrals.healthCentre', 'Health Centre')}</th>
                <th className="py-3 px-4">{t('referrals.priority', 'Priority')}</th>
                <th className="py-3 px-4">{t('referrals.date', 'Date')}</th>
                <th className="py-3 px-4">{t('visitList.status', 'Status')}</th>
                <th className="py-3 px-4 text-right">{t('referrals.updateStatus', 'Update Status')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {referrals.map((ref) => (
                <tr key={ref.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{ref.beneficiaryName}</td>
                  <td className="py-3.5 px-4 text-slate-600">{ref.workerName || 'Sunita Patil'}</td>
                  <td className="py-3.5 px-4 text-slate-800">{ref.reason}</td>
                  <td className="py-3.5 px-4 font-semibold text-blue-700 flex items-center gap-1 mt-1">
                    <Building className="w-3.5 h-3.5" />
                    <span>{ref.healthCentre}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      ref.priority === 'Urgent' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {ref.priority}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">{ref.date}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${getStatusBadge(ref.status)}`}>
                      {ref.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <select
                      value={ref.status}
                      onChange={(e) => updateReferralStatus(ref.id, e.target.value)}
                      className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 cursor-pointer"
                    >
                      <option value="Pending">{t('referrals.pending', 'Pending')}</option>
                      <option value="Referred">{t('referrals.referred', 'Referred')}</option>
                      <option value="In Progress">{t('referrals.inProgress', 'In Progress')}</option>
                      <option value="Completed">{t('visitList.completed', 'Completed')}</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Referral Modal matching Screen 11 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="max-w-lg w-full bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h2 className="text-base font-black text-slate-900">{t('referrals.create', 'Create Referral')}</h2>
                <p className="text-xs text-slate-500">{t('referrals.modalSubtitle', 'Initiate institutional escalation for patient')}</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{t('referrals.beneficiary', 'Beneficiary')} *</label>
                <select
                  value={formData.beneficiaryId}
                  onChange={(e) => setFormData({ ...formData, beneficiaryId: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800"
                >
                  {beneficiaries.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.category} - {b.village})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">{t('referrals.reasonFor', 'Reason for Referral')} *</label>
                <div className="space-y-1.5">
                  {[
                    'High Blood Pressure',
                    'Fever & Infection',
                    'Bleeding / Danger Signs',
                    'Severe Anemia (<9 g/dL)',
                    'Other'
                  ].map((r) => (
                    <label key={r} className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                      <input
                        type="radio"
                        name="reason"
                        checked={formData.reason === r}
                        onChange={() => setFormData({ ...formData, reason: r })}
                        className="text-blue-600"
                      />
                      <span>{r}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{t('referrals.referTo', 'Refer To (Health Centre)')} *</label>
                <select
                  value={formData.healthCentre}
                  onChange={(e) => setFormData({ ...formData, healthCentre: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800"
                >
                  <option value="PHC Rampur">PHC Rampur (Primary Health Centre)</option>
                  <option value="CHC Kalapur">CHC Kalapur (Community Health Centre)</option>
                  <option value="Sub-District Hospital Shirpur">Sub-District Hospital Shirpur</option>
                  <option value="District Civil Hospital">District Civil Hospital</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">{t('referrals.priority', 'Priority')} *</label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                    <input
                      type="radio"
                      name="priority"
                      checked={formData.priority === 'Urgent'}
                      onChange={() => setFormData({ ...formData, priority: 'Urgent' })}
                      className="text-rose-600"
                    />
                    <span className="text-rose-700">{t('common.urgent', 'Urgent')}</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                    <input
                      type="radio"
                      name="priority"
                      checked={formData.priority === 'Normal'}
                      onChange={() => setFormData({ ...formData, priority: 'Normal' })}
                      className="text-blue-600"
                    />
                    <span>{t('common.normal', 'Normal')}</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{t('referrals.notes', 'Notes')}</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder={t('referrals.notesPlaceholder', 'Clinical observation, symptoms, transport instructions...')}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20"
                >
                  Send Referral
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
