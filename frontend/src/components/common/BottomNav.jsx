import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  Home,
  Heart,
  Baby,
  Pill,
  CalendarCheck2,
  Users,
  LayoutDashboard,
  UserCheck,
  BarChart3
} from 'lucide-react';

export default function BottomNav() {
  const { isAdmin } = useAuth();
  const { t } = useLanguage();

  const ashaNavItems = [
    { to: '/', icon: Home, label: t('nav.dashboard') },
    { to: '/pregnancy', icon: Heart, label: 'Maternal' },
    { to: '/children', icon: Baby, label: 'Child' },
    { to: '/medicines', icon: Pill, label: 'Meds' },
    { to: '/visits', icon: CalendarCheck2, label: 'Visits' },
    { to: '/families', icon: Users, label: 'Families' }
  ];

  const adminNavItems = [
    { to: '/admin', icon: LayoutDashboard, label: 'Overview' },
    { to: '/admin/workers', icon: UserCheck, label: 'Workers' },
    { to: '/admin/analytics', icon: BarChart3, label: 'Analytics' }
  ];

  const items = isAdmin ? adminNavItems : ashaNavItems;

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200 px-2 py-1 shadow-lg">
      <div className="flex items-center justify-around">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/' || item.to === '/admin'}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all ${
                  isActive
                    ? 'text-emerald-600 font-bold scale-105'
                    : 'text-slate-500 hover:text-slate-900 font-medium'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-[56px] text-center">
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
