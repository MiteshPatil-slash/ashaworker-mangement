import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  Users,
  Calendar,
  AlertTriangle,
  FileCheck,
  CheckCircle2,
  Clock,
  ChevronRight,
  TrendingUp,
  UserCheck,
  Building2,
  ArrowUpRight
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export default function SupervisorDashboard() {
  const { user } = useAuth();
  const { stats, workers, documents, tasks } = useData();
  const { t } = useLanguage();
  const navigate = useNavigate();

  // Visits Trend data matching Screen 16
  const trendData = [
    { date: '14 Sep', visits: 18 },
    { date: '15 Sep', visits: 24 },
    { date: '16 Sep', visits: 22 },
    { date: '17 Sep', visits: 31 },
    { date: '18 Sep', visits: 28 },
    { date: '19 Sep', visits: 35 },
    { date: '20 Sep', visits: 28 }
  ];

  // Task Status data matching Screen 16
  const taskDonutData = [
    { name: 'Completed', value: 64, color: '#10B981' },
    { name: 'Pending', value: 24, color: '#F59E0B' },
    { name: 'Overdue', value: 12, color: '#EF4444' }
  ];

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Banner matching Screen 16 */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
              {t('roles.supervisor', 'Sector Supervisor')}
            </span>
            <span className="text-xs text-slate-400 font-medium">{t('layout.rampurHealthBlock', 'Rampur Health Block')}</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            {t('supervisor.greeting', 'Good Morning, Supervisor!')} ({user?.name || 'Rajesh More'})
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            {t('supervisor.dashboardSubtitle', 'Supervisory monitoring for 4 villages, 12 frontline workers, and active clinical reviews')}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate('/supervisor/documents')}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <FileCheck className="w-4 h-4" />
            <span>{t('supervisor.reviewDocuments', 'Review Documents')} ({stats.pendingDocuments || 5})</span>
          </button>
        </div>
      </div>

      {/* 4 Metric Cards matching Screen 16 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total ASHA Workers */}
        <div
          onClick={() => navigate('/supervisor/workers')}
          className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs hover:border-blue-300 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600">{t('nav.workers', 'ASHA Workers')}</span>
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">12</div>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">{t('supervisor.allWorkersActive', 'All 12 active in field')}</p>
        </div>

        {/* Total Visits */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600">{t('dashboard.totalVisits', 'Total Visits')}</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">186</div>
          <p className="text-[11px] text-blue-600 font-semibold mt-1">{t('supervisor.villagesThisMonth', 'Across 4 villages this month')}</p>
        </div>

        {/* High-Risk Cases */}
        <div
          onClick={() => navigate('/supervisor/high-risk')}
          className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs hover:border-rose-300 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600">{t('nav.highRiskCases', 'High Risk Cases')}</span>
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-600 mt-2">24</div>
          <p className="text-[11px] text-rose-600 font-semibold mt-1">{t('supervisor.urgentFollowUps', 'Urgent follow-ups flagged')}</p>
        </div>

        {/* Pending Documents */}
        <div
          onClick={() => navigate('/supervisor/documents')}
          className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs hover:border-blue-400 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600">{t('supervisor.pendingDocuments', 'Pending Documents')}</span>
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <FileCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-blue-700 mt-2">{stats.pendingDocuments || 18}</div>
          <p className="text-[11px] text-amber-600 font-semibold mt-1">{t('supervisor.reviewAction', 'Requires review & action')}</p>
        </div>
      </div>

      {/* Main Grid: Visits Trend (Line Chart) & Task Status (Donut Chart) matching Screen 16 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Visits Trend (Last 7 days) matching Screen 16 */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900">{t('supervisor.visitsTrend', 'Visits Trend (Last 7 days)')}</h2>
              <p className="text-xs text-slate-500">{t('supervisor.dailyVisits', 'Daily home visits completed across all worker sectors')}</p>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              {t('supervisor.vsLastWeek', '+14% vs last week')}
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="visitGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', color: '#fff', fontSize: '11px', border: 'none' }}
                />
                <Area type="monotone" dataKey="visits" stroke="#2563EB" strokeWidth={3} fillOpacity={1} fill="url(#visitGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>{t('supervisor.peakVisits', 'Peak visit volume on 19 September (35 visits)')}</span>
            <button
              onClick={() => navigate('/supervisor/reports')}
              className="font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
            >
              <span>{t('supervisor.fullAnalytics', 'Full Analytics')}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Task Status Donut matching Screen 16 */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-extrabold text-slate-900">{t('supervisor.taskStatus', 'Task Status')}</h2>
              <span className="text-xs text-blue-600 font-bold hover:underline cursor-pointer" onClick={() => navigate('/supervisor/tasks')}>
                {t('supervisor.manageTasks', 'Manage Tasks')}
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-2">{t('supervisor.tasksProgress', 'Assigned field tasks progress')}</p>

            {/* Donut Chart */}
            <div className="h-44 w-full flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={taskDonutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={68}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {taskDonutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-black text-slate-900">64%</span>
                <span className="text-[9px] text-slate-400 font-bold uppercase">{t('common.completed', 'Done')}</span>
              </div>
            </div>
          </div>

          {/* Legend matching Screen 16 */}
          <div className="space-y-2 pt-2 border-t border-slate-100 text-xs font-semibold">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-700">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>{t('supervisor.completedTasks', 'Completed Tasks')}</span>
              </div>
              <span className="font-bold text-slate-900">64%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-700">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>{t('supervisor.pendingTasks', 'Pending Tasks')}</span>
              </div>
              <span className="font-bold text-slate-900">24%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-700">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span>{t('supervisor.overdueTasks', 'Overdue Tasks')}</span>
              </div>
              <span className="font-bold text-slate-900">12%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
