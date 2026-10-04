import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useNotifications } from '../../context/NotificationContext';
import { useOffline } from '../../context/OfflineContext';
import LanguageSelector from './LanguageSelector';
import {
  HeartHandshake,
  Bell,
  Wifi,
  WifiOff,
  RefreshCw,
  LogOut,
  User,
  ShieldAlert,
  Menu,
  X
} from 'lucide-react';

export default function Navbar() {
  const { user, logout, isAdmin, isAsha } = useAuth();
  const { t } = useLanguage();
  const { unreadCount } = useNotifications();
  const { isOnline, isSyncing, pendingCount, triggerSync } = useOffline();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-200 group-hover:scale-105 transition-transform">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <div>
                <span className="text-base sm:text-lg font-bold text-slate-900 leading-tight block">
                  ASHA <span className="text-emerald-600">Smart</span>
                </span>
                <span className="text-[10px] text-slate-500 font-medium hidden sm:block">
                  National Health Mission
                </span>
              </div>
            </Link>

            {/* Role Badge */}
            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
              isAdmin
                ? 'bg-purple-50 text-purple-700 border-purple-200'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}>
              {isAdmin ? 'ADMIN' : user?.workerId || 'ASHA WORKER'}
            </span>
          </div>

          {/* Desktop Nav Links (for Admin / Quick Nav) */}
          <div className="hidden lg:flex items-center gap-1 text-sm font-semibold text-slate-600">
            {isAdmin ? (
              <>
                <Link to="/admin" className="px-3 py-2 rounded-xl hover:bg-slate-100 hover:text-slate-900 transition-colors">
                  {t('nav.dashboard')}
                </Link>
                <Link to="/admin/workers" className="px-3 py-2 rounded-xl hover:bg-slate-100 hover:text-slate-900 transition-colors">
                  {t('nav.workers')}
                </Link>
                <Link to="/admin/analytics" className="px-3 py-2 rounded-xl hover:bg-slate-100 hover:text-slate-900 transition-colors">
                  {t('nav.analytics')}
                </Link>
                <Link to="/admin/reports" className="px-3 py-2 rounded-xl hover:bg-slate-100 hover:text-slate-900 transition-colors">
                  {t('nav.reports')}
                </Link>
                <Link to="/admin/facilities" className="px-3 py-2 rounded-xl hover:bg-slate-100 hover:text-slate-900 transition-colors">
                  {t('nav.facilities')}
                </Link>
                <Link to="/admin/audit-logs" className="px-3 py-2 rounded-xl hover:bg-slate-100 hover:text-slate-900 transition-colors">
                  {t('nav.auditLogs')}
                </Link>
              </>
            ) : (
              <>
                <Link to="/" className="px-3 py-2 rounded-xl hover:bg-slate-100 hover:text-slate-900 transition-colors">
                  {t('nav.dashboard')}
                </Link>
                <Link to="/pregnancy" className="px-3 py-2 rounded-xl hover:bg-slate-100 hover:text-slate-900 transition-colors">
                  {t('nav.pregnancy')}
                </Link>
                <Link to="/children" className="px-3 py-2 rounded-xl hover:bg-slate-100 hover:text-slate-900 transition-colors">
                  {t('nav.children')}
                </Link>
                <Link to="/medicines" className="px-3 py-2 rounded-xl hover:bg-slate-100 hover:text-slate-900 transition-colors">
                  {t('nav.medicines')}
                </Link>
                <Link to="/visits" className="px-3 py-2 rounded-xl hover:bg-slate-100 hover:text-slate-900 transition-colors">
                  {t('nav.visits')}
                </Link>
                <Link to="/families" className="px-3 py-2 rounded-xl hover:bg-slate-100 hover:text-slate-900 transition-colors">
                  {t('nav.families')}
                </Link>
              </>
            )}
          </div>

          {/* Right Controls: Online Status, Sync, Notifications, Language, Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Sync & Offline Status */}
            <Link
              to="/sync"
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold border transition-all ${
                !isOnline
                  ? 'bg-amber-500 text-white border-amber-600 animate-pulse'
                  : pendingCount > 0
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
              }`}
              title={isOnline ? 'Online - Cloud Synced' : 'Offline Mode Active'}
            >
              {!isOnline ? (
                <>
                  <WifiOff className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Offline ({pendingCount})</span>
                </>
              ) : pendingCount > 0 ? (
                <>
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>Sync ({pendingCount})</span>
                </>
              ) : (
                <>
                  <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="hidden sm:inline text-emerald-700">Synced</span>
                </>
              )}
            </Link>

            {/* Language Selector */}
            <LanguageSelector />

            {/* Notifications Bell */}
            <Link
              to="/notifications"
              className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>

            {/* User Profile & Logout */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="hidden md:block text-right">
                <span className="text-xs font-bold text-slate-800 block truncate max-w-[120px]">
                  {user?.name?.split(' ')[0] || user?.username}
                </span>
                <span className="text-[10px] text-slate-500 block truncate max-w-[120px]">
                  {user?.workerDetails?.assignedVillage || (isAdmin ? 'District HQ' : 'Sector 1')}
                </span>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                title={t('nav.logout')}
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
