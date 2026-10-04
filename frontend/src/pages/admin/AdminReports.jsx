import React, { useState } from 'react';
import { api } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import {
  FileSpreadsheet,
  Download,
  Printer,
  Calendar,
  Filter,
  CheckCircle2,
  Heart,
  Baby,
  Pill,
  CalendarCheck2,
  Users,
  UserCheck
} from 'lucide-react';

export default function AdminReports() {
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState('pregnancies');
  const [downloading, setDownloading] = useState(false);

  const categories = [
    { id: 'pregnancies', name: 'Maternal Care & Pregnancy Report', icon: Heart, color: 'text-rose-600 bg-rose-50' },
    { id: 'children', name: 'Child Immunization & Birth Report', icon: Baby, color: 'text-blue-600 bg-blue-50' },
    { id: 'visits', name: 'Home Visits & Field Activities Report', icon: CalendarCheck2, color: 'text-teal-600 bg-teal-50' },
    { id: 'medicines', name: 'Medicine Stock & Distribution Ledger', icon: Pill, color: 'text-purple-600 bg-purple-50' },
    { id: 'families', name: 'Household & Family Directory Export', icon: Users, color: 'text-emerald-600 bg-emerald-50' },
    { id: 'workers', name: 'ASHA Staff Performance & Roster Report', icon: UserCheck, color: 'text-indigo-600 bg-indigo-50' }
  ];

  const handleExportCSV = async (catId) => {
    try {
      setDownloading(true);
      const blob = await api.downloadCSV(catId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `asha-report-${catId}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert(err.message || 'Failed to export report');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-800 via-emerald-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-teal-900/20">
        <div className="flex items-center gap-2 mb-1">
          <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full">
            Export Center
          </span>
          <span className="text-teal-200 text-xs">Official NHM Reporting Data</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Reports & Data Export Center
        </h1>
        <p className="text-teal-200 text-xs sm:text-sm mt-1 max-w-xl">
          Generate structured CSV exports, maternal registries, and immunization coverage tables for district submissions.
        </p>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <div
              key={cat.id}
              className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${cat.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">CSV / EXCEL</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 leading-snug">{cat.name}</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Complete official dataset formatted for tabular analysis and government portal submissions.
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-medium">Standard UTF-8</span>
                <button
                  type="button"
                  disabled={downloading}
                  onClick={() => handleExportCSV(cat.id)}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all touch-press disabled:opacity-50"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download CSV</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
