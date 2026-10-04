import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  Plus,
  X,
  Trash2
} from 'lucide-react';

function displayStatus(status) {
  switch ((status || '').toUpperCase()) {
    case 'COMPLETED': return 'Completed';
    case 'IN_PROGRESS': return 'In Progress';
    case 'CANCELLED': return 'Cancelled';
    case 'OVERDUE': return 'Overdue';
    case 'PENDING':
    default: return 'Pending';
  }
}

export default function TasksManagement() {
  const [tasks, setTasks] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: '',
    workerId: '',
    workerName: '',
    beneficiaryName: '',
    household: '',
    dueDate: new Date().toISOString().split('T')[0],
    priority: 'NORMAL',
    instructions: ''
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const [taskRes, workerRes] = await Promise.all([api.getTasks({ status: 'ALL' }), api.getWorkers()]);
      setTasks(taskRes.tasks || []);
      const workerList = workerRes.workers || [];
      setWorkers(workerList);
      if (workerList.length && !taskForm.workerId) {
        setTaskForm(prev => ({ ...prev, workerId: workerList[0].workerId, workerName: workerList[0].name }));
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to load tasks from the server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!taskForm.title || !taskForm.workerId) return;
    try {
      setSaving(true);
      await api.createTask(taskForm);
      setIsModalOpen(false);
      setTaskForm(prev => ({
        ...prev,
        title: '',
        beneficiaryName: '',
        household: '',
        instructions: '',
        priority: 'NORMAL'
      }));
      loadData();
    } catch (err) {
      alert(err.message || 'Failed to create task');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (task, newStatus) => {
    try {
      await api.updateTaskStatus(task._id, newStatus);
      setTasks(prev => prev.map(t => (t._id === task._id ? { ...t, status: newStatus } : t)));
    } catch (err) {
      alert(err.message || 'Failed to update task status');
    }
  };

  const handleDelete = async (task) => {
    if (!window.confirm(`Permanently delete task "${task.title}"? This removes it from the database. This cannot be undone.`)) {
      return;
    }
    try {
      setDeletingId(task._id);
      await api.deleteTask(task._id);
      setTasks(prev => prev.filter(t => t._id !== task._id));
    } catch (err) {
      alert(err.message || 'Failed to delete task');
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (displayStatus(status)) {
      case 'Completed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Overdue':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'Pending':
      default:
        return 'bg-amber-100 text-amber-800 border-amber-200';
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Field Task Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Delegate, assign, and track frontline tasks across all sector ASHA workers
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create Task</span>
        </button>
      </div>

      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold px-4 py-3 rounded-xl">
          {errorMsg}
        </div>
      )}

      {/* Tasks Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400 font-semibold">Loading tasks...</div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Task Title</th>
                  <th className="py-3.5 px-4">Assigned Worker</th>
                  <th className="py-3.5 px-4">Beneficiary / Area</th>
                  <th className="py-3.5 px-4">Due Date</th>
                  <th className="py-3.5 px-4">Priority</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Update Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {tasks.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400 text-xs font-semibold">
                      No tasks found.
                    </td>
                  </tr>
                ) : (
                  tasks.map((tsk) => (
                    <tr key={tsk._id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{tsk.title}</div>
                        <div className="text-[11px] text-slate-500 line-clamp-1">{tsk.instructions || tsk.description}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 font-semibold">{tsk.workerName || tsk.workerId}</td>
                      <td className="py-3.5 px-4 text-slate-600">{tsk.beneficiaryName || '-'} {tsk.household ? `• ${tsk.household}` : ''}</td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">{tsk.dueDate}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          (tsk.priority || '').toUpperCase() === 'URGENT' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {tsk.priority}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${getStatusBadge(tsk.status)}`}>
                          {displayStatus(tsk.status)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <select
                          value={(tsk.status || 'PENDING').toUpperCase()}
                          onChange={(e) => handleStatusChange(tsk, e.target.value)}
                          className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 cursor-pointer"
                        >
                          <option value="PENDING">Pending</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="COMPLETED">Completed</option>
                          <option value="OVERDUE">Overdue</option>
                        </select>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleDelete(tsk)}
                          disabled={deletingId === tsk._id}
                          title="Delete permanently"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-40"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="max-w-lg w-full bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h2 className="text-base font-black text-slate-900">Create Task</h2>
                <p className="text-xs text-slate-500">Will immediately notify the assigned worker</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  placeholder="e.g. Conduct Hb test on Sita Patil"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Assign ASHA Worker</label>
                  <select
                    value={taskForm.workerId}
                    onChange={(e) => {
                      const sel = workers.find(w => w.workerId === e.target.value);
                      setTaskForm({ ...taskForm, workerId: sel.workerId, workerName: sel.name });
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                  >
                    {workers.map(w => (
                      <option key={w.workerId} value={w.workerId}>{w.name} ({w.assignedVillage})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={taskForm.dueDate}
                    onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Beneficiary / Household</label>
                <input
                  type="text"
                  value={taskForm.beneficiaryName}
                  onChange={(e) => setTaskForm({ ...taskForm, beneficiaryName: e.target.value })}
                  placeholder="e.g. Sita Patil (House 12)"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Priority</label>
                <div className="flex items-center gap-4">
                  {['NORMAL', 'URGENT'].map(p => (
                    <label key={p} className="flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer">
                      <input
                        type="radio"
                        checked={taskForm.priority === p}
                        onChange={() => setTaskForm({ ...taskForm, priority: p })}
                        className="text-blue-600"
                      />
                      <span>{p === 'NORMAL' ? 'Normal' : 'Urgent'}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Instructions</label>
                <textarea
                  rows={2}
                  value={taskForm.instructions}
                  onChange={(e) => setTaskForm({ ...taskForm, instructions: e.target.value })}
                  placeholder="Special clinical advice or instructions..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Assign Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
