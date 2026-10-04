import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import {
  VisitTypeBarChart,
  PregnancyRiskPieChart,
  MedicineStockBarChart
} from '../../components/charts/AnalyticsCharts';
import {
  BarChart3,
  TrendingUp,
  Activity,
  Heart,
  Baby,
  Pill,
  CalendarCheck2,
  Filter
} from 'lucide-react';

export default function AdminAnalytics() {
  const { t } = useLanguage();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await api.getAnalytics();
        if (res.success) {
          setData(res);
        }
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading || !data) {
    return <div className="p-12 text-center text-xs text-slate-400">{t('common.loading')}</div>;
  }

  const { summary, charts } = data;

  return (
    <div className="space-y-6 pb-20 lg:pb-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-800 via-purple-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-indigo-900/20">
        <div className="flex items-center gap-2 mb-1">
          <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full">
            Data Insights
          </span>
          <span className="text-indigo-200 text-xs">District Public Health Overview</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Performance & Coverage Analytics
        </h1>
        <p className="text-indigo-200 text-xs sm:text-sm mt-1 max-w-xl">
          Visual metrics tracking maternal health checkups, child age groups, and essential drug stocks.
        </p>
      </div>

      {/* Graphical Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Home Visits by Type */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Home Visits Breakdown by Category
              </h3>
              <p className="text-xs text-slate-500">Distribution across ANC, PNC, Child Care, and General</p>
            </div>
            <CalendarCheck2 className="w-5 h-5 text-emerald-600" />
          </div>
          <VisitTypeBarChart data={charts?.visitTypesCount || {}} />
        </div>

        {/* Chart 2: Pregnancy Risk Distribution */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Maternal Protocol Risk Distribution
              </h3>
              <p className="text-xs text-slate-500">Normal vs Needs Follow-up vs High Priority Cases</p>
            </div>
            <Heart className="w-5 h-5 text-rose-600" />
          </div>
          <PregnancyRiskPieChart data={charts?.pregnancyRiskStats || {}} />
        </div>

        {/* Chart 3: Medicine Inventory Stock Levels */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Essential Medicine Inventory vs Minimum Threshold
              </h3>
              <p className="text-xs text-slate-500">Real-time stock ledger comparison across key supplies</p>
            </div>
            <Pill className="w-5 h-5 text-purple-600" />
          </div>
          <MedicineStockBarChart data={charts?.medicineStockOverview || []} />
        </div>

      </div>

    </div>
  );
}
