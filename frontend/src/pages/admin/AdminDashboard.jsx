import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  Users,
  UserCheck,
  Building2,
  TrendingUp,
  ShieldCheck,
  Plus,
  MapPin,
  FileSpreadsheet,
  Activity,
  CalendarCheck,
  CheckCircle2
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export default function AdminDashboard() {
  const { user } = useAuth();
  const { stats, beneficiaries, workers } = useData();
  const { t } = useLanguage();
  const navigate = useNavigate();

  // Beneficiaries by village matching Screen 19
  const villageData = [
    { village: 'Rampur', count: 1420 },
    { village: 'Bhagwan', count: 1150 },
    { village: 'Kalapur', count: 1080 },
    { village: 'Shirpur', count: 870 }
  ];

  // Category Distribution matching Screen 19
  const categoryData = [
    { name: 'Pregnant Women', value: 24, color: '#3B82F6' },
    { name: 'Children', value: 42, color: '#10B981' },
    { name: 'Elderly', value: 18, color: '#F59E0B' },
    { name: 'Other', value: 16, color: '#64748B' }
  ];

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Banner matching Screen 19 */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
              {t('admin.systemAdministration', 'System Administration')}
            </span>
            <span className="text-xs text-slate-400 font-medium">{t('layout.districtHealthAuthority', 'District Health Authority')}</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            {t('admin.dashboardTitle', 'District Administration Console')}
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            {t('admin.dashboardSubtitle', 'System-level access to ASHA workers, supervisors, cluster assignments, and health indices')}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate('/admin/users')}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <UserCheck className="w-4 h-4" />
            <span>{t('admin.manageUsers', 'Manage Users')}</span>
          </button>
        </div>
      </div>

      {/* 4 Metric Cards matching Screen 19 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* ASHA Workers */}
        <div
          onClick={() => navigate('/admin/users')}
          className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs hover:border-blue-300 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600">{t('nav.workers', 'ASHA Workers')}</span>
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">124</div>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">{t('admin.ruralSectors', 'Across 28 rural sectors')}</p>
        </div>

        {/* Supervisors */}
        <div
          onClick={() => navigate('/admin/users')}
          className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs hover:border-indigo-300 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600">{t('roles.supervisor', 'Supervisors')}</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">12</div>
          <p className="text-[11px] text-indigo-600 font-semibold mt-1">{t('admin.supervisorRatio', '1:10 supervisor ratio')}</p>
        </div>

        {/* Beneficiaries */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600">{t('nav.beneficiaries', 'Beneficiaries')}</span>
            <div className="w-8 h-8 rounded-lg bg-pink-100 text-pink-600 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">4,520</div>
          <p className="text-[11px] text-pink-600 font-semibold mt-1">{t('admin.digitalProfiles', 'Digital health profiles')}</p>
        </div>

        {/* Villages */}
        <div
          onClick={() => navigate('/admin/villages')}
          className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs hover:border-purple-300 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600">{t('nav.villages', 'Villages')}</span>
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">28</div>
          <p className="text-[11px] text-purple-600 font-semibold mt-1">{t('admin.coverageAchieved', '100% coverage achieved')}</p>
        </div>
      </div>

      {/* Main Charts Grid matching Screen 19 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Beneficiaries by Village Bar Chart matching Screen 19 */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900">{t('admin.beneficiariesByVillage', 'Beneficiaries by Village')}</h2>
              <p className="text-xs text-slate-500">{t('admin.villageDistribution', 'Demographic distribution across primary village blocks')}</p>
            </div>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
              {t('admin.topClusters', 'Top 4 Clusters')}
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={villageData}>
                <XAxis dataKey="village" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', color: '#fff', fontSize: '11px', border: 'none' }}
                />
                <Bar dataKey="count" fill="#3B82F6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>{t('admin.clusterPopulation', 'Rampur cluster accounts for 31.4% of total registered population')}</span>
            <button
              onClick={() => navigate('/admin/villages')}
              className="text-xs font-bold text-blue-600 hover:underline"
            >
              {t('admin.villageDirectory', 'Village Directory')} &gt;
            </button>
          </div>
        </div>

        {/* Category Distribution Donut Chart matching Screen 19 */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-extrabold text-slate-900">{t('admin.categoryDistribution', 'Category Distribution')}</h2>
              <span className="text-xs font-bold text-slate-700">148 {t('admin.activeSamples', 'Active Samples')}</span>
            </div>
            <p className="text-xs text-slate-500 mb-2">{t('admin.demographicBreakdown', 'Maternal, pediatric, and geriatric breakdown')}</p>

            <div className="h-44 w-full flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={68}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-black text-slate-900">148</span>
                <span className="text-[9px] text-slate-400 font-bold uppercase">{t('reports.total', 'Total')}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-600 pt-3 border-t border-slate-100">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span>{t('dashboard.pregnantWomen', 'Pregnant Women')} (24%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>{t('dashboard.children', 'Children')} (42%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>{t('dashboard.elderly', 'Elderly')} (18%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
              <span>{t('visit.other', 'Other')} (16%)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
