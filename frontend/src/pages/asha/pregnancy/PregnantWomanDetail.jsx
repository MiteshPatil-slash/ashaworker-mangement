import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../../../services/api';
import { useLanguage } from '../../../context/LanguageContext';
import PriorityBadge from '../../../components/common/PriorityBadge';
import CreateReferralModal from '../../../components/forms/CreateReferralModal';
import DocumentUploadModal from '../../../components/forms/DocumentUploadModal';
import {
  Heart,
  ArrowLeft,
  Calendar,
  Activity,
  FileText,
  Hospital,
  Camera,
  Plus,
  Clock,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Phone
} from 'lucide-react';

export default function PregnantWomanDetail() {
  const { id } = useParams();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [pregnancy, setPregnancy] = useState(null);
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [referralModalOpen, setReferralModalOpen] = useState(false);
  const [docModalOpen, setDocModalOpen] = useState(false);
  const [ancModalOpen, setAncModalOpen] = useState(false);

  // ANC Form State
  const [ancForm, setAncForm] = useState({
    code: 'ANC_1',
    date: new Date().toISOString().split('T')[0],
    weightKg: 52,
    systolicBP: 120,
    diastolicBP: 80,
    hemoglobin: 11.0,
    ttDose: 'TT-1',
    ifaDistributed: 60,
    calciumDistributed: 30,
    remarks: 'Routine ANC visit',
    nextVisitDate: ''
  });

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const [pRes, fRes] = await Promise.all([
        api.getPregnancyById(id),
        api.getFacilities()
      ]);

      if (pRes.success) {
        setPregnancy(pRes.pregnancy);
        const nextAncNum = (pRes.pregnancy.ancVisits?.length || 0) + 1;
        setAncForm(prev => ({ ...prev, code: `ANC_${nextAncNum}` }));
      }
      if (fRes.success) setFacilities(fRes.facilities || []);
    } catch (err) {
      console.error('Failed to load pregnancy detail:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const handleAddAncSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.addAncVisit(id, ancForm);
      setAncModalOpen(false);
      fetchDetail();
    } catch (err) {
      alert(err.message || 'Failed to record ANC checkup');
    }
  };

  if (loading || !pregnancy) {
    return <div className="p-12 text-center text-xs text-slate-400">{t('common.loading')}</div>;
  }

  const ancVisits = pregnancy.ancVisits || [];
  const documents = pregnancy.documents || [];
  const referrals = pregnancy.referrals || [];

  return (
    <div className="space-y-6 pb-20 lg:pb-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
      
      {/* Back button & Title Bar */}
      <div className="flex items-center justify-between">
        <Link
          to="/pregnancy"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white px-3 py-1.5 rounded-xl border border-slate-200"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Maternal List</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setReferralModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
          >
            <Hospital className="w-4 h-4" />
            <span>Refer to Facility</span>
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

      {/* Maternal Profile Header Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-start gap-3.5">
            <div className="w-14 h-14 rounded-3xl bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0">
              <Heart className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold text-slate-900">{pregnancy.womanName}</h1>
                <PriorityBadge level={pregnancy.riskLevel} />
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Age: <strong className="text-slate-700">{pregnancy.age} Yrs</strong> | Blood Group: <strong className="text-slate-700">{pregnancy.bloodGroup}</strong> | Gravida {pregnancy.gravida}, Para {pregnancy.parity}
              </p>
              <p className="text-xs text-slate-500">
                Family ID: <strong className="text-slate-700">{pregnancy.familyId}</strong> | Address: {pregnancy.address}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-rose-50/70 p-3.5 rounded-2xl border border-rose-100 self-start md:self-center">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Gestational Age</span>
              <span className="text-base font-extrabold text-rose-900">
                ~{pregnancy.gestationalWeeks} Wks {pregnancy.gestationalDays} Days
              </span>
              <span className="text-[11px] text-slate-500 block">{pregnancy.trimester}</span>
            </div>
            <div className="pl-4 border-l border-rose-200">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Expected Delivery (EDD)</span>
              <span className="text-base font-extrabold text-slate-900">{pregnancy.expectedDeliveryDate}</span>
              <span className="text-[11px] text-emerald-700 font-bold block">LMP: {pregnancy.lmpDate}</span>
            </div>
          </div>
        </div>

        {/* Clinical Protocol Alert Notice */}
        {pregnancy.riskReasons && pregnancy.riskReasons.length > 0 && pregnancy.riskLevel !== 'NORMAL' && (
          <div className="mt-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-900 flex items-start gap-2.5">
            <ShieldAlert className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-extrabold block">Administrative Protocol Alert:</span>
              <span className="font-medium">{pregnancy.riskReasons.join(' • ')}</span>
              <p className="text-[10px] text-rose-700 mt-1 italic">
                Notice: {pregnancy.clinicalAlertDisclaimer || 'Administrative alert based on national maternal protocol. Not an automated diagnosis.'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* VISUAL PREGNANCY PROGRESSION TIMELINE */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-emerald-600" />
          <span>{t('pregnancy.timelineTitle')}</span>
        </h3>

        <div className="overflow-x-auto pb-4">
          <div className="flex items-center min-w-[700px] justify-between relative px-6">
            
            {/* Horizontal connecting bar */}
            <div className="absolute top-1/2 left-8 right-8 h-1 bg-slate-200 -translate-y-1/2 z-0" />

            {/* Step 1: Registration */}
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-md">
                ✓
              </div>
              <span className="text-xs font-bold text-slate-800 mt-2">Registration</span>
              <span className="text-[10px] text-slate-500">LMP: {pregnancy.lmpDate}</span>
            </div>

            {/* Step 2: ANC 1 */}
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shadow-md ${
                ancVisits.length >= 1 ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500 border border-slate-300'
              }`}>
                {ancVisits.length >= 1 ? '✓' : '1'}
              </div>
              <span className="text-xs font-bold text-slate-800 mt-2">ANC 1</span>
              <span className="text-[10px] text-slate-500">Within 12 Wks</span>
            </div>

            {/* Step 3: ANC 2 */}
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shadow-md ${
                ancVisits.length >= 2 ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500 border border-slate-300'
              }`}>
                {ancVisits.length >= 2 ? '✓' : '2'}
              </div>
              <span className="text-xs font-bold text-slate-800 mt-2">ANC 2</span>
              <span className="text-[10px] text-slate-500">14-26 Wks (USG)</span>
            </div>

            {/* Step 4: ANC 3 */}
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shadow-md ${
                ancVisits.length >= 3 ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500 border border-slate-300'
              }`}>
                {ancVisits.length >= 3 ? '✓' : '3'}
              </div>
              <span className="text-xs font-bold text-slate-800 mt-2">ANC 3</span>
              <span className="text-[10px] text-slate-500">28-34 Wks</span>
            </div>

            {/* Step 5: ANC 4 */}
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shadow-md ${
                ancVisits.length >= 4 ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500 border border-slate-300'
              }`}>
                {ancVisits.length >= 4 ? '✓' : '4'}
              </div>
              <span className="text-xs font-bold text-slate-800 mt-2">ANC 4</span>
              <span className="text-[10px] text-slate-500">36+ Wks</span>
            </div>

            {/* Step 6: Expected Delivery / Delivery */}
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shadow-md ${
                pregnancy.status === 'DELIVERED'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-rose-100 text-rose-700 border border-rose-300'
              }`}>
                {pregnancy.status === 'DELIVERED' ? '✓' : 'EDD'}
              </div>
              <span className="text-xs font-bold text-slate-800 mt-2">Delivery</span>
              <span className="text-[10px] text-slate-500">{pregnancy.expectedDeliveryDate}</span>
            </div>

          </div>
        </div>
      </div>

      {/* ANC CHECKUPS SECTION */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">{t('pregnancy.ancHistory')}</h3>
            <p className="text-xs text-slate-500">Documented Antenatal Care checkups and vitals</p>
          </div>
          <button
            type="button"
            onClick={() => setAncModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm hover:bg-emerald-700"
          >
            <Plus className="w-4 h-4" />
            <span>{t('pregnancy.addAnc')}</span>
          </button>
        </div>

        {ancVisits.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-xs text-slate-500">
            No ANC checkups recorded yet. Tap "+ Record ANC Checkup" to add one.
          </div>
        ) : (
          <div className="space-y-3">
            {ancVisits.map((anc, idx) => (
              <div key={idx} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-extrabold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-lg">
                    {anc.code || `ANC Check-up ${idx + 1}`}
                  </span>
                  <span className="text-xs font-bold text-slate-500">{anc.date}</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs py-2 border-y border-slate-200/60 my-2">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Blood Pressure</span>
                    <strong className="text-slate-800">{anc.bloodPressure || '120/80'} mmHg</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Maternal Weight</span>
                    <strong className="text-slate-800">{anc.weightKg || 'N/A'} kg</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Hemoglobin (Hb)</span>
                    <strong className="text-slate-800">{anc.hemoglobin || 'N/A'} g/dL</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">IFA / TT Given</span>
                    <strong className="text-slate-800">{anc.ifaDistributed || 0} IFA • {anc.ttDose || 'None'}</strong>
                  </div>
                </div>

                {anc.remarks && (
                  <p className="text-xs text-slate-600 italic">
                    "{anc.remarks}"
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* HEALTH DOCUMENTS GALLERY & REFERRALS SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Attached Documents */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>Health Documents & Photos ({documents.length})</span>
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
              <p className="text-xs text-slate-400 py-6 text-center">No documents or photos attached yet.</p>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {documents.map((doc, i) => (
                  <div key={i} className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-slate-50">
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">{doc.title}</span>
                      <span className="text-[10px] text-slate-500">{doc.category} • {doc.uploadedAt?.split('T')[0]}</span>
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
        </div>

        {/* Facility Referrals */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Hospital className="w-4 h-4 text-amber-600" />
                <span>Facility Referrals ({referrals.length})</span>
              </h3>
              <button
                type="button"
                onClick={() => setReferralModalOpen(true)}
                className="text-xs font-bold text-amber-600 hover:text-amber-700"
              >
                + Create Referral
              </button>
            </div>

            {referrals.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No active hospital referrals.</p>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {referrals.map((ref, i) => (
                  <div key={i} className="p-2.5 rounded-xl border border-amber-200 bg-amber-50/50">
                    <div className="flex items-center justify-between">
                      <strong className="text-xs text-amber-900">{ref.facilityName}</strong>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 uppercase">
                        {ref.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 mt-1">{ref.reason}</p>
                    <span className="text-[10px] text-slate-500 block mt-1">Referred Date: {ref.referralDate}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Record ANC Checkup Modal */}
      {ancModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="text-base font-bold text-slate-900 mb-3">Record ANC Checkup</h3>
            <form onSubmit={handleAddAncSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Checkup Code</label>
                  <input
                    type="text"
                    value={ancForm.code}
                    onChange={e => setAncForm({ ...ancForm, code: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Date</label>
                  <input
                    type="date"
                    value={ancForm.date}
                    onChange={e => setAncForm({ ...ancForm, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Systolic BP</label>
                  <input
                    type="number"
                    value={ancForm.systolicBP}
                    onChange={e => setAncForm({ ...ancForm, systolicBP: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Diastolic BP</label>
                  <input
                    type="number"
                    value={ancForm.diastolicBP}
                    onChange={e => setAncForm({ ...ancForm, diastolicBP: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={ancForm.weightKg}
                    onChange={e => setAncForm({ ...ancForm, weightKg: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Hemoglobin (g/dL)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={ancForm.hemoglobin}
                    onChange={e => setAncForm({ ...ancForm, hemoglobin: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">IFA Tablets Given</label>
                  <input
                    type="number"
                    value={ancForm.ifaDistributed}
                    onChange={e => setAncForm({ ...ancForm, ifaDistributed: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Observations & Clinical Notes</label>
                <input
                  type="text"
                  value={ancForm.remarks}
                  onChange={e => setAncForm({ ...ancForm, remarks: e.target.value })}
                  placeholder="Fetal heart sound, diet counseling, etc."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Next Follow-up Date (Optional)</label>
                <input
                  type="date"
                  value={ancForm.nextVisitDate}
                  onChange={e => setAncForm({ ...ancForm, nextVisitDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAncModalOpen(false)}
                  className="px-3 py-2 rounded-xl border border-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold"
                >
                  Save ANC Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modals */}
      <CreateReferralModal
        isOpen={referralModalOpen}
        onClose={() => setReferralModalOpen(false)}
        onSuccess={fetchDetail}
        patient={pregnancy}
        facilities={facilities}
      />
      <DocumentUploadModal
        isOpen={docModalOpen}
        onClose={() => setDocModalOpen(false)}
        onSuccess={fetchDetail}
        targetType="pregnancy"
        targetId={pregnancy._id}
      />

    </div>
  );
}
