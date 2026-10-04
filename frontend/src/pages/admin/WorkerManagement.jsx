import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import {
  UserCheck,
  Plus,
  Search,
  KeyRound,
  ShieldAlert,
  Power,
  Edit2,
  Activity,
  X,
  CheckCircle2,
  MapPin,
  Building2,
  Phone
} from 'lucide-react';

export default function WorkerManagement() {
  const { t } = useLanguage();
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState(null);

  // New Worker Form
  const [newWorkerForm, setNewWorkerForm] = useState({
    name: '',
    mobile: '',
    assignedVillage: '',
    assignedHealthCentre: 'Chandrapur Rural Primary Health Centre (PHC)',
    customUsername: '',
    tempPassword: 'Asha@' + Math.floor(1000 + Math.random() * 9000)
  });

  const [newTempPassword, setNewTempPassword] = useState('');

  const fetchWorkers = async () => {
    try {
      setLoading(true);
      const res = await api.getWorkers();
      if (res.success) {
        setWorkers(res.workers || []);
      }
    } catch (err) {
      console.error('Failed to load workers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, []);

  const handleCreateWorker = async (e) => {
    e.preventDefault();
    try {
      const res = await api.createWorker(newWorkerForm);
      alert(`Worker created successfully!\nWorker ID: ${res.credentials?.workerId}\nUsername: ${res.credentials?.username}\nTemporary Password: ${res.credentials?.temporaryPassword}`);
      setCreateModalOpen(false);
      setNewWorkerForm({
        name: '',
        mobile: '',
        assignedVillage: '',
        assignedHealthCentre: 'Chandrapur Rural Primary Health Centre (PHC)',
        customUsername: '',
        tempPassword: 'Asha@' + Math.floor(1000 + Math.random() * 9000)
      });
      fetchWorkers();
    } catch (err) {
      alert(err.message || 'Failed to create worker account');
    }
  };

  const handleToggleStatus = async (workerId) => {
    try {
      await api.toggleWorkerStatus(workerId);
      fetchWorkers();
    } catch (err) {
      alert(err.message || 'Failed to update status');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!selectedWorker) return;
    try {
      const res = await api.resetWorkerPassword(selectedWorker.workerId, { newTempPassword });
      alert(`Password reset successful!\nNew Temporary Password: ${res.temporaryPassword}`);
      setResetModalOpen(false);
      setNewTempPassword('');
    } catch (err) {
      alert(err.message || 'Failed to reset password');
    }
  };

  const filteredWorkers = search
    ? workers.filter(w =>
        w.name?.toLowerCase().includes(search.toLowerCase()) ||
        w.workerId?.toLowerCase().includes(search.toLowerCase()) ||
        w.assignedVillage?.toLowerCase().includes(search.toLowerCase())
      )
    : workers;

  return (
    <div className="space-y-6 pb-20 lg:pb-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-800 via-indigo-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-purple-900/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full">
              Staff Administration
            </span>
            <span className="text-purple-200 text-xs">Accredited Social Health Activists</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            ASHA Worker Management
          </h1>
          <p className="text-purple-200 text-xs sm:text-sm mt-1 max-w-xl">
            Provision official accounts, generate Worker IDs, assign village jurisdictions, and manage access credentials.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setCreateModalOpen(true)}
          className="px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-lg transition-all flex items-center gap-2 self-start md:self-center touch-press"
        >
          <Plus className="w-4 h-4" />
          <span>Provision New ASHA Worker</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by worker name, worker ID, assigned village sector..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Workers Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">{t('common.loading')}</div>
      ) : filteredWorkers.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-200">
          <UserCheck className="w-8 h-8 text-purple-300 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-700">No ASHA workers found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWorkers.map((w) => (
            <div
              key={w._id || w.id}
              className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{w.name}</h3>
                    <span className="text-xs font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-lg border border-purple-200">
                      {w.workerId}
                    </span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    w.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {w.status}
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 mt-2 space-y-1 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>Sector: <strong>{w.assignedVillage}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">PHC: {w.assignedHealthCentre}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>Mobile: {w.mobile}</span>
                  </div>
                </div>

                {/* Worker Coverage Stats */}
                {w.stats && (
                  <div className="grid grid-cols-3 gap-2 mt-3 pt-2 border-t border-slate-100 text-center text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Families</span>
                      <strong className="text-slate-800">{w.stats.families || 0}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-rose-500 uppercase font-bold block">Maternal</span>
                      <strong className="text-rose-700">{w.stats.activePregnancies || 0}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-emerald-500 uppercase font-bold block">Visits</span>
                      <strong className="text-emerald-700">{w.stats.completedVisits || 0}</strong>
                    </div>
                  </div>
                )}
              </div>

              {/* Admin Actions */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedWorker(w);
                    setNewTempPassword('Asha@' + Math.floor(1000 + Math.random() * 9000));
                    setResetModalOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1"
                >
                  <KeyRound className="w-3.5 h-3.5 text-purple-600" />
                  <span>Reset PW</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleToggleStatus(w.workerId)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 ${
                    w.status === 'ACTIVE'
                      ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                  }`}
                >
                  <Power className="w-3.5 h-3.5" />
                  <span>{w.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Provision Worker Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">Provision New ASHA Account</h3>
              <button onClick={() => setCreateModalOpen(false)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateWorker} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Worker Full Name *</label>
                <input
                  type="text"
                  required
                  value={newWorkerForm.name}
                  onChange={e => setNewWorkerForm({ ...newWorkerForm, name: e.target.value })}
                  placeholder="e.g. Rekha Gaikwad"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    value={newWorkerForm.mobile}
                    onChange={e => setNewWorkerForm({ ...newWorkerForm, mobile: e.target.value })}
                    placeholder="10-digit phone"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Custom Username (Optional)</label>
                  <input
                    type="text"
                    value={newWorkerForm.customUsername}
                    onChange={e => setNewWorkerForm({ ...newWorkerForm, customUsername: e.target.value })}
                    placeholder="e.g. asha_rekha"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Assigned Village / Area *</label>
                <input
                  type="text"
                  required
                  value={newWorkerForm.assignedVillage}
                  onChange={e => setNewWorkerForm({ ...newWorkerForm, assignedVillage: e.target.value })}
                  placeholder="e.g. Chandrapur Sector 3 & 4"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Assigned Health Centre (PHC / Sub-centre) *</label>
                <input
                  type="text"
                  required
                  value={newWorkerForm.assignedHealthCentre}
                  onChange={e => setNewWorkerForm({ ...newWorkerForm, assignedHealthCentre: e.target.value })}
                  placeholder="e.g. Chandrapur Rural PHC"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Temporary Initial Password</label>
                <input
                  type="text"
                  required
                  value={newWorkerForm.tempPassword}
                  onChange={e => setNewWorkerForm({ ...newWorkerForm, tempPassword: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold"
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">Worker will be prompted to change password on first login.</span>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-3 py-2 rounded-xl border border-slate-200 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 text-white font-bold"
                >
                  Generate Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetModalOpen && selectedWorker && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="text-base font-bold text-slate-900 mb-2">Reset Worker Password</h3>
            <p className="text-xs text-slate-500 mb-3">Reset credentials for {selectedWorker.name} ({selectedWorker.workerId})</p>

            <form onSubmit={handleResetPassword} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">New Temporary Password</label>
                <input
                  type="text"
                  required
                  value={newTempPassword}
                  onChange={e => setNewTempPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setResetModalOpen(false)}
                  className="px-3 py-2 rounded-xl border border-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 text-white font-bold"
                >
                  Confirm Reset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
