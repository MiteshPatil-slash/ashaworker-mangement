import React, { useState } from 'react';
import { X, Plus, Trash2, Home, Users } from 'lucide-react';
import { api } from '../../services/api';
import { useOffline } from '../../context/OfflineContext';
import { useLanguage } from '../../context/LanguageContext';

export default function AddFamilyModal({ isOpen, onClose, onSuccess }) {
  const { queueAction, isOnline } = useOffline();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    headOfFamily: '',
    contactNumber: '',
    address: '',
    village: 'Chandrapur Sector 1',
    category: 'BPL',
    members: [{ name: '', relation: 'Self/Head', age: '', gender: 'Male' }]
  });

  if (!isOpen) return null;

  const handleAddMember = () => {
    setFormData(prev => ({
      ...prev,
      members: [...prev.members, { name: '', relation: 'Family Member', age: '', gender: 'Female' }]
    }));
  };

  const handleRemoveMember = (idx) => {
    setFormData(prev => ({
      ...prev,
      members: prev.members.filter((_, i) => i !== idx)
    }));
  };

  const handleMemberChange = (idx, field, val) => {
    const updated = [...formData.members];
    updated[idx][field] = val;
    setFormData(prev => ({ ...prev, members: updated }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.headOfFamily || !formData.address) {
      alert('Please enter head of family and address');
      return;
    }

    setLoading(true);
    try {
      if (isOnline) {
        await api.createFamily(formData);
      } else {
        await queueAction('CREATE_FAMILY', formData);
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      alert(err.message || 'Failed to register family');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Home className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Register New Family</h3>
              <p className="text-xs text-slate-500">Creates a unified Family ID for household tracking</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-4 overflow-y-auto pr-1 flex-1">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Head of Family Name *
            </label>
            <input
              type="text"
              required
              value={formData.headOfFamily}
              onChange={e => setFormData({ ...formData, headOfFamily: e.target.value })}
              placeholder="e.g. Ramesh Patil"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Contact Number
              </label>
              <input
                type="tel"
                value={formData.contactNumber}
                onChange={e => setFormData({ ...formData, contactNumber: e.target.value })}
                placeholder="10-digit mobile"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Socio-Economic Category
              </label>
              <select
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="BPL">BPL (Below Poverty Line)</option>
                <option value="APL">APL (Above Poverty Line)</option>
                <option value="AAY">Antyodaya (AAY)</option>
                <option value="General">General</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Village / Ward Sector *
            </label>
            <input
              type="text"
              required
              value={formData.village}
              onChange={e => setFormData({ ...formData, village: e.target.value })}
              placeholder="e.g. Chandrapur Sector 1"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Full Address / House Landmarks *
            </label>
            <input
              type="text"
              required
              value={formData.address}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
              placeholder="House #, Street name, Landmark"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Members List */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                <span>Family Members ({formData.members.length})</span>
              </label>
              <button
                type="button"
                onClick={handleAddMember}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Member</span>
              </button>
            </div>

            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {formData.members.map((member, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
                  <input
                    type="text"
                    placeholder="Member Name"
                    value={member.name}
                    onChange={e => handleMemberChange(idx, 'name', e.target.value)}
                    className="flex-1 px-2.5 py-1.5 text-xs bg-white rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <input
                    type="text"
                    placeholder="Relation"
                    value={member.relation}
                    onChange={e => handleMemberChange(idx, 'relation', e.target.value)}
                    className="w-24 px-2 py-1.5 text-xs bg-white rounded-lg border border-slate-200 focus:outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Age"
                    value={member.age}
                    onChange={e => handleMemberChange(idx, 'age', e.target.value)}
                    className="w-14 px-2 py-1.5 text-xs bg-white rounded-lg border border-slate-200 focus:outline-none"
                  />
                  {formData.members.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(idx)}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-200 disabled:opacity-50"
            >
              {loading ? 'Registering...' : 'Save Family'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
