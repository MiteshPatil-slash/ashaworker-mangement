import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../../services/api';
import { useLanguage } from '../../../context/LanguageContext';
import {
  Users,
  ArrowLeft,
  Home,
  Phone,
  MapPin,
  Calendar,
  Heart,
  Baby,
  CalendarCheck2,
  Clock,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

export default function FamilyDetail() {
  const { id } = useParams();
  const { t } = useLanguage();

  const [family, setFamily] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchFamily = async () => {
    try {
      setLoading(true);
      const res = await api.getFamilyById(id);
      if (res.success) {
        setFamily(res.family);
      }
    } catch (err) {
      console.error('Failed to load family detail:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFamily();
  }, [id]);

  if (loading || !family) {
    return <div className="p-12 text-center text-xs text-slate-400">{t('common.loading')}</div>;
  }

  const members = family.members || [];
  const pregnancies = family.pregnancies || [];
  const children = family.children || [];
  const timeline = family.timeline || [];

  return (
    <div className="space-y-6 pb-20 lg:pb-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
      
      {/* Back button */}
      <div>
        <Link
          to="/families"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white px-3 py-1.5 rounded-xl border border-slate-200"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Family Directory</span>
        </Link>
      </div>

      {/* Family Profile Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-start gap-3.5">
            <div className="w-14 h-14 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <Home className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold text-slate-900">{family.headOfFamily}'s Household</h1>
                <span className="text-xs font-mono font-bold bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                  {family.familyId}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Category: <strong className="text-slate-700">{family.category}</strong> | Contact: <strong className="text-slate-700">{family.contactNumber || 'N/A'}</strong>
              </p>
              <p className="text-xs text-slate-500">
                Village Sector: <strong className="text-slate-700">{family.village}</strong> | Address: {family.address}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-rose-50 p-3 rounded-2xl border border-rose-100 text-center">
              <span className="text-[10px] uppercase font-bold text-rose-500 block">Pregnancies</span>
              <span className="text-lg font-extrabold text-rose-700">{pregnancies.length}</span>
            </div>
            <div className="bg-blue-50 p-3 rounded-2xl border border-blue-100 text-center">
              <span className="text-[10px] uppercase font-bold text-blue-500 block">Children</span>
              <span className="text-lg font-extrabold text-blue-700">{children.length}</span>
            </div>
          </div>
        </div>

        {/* Household Members */}
        <div className="mt-4">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />
            <span>Family Members ({members.length})</span>
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {members.map((m, idx) => (
              <div key={idx} className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs">
                <strong className="text-slate-900 block">{m.name}</strong>
                <span className="text-[11px] text-slate-500">{m.relation} ({m.age} Yrs, {m.gender})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* UNIFIED MULTI-GENERATIONAL FAMILY TIMELINE */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Unified Family Health Timeline</h3>
            <p className="text-xs text-slate-500">
              Chronological history of registrations, pregnancies, births, vaccinations, and home visits
            </p>
          </div>
        </div>

        {timeline.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">No timeline events recorded.</p>
        ) : (
          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {timeline.map((event, idx) => {
              let dotColor = 'bg-emerald-500 ring-emerald-100';
              let icon = <CheckCircle2 className="w-3 h-3 text-white" />;

              if (event.type.includes('PREGNANCY')) {
                dotColor = 'bg-rose-500 ring-rose-100';
              } else if (event.type.includes('CHILD') || event.type.includes('VACCIN')) {
                dotColor = 'bg-blue-500 ring-blue-100';
              } else if (event.type.includes('VISIT')) {
                dotColor = 'bg-teal-500 ring-teal-100';
              }

              return (
                <div key={idx} className="relative group">
                  <div className={`absolute -left-6 top-1 w-4 h-4 rounded-full ${dotColor} ring-4 flex items-center justify-center`} />
                  <div className="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200 hover:bg-white hover:border-slate-300 transition-all">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900">{event.title}</h4>
                      <span className="text-[10px] font-bold text-slate-400">{event.date}</span>
                    </div>
                    <p className="text-xs text-slate-600">{event.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
