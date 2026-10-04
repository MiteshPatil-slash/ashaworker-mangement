import React, { useState } from 'react';
import { useData } from '../../../context/DataContext';
import { useLanguage } from '../../../context/LanguageContext';
import {
  Download,
  Calendar,
  BarChart2,
  PieChart as PieIcon,
  TrendingUp,
  Heart,
  Baby,
  Users,
  Share2,
  CheckCircle2,
  FileSpreadsheet
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

export default function AshaReportsPage() {
  const { stats, beneficiaries, visits, referrals } = useData();
  const { t } = useLanguage();
  const [selectedMonth, setSelectedMonth] = useState('September 2026');
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Village data matching Screen 13
  const villageData = [
    { village: 'Rampur', visits: 62 },
    { village: 'Bhagwan', visits: 32 },
    { village: 'Kalapur', visits: 28 },
    { village: 'Shirpur', visits: 18 }
  ];

  // Category Donut data matching Screen 13
  const categoryData = [
    { name: 'Pregnant Women', value: 32, color: '#EC4899' },
    { name: 'Children', value: 58, color: '#10B981' },
    { name: 'Elderly', value: 29, color: '#8B5CF6' },
    { name: 'Other', value: 29, color: '#64748B' }
  ];

  const handleDownloadReport = () => {
    // Generate simple CSV download
    const csvContent = "data:text/csv;charset=utf-8,"
      + "Metric,Count\n"
      + `Total Visits,${stats.totalVisits || 156}\n`
      + `Pregnant Women,${stats.pregnantWomen || 82}\n`
      + `Children,${stats.children || 96}\n`
      + `Referrals,${stats.activeReferrals || 12}\n`
      + "Rampur Visits,62\n"
      + "Bhagwan Visits,32\n"
      + "Kalapur Visits,28\n"
      + "Shirpur Visits,18\n";

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ASHA_Field_Report_${selectedMonth.replace(' ', '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header matching Screen 13 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {t('reports.title', 'Reports & Analytics (ASHA)')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            {t('reports.subtitle', 'Field performance metrics, maternal-child tracking, and health index analysis')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 shadow-xs"
          >
            <option value="September 2026">{t('reports.thisMonth', 'This Month (Sep 2026)')}</option>
            <option value="August 2026">{t('reports.lastMonth', 'Last Month (Aug 2026)')}</option>
            <option value="Q3 2026">{t('reports.quarter', 'Quarter 3 2026')}</option>
          </select>

          <button
            onClick={handleDownloadReport}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{t('reports.download', 'Download Report')}</span>
          </button>
        </div>
      </div>

      {downloadSuccess && (
        <div className="p-3 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in-50">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{t('reports.exported', 'Report exported successfully to CSV for district submission!')}</span>
        </div>
      )}

      {/* 4 Primary Metric Cards matching Screen 13 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Visits */}
        <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-900">{t('dashboard.totalVisits', 'Visits')}</span>
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-blue-900 mt-2">156</div>
            <p className="text-[11px] text-blue-600 font-semibold mt-1">{t('reports.monthlyTarget', '92% of monthly target')}</p>
        </div>

        {/* Pregnant Women */}
        <div className="bg-pink-50/70 border border-pink-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-pink-900">{t('dashboard.pregnantWomen', 'Pregnant Women')}</span>
            <div className="w-8 h-8 rounded-lg bg-pink-100 text-pink-600 flex items-center justify-center">
              <Heart className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-pink-900 mt-2">82</div>
            <p className="text-[11px] text-pink-600 font-semibold mt-1">{t('reports.ancRegistered', '100% ANC registered')}</p>
        </div>

        {/* Children */}
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-900">{t('dashboard.children', 'Children')}</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <Baby className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-900 mt-2">96</div>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1">{t('reports.immunizationOnTrack', 'Full immunization on track')}</p>
        </div>

        {/* Referrals */}
        <div className="bg-purple-50/70 border border-purple-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-900">{t('nav.referrals', 'Referrals')}</span>
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
              <Share2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-purple-900 mt-2">12</div>
            <p className="text-[11px] text-purple-600 font-semibold mt-1">{t('reports.institutionallyAttended', '10 institutionally attended')}</p>
        </div>
      </div>

      {/* Main Charts Grid matching Screen 13 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Visit Completion Progress + High Risk Cases */}
        <div className="lg:col-span-4 space-y-6">
          {/* Visit Completion Gauge matching Screen 13 */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-900">{t('reports.visitCompletion', 'Visit Completion')}</h3>
              <span className="text-sm font-black text-blue-600">89%</span>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden">
              <div className="bg-blue-600 h-full rounded-full transition-all duration-500" style={{ width: '89%' }} />
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              {t('reports.visitCompletionDescription', '139 out of 156 monthly planned home visits completed across all assigned households.')}
            </p>
          </div>

          {/* High-Risk Cases Metric matching Screen 13 */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-900">{t('nav.highRiskCases', 'High-Risk Cases')}</h3>
              <span className="text-sm font-black text-rose-600">12%</span>
            </div>
            <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden">
              <div className="bg-rose-500 h-full rounded-full transition-all duration-500" style={{ width: '12%' }} />
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              {t('reports.highRiskDescription', '3 high-risk pregnancies and elderly patients under weekly monitoring protocol.')}
            </p>
          </div>
        </div>

        {/* Center: Visits by Village Bar Chart matching Screen 13 */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-extrabold text-slate-900">{t('reports.visitsByVillage', 'Visits by Village')}</h3>
            <span className="text-[11px] text-slate-400 font-medium">{t('reports.homeVisitsLogged', 'Home visits logged')}</span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={villageData}>
                <XAxis dataKey="village" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1E293B', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                />
                <Bar dataKey="visits" fill="#3B82F6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="text-center text-[11px] text-slate-500 pt-2 border-t border-slate-100">
            Rampur leads with 62 completed community visits
          </div>
        </div>

        {/* Right: Beneficiaries by Category Donut Chart matching Screen 13 */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-extrabold text-slate-900">{t('reports.beneficiariesByCategory', 'Beneficiaries by Category')}</h3>
            <span className="text-[11px] font-bold text-slate-800">{t('reports.total', 'Total')}: 148</span>
          </div>

          <div className="h-44 w-full flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={65}
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
              <span className="text-lg font-black text-slate-900">148</span>
              <span className="text-[9px] text-slate-400 font-bold uppercase">{t('reports.members', 'Members')}</span>
            </div>
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-2 text-[10px] font-semibold text-slate-600 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-pink-500" />
              <span>{t('dashboard.pregnantWomen', 'Pregnant Women')} (22%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>{t('dashboard.children', 'Children')} (39%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-500" />
              <span>{t('dashboard.elderly', 'Elderly')} (20%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-500" />
              <span>{t('visit.other', 'Other')} (19%)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
