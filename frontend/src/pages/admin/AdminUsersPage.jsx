import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  UserCheck,
  Plus,
  Search,
  Edit2,
  Trash2,
  X
} from 'lucide-react';

export default function AdminUsersPage() {
  const [userList, setUserList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [newUser, setNewUser] = useState({
    name: '',
    mobile: '',
    assignedVillage: '',
    assignedHealthCentre: 'Chandrapur Rural Primary Health Centre (PHC)'
  });

  const fetchWorkers = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const res = await api.getWorkers();
      if (res.success) {
        const mapped = (res.workers || []).map(w => ({
          id: w.workerId,
          name: w.name,
          role: 'ASHA Worker',
          village: w.assignedVillage,
          healthCentre: w.assignedHealthCentre,
          phone: w.mobile,
          status: w.status === 'ACTIVE' ? 'Active' : 'Inactive'
        }));
        setUserList(mapped);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to load workers from the server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, []);

  const [deletingId, setDeletingId] = useState(null);

  const handleToggleStatus = async (id) => {
    try {
      await api.toggleWorkerStatus(id);
      fetchWorkers();
    } catch (err) {
      alert(err.message || 'Failed to update status');
    }
  };

  const handleDelete = async (u) => {
    if (!window.confirm(`Permanently delete ${u.name} (${u.id})? This removes the worker and their login account from the database. This cannot be undone.`)) {
      return;
    }
    try {
      setDeletingId(u.id);
      await api.deleteWorker(u.id);
      setUserList(prev => prev.filter(w => w.id !== u.id));
    } catch (err) {
      alert(err.message || 'Failed to delete worker');
    } finally {
      setDeletingId(null);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!newUser.name || !newUser.mobile || !newUser.assignedVillage) return;

    try {
      setSaving(true);
      const res = await api.createWorker(newUser);
      alert(
        `Worker created successfully!\nWorker ID: ${res.credentials?.workerId}\nUsername: ${res.credentials?.username}\nTemporary Password: ${res.credentials?.temporaryPassword}`
      );
      setNewUser({
        name: '',
        mobile: '',
        assignedVillage: '',
        assignedHealthCentre: 'Chandrapur Rural Primary Health Centre (PHC)'
      });
      setIsModalOpen(false);
      fetchWorkers();
    } catch (err) {
      alert(err.message || 'Failed to create worker account');
    } finally {
      setSaving(false);
    }
  };

  const filteredUsers = userList.filter(u => {
    if (roleFilter !== 'All' && u.role !== roleFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        u.name.toLowerCase().includes(q) ||
        u.id.toLowerCase().includes(q) ||
        (u.village || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            User Management & Allocation
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Create and manage ASHA Worker accounts (synced with the database)
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add ASHA Worker</span>
        </button>
      </div>

      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold px-4 py-3 rounded-xl">
          {errorMsg}
        </div>
      )}

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search user by name, ID or village..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-semibold">Filter Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
            >
              <option value="All">All Roles</option>
              <option value="ASHA Worker">ASHA Worker</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400 font-semibold">Loading workers...</div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Assigned Village</th>
                  <th className="py-3.5 px-4">Health Centre</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <div>{u.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">ID: {u.id}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-semibold">{u.village}</td>
                    <td className="py-3.5 px-4 text-slate-600">{u.healthCentre}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-500">{u.phone}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        u.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleToggleStatus(u.id)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                            u.status === 'Active'
                              ? 'text-rose-600 bg-rose-50 hover:bg-rose-100'
                              : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'
                          }`}
                        >
                          {u.status === 'Active' ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleDelete(u)}
                          disabled={deletingId === u.id}
                          title="Delete permanently"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-40"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400 text-xs font-semibold">
                      No workers found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-black text-slate-900">Add ASHA Worker</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  placeholder="Enter full name"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Phone *</label>
                <input
                  type="tel"
                  required
                  value={newUser.mobile}
                  onChange={(e) => setNewUser({ ...newUser, mobile: e.target.value })}
                  placeholder="98XXXXXXXX"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Village *</label>
                <input
                  type="text"
                  required
                  value={newUser.assignedVillage}
                  onChange={(e) => setNewUser({ ...newUser, assignedVillage: e.target.value })}
                  placeholder="e.g. Chandrapur Sector 1"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Health Centre *</label>
                <input
                  type="text"
                  required
                  value={newUser.assignedHealthCentre}
                  onChange={(e) => setNewUser({ ...newUser, assignedHealthCentre: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <p className="text-[11px] text-slate-400">
                Note: only ASHA Worker accounts can be created here — the backend doesn't yet support Supervisor/Admin creation.
              </p>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}