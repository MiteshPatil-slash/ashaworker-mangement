import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useData } from '../../context/DataContext';
import {
  Globe,
  Bell,
  User,
  LogOut,
  ChevronDown,
  Heart
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AppNavbar({ onOpenNotifications }) {
  const { user, currentRole, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { notifications } = useData();

  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const navigate = useNavigate();

  const unreadNotifs = notifications.filter(n => !n.read).length;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 flex items-center justify-between h-16 gap-3">
        {/* Brand & Logo */}
        <div className="flex items-center gap-3 min-w-[200px]">
          <div
            onClick={() => navigate(currentRole === 'ASHA_WORKER' ? '/' : currentRole === 'SUPERVISOR' ? '/supervisor' : '/admin')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-sm shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Heart className="w-5 h-5 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-extrabold tracking-tight text-slate-900 leading-none">
                  {t('appName', 'ASHA SAATHI')}
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">
                  {currentRole === 'ASHA_WORKER' ? t('roles.worker', 'Worker') : currentRole === 'SUPERVISOR' ? t('roles.supervisor', 'Supervisor') : t('roles.admin', 'Admin')}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block leading-tight">
                {t('appSubtitle', 'Healthy Communities | Empowered ASHA Workers | Stronger Tomorrow')}
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1" />

        {/* Actions, Offline Simulator, Language, Role Switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Switcher */}
          <div className="relative">
            <button
              onClick={() => {
                setLangMenuOpen(!langMenuOpen);
                setUserMenuOpen(false);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition-colors"
            >
              <Globe className="w-3.5 h-3.5 text-blue-600" />
              <span>{language === 'en' ? 'English' : language === 'mr' ? 'मराठी' : 'हिंदी'}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {langMenuOpen && (
              <div className="absolute right-0 mt-1.5 w-32 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50 text-xs font-medium">
                <button
                  onClick={() => { setLanguage('en'); setLangMenuOpen(false); }}
                  className={`w-full text-left px-3 py-1.5 hover:bg-slate-50 ${language === 'en' ? 'text-blue-600 font-bold bg-blue-50' : 'text-slate-700'}`}
                >
                  English
                </button>
                <button
                  onClick={() => { setLanguage('mr'); setLangMenuOpen(false); }}
                  className={`w-full text-left px-3 py-1.5 hover:bg-slate-50 ${language === 'mr' ? 'text-blue-600 font-bold bg-blue-50' : 'text-slate-700'}`}
                >
                  मराठी (Marathi)
                </button>
                <button
                  onClick={() => { setLanguage('hi'); setLangMenuOpen(false); }}
                  className={`w-full text-left px-3 py-1.5 hover:bg-slate-50 ${language === 'hi' ? 'text-blue-600 font-bold bg-blue-50' : 'text-slate-700'}`}
                >
                  हिंदी (Hindi)
                </button>
              </div>
            )}
          </div>

          {/* Notifications Bell */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            title={t('nav.notifications', 'Notifications')}
            aria-label={t('nav.notifications', 'Notifications')}
          >
            <Bell className="w-4 h-4" />
            {unreadNotifs > 0 && (
              <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-rose-500 text-white text-[9px] leading-4 font-bold ring-2 ring-white">
                {unreadNotifs}
              </span>
            )}
          </button>

          {/* User Profile Avatar */}
          <div className="relative">
            <button
              onClick={() => {
                setUserMenuOpen(!userMenuOpen);
                setLangMenuOpen(false);
              }}
              className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'}
                alt={user?.name}
                className="w-8 h-8 rounded-full object-cover border border-slate-300"
              />
              <div className="text-left hidden lg:block">
                <div className="text-xs font-bold text-slate-800 leading-tight">{user?.name}</div>
                <div className="text-[10px] text-slate-500 leading-tight">{user?.village || user?.block}</div>
              </div>
              <ChevronDown className="w-3 h-3 text-slate-400 hidden lg:block" />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-1.5 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
                <div className="px-4 py-2 border-b border-slate-100">
                  <div className="text-xs font-bold text-slate-800">{user?.name}</div>
                  <div className="text-[11px] text-slate-500">{user?.email}</div>
                  <div className="text-[11px] text-blue-600 font-semibold mt-0.5">
                    {currentRole === 'ASHA_WORKER' ? t('roles.ashaSubtitle', 'Community Health Worker') : currentRole === 'SUPERVISOR' ? t('roles.supervisorSubtitle', 'Monitor & Support ASHA Workers') : t('roles.adminSubtitle', 'System Management & Oversight')}
                  </div>
                </div>
                <button
                  onClick={() => { setUserMenuOpen(false); navigate('/settings'); }}
                  className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>{t('common.profileSettings', 'Profile & Settings')}</span>
                </button>
                <button
                  onClick={() => { setUserMenuOpen(false); logout(); navigate('/login'); }}
                  className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{t('common.signOut', 'Sign Out')}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
