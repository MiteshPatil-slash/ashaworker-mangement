import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../services/api';
import { useLanguage } from '../../../context/LanguageContext';
import {
  Plus,
  Clock,
  Search,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';

export default function VisitsListPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [visits, setVisits] = useState([]);
  const [beneficiaryLookup, setBeneficiaryLookup] = useState({}); // name -> {id, type}
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const [filterType, setFilterType] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      setErrorMsg('');

      const [visitsRes, pregnanciesRes, childrenRes] = await Promise.all([
        api.getVisits(),
        api.getPregnancies(),
        api.getChildren()
      ]);

      const lookup = {};
      (pregnanciesRes.pregnancies || []).forEach(p => {
        lookup[p.womanName] = { id: p._id, type: 'pregnancy' };
      });
      (childrenRes.children || []).forEach(c => {
        lookup[c.childName] = { id: c.childId || c._id, type: 'child' };
      });
      setBeneficiaryLookup(lookup);

      setVisits(visitsRes.visits || []);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to load visits from the server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];

  const filteredVisits = visits.filter(v => {
    if (filterType === 'Today' && v.scheduledDate !== todayStr) return false;
    if (filterType === 'Pending' && v.status !== 'PENDING') return false;
    if (filterType === 'Completed' && v.status !== 'COMPLETED') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        (v.beneficiaryName || '').toLowerCase().includes(q) ||
        (v.visitType || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'MISSED':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'PENDING':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'COMPLETED':
      default:
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    }
  };

  const goToBeneficiary = (v) => {
    const match = beneficiaryLookup[v.beneficiaryName];
    if (match) {
      navigate(`/beneficiaries/${match.id}?type=${match.type}&tab=visits`);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {t('visitList.title', 'Field Home Visits')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            {t('visitList.subtitle', 'Log and manage routine check-ups, maternal visits, vaccinations, and health interventions')}
          </p>
        </div>

        <button
          onClick={() => navigate('/visits/record')}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{t('visitList.recordNew', 'Record New Visit')}</span>
        </button>
      </div>

      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold px-4 py-3 rounded-xl">
          {errorMsg}
        </div>
      )}

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('visitList.search', 'Search by beneficiary or visit type...')}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto">
            {[
              ['All', t('visitList.all', 'All')],
              ['Today', t('visitList.today', 'Today')],
              ['Pending', t('visitList.pending', 'Pending')],
              ['Completed', t('visitList.completed', 'Completed')]
            ].map(([ft, label]) => (
              <button
                key={ft}
                onClick={() => setFilterType(ft)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  filterType === ft
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-10 text-center text-xs text-slate-400 font-semibold">{t('visitList.loading', 'Loading visits...')}</div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">{t('visitList.dateTime', 'Visit Date & Time')}</th>
                  <th className="py-3.5 px-4">{t('visitList.beneficiary', 'Beneficiary')}</th>
                  <th className="py-3.5 px-4">{t('visitList.type', 'Visit Type')}</th>
                  <th className="py-3.5 px-4">{t('visitList.healthChecks', 'Health Checks')}</th>
                  <th className="py-3.5 px-4">{t('visitList.status', 'Status')}</th>
                  <th className="py-3.5 px-4 text-right">{t('visitList.action', 'Action')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredVisits.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-slate-400 text-xs">
                      {t('visitList.empty', 'No visits found.')}
                    </td>
                  </tr>
                ) : (
                  filteredVisits.map((v) => (
                    <tr key={v._id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{v.scheduledDate}</div>
                        <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          {v.scheduledTime}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div
                          onClick={() => goToBeneficiary(v)}
                          className={`font-bold text-slate-900 ${beneficiaryLookup[v.beneficiaryName] ? 'hover:text-blue-600 cursor-pointer' : ''}`}
                        >
                          {v.beneficiaryName}
                        </div>
                        <div className="text-[10px] text-slate-500">{v.beneficiaryType}</div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-700">{v.visitType}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-600 text-[11px]">
                        {v.vitals?.bloodPressure ? `${t('visitList.bp', 'BP')}: ${v.vitals.bloodPressure}` : t('visitList.noVitals', 'No vitals yet')}
                        {v.vitals?.weightKg ? ` • Wt: ${v.vitals.weightKg}kg` : ''}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(v.status)}`}>
                          {v.status === 'COMPLETED' ? (
                            <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" />{t('visitList.completed', 'Completed')}</span>
                          ) : v.status === 'MISSED' ? (
                            <span className="flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{t('visitList.missed', 'Missed')}</span>
                          ) : t('visitList.pending', 'Pending')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => goToBeneficiary(v)}
                          disabled={!beneficiaryLookup[v.beneficiaryName]}
                          className="px-2.5 py-1 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          {t('common.details', 'Details')} &gt;
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}