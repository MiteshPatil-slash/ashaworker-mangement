import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../../../services/api';
import { useLanguage } from '../../../context/LanguageContext';
import {
  ChevronLeft,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Check
} from 'lucide-react';

export default function RecordVisitWizard() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const beneficiaryId = searchParams.get('beneficiaryId') || '';
  const beneficiaryName = searchParams.get('name') || '';

  const [currentStep, setCurrentStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [visitData, setVisitData] = useState({
    visitType: 'ROUTINE',
    scheduledDate: new Date().toISOString().split('T')[0],
    scheduledTime: '10:00 AM',
    location: '',
    bloodPressure: '',
    weightKg: '',
    temperature: '',
    observations: '',
    remarks: '',
    followUpRequired: false,
    nextFollowUpDate: ''
  });

  const steps = [
    { number: 1, label: t('visit.step1', 'Basic Info') },
    { number: 2, label: t('visit.step2', 'Health Checks') },
    { number: 3, label: t('visit.step3', 'Notes & Follow-up') },
    { number: 4, label: t('visit.step4', 'Review') }
  ];

  const update = (field, value) => setVisitData(prev => ({ ...prev, [field]: value }));

  const handleNext = () => setCurrentStep(s => Math.min(s + 1, 4));
  const handleBack = () => setCurrentStep(s => Math.max(s - 1, 1));

  const handleSubmit = async () => {
    if (!beneficiaryName) {
      setError('No beneficiary selected for this visit.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const scheduleRes = await api.scheduleVisit({
        beneficiaryName,
        visitType: visitData.visitType,
        scheduledDate: visitData.scheduledDate,
        scheduledTime: visitData.scheduledTime,
        location: visitData.location,
        priority: 'NORMAL'
      });

      const visitId = scheduleRes.visit._id;

      await api.recordVisit(visitId, {
        observations: visitData.observations,
        remarks: visitData.remarks,
        nextFollowUpDate: visitData.followUpRequired ? visitData.nextFollowUpDate : null,
        bloodPressure: visitData.bloodPressure,
        weightKg: visitData.weightKg,
        temperature: visitData.temperature,
        servicesProvided: []
      });

      if (beneficiaryId) {
        const type = searchParams.get('type');
        navigate(`/beneficiaries/${beneficiaryId}?type=${type || ''}&tab=visits`);
      } else {
        navigate('/visits');
      }
    } catch (err) {
      setError(err.message || 'Failed to save visit');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <button
          onClick={() => navigate(-1)}
          className="hover:text-blue-600 flex items-center gap-1 cursor-pointer"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>
        <span>&gt;</span>
        <span className="text-slate-900 font-bold">Record Visit{beneficiaryName ? `: ${beneficiaryName}` : ''}</span>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between">
          {steps.map((s, i) => (
            <React.Fragment key={s.number}>
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                    currentStep > s.number
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : currentStep === s.number
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'bg-white border-slate-200 text-slate-400'
                  }`}
                >
                  {currentStep > s.number ? <Check className="w-4 h-4" /> : s.number}
                </div>
                <span className={`text-[10px] font-bold ${currentStep === s.number ? 'text-blue-600' : 'text-slate-400'}`}>
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-1 ${currentStep > s.number ? 'bg-emerald-500' : 'bg-slate-200'}`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
        {currentStep === 1 && (
          <div className="space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900">Basic Visit Info</h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Visit Type *</label>
              <select
                value={visitData.visitType}
                onChange={(e) => update('visitType', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm"
              >
                <option value="ROUTINE">Routine Check-up</option>
                <option value="ANC">Antenatal Care</option>
                <option value="PNC">Postnatal Care</option>
                <option value="IMMUNIZATION">Immunization</option>
                <option value="HEALTH_ISSUE">Health Issue Follow-up</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Visit Date *</label>
                <input
                  type="date"
                  value={visitData.scheduledDate}
                  onChange={(e) => update('scheduledDate', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Time</label>
                <input
                  type="text"
                  value={visitData.scheduledTime}
                  onChange={(e) => update('scheduledTime', e.target.value)}
                  placeholder="e.g. 10:00 AM"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Location / Address</label>
              <input
                type="text"
                value={visitData.location}
                onChange={(e) => update('location', e.target.value)}
                placeholder="Household or landmark"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm"
              />
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900">Health Checks</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Blood Pressure</label>
                <input
                  type="text"
                  value={visitData.bloodPressure}
                  onChange={(e) => update('bloodPressure', e.target.value)}
                  placeholder="e.g. 120/80"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Weight (kg)</label>
                <input
                  type="number"
                  value={visitData.weightKg}
                  onChange={(e) => update('weightKg', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Temperature (°F)</label>
                <input
                  type="text"
                  value={visitData.temperature}
                  onChange={(e) => update('temperature', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900">Notes & Follow-up</h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Observations</label>
              <textarea
                rows={3}
                value={visitData.observations}
                onChange={(e) => update('observations', e.target.value)}
                placeholder="What did you observe during this visit?"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Remarks</label>
              <textarea
                rows={2}
                value={visitData.remarks}
                onChange={(e) => update('remarks', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm"
              />
            </div>

            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={visitData.followUpRequired}
                onChange={(e) => update('followUpRequired', e.target.checked)}
              />
              Schedule a follow-up visit
            </label>

            {visitData.followUpRequired && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Follow-up Date</label>
                <input
                  type="date"
                  value={visitData.nextFollowUpDate}
                  onChange={(e) => update('nextFollowUpDate', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  This will automatically create a pending visit and a task for that date.
                </p>
              </div>
            )}
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Review & Confirm
            </h3>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 text-xs">
              <div><strong>Beneficiary:</strong> {beneficiaryName || '-'}</div>
              <div><strong>Visit Type:</strong> {visitData.visitType}</div>
              <div><strong>Date:</strong> {visitData.scheduledDate} at {visitData.scheduledTime}</div>
              <div><strong>BP / Weight / Temp:</strong> {visitData.bloodPressure || '-'} / {visitData.weightKg || '-'} kg / {visitData.temperature || '-'}</div>
              <div><strong>Observations:</strong> {visitData.observations || '-'}</div>
              {visitData.followUpRequired && (
                <div><strong>Follow-up:</strong> {visitData.nextFollowUpDate}</div>
              )}
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            className="px-5 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-colors disabled:opacity-40 cursor-pointer"
          >
            Back
          </button>

          {currentStep < 4 ? (
            <button
              onClick={handleNext}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-2 cursor-pointer"
            >
              <span>Next</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Visit'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}