import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../../../services/api';
import { useLanguage } from '../../../context/LanguageContext';
import {
  Heart,
  Baby,
  Share2,
  ClipboardCheck,
  ChevronLeft,
  Activity,
  Phone,
  MapPin
} from 'lucide-react';

function mapPregnancyStatus(riskLevel) {
  if (riskLevel === 'HIGH_PRIORITY') return 'High Risk';
  if (riskLevel === 'NEEDS_FOLLOW_UP') return 'Attention';
  return 'Normal';
}

export default function BeneficiaryProfilePage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type');
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [record, setRecord] = useState(null);
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeTab, setActiveTab] = useState('Overview');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setErrorMsg('');

        if (type === 'child') {
          const res = await api.getChildById(id);
          setRecord({ ...res.child, category: 'Child' });
          setVisits(res.child.visits || []);
        } else {
          const res = await api.getPregnancyById(id);
          setRecord({ ...res.pregnancy, category: 'Pregnant Woman' });
          const visitsRes = await api.getVisits();
          const matched = (visitsRes.visits || []).filter(
            v => v.beneficiaryName === res.pregnancy.womanName
          );
          setVisits(matched);
        }
      } catch (err) {
        setErrorMsg(err.message || 'Failed to load beneficiary record');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id, type]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'High Risk':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'Attention':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Normal':
      default:
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    }
  };

  if (loading) {
    return <div className="p-10 text-center text-xs text-slate-400 font-semibold">Loading beneficiary...</div>;
  }

  if (errorMsg || !record) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm font-semibold px-4 py-3 rounded-xl">
          {errorMsg || 'Beneficiary not found'}
        </div>
        <button onClick={() => navigate('/beneficiaries')} className="mt-4 text-xs font-bold text-blue-600 hover:underline">
          &larr; Back to Beneficiaries
        </button>
      </div>
    );
  }

  const isPregnant = record.category === 'Pregnant Woman';
  const displayName = isPregnant ? record.womanName : record.childName;
  const displayAge = record.age;
  const status = isPregnant ? mapPregnancyStatus(record.riskLevel) : (record.vaccineSchedule?.some(v => v.status === 'OVERDUE') ? 'Attention' : 'Normal');
  const village = record.family?.village || '-';
  const mobile = record.mobile || record.family?.contactNumber || '-';
  const recordIdForRoute = record.childId || record._id;

  const tabs = ['Overview', isPregnant ? 'ANC Records' : 'Growth Monitoring', 'Visits', 'Documents', 'Follow-ups'];

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <button
          onClick={() => navigate('/beneficiaries')}
          className="hover:text-blue-600 flex items-center gap-1 cursor-pointer"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Beneficiaries</span>
        </button>
        <span>&gt;</span>
        <span className="text-slate-900 font-bold">{displayName}</span>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <img
            src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80"
            alt={displayName}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-200 shadow-xs"
          />
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">{displayName}</h1>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusBadge(status)}`}>
                {status}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium mt-1">
              <span>Age: <strong className="text-slate-800">{displayAge}</strong></span>
              <span>•</span>
              <span className="font-mono">ID: <strong className="text-slate-800">{recordIdForRoute}</strong></span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-400" />
                Village: <strong className="text-slate-800">{village}</strong>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Phone className="w-3 h-3 text-slate-400" />
                {mobile}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => navigate(`/visits/record?beneficiaryId=${recordIdForRoute}&name=${encodeURIComponent(displayName)}`)}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            <ClipboardCheck className="w-4 h-4" />
            <span>{t('profile.startVisit', 'Start Visit')}</span>
          </button>

          <button
            onClick={() => setActiveTab('Visits')}
            className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            {t('profile.viewHistory', 'View History')}
          </button>

          <button
            onClick={() => navigate(`/referrals?create=true&beneficiaryId=${recordIdForRoute}`)}
            className="px-4 py-2.5 border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{t('profile.refer', 'Refer')}</span>
          </button>
        </div>
      </div>

      <div className="border-b border-slate-200 flex items-center gap-2 overflow-x-auto scrollbar-none">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === tab
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab}
            {tab === 'Visits' && visits.length > 0 && (
              <span className="ml-1.5 bg-slate-100 text-slate-700 text-[10px] px-1.5 py-0.2 rounded-full">
                {visits.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {activeTab === 'Overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {isPregnant ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                  <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    <Heart className="w-4 h-4 text-pink-600" />
                    <span>Pregnancy Information</span>
                  </h3>
                  <span className="text-[11px] font-bold text-pink-700 bg-pink-50 px-2 py-0.5 rounded-full border border-pink-200">
                    {record.trimester ? `Trimester ${record.trimester}` : record.pregnancyStage}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Gestational Age</span>
                    <strong className="text-slate-800 text-sm">{record.gestationalWeeks} weeks {record.gestationalDays} days</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Expected Delivery</span>
                    <strong className="text-slate-800 text-sm">{record.expectedDeliveryDate ? new Date(record.expectedDeliveryDate).toLocaleDateString() : '-'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Blood Group</span>
                    <strong className="text-slate-800 text-sm">{record.bloodGroup || '-'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Gravida / Parity</span>
                    <strong className="text-slate-800 text-sm">G{record.gravida} P{record.parity}</strong>
                  </div>
                </div>

                {record.riskReasons?.length > 0 && (
                  <div className="mt-4 p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-900 leading-relaxed">
                    <strong className="font-bold block mb-0.5">Clinical Notes:</strong>
                    {record.riskReasons.join(', ')}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                  <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    <Baby className="w-4 h-4 text-emerald-600" />
                    <span>Child Health & Immunization</span>
                  </h3>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Age {record.age}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Date of Birth</span>
                    <strong className="text-slate-800 text-sm">{record.dateOfBirth ? new Date(record.dateOfBirth).toLocaleDateString() : '-'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Mother's Name</span>
                    <strong className="text-slate-800 text-sm">{record.motherName || '-'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Gender</span>
                    <strong className="text-slate-800 text-sm">{record.gender || '-'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Vaccines Overdue</span>
                    <strong className={`text-sm font-bold ${record.vaccineSchedule?.some(v => v.status === 'OVERDUE') ? 'text-rose-600' : 'text-emerald-700'}`}>
                      {record.vaccineSchedule?.filter(v => v.status === 'OVERDUE').length || 0}
                    </strong>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-600" />
                  <span>{t('profile.latestHealthInfo', 'Household Info')}</span>
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-500 font-semibold block">Family ID</span>
                  <div className="text-sm font-black text-slate-900 mt-1">{record.familyId}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-500 font-semibold block">Head of Family</span>
                  <div className="text-sm font-black text-slate-900 mt-1">{record.family?.headOfFamily || '-'}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 col-span-2">
                  <span className="text-slate-500 font-semibold block">Address</span>
                  <div className="text-sm font-bold text-slate-900 mt-1">{record.address || record.family?.address || '-'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'ANC Records' && isPregnant && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900">Antenatal Care (ANC) Visits</h3>
          {(!record.ancVisits || record.ancVisits.length === 0) ? (
            <p className="text-xs text-slate-400 py-4 text-center">No ANC visits recorded yet.</p>
          ) : (
            <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
              <thead className="bg-slate-100 text-slate-600">
                <tr>
                  <th className="p-2.5">Date</th>
                  <th className="p-2.5">Weight</th>
                  <th className="p-2.5">BP</th>
                  <th className="p-2.5">Hb</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {record.ancVisits.map((anc, i) => (
                  <tr key={i}>
                    <td className="p-2.5 font-semibold">{anc.date}</td>
                    <td className="p-2.5">{anc.weightKg ? `${anc.weightKg} kg` : '-'}</td>
                    <td className="p-2.5">{anc.bloodPressure || '-'}</td>
                    <td className="p-2.5">{anc.hemoglobin ? `${anc.hemoglobin} g/dL` : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {record.recommendedANC?.length > 0 && (
            <div className="pt-3 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-700 uppercase mb-2">Recommended Schedule</h4>
              <div className="flex flex-wrap gap-2">
                {record.recommendedANC.map((a, i) => (
                  <span key={i} className="text-[11px] bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full font-semibold">
                    {a.code || a.name}: {a.dueDate}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'Growth Monitoring' && !isPregnant && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900">National Immunization Schedule</h3>
          <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
            {(record.vaccineSchedule || []).map((v, i) => (
              <div key={i} className="p-3 flex items-center justify-between text-xs bg-white">
                <div>
                  <span className="font-bold text-slate-800">{v.vaccineCode || v.name}</span>
                  <span className="text-[11px] text-slate-500 ml-2 font-mono">{v.dueDate || v.givenDate}</span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  v.status === 'COMPLETED'
                    ? 'bg-emerald-100 text-emerald-800'
                    : v.status === 'OVERDUE'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-amber-100 text-amber-800'
                }`}>
                  {v.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'Visits' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900">
              Field Visit History ({visits.length})
            </h3>
            <button
              onClick={() => navigate(`/visits/record?beneficiaryId=${recordIdForRoute}&name=${encodeURIComponent(displayName)}`)}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
            >
              + Record New Visit
            </button>
          </div>

          {visits.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No visits recorded yet.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {visits.map((v) => (
                <div key={v._id} className="py-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-900">{v.scheduledDate}</span>
                      <span className="text-xs px-2 py-0.2 rounded bg-slate-100 text-slate-700 font-semibold">
                        {v.visitType}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-slate-100 text-slate-700 border-slate-200">
                      {v.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">{v.observations || 'No observations recorded.'}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'Documents' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <h3 className="text-sm font-extrabold text-slate-900 mb-2">Documents</h3>
          <p className="text-xs text-slate-500">
            Document upload is supported by the backend during a visit, but there's no endpoint yet to list previously uploaded documents here. This is a next step.
          </p>
        </div>
      )}

      {activeTab === 'Follow-ups' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <h3 className="text-sm font-extrabold text-slate-900 mb-2">Follow-ups</h3>
          <p className="text-xs text-slate-500">
            Follow-ups are auto-created as Tasks when a visit is recorded with a next follow-up date. Check the Tasks section — dedicated follow-up display here is a next step.
          </p>
        </div>
      )}
    </div>
  );
}