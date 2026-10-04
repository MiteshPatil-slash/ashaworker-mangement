import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  AlertTriangle,
  Heart,
  Calendar,
  Phone,
  Building,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';

export default function HighRiskManagement() {
  const { beneficiaries, visits, referrals } = useData();
  const { t } = useLanguage();
  const navigate = useNavigate();

  // High risk or attention cases
  const highRiskCases = beneficiaries.filter(b => b.status === 'High Risk' || b.status === 'Attention');

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
              {t('supervisor.clinicalAlert', 'Clinical Protocol Alert')}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
            {t('supervisor.highRiskManagement', 'High-Risk Case Management')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            {t('supervisor.highRiskSubtitle', 'Intensive surveillance of complicated maternal pregnancies, severe anemia, and chronic geriatric cases')}
          </p>
        </div>

        <div className="bg-rose-50 border border-rose-200 px-4 py-2 rounded-2xl text-xs font-bold text-rose-900 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-600" />
          <span>{highRiskCases.length} {t('supervisor.activeHighRisk', 'Active High-Risk Cases Under Monitoring')}</span>
        </div>
      </div>

      {/* Cases Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px]">
              <tr>
                <th className="py-3.5 px-4">{t('referrals.beneficiary', 'Beneficiary')}</th>
                <th className="py-3.5 px-4">{t('referrals.worker', 'ASHA Worker')}</th>
                <th className="py-3.5 px-4">{t('supervisor.identifiedIssue', 'Identified Issue')}</th>
                <th className="py-3.5 px-4">{t('supervisor.riskLevel', 'Risk Level')}</th>
                <th className="py-3.5 px-4">{t('supervisor.lastVisit', 'Last Visit')}</th>
                <th className="py-3.5 px-4">{t('supervisor.followUpDate', 'Follow-up Date')}</th>
                <th className="py-3.5 px-4">{t('supervisor.referralStatus', 'Referral Status')}</th>
                <th className="py-3.5 px-4 text-right">{t('referrals.action', 'Action')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {highRiskCases.map((ben) => {
                // Find matching latest visit
                const v = visits.find(vis => vis.beneficiaryId === ben.id);
                // Find matching referral
                const ref = referrals.find(r => r.beneficiaryId === ben.id);

                return (
                  <tr key={ben.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-4 font-bold text-slate-900">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={ben.photoUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'}
                          alt={ben.name}
                          className="w-8 h-8 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <div>{ben.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">ID: {ben.id} • {ben.village}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-slate-700">{ben.assignedWorker || 'Sunita Patil'}</td>
                    <td className="py-4 px-4 font-bold text-rose-700 max-w-[200px]">
                      {v?.hasIssue ? v.issue?.category : (ben.pregnancy?.riskObservations || 'Hypertension / Anemia risk')}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        ben.status === 'High Risk' ? 'bg-rose-100 text-rose-800 border-rose-200' : 'bg-amber-100 text-amber-800 border-amber-200'
                      }`}>
                        {ben.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-slate-600 font-mono text-[11px]">
                      {v?.visitDate || ben.pregnancy?.lastVisit || '10 Sep 2026'}
                    </td>
                    <td className="py-4 px-4 text-blue-700 font-bold font-mono text-[11px]">
                      {v?.followUp?.date || ben.pregnancy?.nextVisit || '24 Sep 2026'}
                    </td>
                    <td className="py-4 px-4">
                      {ref ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                          {ref.status} ({ref.healthCentre})
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">{t('supervisor.noReferral', 'No active referral')}</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => navigate(`/beneficiaries/${ben.id}`)}
                        className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-bold text-xs transition-colors"
                      >
                        {t('supervisor.inspectProfile', 'Inspect Profile')} &gt;
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
