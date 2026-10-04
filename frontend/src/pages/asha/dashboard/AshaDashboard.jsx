import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useData } from '../../../context/DataContext';
import { useLanguage } from '../../../context/LanguageContext';
import {
  Calendar,
  Users,
  Baby,
  Heart,
  AlertTriangle,
  UserPlus,
  ClipboardCheck,
  BarChart2,
  Clock,
  ChevronRight,
  ShieldAlert,
  CheckCircle2,
  Activity
} from 'lucide-react';

export default function AshaDashboard({ onOpenAddBeneficiary, onOpenRecordVisit }) {
  const { user } = useAuth();
  const { beneficiaries, visits, stats, alerts } = useData();
  const { t } = useLanguage();
  const navigate = useNavigate();

  // Get Today's Visits
  const todaysVisits = visits.slice(0, 4);

  // Status badge styling
  const getStatusBadge = (status) => {
    switch (status) {
      case 'High Risk':
        return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'Attention':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Normal':
      default:
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Welcome & Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {t('dashboard.welcome', 'Namaste')}, {user?.name || 'Sunita Patil'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            Community Health Worker • Rampur Village • Today is Sunday, 20 September 2026
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => navigate('/beneficiaries?add=true')}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm shadow-blue-500/20 transition-all cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>{t('dashboard.addBeneficiary', 'Add Beneficiary')}</span>
          </button>
          <button
            onClick={() => navigate('/visits/record')}
            className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <ClipboardCheck className="w-3.5 h-3.5" />
            <span>{t('dashboard.recordVisit', 'Record Visit')}</span>
          </button>
        </div>
      </div>

      {/* 5 Top Stat Cards strictly matching reference image Screen 3 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Total Visits */}
        <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-900">{t('dashboard.totalVisits', 'Total Visits')}</span>
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-blue-900">{stats.totalVisits || 24}</div>
            <div className="text-[11px] text-blue-600 font-semibold mt-0.5">+4 scheduled today</div>
          </div>
        </div>

        {/* Pregnant Women */}
        <div className="bg-pink-50/70 border border-pink-200 rounded-2xl p-4 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-pink-900">{t('dashboard.pregnantWomen', 'Pregnant Women')}</span>
            <div className="w-8 h-8 rounded-lg bg-pink-100 text-pink-600 flex items-center justify-center">
              <Heart className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-pink-900">{stats.pregnantWomen || 12}</div>
            <div className="text-[11px] text-pink-600 font-semibold mt-0.5">3 in 3rd trimester</div>
          </div>
        </div>

        {/* Children */}
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-900">{t('dashboard.children', 'Children')}</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <Baby className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-emerald-900">{stats.children || 18}</div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">1 immunization due</div>
          </div>
        </div>

        {/* Elderly */}
        <div className="bg-purple-50/70 border border-purple-200 rounded-2xl p-4 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-900">{t('dashboard.elderly', 'Elderly')}</span>
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-purple-900">{stats.elderly || 4}</div>
            <div className="text-[11px] text-purple-600 font-semibold mt-0.5">NCD screening active</div>
          </div>
        </div>

        {/* High Risk */}
        <div className="bg-rose-50/70 border border-rose-200 rounded-2xl p-4 flex flex-col justify-between shadow-xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-900">{t('dashboard.highRisk', 'High Risk')}</span>
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-rose-900">{stats.highRisk || 3}</div>
            <div className="text-[11px] text-rose-600 font-semibold mt-0.5">Requires immediate attention</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Today's Visits & Right Column (Quick Actions + Reminders) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Today's Visits Table (matches Screen 3 Left side) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-extrabold text-slate-900">
                  {t('dashboard.todaysVisits', "Today's Visits")}
                </h2>
                <p className="text-xs text-slate-500">Scheduled community health field visits for 20 Sep 2026</p>
              </div>
              <button
                onClick={() => navigate('/visits')}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <span>{t('dashboard.viewAll', 'View All')}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {todaysVisits.map((v) => (
                <div key={v.id} className="py-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/80 px-2 rounded-xl transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-16 text-xs font-mono font-bold text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{v.visitTime}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          onClick={() => navigate(`/beneficiaries/${v.beneficiaryId}`)}
                          className="text-xs sm:text-sm font-bold text-slate-900 hover:text-blue-600 cursor-pointer"
                        >
                          {v.beneficiaryName}
                        </span>
                        <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-medium">
                          {v.visitType}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                        {v.observations}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(v.status)}`}>
                      {v.status}
                    </span>
                    <button
                      onClick={() => navigate(`/visits/record?beneficiaryId=${v.beneficiaryId}&name=${encodeURIComponent(v.beneficiaryName)}`)}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
                    >
                      {t('dashboard.start', 'Start')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Showing {todaysVisits.length} visits for today</span>
            <span className="font-semibold text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {stats.completedVisitsToday || 3} of {stats.totalVisits || 4} Completed
            </span>
          </div>
        </div>

        {/* Right Column: Quick Actions + Upcoming Reminders */}
        <div className="lg:col-span-4 space-y-6">
          {/* Quick Actions Card matching reference image */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <h2 className="text-sm font-extrabold text-slate-900 mb-3">
              {t('dashboard.quickActions', 'Quick Actions')}
            </h2>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => navigate('/beneficiaries?add=true')}
                className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-200 transition-all text-center flex flex-col items-center justify-center gap-1.5 cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <UserPlus className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-800 group-hover:text-blue-700">
                  {t('dashboard.addBeneficiary', 'Add Beneficiary')}
                </span>
              </button>

              <button
                onClick={() => navigate('/visits/record')}
                className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 transition-all text-center flex flex-col items-center justify-center gap-1.5 cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <ClipboardCheck className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-800 group-hover:text-indigo-700">
                  {t('dashboard.recordVisit', 'Record Visit')}
                </span>
              </button>

              <button
                onClick={() => navigate('/reports')}
                className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-purple-50 hover:border-purple-200 transition-all text-center flex flex-col items-center justify-center gap-1.5 cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <BarChart2 className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-800 group-hover:text-purple-700">
                  {t('dashboard.viewReports', 'View Reports')}
                </span>
              </button>
            </div>
          </div>

          {/* Upcoming Reminders Widget matching reference image */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-extrabold text-slate-900">
                {t('dashboard.upcomingReminders', 'Upcoming Reminders')}
              </h2>
              <button
                onClick={() => navigate('/alerts')}
                className="text-xs font-bold text-blue-600 hover:text-blue-700"
              >
                {t('dashboard.viewAll', 'View All')}
              </button>
            </div>

            <div className="space-y-3">
              {[
                { date: '20 Sep', title: 'Child Immunization', patient: 'Anita Shah', type: 'Vaccination' },
                { date: '22 Sep', title: 'ANC Follow-up', patient: 'Sita Patil', type: 'Pregnancy' },
                { date: '23 Sep', title: 'Elderly Check-up', patient: 'Ramesh Patil', type: 'Elderly' }
              ].map((rem, idx) => (
                <div key={idx} className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="w-12 h-11 rounded-lg bg-blue-100 text-blue-800 font-extrabold text-xs flex flex-col items-center justify-center shrink-0">
                    <span className="text-[10px] uppercase font-semibold leading-none">{rem.date.split(' ')[1]}</span>
                    <span className="text-sm leading-none mt-0.5">{rem.date.split(' ')[0]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-slate-800 truncate">{rem.title}</h4>
                    <p className="text-[11px] text-slate-500 truncate">{rem.patient}</p>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {rem.type}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
