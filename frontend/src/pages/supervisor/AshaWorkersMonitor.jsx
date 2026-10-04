import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import {
  Users,
  Search,
  Plus,
  ClipboardList,
  MessageSquare,
  CheckCircle2,
  MapPin,
  Calendar,
  X,
  Eye,
  AlertCircle
} from 'lucide-react';

export default function AshaWorkersMonitor() {
  const { workers, createTask, tasks, visits } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [villageFilter, setVillageFilter] = useState('All');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState(null);

  const [taskForm, setTaskForm] = useState({
    title: '',
    workerId: 'ASHA-101',
    workerName: 'Sunita Patil',
    beneficiaryName: 'Sita Patil',
    household: 'House 12, Rampur',
    dueDate: '2026-09-22',
    priority: 'Urgent',
    instructions: 'Re-test hemoglobin and check blood pressure reading.'
  });

  const handleOpenAssignTask = (worker) => {
    setSelectedWorker(worker);
    setTaskForm({
      ...taskForm,
      workerId: worker.id,
      workerName: worker.name,
      household: `${worker.village} Field Sector`
    });
    setIsTaskModalOpen(true);
  };

  const handleCreateTask = (e) => {
    e.preventDefault();
    createTask(taskForm);
    setIsTaskModalOpen(false);
  };

  const filteredWorkers = workers.filter(w => {
    if (villageFilter !== 'All' && w.village !== villageFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return w.name.toLowerCase().includes(q) || w.village.toLowerCase().includes(q) || w.id.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header matching Screen 17 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            ASHA Workers Monitoring
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Sector supervision, field visits tracking, and task delegation
          </p>
        </div>

        <button
          onClick={() => handleOpenAssignTask(workers[0])}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <ClipboardList className="w-4 h-4" />
          <span>Assign New Task</span>
        </button>
      </div>

      {/* Table Card matching Screen 17 */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Search & Village Filter */}
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ASHA worker by name, ID or phone..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-semibold whitespace-nowrap">Village Filter:</span>
            <select
              value={villageFilter}
              onChange={(e) => setVillageFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
            >
              <option value="All">All Villages</option>
              <option value="Rampur">Rampur</option>
              <option value="Bhagwan">Bhagwan</option>
              <option value="Shirpur">Shirpur</option>
              <option value="Kalapur">Kalapur</option>
            </select>
          </div>
        </div>

        {/* Table strictly matching Screen 17 */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px]">
              <tr>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Village</th>
                <th className="py-3 px-4">Total Visits</th>
                <th className="py-3 px-4">Active Cases</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredWorkers.map((w) => (
                <tr key={w.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-extrabold flex items-center justify-center">
                        {w.name[0]}
                      </div>
                      <div>
                        <div>{w.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">ID: {w.id} • {w.phone}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-700">{w.village}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">{w.totalVisits}</td>
                  <td className="py-3.5 px-4 text-slate-600">{w.activeBeneficiaries} beneficiaries</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                      w.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {w.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenAssignTask(w)}
                        className="px-2.5 py-1 text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-lg flex items-center gap-1 cursor-pointer"
                        title="Assign specific task"
                      >
                        <ClipboardList className="w-3.5 h-3.5" />
                        <span>Assign Task</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assign Task Modal */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="max-w-lg w-full bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h2 className="text-base font-black text-slate-900">Assign Field Task</h2>
                <p className="text-xs text-slate-500">Task will appear on the ASHA Worker's Dashboard</p>
              </div>
              <button
                onClick={() => setIsTaskModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  placeholder="e.g. Verify ANC 3rd Trimester Hemoglobin"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ASHA Worker</label>
                  <select
                    value={taskForm.workerId}
                    onChange={(e) => {
                      const sel = workers.find(w => w.id === e.target.value);
                      setTaskForm({ ...taskForm, workerId: sel.id, workerName: sel.name });
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                  >
                    {workers.map(w => (
                      <option key={w.id} value={w.id}>{w.name} ({w.village})</option>
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
                  placeholder="Patient name or house number"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Priority</label>
                <div className="flex items-center gap-4">
                  {['Normal', 'Urgent'].map(pr => (
                    <label key={pr} className="flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer">
                      <input
                        type="radio"
                        checked={taskForm.priority === pr}
                        onChange={() => setTaskForm({ ...taskForm, priority: pr })}
                        className="text-blue-600"
                      />
                      <span>{pr}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Instructions</label>
                <textarea
                  rows={3}
                  value={taskForm.instructions}
                  onChange={(e) => setTaskForm({ ...taskForm, instructions: e.target.value })}
                  placeholder="Special instructions or clinical guidance..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsTaskModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20"
                >
                  Assign Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
