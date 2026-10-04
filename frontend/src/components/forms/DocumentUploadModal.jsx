import React, { useState } from 'react';
import { X, Camera, UploadCloud, FileText, Image as ImageIcon } from 'lucide-react';
import { api } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';

export default function DocumentUploadModal({ isOpen, onClose, onSuccess, targetType = 'pregnancy', targetId = '' }) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('HEALTH_CARD');

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      if (!title) {
        setTitle(selected.name.replace(/\.[^/.]+$/, ''));
      }
      if (selected.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result);
        };
        reader.readAsDataURL(selected);
      } else {
        setPreview(null);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !targetId) {
      alert('Please select a file or take a photo');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('document', file);
    formData.append('title', title || file.name);
    formData.append('category', category);

    try {
      if (targetType === 'pregnancy') {
        await api.uploadPregnancyDoc(targetId, formData);
      } else if (targetType === 'child') {
        await api.uploadChildDoc(targetId, formData);
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      alert(err.message || 'Failed to upload document');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Upload Photo / Health Document</h3>
              <p className="text-xs text-slate-500">Capture with camera or upload from device</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-4 overflow-y-auto pr-1 flex-1">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Document Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. MCP Card Front Page, USG Report"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Document Category
            </label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="HEALTH_CARD">MCP / Mother & Child Protection Card</option>
              <option value="IMMUNIZATION_CARD">Immunization Card</option>
              <option value="USG_SCAN">Ultrasound USG Scan Report</option>
              <option value="BLOOD_TEST">Pathology / Blood Test Report</option>
              <option value="REFERRAL_SLIP">Referral Document / Prescription</option>
              <option value="BIRTH_CERTIFICATE">Birth Registration Certificate</option>
              <option value="OTHER">Other Health Document</option>
            </select>
          </div>

          {/* File Picker / Camera Button */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Capture or Choose File *
            </label>
            
            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-4 text-center hover:bg-slate-50 transition-colors cursor-pointer relative">
              <input
                type="file"
                accept="image/*,application/pdf"
                capture="environment"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              {preview ? (
                <div className="space-y-2">
                  <img src={preview} alt="Preview" className="max-h-40 mx-auto rounded-xl shadow-sm object-cover" />
                  <p className="text-xs font-bold text-emerald-600">Photo selected (Tap to change)</p>
                </div>
              ) : file ? (
                <div className="flex flex-col items-center gap-1.5 py-2">
                  <FileText className="w-8 h-8 text-blue-600" />
                  <span className="text-xs font-bold text-slate-800">{file.name}</span>
                  <span className="text-[10px] text-slate-500">{(file.size / 1024).toFixed(1)} KB</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 py-4">
                  <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Camera className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-blue-700 block">Take Photo or Browse</span>
                    <span className="text-[10px] text-slate-500">Supports JPG, PNG, WebP, PDF</span>
                  </div>
                </div>
              )}
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
              disabled={loading || !file}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-200 disabled:opacity-50 flex items-center gap-1.5"
            >
              <UploadCloud className="w-4 h-4" />
              <span>{loading ? 'Uploading...' : 'Save Document'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
