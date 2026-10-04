import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import {
  Building2,
  Users,
  MapPin,
  Plus,
  Search,
  CheckCircle2,
  Activity
} from 'lucide-react';

export default function AdminVillagesPage() {
  const { t } = useLanguage();
  const [villages, setVillages] = useState([
    { id: 'VIL-01', name: 'Rampur', block: 'Rampur Cluster', population: 3200, households: 480, ashaWorker: 'Sunita Patil', supervisor: 'Rajesh More', status: 'Active' },
    { id: 'VIL-02', name: 'Bhagwan', block: 'Rampur Cluster', population: 2600, households: 390, ashaWorker: 'Anita Shah', supervisor: 'Rajesh More', status: 'Active' },
    { id: 'VIL-03', name: 'Shirpur', block: 'Shirpur Sector', population: 1900, households: 285, ashaWorker: 'Priya More', supervisor: 'Rajesh More', status: 'Active' },
    { id: 'VIL-04', name: 'Kalapur', block: 'Kalapur Sector', population: 2450, households: 360, ashaWorker: 'Rohini Kale', supervisor: 'Rajesh More', status: 'Active' }
  ]);

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {t('admin.villagesTitle', 'Villages & Areas Management')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            {t('admin.villagesSubtitle', 'Rural health jurisdiction allocation and field workforce cluster coverage')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {villages.map((v) => (
          <div key={v.id} className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-400">{v.id}</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                {v.status}
              </span>
            </div>
            <h2 className="text-lg font-black text-slate-900">{v.name}</h2>
            <div className="text-xs space-y-1.5 text-slate-600">
              <div className="flex justify-between">
                <span>{t('admin.population', 'Population')}:</span>
                <strong className="text-slate-800">{v.population.toLocaleString()}</strong>
              </div>
              <div className="flex justify-between">
                <span>{t('admin.households', 'Households')}:</span>
                <strong className="text-slate-800">{v.households}</strong>
              </div>
              <div className="flex justify-between">
                <span>{t('nav.workers', 'ASHA Worker')}:</span>
                <strong className="text-blue-700">{v.ashaWorker}</strong>
              </div>
              <div className="flex justify-between">
                <span>{t('roles.supervisor', 'Supervisor')}:</span>
                <strong className="text-slate-700">{v.supervisor}</strong>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
