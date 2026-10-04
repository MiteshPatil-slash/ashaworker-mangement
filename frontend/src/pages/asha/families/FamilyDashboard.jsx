import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../../services/api';
import { useLanguage } from '../../../context/LanguageContext';
import AddFamilyModal from '../../../components/forms/AddFamilyModal';
import {
  Users,
  Search,
  Plus,
  Home,
  Phone,
  MapPin,
  ChevronRight,
  Heart,
  Baby,
  CalendarCheck2
} from 'lucide-react';

export default function FamilyDashboard() {
  const { t } = useLanguage();
  const [families, setFamilies] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchFamilies = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;

      const res = await api.getFamilies(params);
      if (res.success) {
        setFamilies(res.families || []);
      }
    } catch (err) {
      console.error('Failed to load families:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFamilies();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchFamilies();
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-emerald-600/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full">
              Household Registry
            </span>
            <span className="text-emerald-100 text-xs">Family ID & Multi-generational Tracking</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {t('nav.families')}
          </h1>
          <p className="text-emerald-100 text-xs sm:text-sm mt-1 max-w-xl">
            Unified family folders connecting pregnancies, children, vaccinations, and home visits.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="px-5 py-3 rounded-2xl bg-white text-emerald-800 font-bold text-xs shadow-lg hover:bg-emerald-50 transition-all flex items-center gap-2 self-start md:self-center touch-press"
        >
          <Plus className="w-4 h-4" />
          <span>{t('dashboard.addFamily')}</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200">
        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by Head of Family, Family ID, address, member name..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </form>
      </div>

      {/* Families Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">{t('common.loading')}</div>
      ) : families.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-200">
          <Users className="w-8 h-8 text-emerald-300 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-700">{t('common.noData')}</p>
          <p className="text-xs text-slate-500 mt-1">Add a new family using the button above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {families.map((fam) => (
            <Link
              key={fam._id || fam.id}
              to={`/families/${fam._id || fam.id}`}
              className="bg-white p-5 rounded-3xl border border-slate-200 hover:border-emerald-300 hover:shadow-lg transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                      {fam.headOfFamily}
                    </h3>
                    <span className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{fam.village}</span>
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-lg border border-emerald-200">
                    {fam.familyId}
                  </span>
                </div>

                <p className="text-xs text-slate-600 line-clamp-1 mt-1">
                  {fam.address}
                </p>

                {/* Family Metrics Badges */}
                <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-100 text-center text-xs">
                  <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Members</span>
                    <strong className="text-slate-800">{fam.stats?.memberCount || fam.members?.length || 0}</strong>
                  </div>
                  <div className="bg-rose-50/70 p-2 rounded-xl border border-rose-100">
                    <span className="text-[10px] font-bold text-rose-500 block uppercase">Pregnant</span>
                    <strong className="text-rose-700">{fam.stats?.activePregnancies || 0}</strong>
                  </div>
                  <div className="bg-blue-50/70 p-2 rounded-xl border border-blue-100">
                    <span className="text-[10px] font-bold text-blue-500 block uppercase">Children</span>
                    <strong className="text-blue-700">{fam.stats?.childrenCount || 0}</strong>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-600 group-hover:translate-x-1 transition-transform">
                <span>Open Family Timeline</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Add Family Modal */}
      <AddFamilyModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={fetchFamilies}
      />

    </div>
  );
}
