import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import {
  ShieldCheck,
  Search,
  Filter,
  Clock,
  User,
  Activity,
  Layers,
  Terminal
} from 'lucide-react';

export default function AuditLogsPage() {
  const { t } = useLanguage();
  const [logs, setLogs] = useState([]);
  const [moduleFilter, setModuleFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = {};
      if (moduleFilter) params.module = moduleFilter;
      if (search) params.search = search;

      const res = await api.getAuditLogs(params);
      if (res.success) {
        setLogs(res.logs || []);
      }
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [moduleFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchLogs();
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-slate-900/20">
        <div className="flex items-center gap-2 mb-1">
          <span className="bg-white/10 backdrop-blur-sm text-emerald-400 text-xs font-mono font-bold px-3 py-1 rounded-full border border-emerald-500/20">
            Immutable Audit Trail
          </span>
          <span className="text-slate-400 text-xs">Security & Legal Compliance</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          System Audit & Activity Logs
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-xl">
          Comprehensive historical audit log recording worker logins, pregnancy registrations, clinical referrals, and medicine ledger changes.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search username, action, record ID..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-500"
          />
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={moduleFilter}
            onChange={e => setModuleFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:outline-none text-slate-700 w-full sm:w-auto font-medium"
          >
            <option value="">All Health Modules</option>
            <option value="PREGNANCY">Pregnancy & Maternal</option>
            <option value="CHILD">Child & Birth</option>
            <option value="MEDICINE">Medicine & Supplies</option>
            <option value="VISIT">Home Visits</option>
            <option value="REFERRAL">Hospital Referrals</option>
            <option value="WORKER">Staff Accounts</option>
            <option value="SYSTEM">System & Auth</option>
          </select>
        </div>
      </div>

      {/* Logs Timeline Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">{t('common.loading')}</div>
        ) : logs.length === 0 ? (
          <p className="text-xs text-slate-400 py-10 text-center">No audit logs found for the selected filter.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase font-bold text-[10px]">
                  <th className="pb-3">Timestamp</th>
                  <th className="pb-3">User & Role</th>
                  <th className="pb-3">Action Event</th>
                  <th className="pb-3">Module</th>
                  <th className="pb-3">Record Details</th>
                  <th className="pb-3">Client IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {logs.map((log) => (
                  <tr key={log._id || log.id} className="hover:bg-slate-50">
                    <td className="py-3 text-slate-500 font-sans text-xs whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 font-sans">
                      <strong className="text-slate-900 block">{log.username}</strong>
                      <span className="text-[10px] text-slate-500">{log.role}</span>
                    </td>
                    <td className="py-3">
                      <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded font-bold text-[11px]">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 font-sans">
                      <span className="text-[10px] font-bold uppercase text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                        {log.module}
                      </span>
                    </td>
                    <td className="py-3 font-sans text-slate-600 max-w-xs truncate text-[11px]">
                      {log.details ? JSON.stringify(log.details) : log.recordId || '-'}
                    </td>
                    <td className="py-3 text-slate-400 text-[10px]">{log.ip || '127.0.0.1'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
