import React, { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import { useLanguage } from '../../../context/LanguageContext';
import DistributeMedicineModal from '../../../components/forms/DistributeMedicineModal';
import {
  Pill,
  Search,
  Plus,
  AlertTriangle,
  Clock,
  ShieldAlert,
  CheckCircle2,
  Package,
  History,
  TrendingDown,
  RefreshCw
} from 'lucide-react';

export default function MedicineDashboard() {
  const { t } = useLanguage();
  const [medicines, setMedicines] = useState([]);
  const [distributions, setDistributions] = useState([]);
  const [report, setReport] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modals
  const [distributeModalOpen, setDistributeModalOpen] = useState(false);
  const [addStockModalOpen, setAddStockModalOpen] = useState(false);

  const [newMedForm, setNewMedForm] = useState({
    medicineName: '',
    genericName: '',
    category: 'Maternal Nutrition',
    batchNo: 'BATCH-' + Math.floor(1000 + Math.random() * 9000),
    unit: 'Tablets',
    availableQuantity: 100,
    minThreshold: 40,
    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  const fetchMedicineData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;

      const [mRes, dRes, rRes] = await Promise.all([
        api.getMedicines(params),
        api.getDistributions(),
        api.getMedicineReport()
      ]);

      if (mRes.success) setMedicines(mRes.medicines || []);
      if (dRes.success) setDistributions(dRes.distributions || []);
      if (rRes.success) setReport(rRes.report);
    } catch (err) {
      console.error('Failed to load medicine data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicineData();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchMedicineData();
  };

  const handleAddStockSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.addMedicine(newMedForm);
      setAddStockModalOpen(false);
      fetchMedicineData();
    } catch (err) {
      alert(err.message || 'Failed to add medicine stock');
    }
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-700 via-purple-600 to-indigo-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-purple-700/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full">
              Section 3
            </span>
            <span className="text-purple-100 text-xs">Essential Drugs & Supply Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {t('medicines.title')}
          </h1>
          <p className="text-purple-100 text-xs sm:text-sm mt-1 max-w-xl">
            {t('medicines.subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-center">
          <button
            type="button"
            onClick={() => setAddStockModalOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Stock Item</span>
          </button>
          <button
            type="button"
            onClick={() => setDistributeModalOpen(true)}
            className="px-5 py-2.5 rounded-2xl bg-white text-purple-800 font-bold text-xs shadow-lg hover:bg-purple-50 transition-all flex items-center gap-1.5 touch-press"
          >
            <Pill className="w-4 h-4" />
            <span>{t('medicines.distribute')}</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Cataloged Items</span>
          <span className="text-xl font-extrabold text-slate-900">{medicines.length}</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-amber-500 block">Low Stock Items</span>
          <span className="text-xl font-extrabold text-amber-600">
            {medicines.filter(m => m.status === 'LOW_STOCK').length}
          </span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-rose-500 block">Expiring / Expired</span>
          <span className="text-xl font-extrabold text-rose-600">
            {medicines.filter(m => m.status === 'EXPIRING_SOON' || m.status === 'EXPIRED').length}
          </span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-emerald-600 block">Units Dispensed</span>
          <span className="text-xl font-extrabold text-emerald-700">
            {report?.summary?.totalUnitsDistributed || 0}
          </span>
        </div>
      </div>

      {/* Search & Status Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search medicine name, generic salt, batch..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:outline-none text-slate-700 w-full sm:w-auto font-medium"
          >
            <option value="">All Inventory Statuses</option>
            <option value="AVAILABLE">🟢 Available in Stock</option>
            <option value="LOW_STOCK">🟡 Low Stock Alert</option>
            <option value="EXPIRING_SOON">⚠️ Expiring Soon</option>
            <option value="OUT_OF_STOCK">🔴 Out of Stock</option>
            <option value="EXPIRED">❌ Expired (Blocked)</option>
          </select>
        </div>
      </div>

      {/* Medicine Inventory Cards */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">{t('common.loading')}</div>
      ) : medicines.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-200">
          <Pill className="w-8 h-8 text-purple-300 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-700">{t('common.noData')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {medicines.map((med) => {
            const isLow = med.status === 'LOW_STOCK';
            const isOut = med.status === 'OUT_OF_STOCK';
            const isExpSoon = med.status === 'EXPIRING_SOON';
            const isExpired = med.status === 'EXPIRED';

            let statusBadge = (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase">
                In Stock
              </span>
            );

            if (isExpired) {
              statusBadge = (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 uppercase">
                  Expired (Blocked)
                </span>
              );
            } else if (isOut) {
              statusBadge = (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 uppercase">
                  Out of Stock
                </span>
              );
            } else if (isExpSoon) {
              statusBadge = (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 uppercase">
                  Expiring Soon
                </span>
              );
            } else if (isLow) {
              statusBadge = (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 uppercase">
                  Low Stock
                </span>
              );
            }

            return (
              <div
                key={med._id || med.id}
                className="bg-white p-5 rounded-3xl border border-slate-200 hover:border-purple-300 hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{med.medicineName}</h3>
                      <span className="text-xs text-slate-500">{med.genericName || med.category}</span>
                    </div>
                    {statusBadge}
                  </div>

                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 mt-2 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Available Stock:</span>
                      <strong className="text-slate-900 font-extrabold text-sm">
                        {med.availableQuantity} {med.unit || 'units'}
                      </strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Min Threshold:</span>
                      <strong className="text-slate-700">{med.minThreshold} {med.unit || 'units'}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Batch / Expiry:</span>
                      <strong className={isExpired ? 'text-rose-600 font-bold' : 'text-slate-800'}>
                        {med.batchNo} • {med.expiryDate}
                      </strong>
                    </div>
                  </div>

                  {isExpired && (
                    <p className="mt-2 text-[11px] font-bold text-rose-700 bg-rose-50 p-2 rounded-xl border border-rose-200">
                      ⚠️ Expired item is locked against field distribution.
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">{med.category}</span>
                  <button
                    type="button"
                    disabled={isExpired || med.availableQuantity <= 0}
                    onClick={() => setDistributeModalOpen(true)}
                    className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white text-xs font-bold shadow-sm"
                  >
                    Dispense
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* DISTRIBUTION AUDIT LOGS TABLE */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recent Distribution History</h3>
            <p className="text-xs text-slate-500">Record of medicines issued to village beneficiaries</p>
          </div>
        </div>

        {distributions.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">No medicine distributions recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase font-bold text-[10px]">
                  <th className="pb-2.5">Date</th>
                  <th className="pb-2.5">Medicine</th>
                  <th className="pb-2.5">Quantity</th>
                  <th className="pb-2.5">Recipient</th>
                  <th className="pb-2.5">Category</th>
                  <th className="pb-2.5">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {distributions.slice(0, 10).map((d) => (
                  <tr key={d._id || d.id} className="hover:bg-slate-50">
                    <td className="py-2.5 font-bold text-slate-700">{d.date}</td>
                    <td className="py-2.5 font-extrabold text-slate-900">{d.medicineName}</td>
                    <td className="py-2.5 font-bold text-purple-700">{d.quantity} {d.unit}</td>
                    <td className="py-2.5 text-slate-800">{d.recipientName} ({d.familyId || 'N/A'})</td>
                    <td className="py-2.5">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md text-[10px] font-bold">
                        {d.beneficiaryType}
                      </span>
                    </td>
                    <td className="py-2.5 text-slate-500 italic max-w-xs truncate">{d.remarks || 'Standard'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Stock Modal */}
      {addStockModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="text-base font-bold text-slate-900 mb-3">Add Medicine Stock Item</h3>
            <form onSubmit={handleAddStockSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Medicine Name *</label>
                <input
                  type="text"
                  required
                  value={newMedForm.medicineName}
                  onChange={e => setNewMedForm({ ...newMedForm, medicineName: e.target.value })}
                  placeholder="e.g. Zinc Sulphate 20mg"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Generic Salt / Formula</label>
                <input
                  type="text"
                  value={newMedForm.genericName}
                  onChange={e => setNewMedForm({ ...newMedForm, genericName: e.target.value })}
                  placeholder="e.g. Dispersible Zinc Tablets"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Quantity Received *</label>
                  <input
                    type="number"
                    required
                    value={newMedForm.availableQuantity}
                    onChange={e => setNewMedForm({ ...newMedForm, availableQuantity: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Min Threshold</label>
                  <input
                    type="number"
                    value={newMedForm.minThreshold}
                    onChange={e => setNewMedForm({ ...newMedForm, minThreshold: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Batch Number</label>
                  <input
                    type="text"
                    value={newMedForm.batchNo}
                    onChange={e => setNewMedForm({ ...newMedForm, batchNo: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Expiry Date *</label>
                  <input
                    type="date"
                    required
                    value={newMedForm.expiryDate}
                    onChange={e => setNewMedForm({ ...newMedForm, expiryDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAddStockModalOpen(false)}
                  className="px-3 py-2 rounded-xl border border-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 text-white font-bold"
                >
                  Save Stock Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Distribute Modal */}
      <DistributeMedicineModal
        isOpen={distributeModalOpen}
        onClose={() => setDistributeModalOpen(false)}
        onSuccess={fetchMedicineData}
        medicines={medicines}
      />

    </div>
  );
}
