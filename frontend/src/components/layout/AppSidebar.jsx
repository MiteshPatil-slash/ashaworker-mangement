import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useData } from '../../context/DataContext';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  Bell,
  Share2,
  BarChart3,
  MapPin,
  Inbox,
  Settings,
  ClipboardList,
  FileCheck,
  AlertTriangle,
  UserCheck,
  Building2,
  ShieldCheck,
  TrendingUp,
  HeartHandshake
} from 'lucide-react';

export default function AppSidebar() {
  const { currentRole } = useAuth();
  const { t } = useLanguage();
  const { stats, alerts, notifications } = useData();

  const unreadNotifs = notifications.filter(n => !n.read).length;
  const unresolvedAlerts = alerts.filter(alert => !alert.resolved).length;

  // ASHA Worker Links
  const ashaLinks = [
    { to: '/', label: t('nav.dashboard', 'Dashboard'), icon: LayoutDashboard, exact: true },
    { to: '/beneficiaries', label: t('nav.beneficiaries', 'Beneficiaries'), icon: Users },
    { to: '/visits', label: t('nav.visits', 'Visits'), icon: CalendarCheck },
    { to: '/alerts', label: t('nav.alerts', 'Alerts'), icon: Bell, badge: unresolvedAlerts > 0 ? unresolvedAlerts : null, badgeColor: 'bg-rose-500' },
    { to: '/referrals', label: t('nav.referrals', 'Referrals'), icon: Share2 },
    { to: '/reports', label: t('nav.reports', 'Reports'), icon: BarChart3 },
    { to: '/map', label: t('nav.map', 'Map / Households'), icon: MapPin },
    { to: '/notifications', label: t('nav.notifications', 'Notifications'), icon: Inbox, badge: unreadNotifs > 0 ? unreadNotifs : null, badgeColor: 'bg-blue-500' },
    { to: '/settings', label: t('nav.settings', 'Settings'), icon: Settings }
  ];

  // Supervisor Links
  const supervisorLinks = [
    { to: '/supervisor', label: t('nav.dashboard', 'Dashboard'), icon: LayoutDashboard, exact: true },
    { to: '/supervisor/workers', label: t('nav.workers', 'ASHA Workers'), icon: Users },
    { to: '/supervisor/tasks', label: t('nav.tasks', 'Tasks'), icon: ClipboardList, badge: stats.pendingTasks > 0 ? stats.pendingTasks : null, badgeColor: 'bg-amber-500' },
    { to: '/supervisor/documents', label: t('nav.documentReview', 'Document Review'), icon: FileCheck, badge: stats.pendingDocuments > 0 ? stats.pendingDocuments : null, badgeColor: 'bg-blue-500' },
    { to: '/supervisor/high-risk', label: t('nav.highRiskCases', 'High-Risk Cases'), icon: AlertTriangle, badge: stats.highRisk > 0 ? stats.highRisk : null, badgeColor: 'bg-rose-500' },
    { to: '/supervisor/referrals', label: t('nav.referrals', 'Referrals'), icon: Share2 },
    { to: '/supervisor/reports', label: t('nav.reportsAnalytics', 'Reports & Analytics'), icon: BarChart3 },
    { to: '/settings', label: t('nav.settings', 'Settings'), icon: Settings }
  ];

  // Admin Links
  const adminLinks = [
    { to: '/admin', label: t('nav.dashboard', 'Dashboard'), icon: LayoutDashboard, exact: true },
    { to: '/admin/users', label: t('nav.userManagement', 'User Management'), icon: UserCheck },
    { to: '/admin/villages', label: t('nav.villagesAreas', 'Villages & Areas'), icon: Building2 },
    { to: '/admin/reports', label: t('nav.systemAnalytics', 'System Analytics'), icon: TrendingUp },
    { to: '/admin/audit-logs', label: t('nav.systemAuditLogs', 'System Audit Logs'), icon: ShieldCheck },
    { to: '/settings', label: t('nav.settings', 'Settings'), icon: Settings }
  ];

  const links = currentRole === 'ASHA_WORKER'
    ? ashaLinks
    : currentRole === 'SUPERVISOR'
    ? supervisorLinks
    : adminLinks;

  return (
    <aside className="w-64 bg-[#112340] text-slate-300 flex flex-col shrink-0 min-h-[calc(100vh-4rem)] border-r border-slate-800">
      {/* Role Banner inside Sidebar */}
      <div className="px-5 py-4 border-b border-slate-800/80">
        <div className="flex items-center gap-2 text-xs font-semibold text-blue-400">
          <HeartHandshake className="w-4 h-4" />
          <span>
            {currentRole === 'ASHA_WORKER' ? t('layout.fieldWorkspace', 'ASHA Field Workspace') : currentRole === 'SUPERVISOR' ? t('layout.supervisorPortal', 'Supervisor Portal') : t('layout.adminConsole', 'Administrator Console')}
          </span>
        </div>
        <p className="text-[11px] text-slate-400 mt-0.5">
          {currentRole === 'ASHA_WORKER' ? t('layout.rampurSector', 'Rampur Sector • Unit 04') : currentRole === 'SUPERVISOR' ? t('layout.rampurHealthBlock', 'Rampur Health Block') : t('layout.districtHealthAuthority', 'District Health Authority')}
        </p>
      </div>

      {/* Nav List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {links.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 transition-transform group-hover:scale-110" />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge !== null && (
                <span className={`text-[10px] text-white font-bold px-1.5 py-0.2 rounded-full ${item.badgeColor || 'bg-blue-500'}`}>
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Footer */}
      <div className="p-4 border-t border-slate-800/80 text-[11px] text-slate-400">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-slate-300">ASHA SAATHI v2.4</span>
          <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-emerald-400 font-mono">STABLE</span>
        </div>
        <p className="mt-1 text-[10px] text-slate-400">{t('layout.nationalHealthMission', 'National Health Mission')}</p>
      </div>
    </aside>
  );
}
