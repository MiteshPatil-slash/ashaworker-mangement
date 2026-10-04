import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../../../services/api';
import { useLanguage } from '../../../context/LanguageContext';
import AddBeneficiaryModal from './AddBeneficiaryModal';
import {
  Search,
  UserPlus,
  ChevronRight,
  AlertTriangle,
  Heart,
  Baby,
  Users,
  ChevronLeft,
  Trash2
} from 'lucide-react';

function mapPregnancyStatus(riskLevel) {
  if (riskLevel === 'HIGH_PRIORITY') return 'High Risk';
  if (riskLevel === 'NEEDS_FOLLOW_UP') return 'Attention';
  return 'Normal';
}

function mapChildStatus(child) {
  if (child.vaccineStats?.overdue > 0) return 'Attention';
  return 'Normal';
}

export default function BeneficiaryListPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const [beneficiaries, setBeneficiaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchBeneficiaries = async () => {
    try {
      setLoading(true);
      setErrorMsg('');

      const [familiesRes, pregnanciesRes, childrenRes] = await Promise.all([
        api.getFamilies(),
        api.getPregnancies(),
        api.getChildren()
      ]);

      const villageByFamily = {};
      (familiesRes.families || []).forEach(f => {
        villageByFamily[f.familyId] = f.village;
      });

      const pregnant = (pregnanciesRes.pregnancies || []).map(p => ({
        id: p._id,
        type: 'pregnancy',
        name: p.womanName,
        age: p.age,
        mobile: p.mobile,
        category: 'Pregnant Woman',
        village: villageByFamily[p.familyId] || '-',
        status: mapPregnancyStatus(p.riskLevel)
      }));

      const children = (childrenRes.children || []).map(c => ({
        id: c.childId || c._id,
        type: 'child',
        name: c.childName,
        age: c.age,
        mobile: c.mobile || '-',
        category: 'Child',
        village: villageByFamily[c.familyId] || '-',
        status: mapChildStatus(c)
      }));

      setBeneficiaries([...pregnant, ...children]);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to load beneficiaries from the server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBeneficiaries();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('add') === 'true') {
      setIsAddModalOpen(true);
    }
  }, [location.search]);

  const counts = {
    All: beneficiaries.length,
    Pregnant: beneficiaries.filter(b => b.category === 'Pregnant Woman').length,
    Children: beneficiaries.filter(b => b.category === 'Child').length,
    Elderly: 0,
    HighRisk: beneficiaries.filter(b => b.status === 'High Risk' || b.status === 'Attention').length
  };

  const tabs = [
    { key: 'All', label: `${t('beneficiaries.all', 'All')} (${counts.All})` },
    { key: 'Pregnant', label: `${t('beneficiaries.pregnant', 'Pregnant')} (${counts.Pregnant})` },
    { key: 'Children', label: `${t('beneficiaries.children', 'Children')} (${counts.Children})` },
    { key: 'Elderly', label: `${t('beneficiaries.elderly', 'Elderly')} (${counts.Elderly})` },
    { key: 'High Risk', label: `${t('beneficiaries.highRisk', 'High Risk')} (${counts.HighRisk})` }
  ];

  const filteredBeneficiaries = beneficiaries.filter(b => {
    if (activeTab === 'Pregnant' && b.category !== 'Pregnant Woman') return false;
    if (activeTab === 'Children' && b.category !== 'Child') return false;
    if (activeTab === 'Elderly') return false;
    if (activeTab === 'High Risk' && b.status !== 'High Risk' && b.status !== 'Attention') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        (b.name || '').toLowerCase().includes(q) ||
        (b.id || '').toLowerCase().includes(q) ||
        (b.mobile || '').includes(q) ||
        (b.village || '').toLowerCase().includes(q)
      );
    }

    return true;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'High Risk':
        return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'Attention':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Normal':
      default:
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Pregnant Woman':
        return <Heart className="w-3.5 h-3.5 text-pink-600" />;
      case 'Child':
        return <Baby className="w-3.5 h-3.5 text-emerald-600" />;
      default:
        return <Users className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  const goToProfile = (b) => navigate(`/beneficiaries/${b.id}?type=${b.type}`);

  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = async (e, b) => {
    e.stopPropagation();
    const label = b.category === 'Pregnant Woman' ? 'pregnancy record' : 'child record';
    if (!window.confirm(`Permanently delete ${b.name}'s ${label}? This removes it (and related visits, tasks and referrals) from the database. This cannot be undone.`)) {
      return;
    }
    try {
      setDeletingId(b.id);
      if (b.type === 'pregnancy') {
        await api.deletePregnancy(b.id);
      } else {
        await api.deleteChild(b.id);
      }
      setBeneficiaries(prev => prev.filter(x => !(x.id === b.id && x.type === b.type)));
    } catch (err) {
      alert(err.message || 'Failed to delete record');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {t('beneficiaries.title', 'Beneficiaries')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Registered village households, maternal, child, and elderly members
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>{t('beneficiaries.addBtn', '+ Add Beneficiary')}</span>
        </button>
      </div>

      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold px-4 py-3 rounded-xl flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" /> {errorMsg}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('beneficiaries.searchPlaceholder', 'Search by name, mobile or ID...')}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === tab.key
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-10 text-center text-xs text-slate-400 font-semibold">Loading beneficiaries...</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">{t('beneficiaries.name', 'Name')}</th>
                  <th className="py-3 px-4">{t('beneficiaries.age', 'Age')}</th>
                  <th className="py-3 px-4">{t('beneficiaries.category', 'Category')}</th>
                  <th className="py-3 px-4">{t('beneficiaries.village', 'Village')}</th>
                  <th className="py-3 px-4">{t('beneficiaries.status', 'Status')}</th>
                  <th className="py-3 px-4 text-right">{t('beneficiaries.action', 'Action')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {filteredBeneficiaries.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-slate-400 text-xs">
                      No beneficiaries found matching your filter or search query.
                    </td>
                  </tr>
                ) : (
                  filteredBeneficiaries.map((b) => (
                    <tr
                      key={`${b.type}-${b.id}`}
                      onClick={() => goToProfile(b)}
                      className="hover:bg-blue-50/40 transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80"
                            alt={b.name}
                            className="w-8 h-8 rounded-full object-cover border border-slate-200"
                          />
                          <div>
                            <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                              {b.name}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              ID: {b.id} • {b.mobile}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">{b.age}</td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                          {getCategoryIcon(b.category)}
                          <span>{b.category}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{b.village}</td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold border ${getStatusBadge(b.status)}`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              goToProfile(b);
                            }}
                            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                          >
                            <span>{t('beneficiaries.view', 'View >')}</span>
                          </button>
                          <button
                            onClick={(e) => handleDelete(e, b)}
                            disabled={deletingId === b.id}
                            title="Delete permanently"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-40"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        <div className="p-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div>
            Showing 1 to {filteredBeneficiaries.length} of {beneficiaries.length} entries
          </div>
          <div className="flex items-center gap-1">
            <button className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40">
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            {[1, 2, 3, 4, 5].map(num => (
              <button
                key={num}
                onClick={() => setCurrentPage(num)}
                className={`w-7 h-7 rounded-lg font-bold text-xs flex items-center justify-center transition-colors ${
                  currentPage === num
                    ? 'bg-blue-600 text-white'
                    : 'hover:bg-slate-100 text-slate-700'
                }`}
              >
                {num}
              </button>
            ))}
            <button className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100">
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      <AddBeneficiaryModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          fetchBeneficiaries();
          setIsAddModalOpen(false);
        }}
      />
    </div>
  );
}