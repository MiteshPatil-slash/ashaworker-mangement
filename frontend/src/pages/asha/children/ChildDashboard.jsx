import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../../services/api';
import { useLanguage } from '../../../context/LanguageContext';
import RegisterBirthModal from '../../../components/forms/RegisterBirthModal';
import {
  Baby,
  Search,
  Plus,
  Calendar,
  ShieldCheck,
  ChevronRight,
  Filter,
  CheckCircle2,
  AlertCircle,
  Activity
} from 'lucide-react';

export default function ChildDashboard() {
  const { t } = useLanguage();
  const [children, setChildren] = useState([]);
  const [pregnancies, setPregnancies] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchChildren = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;

      const [cRes, pRes] = await Promise.all([
        api.getChildren(params),
        api.getPregnancies()
      ]);

      if (cRes.success) setChildren(cRes.children || []);
      if (pRes.success) setPregnancies(pRes.pregnancies || []);
    } catch (err) {
      console.error('Failed to load children:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChildren();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchChildren();
  };

  const totalOverdueVaccines = children.reduce((sum, c) => sum + (c.vaccineStats?.overdue || 0), 0);
  const totalDueVaccines = children.reduce((sum, c) => sum + (c.vaccineStats?.due || 0), 0);

  return (
    <div className="space-y-6 pb-20 lg:pb-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-blue-600/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full">
              Section 2
            </span>
            <span className="text-blue-100 text-xs">Universal Immunization Programme (UIP)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {t('child.title')}
          </h1>
          <p className="text-blue-100 text-xs sm:text-sm mt-1 max-w-xl">
            {t('child.subtitle')}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="px-5 py-3 rounded-2xl bg-white text-blue-700 font-bold text-xs shadow-lg hover:bg-blue-50 transition-all flex items-center gap-2 self-start md:self-center touch-press"
        >
          <Plus className="w-4 h-4" />
          <span>{t('child.registerBirth')}</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Registered Children</span>
          <span className="text-xl font-extrabold text-slate-900">{children.length}</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-rose-500 block">Vaccines Overdue</span>
          <span className="text-xl font-extrabold text-rose-600">{totalOverdueVaccines} Doses</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-amber-500 block">Vaccines Due Now</span>
          <span className="text-xl font-extrabold text-amber-600">{totalDueVaccines} Doses</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-emerald-600 block">Infants (&lt; 1 Year)</span>
          <span className="text-xl font-extrabold text-emerald-700">
            {children.filter(c => (c.ageMonths || 0) < 12).length}
          </span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200">
        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t('child.searchPlaceholder')}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </form>
      </div>

      {/* Children Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">{t('common.loading')}</div>
      ) : children.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-200">
          <Baby className="w-8 h-8 text-blue-300 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-700">{t('common.noData')}</p>
          <p className="text-xs text-slate-500 mt-1">Register a birth using the button above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {children.map((child) => (
            <Link
              key={child._id || child.id}
              to={`/children/${child._id || child.id}`}
              className="bg-white p-5 rounded-3xl border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {child.childName}
                    </h3>
                    <span className="text-xs text-slate-500">
                      DOB: {child.dateOfBirth} ({child.gender})
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-lg border border-blue-200">
                    {child.childId}
                  </span>
                </div>

                {/* Age & Family info */}
                <div className="bg-blue-50/60 p-3 rounded-2xl border border-blue-100 mt-2 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Calculated Age:</span>
                    <strong className="text-blue-900 font-extrabold">{child.age}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Mother:</span>
                    <strong className="text-slate-900">{child.motherName}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Birth Weight:</span>
                    <strong className="text-slate-900">{child.birthWeightKg || 'N/A'} kg</strong>
                  </div>
                </div>

                {/* Vaccine Status Indicators */}
                <div className="mt-3 flex items-center justify-between text-[11px] pt-2 border-t border-slate-100">
                  <span className="flex items-center gap-1 text-emerald-700 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{child.vaccineStats?.completed || 0} Given</span>
                  </span>

                  {(child.vaccineStats?.overdue || 0) > 0 ? (
                    <span className="text-rose-600 font-extrabold bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                      {child.vaccineStats.overdue} Overdue
                    </span>
                  ) : (child.vaccineStats?.due || 0) > 0 ? (
                    <span className="text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                      {child.vaccineStats.due} Due Now
                    </span>
                  ) : (
                    <span className="text-slate-500">Up to date</span>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600 group-hover:translate-x-1 transition-transform">
                <span>View Immunization & Growth</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Register Birth Modal */}
      <RegisterBirthModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={fetchChildren}
        pregnancies={pregnancies}
      />

    </div>
  );
}
