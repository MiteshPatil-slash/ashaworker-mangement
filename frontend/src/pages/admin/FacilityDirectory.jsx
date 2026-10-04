import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import FacilityMap from '../../components/maps/FacilityMap';
import {
  Hospital,
  Search,
  Plus,
  Phone,
  Clock,
  MapPin,
  X,
  Building2,
  ShieldAlert
} from 'lucide-react';

export default function FacilityDirectory() {
  const { t } = useLanguage();
  const [facilities, setFacilities] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const [form, setForm] = useState({
    name: '',
    type: 'PHC',
    address: '',
    contactNumber: '',
    emergencyNumber: '108',
    doctorInCharge: '',
    services: ['24x7 Emergency', 'Delivery Care', 'Immunization'],
    operatingHours: '24 Hours'
  });

  const fetchFacilities = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;

      const res = await api.getFacilities(params);
      if (res.success) {
        setFacilities(res.facilities || []);
      }
    } catch (err) {
      console.error('Failed to load facilities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacilities();
  }, []);

  const handleCreateFacility = async (e) => {
    e.preventDefault();
    try {
      await api.addFacility(form);
      setModalOpen(false);
      setForm({
        name: '',
        type: 'PHC',
        address: '',
        contactNumber: '',
        emergencyNumber: '108',
        doctorInCharge: '',
        services: ['24x7 Emergency', 'Delivery Care', 'Immunization'],
        operatingHours: '24 Hours'
      });
      fetchFacilities();
    } catch (err) {
      alert(err.message || 'Failed to add facility');
    }
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-blue-700/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full">
              Infrastructure
            </span>
            <span className="text-blue-100 text-xs">Public Health Network Directory</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Health Facility & Hospital Directory
          </h1>
          <p className="text-blue-100 text-xs sm:text-sm mt-1 max-w-xl">
            Authorized directory of District Hospitals, CHCs, PHCs, and Sub-Centres for emergency referral and delivery routing.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="px-5 py-3 rounded-2xl bg-white text-blue-900 font-bold text-xs shadow-lg hover:bg-blue-50 transition-all flex items-center gap-2 self-start md:self-center touch-press"
        >
          <Plus className="w-4 h-4" />
          <span>Add Health Facility</span>
        </button>
      </div>

      {/* Interactive Facility Map */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-emerald-600" />
          <span>Geographic Facility Locator (OpenStreetMap)</span>
        </h3>
        <FacilityMap facilities={facilities} />
      </div>

      {/* Facilities Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {facilities.map((fac) => (
          <div
            key={fac._id || fac.id}
            className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h3 className="text-base font-bold text-slate-900">{fac.name}</h3>
                  <span className="text-xs text-slate-500">{fac.doctorInCharge}</span>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200 uppercase">
                  {fac.type}
                </span>
              </div>

              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 mt-2 space-y-1 text-xs">
                <div className="flex items-center gap-1.5 text-slate-700">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{fac.address}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-700">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Hours: {fac.operatingHours}</span>
                </div>
              </div>

              {/* Services Badges */}
              {fac.services && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {fac.services.map((s, idx) => (
                    <span key={idx} className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <a
                href={`tel:${fac.contactNumber}`}
                className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{fac.contactNumber}</span>
              </a>
              <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                Emergency: {fac.emergencyNumber}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Facility Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">Add Healthcare Facility</h3>
              <button onClick={() => setModalOpen(false)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateFacility} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Facility Name *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Wardha Sub-District Hospital"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Facility Type *</label>
                  <select
                    value={form.type}
                    onChange={e => setForm({ ...form, type: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="PHC">Primary Health Centre (PHC)</option>
                    <option value="CHC">Community Health Centre (CHC)</option>
                    <option value="SUB_CENTRE">Sub-Centre</option>
                    <option value="DISTRICT_HOSPITAL">District Hospital</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Contact Phone *</label>
                  <input
                    type="tel"
                    required
                    value={form.contactNumber}
                    onChange={e => setForm({ ...form, contactNumber: e.target.value })}
                    placeholder="+91..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Doctor In-Charge</label>
                <input
                  type="text"
                  value={form.doctorInCharge}
                  onChange={e => setForm({ ...form, doctorInCharge: e.target.value })}
                  placeholder="e.g. Dr. Rajesh Verma (MBBS)"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Address / Landmark</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={e => setForm({ ...form, address: e.target.value })}
                  placeholder="Street, Town/Village"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3 py-2 rounded-xl border border-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold"
                >
                  Save Facility
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
