import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../../services/api';
import { useLanguage } from '../../../context/LanguageContext';
import PriorityBadge from '../../../components/common/PriorityBadge';
import RegisterPregnancyModal from '../../../components/forms/RegisterPregnancyModal';
import {
  Heart,
  Search,
  Plus,
  Calendar,
  Phone,
  AlertTriangle,
  ChevronRight,
  Filter,
  FileText,
  Activity
} from 'lucide-react';

export default function PregnancyDashboard() {
  const { t } = useLanguage();
  const [pregnancies, setPregnancies] = useState([]);
  const [families, setFamilies] = useState([]);
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchPregnancies = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (riskFilter) params.riskLevel = riskFilter;

      const [pRes, fRes] = await Promise.all([
        api.getPregnancies(params),
        api.getFamilies()
      ]);

      if (pRes.success) setPregnancies(pRes.pregnancies || []);
      if (fRes.success) setFamilies(fRes.families || []);
    } catch (err) {
      console.error('Failed to load pregnancies:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPregnancies();
  }, [riskFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchPregnancies();
  };

  const highRiskCount = pregnancies.filter(p => p.riskLevel === 'HIGH_PRIORITY' && p.status === 'ACTIVE').length;
  const activeCount = pregnancies.filter(p => p.status === 'ACTIVE').length;

  return (
    <div className="space-y-6 pb-20 lg:pb-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-rose-600 to-pink-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-rose-600/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full">
              Section 1
            </span>
            <span className="text-rose-100 text-xs">Maternal Health Protocol</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {t('pregnancy.title')}
          </h1>
          <p className="text-rose-100 text-xs sm:text-sm mt-1 max-w-xl">
            {t('pregnancy.subtitle')}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="px-5 py-3 rounded-2xl bg-white text-rose-700 font-bold text-xs shadow-lg hover:bg-rose-50 transition-all flex items-center gap-2 self-start md:self-center touch-press"
        >
          <Plus className="w-4 h-4" />
          <span>{t('pregnancy.registerWoman')}</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Active Pregnancies</span>
          <span className="text-xl font-extrabold text-slate-900">{activeCount}</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-rose-500 block">High Priority (Alert)</span>
          <span className="text-xl font-extrabold text-rose-600">{highRiskCount}</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Trimester 3 (Near EDD)</span>
          <span className="text-xl font-extrabold text-amber-600">
            {pregnancies.filter(p => (p.gestationalWeeks || 0) >= 28 && p.status === 'ACTIVE').length}
          </span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-emerald-600 block">Normal Progression</span>
          <span className="text-xl font-extrabold text-emerald-700">
            {pregnancies.filter(p => p.riskLevel === 'NORMAL' && p.status === 'ACTIVE').length}
          </span>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t('pregnancy.searchPlaceholder')}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 hidden sm:block" />
          <select
            value={riskFilter}
            onChange={e => setRiskFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:outline-none text-slate-700 w-full sm:w-auto font-medium"
          >
            <option value="">All Protocol Levels</option>
            <option value="HIGH_PRIORITY">🔴 High Priority Alert</option>
            <option value="NEEDS_FOLLOW_UP">🟡 Needs Follow-up</option>
            <option value="NORMAL">🟢 Normal Protocol</option>
          </select>
        </div>
      </div>

      {/* Pregnant Women Registry Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">{t('common.loading')}</div>
      ) : pregnancies.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-200">
          <Heart className="w-8 h-8 text-rose-300 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-700">{t('common.noData')}</p>
          <p className="text-xs text-slate-500 mt-1">Register a pregnant woman using the button above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pregnancies.map((p) => (
            <Link
              key={p._id || p.id}
              to={`/pregnancy/${p._id || p.id}`}
              className="bg-white p-5 rounded-3xl border border-slate-200 hover:border-rose-300 hover:shadow-lg transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Top Row: Name & Protocol Flag */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-rose-600 transition-colors">
                      {p.womanName}
                    </h3>
                    <span className="text-xs text-slate-500">
                      Age: {p.age} Yrs | Blood: <strong className="text-slate-700">{p.bloodGroup}</strong>
                    </span>
                  </div>
                  <PriorityBadge level={p.riskLevel} />
                </div>

                {/* Gestation & EDD Card */}
                <div className="bg-rose-50/60 p-3 rounded-2xl border border-rose-100 mt-2 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600">Gestation:</span>
                    <strong className="text-rose-900 font-extrabold">
                      ~{p.gestationalWeeks || 0} Weeks ({p.trimester?.split(' ')[0]} Trimester)
                    </strong>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600">Expected Delivery (EDD):</span>
                    <strong className="text-slate-900 font-bold">{p.expectedDeliveryDate}</strong>
                  </div>
                </div>

                {/* High risk reasons if flagged */}
                {p.riskReasons && p.riskReasons.length > 0 && p.riskLevel !== 'NORMAL' && (
                  <div className="mt-2 text-[11px] text-rose-700 bg-rose-50/80 p-2 rounded-xl border border-rose-200">
                    <span className="font-bold block">Protocol Note:</span>
                    <span>{p.riskReasons.join(', ')}</span>
                  </div>
                )}

                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Family ID: <strong className="text-slate-700">{p.familyId}</strong></span>
                  <span>ANC Visits: <strong className="text-slate-700">{p.ancVisits?.length || 0}/4</strong></span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-rose-600 group-hover:translate-x-1 transition-transform">
                <span>View Timeline & Records</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Modal */}
      <RegisterPregnancyModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={fetchPregnancies}
        families={families}
      />

    </div>
  );
}
