import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../../context/DataContext';
import { useLanguage } from '../../../context/LanguageContext';
import {
  MapPin,
  Navigation,
  Compass,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  ChevronRight,
  Route
} from 'lucide-react';

export default function HouseholdMapPage() {
  const { beneficiaries, visits } = useData();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [filterType, setFilterType] = useState('All');
  const [selectedPin, setSelectedPin] = useState(null);
  const [routePlanned, setRoutePlanned] = useState(false);

  // Household Pin Data strictly matching Screen 12
  const householdPins = [
    {
      id: 'ASHA1023',
      name: 'Sita Patil',
      household: 'House 12, Rampur',
      category: 'Pregnant Woman',
      status: 'High Risk',
      statusColor: 'bg-rose-500 ring-rose-300',
      x: 52, // % coordinate on stylized village terrain map
      y: 35,
      time: '10:00 AM',
      notes: 'High Blood Pressure follow-up (Urgent)'
    },
    {
      id: 'ASHA1024',
      name: 'Anita Shah',
      household: 'House 45, Bhagwan',
      category: 'Child',
      status: 'Normal',
      statusColor: 'bg-emerald-500 ring-emerald-300',
      x: 68,
      y: 40,
      time: '11:30 AM',
      notes: 'DPT booster vaccination'
    },
    {
      id: 'ASHA1025',
      name: 'Ramesh Patil',
      household: 'Lane 3, Kalapur',
      category: 'Elderly',
      status: 'Today',
      statusColor: 'bg-blue-600 ring-blue-300',
      x: 32,
      y: 65,
      time: '02:00 PM',
      notes: 'Diabetic NCD checkup'
    },
    {
      id: 'ASHA1026',
      name: 'Priya More',
      household: 'Near School, Rampur',
      category: 'Child',
      status: 'Pending',
      statusColor: 'bg-amber-500 ring-amber-300',
      x: 48,
      y: 78,
      time: '04:00 PM',
      notes: 'Growth assessment follow-up'
    }
  ];

  const handlePlanRoute = () => {
    setRoutePlanned(true);
    setSelectedPin(householdPins[0]);
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {t('map.title', 'Map / Households')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            {t('map.subtitle', 'Geographic overview of assigned village households and optimized field visit routing')}
          </p>
        </div>

        <button
          onClick={handlePlanRoute}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <Route className="w-4 h-4" />
          <span>{t('map.planRoute', "Plan Today's Route")}</span>
        </button>
      </div>

      {/* Main Grid: Interactive Map + Route Details Side Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Map Canvas matching Screen 12 */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs relative flex flex-col min-h-[520px]">
          {/* Stylized Village Geographic Surface */}
          <div className="relative flex-1 w-full bg-[#E5EDDB] overflow-hidden select-none">
            {/* Terrain Background SVG elements (roads, river, fields) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40" xmlns="http://www.w3.org/2000/svg">
              {/* River stream */}
              <path d="M 0,260 Q 200,280 400,200 T 800,250" fill="none" stroke="#93C5FD" strokeWidth="26" />
              {/* Village Main Road */}
              <path d="M 100,500 C 250,420 300,320 450,200 S 700,100 800,80" fill="none" stroke="#CBD5E1" strokeWidth="16" />
              <path d="M 250,420 L 700,450" fill="none" stroke="#E2E8F0" strokeWidth="10" strokeDasharray="6,6" />
              {/* Field plots */}
              <rect x="50" y="60" width="160" height="120" rx="10" fill="#DCFCE7" opacity="0.6" />
              <rect x="420" y="320" width="180" height="130" rx="10" fill="#FEF3C7" opacity="0.6" />
              <rect x="620" y="220" width="140" height="110" rx="10" fill="#DCFCE7" opacity="0.6" />
            </svg>

            {/* Route path lines if route planned */}
            {routePlanned && (
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" xmlns="http://www.w3.org/2000/svg">
                <polyline
                  points="520,180 680,210 320,340 480,410"
                  fill="none"
                  stroke="#2563EB"
                  strokeWidth="4"
                  strokeDasharray="8,6"
                  className="animate-pulse"
                />
              </svg>
            )}

            {/* Household Location Pins strictly matching Screen 12 */}
            {householdPins.map((pin) => {
              const isSelected = selectedPin?.id === pin.id;
              return (
                <div
                  key={pin.id}
                  onClick={() => setSelectedPin(pin)}
                  style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer group"
                >
                  <div className="flex flex-col items-center">
                    {/* Pin Label Box */}
                    <div className={`px-2 py-0.5 rounded-md text-[11px] font-extrabold shadow-md mb-1 whitespace-nowrap transition-transform group-hover:scale-110 ${
                      isSelected
                        ? 'bg-blue-900 text-white ring-2 ring-blue-400'
                        : 'bg-white text-slate-800 border border-slate-200'
                    }`}>
                      {pin.name}
                    </div>

                    {/* Pin Icon */}
                    <div className={`w-8 h-8 rounded-full text-white flex items-center justify-center shadow-lg ring-4 transition-all group-hover:scale-125 ${pin.statusColor} ${
                      isSelected ? 'scale-125 ring-8 ring-blue-400/40' : ''
                    }`}>
                      <MapPin className="w-4 h-4 fill-white" />
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Map Legend Overlay matching Screen 12 */}
            <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md p-3 rounded-2xl shadow-lg border border-slate-200 z-30 text-xs font-semibold text-slate-700 space-y-2">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {t('map.legend', 'Map Legend')}
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                <span>{t('map.allHouseholds', 'All Households')}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>{t('common.pending', 'Pending')}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span>{t('dashboard.highRisk', 'High Risk')}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>{t('map.todaysVisits', "Today's Visits")}</span>
              </div>
            </div>

            {/* Map Control Badge Bottom Left */}
            <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-md border border-slate-200 z-30 text-xs font-bold text-slate-800 flex items-center gap-2">
              <Compass className="w-4 h-4 text-blue-600 animate-spin" />
              <span>{t('map.sectorLabel', 'Rampur Sub-Centre Sector 4')}</span>
            </div>
          </div>
        </div>

        {/* Side Panel: Selected Stop & Planned Route Details */}
        <div className="lg:col-span-4 space-y-4">
          {/* Route Overview Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Route className="w-4 h-4 text-blue-600" />
                <span>{t('map.fieldSequence', "Today's Field Sequence")}</span>
              </h2>
              <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                {t('map.routeDistance', '4 Stops • 3.4 km')}
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {householdPins.map((stop, idx) => (
                <div
                  key={stop.id}
                  onClick={() => setSelectedPin(stop)}
                  className={`p-3 rounded-2xl border text-xs transition-all cursor-pointer flex items-center justify-between ${
                    selectedPin?.id === stop.id
                      ? 'border-blue-600 bg-blue-50/70 shadow-xs ring-1 ring-blue-500/20'
                      : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-extrabold text-[11px] flex items-center justify-center shrink-0">
                      {idx + 1}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">{stop.name}</div>
                      <div className="text-[10px] text-slate-500">{stop.household}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-mono font-bold text-slate-800 text-[11px]">{stop.time}</div>
                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                      stop.status === 'High Risk' ? 'bg-rose-100 text-rose-700' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {stop.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Household Detail Popout */}
          {selectedPin ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-black text-slate-900 text-sm">{selectedPin.name}</h3>
                  <p className="text-[11px] text-slate-500">{selectedPin.household} • {selectedPin.category}</p>
                </div>
                <button
                  onClick={() => navigate(`/beneficiaries/${selectedPin.id}`)}
                  className="px-2.5 py-1 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                >
                  Profile &gt;
                </button>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl text-xs border border-slate-200 space-y-1.5">
                <div><strong>{t('map.scheduledTime', 'Scheduled Time')}:</strong> {selectedPin.time}</div>
                <div><strong>{t('map.priorityNote', 'Priority Clinical Note')}:</strong> {selectedPin.notes}</div>
                <div><strong>{t('visitList.status', 'Status')}:</strong> <span className="font-bold text-rose-600">{selectedPin.status}</span></div>
              </div>

              <button
                onClick={() => navigate(`/visits/record?beneficiaryId=${selectedPin.id}&name=${encodeURIComponent(selectedPin.name)}`)}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer"
              >
                Start Home Visit Now
              </button>
            </div>
          ) : (
            <div className="p-5 text-center text-xs text-slate-400 bg-white rounded-3xl border border-slate-200">
              Click any pin on the map or stop in the sequence to inspect household clinical details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
