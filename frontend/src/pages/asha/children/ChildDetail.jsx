import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../../services/api';
import { useLanguage } from '../../../context/LanguageContext';
import GrowthChart from '../../../components/charts/GrowthChart';
import DocumentUploadModal from '../../../components/forms/DocumentUploadModal';
import {
  Baby,
  ArrowLeft,
  Calendar,
  ShieldCheck,
  Activity,
  FileText,
  Plus,
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink,
  Camera
} from 'lucide-react';

export default function ChildDetail() {
  const { id } = useParams();
  const { t } = useLanguage();

  const [child, setChild] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [docModalOpen, setDocModalOpen] = useState(false);
  const [growthModalOpen, setGrowthModalOpen] = useState(false);
  const [vaccineModalOpen, setVaccineModalOpen] = useState(false);
  const [selectedVaccineCode, setSelectedVaccineCode] = useState('');

  // Growth Form
  const [growthForm, setGrowthForm] = useState({
    date: new Date().toISOString().split('T')[0],
    weightKg: '',
    heightCm: '',
    muacCm: '',
    notes: 'Routine growth monitoring'
  });

  // Vaccine Form
  const [vaccineForm, setVaccineForm] = useState({
    vaccineCode: '',
    givenDate: new Date().toISOString().split('T')[0],
    batchNo: 'BATCH-' + Math.floor(1000 + Math.random() * 9000),
    givenBy: '',
    remarks: 'Administered during session'
  });

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const res = await api.getChildById(id);
      if (res.success) {
        setChild(res.child);
      }
    } catch (err) {
      console.error('Failed to load child detail:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const handleGrowthSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.addGrowth(id, growthForm);
      setGrowthModalOpen(false);
      fetchDetail();
    } catch (err) {
      alert(err.message || 'Failed to record growth measurement');
    }
  };

  const handleOpenVaccineModal = (code) => {
    setSelectedVaccineCode(code);
    setVaccineForm(prev => ({ ...prev, vaccineCode: code }));
    setVaccineModalOpen(true);
  };

  const handleVaccineSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.recordVaccine(id, vaccineForm);
      setVaccineModalOpen(false);
      fetchDetail();
    } catch (err) {
      alert(err.message || 'Failed to record vaccine');
    }
  };

  if (loading || !child) {
    return <div className="p-12 text-center text-xs text-slate-400">{t('common.loading')}</div>;
  }

  const vaccineSchedule = child.vaccineSchedule || [];
  const growthRecords = child.growthRecords || [];
  const documents = child.documents || [];

  return (
    <div className="space-y-6 pb-20 lg:pb-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
      
      {/* Back button & Action Bar */}
      <div className="flex items-center justify-between">
        <Link
          to="/children"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white px-3 py-1.5 rounded-xl border border-slate-200"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Child List</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setGrowthModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
          >
            <Activity className="w-4 h-4" />
            <span>Record Growth</span>
          </button>
          <button
            type="button"
            onClick={() => setDocModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
          >
            <Camera className="w-4 h-4" />
            <span>Attach Document</span>
          </button>
        </div>
      </div>

      {/* Child Profile Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-14 h-14 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
              <Baby className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold text-slate-900">{child.childName}</h1>
                <span className="text-xs font-mono font-bold bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-lg border border-blue-200">
                  {child.childId}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                DOB: <strong className="text-slate-700">{child.dateOfBirth}</strong> ({child.gender}) | Mother: <strong className="text-slate-700">{child.motherName}</strong> | Father: {child.fatherName}
              </p>
              <p className="text-xs text-slate-500">
                Family ID: <strong className="text-slate-700">{child.familyId}</strong> | Place of Birth: {child.placeOfBirth} ({child.deliveryType})
              </p>
            </div>
          </div>

          <div className="bg-blue-50/70 p-3.5 rounded-2xl border border-blue-100 flex items-center gap-4 self-start md:self-center">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Current Age</span>
              <span className="text-base font-extrabold text-blue-900">{child.age}</span>
            </div>
            <div className="pl-4 border-l border-blue-200">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Birth Weight</span>
              <span className="text-base font-extrabold text-slate-900">{child.birthWeightKg || 'N/A'} kg</span>
            </div>
          </div>
        </div>
      </div>

      {/* NATIONAL IMMUNIZATION SCHEDULE (NIS) CHECKLIST */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">{t('child.vaccineSchedule')}</h3>
            <p className="text-xs text-slate-500">Universal Immunization Programme schedule based on DOB</p>
          </div>
        </div>

        <div className="space-y-2.5">
          {vaccineSchedule.map((vaccine) => {
            const isCompleted = vaccine.status === 'COMPLETED';
            const isOverdue = vaccine.status === 'OVERDUE';
            const isDue = vaccine.status === 'DUE';

            return (
              <div
                key={vaccine.code}
                className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isCompleted
                    ? 'bg-emerald-50/40 border-emerald-200'
                    : isOverdue
                    ? 'bg-rose-50/50 border-rose-200'
                    : isDue
                    ? 'bg-amber-50/50 border-amber-200'
                    : 'bg-slate-50/50 border-slate-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : isOverdue ? (
                      <AlertCircle className="w-5 h-5 text-rose-600" />
                    ) : (
                      <Clock className="w-5 h-5 text-amber-500" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900">{vaccine.name}</h4>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        isCompleted
                          ? 'bg-emerald-100 text-emerald-800'
                          : isOverdue
                          ? 'bg-rose-100 text-rose-800'
                          : isDue
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}>
                        {vaccine.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Protects against: <strong>{vaccine.disease}</strong> | Age: {vaccine.dueAgeLabel} | Due Date: <strong>{vaccine.dueDate}</strong>
                    </p>
                    {isCompleted && (
                      <p className="text-[11px] text-emerald-700 mt-1">
                        Given on: <strong>{vaccine.completedDate}</strong> (Batch: {vaccine.batchNo})
                      </p>
                    )}
                  </div>
                </div>

                <div className="self-end sm:self-center">
                  {!isCompleted && (
                    <button
                      type="button"
                      onClick={() => handleOpenVaccineModal(vaccine.code)}
                      className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm"
                    >
                      Record Dose Given
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* WHO GROWTH MONITORING SECTION */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">{t('child.growthTracker')}</h3>
            <p className="text-xs text-slate-500">Weight & Height progression curve across visits</p>
          </div>
          <button
            type="button"
            onClick={() => setGrowthModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 shadow-sm flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t('child.addGrowth')}</span>
          </button>
        </div>

        <GrowthChart growthRecords={growthRecords} />
      </div>

      {/* ATTACHED IMMUNIZATION & HEALTH DOCUMENTS */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            <span>Immunization Card Photos & Documents ({documents.length})</span>
          </h3>
          <button
            type="button"
            onClick={() => setDocModalOpen(true)}
            className="text-xs font-bold text-blue-600 hover:text-blue-700"
          >
            + Upload Photo
          </button>
        </div>

        {documents.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">No documents attached yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {documents.map((doc, i) => (
              <div key={i} className="p-3 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">{doc.title}</span>
                  <span className="text-[10px] text-slate-500">{doc.category}</span>
                </div>
                {doc.url && doc.mimetype?.startsWith('image/') && (
                      <img src={doc.url} alt={doc.title} className="w-12 h-12 rounded-lg object-cover border border-slate-200 mr-2" />
                    )}
                {doc.url && (
                  <a
                    href={doc.url}
                    download={doc.originalName || doc.title}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg text-xs font-bold flex items-center gap-1"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>View</span>
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Record Vaccine Modal */}
      {vaccineModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="text-base font-bold text-slate-900 mb-3">Record Vaccine Administration</h3>
            <form onSubmit={handleVaccineSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Vaccine Code</label>
                <input
                  type="text"
                  readOnly
                  value={vaccineForm.vaccineCode}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Date Administered</label>
                  <input
                    type="date"
                    required
                    value={vaccineForm.givenDate}
                    onChange={e => setVaccineForm({ ...vaccineForm, givenDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Batch Number</label>
                  <input
                    type="text"
                    required
                    value={vaccineForm.batchNo}
                    onChange={e => setVaccineForm({ ...vaccineForm, batchNo: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Administered By (ANM / ASHA / Nurse)</label>
                <input
                  type="text"
                  value={vaccineForm.givenBy}
                  onChange={e => setVaccineForm({ ...vaccineForm, givenBy: e.target.value })}
                  placeholder="e.g. ANM Vandana at VHND"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setVaccineModalOpen(false)}
                  className="px-3 py-2 rounded-xl border border-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold"
                >
                  Confirm Vaccine Given
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Growth Modal */}
      {growthModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="text-base font-bold text-slate-900 mb-3">Record Child Growth Measurement</h3>
            <form onSubmit={handleGrowthSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={growthForm.date}
                    onChange={e => setGrowthForm({ ...growthForm, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Weight (kg) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={growthForm.weightKg}
                    onChange={e => setGrowthForm({ ...growthForm, weightKg: e.target.value })}
                    placeholder="e.g. 6.2"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Height / Length (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={growthForm.heightCm}
                    onChange={e => setGrowthForm({ ...growthForm, heightCm: e.target.value })}
                    placeholder="e.g. 62"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">MUAC Arm Circ (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={growthForm.muacCm}
                    onChange={e => setGrowthForm({ ...growthForm, muacCm: e.target.value })}
                    placeholder="e.g. 13.5"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Observations & Feeding Notes</label>
                <input
                  type="text"
                  value={growthForm.notes}
                  onChange={e => setGrowthForm({ ...growthForm, notes: e.target.value })}
                  placeholder="Exclusive breastfeeding, active, etc."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setGrowthModalOpen(false)}
                  className="px-3 py-2 rounded-xl border border-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold"
                >
                  Save Measurement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Document Upload Modal */}
      <DocumentUploadModal
        isOpen={docModalOpen}
        onClose={() => setDocModalOpen(false)}
        onSuccess={fetchDetail}
        targetType="child"
        targetId={child._id}
      />

    </div>
  );
}
