import React, { useState } from 'react';
import { api } from '../../../services/api';
import { useLanguage } from '../../../context/LanguageContext';
import { X, Camera, Trash2 } from 'lucide-react';

const MAX_IMAGE_SIDE = 1280;

// Shrinks a photo in the browser so it stays small enough to store in the database.
function compressImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read the selected image'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Selected file is not a valid image'));
      img.onload = () => {
        const scale = Math.min(1, MAX_IMAGE_SIDE / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (blob) => {
            if (!blob) return reject(new Error('Could not process the image'));
            const name = file.name.replace(/\.[^/.]+$/, '') + '.jpg';
            resolve(new File([blob], name, { type: 'image/jpeg' }));
          },
          'image/jpeg',
          0.8
        );
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

export default function AddBeneficiaryModal({ isOpen, onClose, onSuccess }) {
  const { t } = useLanguage();

  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    age: '',
    gender: 'Female',
    category: 'Pregnant Woman',
    village: 'Rampur',
    address: '',
    lmpDate: '',
    bloodGroup: 'B+',
    dateOfBirth: '',
    motherName: ''
  });

  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handlePhotoChange = async (e) => {
    const selected = e.target.files?.[0];
    e.target.value = '';
    if (!selected) return;
    if (!selected.type.startsWith('image/')) {
      setError('Please choose an image file (JPG, PNG or WebP).');
      return;
    }
    try {
      setError('');
      const compressed = await compressImage(selected);
      setPhoto(compressed);
      setPhotoPreview(URL.createObjectURL(compressed));
    } catch (err) {
      setError(err.message);
    }
  };

  const removePhoto = () => {
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhoto(null);
    setPhotoPreview('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.age) return;

    if (formData.category === 'Pregnant Woman' && !formData.lmpDate) {
      setError('LMP Date is required to register a pregnancy.');
      return;
    }
    if (formData.category === 'Child' && !formData.dateOfBirth) {
      setError('Date of Birth is required to register a child.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const familyRes = await api.createFamily({
        headOfFamily: formData.name,
        contactNumber: formData.mobile,
        address: formData.address || `${formData.village} Gavthan`,
        village: formData.village,
        category: 'General'
      });
      const familyId = familyRes.family.familyId;

      let saved;
      if (formData.category === 'Pregnant Woman') {
        const res = await api.registerPregnancy({
          womanName: formData.name,
          age: Number(formData.age),
          mobile: formData.mobile,
          address: formData.address,
          familyId,
          lmpDate: formData.lmpDate,
          bloodGroup: formData.bloodGroup
        });
        saved = res.pregnancy;
      } else if (formData.category === 'Child') {
        const res = await api.registerBirth({
          childName: formData.name,
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender,
          motherName: formData.motherName,
          familyId
        });
        saved = res.child;
      }

      // Optional photo: stored in the database against the new record
      if (photo && saved?._id) {
        const body = new FormData();
        body.append('document', photo);
        body.append('title', `${formData.name} - Photo`);
        body.append('category', 'BENEFICIARY_PHOTO');
        try {
          if (formData.category === 'Pregnant Woman') await api.uploadPregnancyDoc(saved._id, body);
          else if (formData.category === 'Child') await api.uploadChildDoc(saved._id, body);
        } catch (uploadErr) {
          alert(`Beneficiary saved, but the photo could not be uploaded: ${uploadErr.message}`);
        }
      }

      removePhoto();
      if (onSuccess) onSuccess(saved);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save beneficiary');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="max-w-xl w-full bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150">
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Beneficiaries &gt; Add Beneficiary
            </div>
            <h2 className="text-lg font-black text-slate-900 mt-0.5">
              {t('beneficiaries.addBtn', '+ Add Beneficiary')}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold px-3 py-2.5 rounded-xl">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter full name"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Mobile Number *
              </label>
              <input
                type="tel"
                required
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                placeholder="Enter mobile number"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Age *
              </label>
              <input
                type="number"
                required
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                placeholder="Enter age"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Gender *
              </label>
              <div className="flex items-center gap-4 pt-1">
                {['Female', 'Other'].map(g => (
                  <label key={g} className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      checked={formData.gender === g}
                      onChange={() => setFormData({ ...formData, gender: g })}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span>{g}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Category *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {['Pregnant Woman', 'Child', 'Elderly', 'Other'].map(cat => {
                const disabled = cat === 'Elderly' || cat === 'Other';
                return (
                  <label
                    key={cat}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      disabled
                        ? 'border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed'
                        : formData.category === cat
                          ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold cursor-pointer'
                          : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 cursor-pointer'
                    }`}
                  >
                    <input
                      type="radio"
                      name="category"
                      disabled={disabled}
                      checked={formData.category === cat}
                      onChange={() => setFormData({ ...formData, category: cat })}
                      className="sr-only"
                    />
                    <span className="text-xs">{cat}</span>
                    {disabled && <div className="text-[9px] mt-0.5">Not supported yet</div>}
                  </label>
                );
              })}
            </div>
          </div>

          {formData.category === 'Pregnant Woman' && (
            <div className="p-3 bg-pink-50/70 border border-pink-200 rounded-2xl space-y-3">
              <div className="text-xs font-bold text-pink-900">Pregnancy Details</div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">LMP Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.lmpDate}
                    onChange={(e) => setFormData({ ...formData, lmpDate: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Blood Group</label>
                  <input
                    type="text"
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                    placeholder="e.g. B+"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>
              <p className="text-[10px] text-pink-700">EDD and risk level are calculated automatically by the server.</p>
            </div>
          )}

          {formData.category === 'Child' && (
            <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-3">
              <div className="text-xs font-bold text-blue-900">Child Details</div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Date of Birth *</label>
                  <input
                    type="date"
                    required
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Mother's Name</label>
                  <input
                    type="text"
                    value={formData.motherName}
                    onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Village *
            </label>
            <select
              value={formData.village}
              onChange={(e) => setFormData({ ...formData, village: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
            >
              <option value="Rampur">Rampur</option>
              <option value="Bhagwan">Bhagwan</option>
              <option value="Kalapur">Kalapur</option>
              <option value="Shirpur">Shirpur</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Address
            </label>
            <textarea
              rows={2}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Enter household address or landmark"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Photo / Document <span className="font-normal text-slate-400">(optional)</span>
            </label>
            {photoPreview ? (
              <div className="flex items-center gap-3 p-2.5 border border-slate-200 rounded-xl bg-slate-50">
                <img src={photoPreview} alt="Selected" className="w-16 h-16 rounded-lg object-cover border border-slate-200" />
                <div className="flex-1 text-xs">
                  <div className="font-bold text-emerald-700">Photo attached</div>
                  <div className="text-slate-500">{(photo.size / 1024).toFixed(0)} KB &bull; saved with this record</div>
                </div>
                <button
                  type="button"
                  onClick={removePhoto}
                  className="p-2 rounded-lg text-rose-600 hover:bg-rose-50 cursor-pointer"
                  title="Remove photo"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex items-center justify-center gap-2 px-3.5 py-3 border-2 border-dashed border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:border-blue-300 cursor-pointer transition-colors">
                <Camera className="w-4 h-4 text-blue-600" />
                <span>Take photo or upload image</span>
                <input type="file" accept="image/*" onChange={handlePhotoChange} className="sr-only" />
              </label>
            )}
          </div>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => { removePhoto(); onClose(); }}
              className="px-5 py-2.5 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              {t('common.cancel', 'Cancel')}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Beneficiary'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}