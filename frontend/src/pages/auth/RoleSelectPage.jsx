import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  Heart,
  UserCheck,
  ShieldCheck,
  Building,
  ArrowRight,
  CheckCircle,
  Users
} from 'lucide-react';

export default function RoleSelectPage() {
  const { currentRole, switchRole } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleSelect = (roleKey) => {
    switchRole(roleKey);
    if (roleKey === 'ASHA_WORKER') navigate('/');
    else if (roleKey === 'SUPERVISOR') navigate('/supervisor');
    else if (roleKey === 'ADMIN') navigate('/admin');
  };

  const roles = [
    {
      key: 'ASHA_WORKER',
      title: 'ASHA Worker',
      subtitle: 'Community Health Worker',
      desc: 'Conduct field visits, record pregnancy & child care, upload medical documents and manage beneficiaries.',
      icon: Users,
      color: 'blue',
      badge: 'Field Portal'
    },
    {
      key: 'SUPERVISOR',
      title: 'Supervisor',
      subtitle: 'Monitor & Support ASHA Workers',
      desc: 'Review submitted clinical documents, monitor high-risk pregnancies, track referrals, and assign tasks.',
      icon: UserCheck,
      color: 'indigo',
      badge: 'Supervisory Portal'
    },
    {
      key: 'ADMIN',
      title: 'Admin',
      subtitle: 'System Management',
      desc: 'Full administrative control over worker allocation, health centres, cluster statistics, and system logs.',
      icon: ShieldCheck,
      color: 'slate',
      badge: 'Executive Portal'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-xl border border-slate-200 p-6 sm:p-10 text-center">
        {/* Emblem */}
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-700 text-white flex items-center justify-center mx-auto mb-4 shadow-md shadow-blue-500/20">
          <Heart className="w-7 h-7 fill-white" />
        </div>

        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          Welcome!
        </h2>
        <p className="text-sm text-slate-500 font-medium mt-1 mb-8">
          Redirecting you to your role-based dashboard...
        </p>

        <div className="space-y-4 text-left">
          {roles.map((r) => {
            const Icon = r.icon;
            const isSelected = currentRole === r.key;
            return (
              <div
                key={r.key}
                onClick={() => handleSelect(r.key)}
                className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between group ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/50 shadow-md ring-2 ring-blue-500/20'
                    : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                    isSelected ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-600'
                  }`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-slate-900 text-base">{r.title}</h3>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                        {r.badge}
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-blue-600 mt-0.5">{r.subtitle}</div>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed hidden sm:block">
                      {r.desc}
                    </p>
                  </div>
                </div>

                <div className="pl-4 shrink-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform group-hover:translate-x-1 ${
                    isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-blue-600 group-hover:text-white'
                  }`}>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-xs text-slate-400 mt-8">
          You can switch roles anytime using the role badge in the top navigation bar.
        </p>
      </div>
    </div>
  );
}
