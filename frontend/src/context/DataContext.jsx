import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

const DataContext = createContext(null);

// Initial Pre-seeded Beneficiaries strictly matching reference image
const INITIAL_BENEFICIARIES = [
  {
    id: 'ASHA1023',
    name: 'Sita Patil',
    age: 24,
    gender: 'Female',
    category: 'Pregnant Woman',
    village: 'Rampur',
    mobile: '9876543210',
    address: 'House 12, Shivaji Chowk, Rampur',
    status: 'Attention', // 'Attention' | 'Normal' | 'High Risk'
    assignedWorker: 'Sunita Patil',
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    pregnancy: {
      weeks: '32 weeks',
      expectedDelivery: '12 Nov 2026',
      bloodGroup: 'B+',
      lastVisit: '10 Sep 2026',
      nextVisit: '24 Sep 2026',
      gravida: 'G1 (First Pregnancy)',
      riskObservations: 'Mild pregnancy-induced hypertension (140/90 mmHg), mild edema in feet. Hemoglobin borderline.'
    },
    latestVitals: {
      bp: '140/90',
      weight: '58 kg',
      hb: '10.2 g/dL',
      risk: 'Attention'
    },
    medicalHistory: [
      { date: '10 Jun 2026', notes: 'First ANC registration. Weight 52kg, BP normal 115/75. Prescribed Folic Acid.' },
      { date: '15 Aug 2026', notes: 'Second Trimester scan normal. Hb checked at 10.8 g/dL. Iron supplements given.' },
      { date: '10 Sep 2026', notes: 'BP elevated at 135/85. Advised low salt diet, rest, and weekly monitoring.' }
    ]
  },
  {
    id: 'ASHA1024',
    name: 'Anita Shah',
    age: 2,
    gender: 'Female',
    category: 'Child',
    village: 'Bhagwan',
    mobile: '9823114455',
    address: 'House 45, Near Temple, Bhagwan',
    status: 'Normal',
    assignedWorker: 'Sunita Patil',
    photoUrl: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=150&auto=format&fit=crop&q=80',
    child: {
      dob: '14 Aug 2024',
      motherName: 'Kavita Shah',
      weight: '11.5 kg',
      height: '84 cm',
      nextVaccination: 'DPT Booster (Due 20 Sep 2026)',
      growthStatus: 'Normal Growth (Green Zone)',
      vaccines: [
        { name: 'BCG', status: 'Given', date: '15 Aug 2024' },
        { name: 'OPV 0, 1, 2, 3', status: 'Given', date: '2024-2025' },
        { name: 'Pentavalent 1, 2, 3', status: 'Given', date: '2024-2025' },
        { name: 'Measles-Rubella (MR-1)', status: 'Given', date: '18 May 2025' },
        { name: 'DPT Booster 1', status: 'Due Today', date: '20 Sep 2026' }
      ]
    },
    latestVitals: {
      bp: 'N/A',
      weight: '11.5 kg',
      hb: '11.4 g/dL',
      risk: 'Normal'
    },
    medicalHistory: [
      { date: '14 Aug 2024', notes: 'Institutional delivery at Rampur PHC. Birth weight 2.8kg. Normal cry.' },
      { date: '18 May 2025', notes: 'MR-1 dose administered. No adverse reactions observed.' }
    ]
  },
  {
    id: 'ASHA1025',
    name: 'Ramesh Patil',
    age: 68,
    gender: 'Male',
    category: 'Elderly',
    village: 'Kalapur',
    mobile: '9890223311',
    address: 'Lane 3, Post Office Road, Kalapur',
    status: 'Normal',
    assignedWorker: 'Sunita Patil',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    elderly: {
      conditions: 'Type 2 Diabetes, Mild Osteoarthritis',
      bloodPressure: '130/85 mmHg',
      diabetes: 'Fasting: 135 mg/dL, Post-meal: 178 mg/dL',
      medication: 'Metformin 500mg (twice daily), Calcium + Vit D3',
      lastCheckup: '05 Sep 2026',
      nextCheckup: '23 Sep 2026'
    },
    latestVitals: {
      bp: '130/85',
      weight: '64 kg',
      hb: '12.8 g/dL',
      risk: 'Normal'
    },
    medicalHistory: [
      { date: '05 Aug 2026', notes: 'Routine NCD screening. Blood sugar controlled with Metformin.' },
      { date: '05 Sep 2026', notes: 'Joint pain reported in right knee. Advised mild mobility exercises.' }
    ]
  },
  {
    id: 'ASHA1026',
    name: 'Priya More',
    age: 5,
    gender: 'Female',
    category: 'Child',
    village: 'Rampur',
    mobile: '9823998877',
    address: 'Near ZP Primary School, Rampur',
    status: 'Normal',
    assignedWorker: 'Sunita Patil',
    photoUrl: 'https://images.unsplash.com/photo-1543332164-6e82f355badc?w=150&auto=format&fit=crop&q=80',
    child: {
      dob: '10 Feb 2021',
      motherName: 'Meena More',
      weight: '16.5 kg',
      height: '104 cm',
      nextVaccination: 'DPT Booster 2 (Due 2027)',
      growthStatus: 'Normal Weight & Height',
      vaccines: [
        { name: 'All Primary Vaccines', status: 'Completed', date: '2021-2023' },
        { name: 'Vitamin A Dose 5', status: 'Given', date: '10 Jul 2026' }
      ]
    },
    latestVitals: {
      bp: 'N/A',
      weight: '16.5 kg',
      hb: '12.1 g/dL',
      risk: 'Normal'
    },
    medicalHistory: [
      { date: '10 Jul 2026', notes: 'Vitamin A bi-annual supplementation administered successfully.' }
    ]
  },
  {
    id: 'ASHA1027',
    name: 'Lata Jadhav',
    age: 32,
    gender: 'Female',
    category: 'Pregnant Woman',
    village: 'Shirpur',
    mobile: '9855667788',
    address: 'Bungalo 8, Zilla Parishad Road, Shirpur',
    status: 'High Risk',
    assignedWorker: 'Sunita Patil',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    pregnancy: {
      weeks: '26 weeks',
      expectedDelivery: '28 Dec 2026',
      bloodGroup: 'O+',
      lastVisit: '01 Sep 2026',
      nextVisit: '21 Sep 2026',
      gravida: 'G3 P2 (Third Pregnancy)',
      riskObservations: 'Severe nutritional anemia (Hb 8.2 g/dL), high fatigue, dizzy spells. Needs urgent iron sucrose or hospital evaluation.'
    },
    latestVitals: {
      bp: '108/68',
      weight: '49 kg',
      hb: '8.2 g/dL',
      risk: 'High Risk'
    },
    medicalHistory: [
      { date: '15 Jul 2026', notes: 'Severe fatigue reported. Hb test 8.5 g/dL. Oral IFA double dose prescribed.' },
      { date: '01 Sep 2026', notes: 'Hb failed to rise (8.2 g/dL). Advised hospital referral for IV Iron Sucrose.' }
    ]
  },
  {
    id: 'ASHA1028',
    name: 'Sunil Kumar',
    age: 70,
    gender: 'Male',
    category: 'Elderly',
    village: 'Rampur',
    mobile: '9833445566',
    address: 'Main Bazar, Behind Gram Panchayat, Rampur',
    status: 'Attention',
    assignedWorker: 'Sunita Patil',
    photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    elderly: {
      conditions: 'Hypertension Stage 2, Chronic Bronchitis',
      bloodPressure: '155/95 mmHg',
      diabetes: 'Normal Fasting (105 mg/dL)',
      medication: 'Amlodipine 5mg, Inhaler as needed',
      lastCheckup: '28 Aug 2026',
      nextCheckup: '24 Sep 2026'
    },
    latestVitals: {
      bp: '155/95',
      weight: '61 kg',
      hb: '13.1 g/dL',
      risk: 'Attention'
    },
    medicalHistory: [
      { date: '28 Aug 2026', notes: 'Irregular medication intake reported due to medicine shortage at home. Reminded family.' }
    ]
  }
];

// Initial Connected Visits
const INITIAL_VISITS = [
  {
    id: 'VIS-901',
    beneficiaryId: 'ASHA1023',
    beneficiaryName: 'Sita Patil',
    beneficiaryCategory: 'Pregnant Woman',
    visitDate: '2026-09-20',
    visitTime: '10:00 AM',
    visitType: 'Pregnancy Follow-up',
    status: 'High Risk',
    healthChecks: {
      bp: '140/90',
      weight: '58 kg',
      hb: '10.2 g/dL',
      sugar: 'Normal'
    },
    observations: 'BP higher than normal (140/90). Patient reports mild morning headache and slight ankle swelling.',
    symptoms: 'Headache, Swollen ankles',
    hasIssue: true,
    issue: {
      id: 'ISS-101',
      category: 'High Blood Pressure',
      description: 'BP higher than normal (140/90 mmHg). Advised strict low-salt diet, bed rest and medical review.',
      riskLevel: 'High Risk'
    },
    followUp: {
      required: true,
      date: '2026-09-25',
      priority: 'Urgent',
      reason: 'Re-check blood pressure and check for proteinuria'
    },
    referral: {
      required: true,
      reason: 'Gestational Hypertension Evaluation',
      healthCentre: 'PHC Rampur',
      priority: 'Urgent',
      status: 'In Progress'
    },
    supportingDocId: 'DOC-501',
    notes: 'Counselled mother-in-law on warning signs (severe headache, blurred vision).',
    recordedBy: 'Sunita Patil',
    createdAt: '2026-09-20T10:30:00'
  },
  {
    id: 'VIS-902',
    beneficiaryId: 'ASHA1024',
    beneficiaryName: 'Anita Shah',
    beneficiaryCategory: 'Child',
    visitDate: '2026-09-20',
    visitTime: '11:30 AM',
    visitType: 'Child Vaccination',
    status: 'Normal',
    healthChecks: {
      bp: 'N/A',
      weight: '11.5 kg',
      hb: '11.4 g/dL',
      sugar: 'N/A'
    },
    observations: 'Child active, alert and playful. Weight gain on track along the green growth band.',
    symptoms: 'None',
    hasIssue: false,
    followUp: {
      required: true,
      date: '2026-10-20',
      priority: 'Normal',
      reason: 'Monthly growth monitoring & nutrition check'
    },
    referral: null,
    supportingDocId: null,
    notes: 'DPT booster vaccine administered at Sub-Centre session.',
    recordedBy: 'Sunita Patil',
    createdAt: '2026-09-20T11:50:00'
  },
  {
    id: 'VIS-903',
    beneficiaryId: 'ASHA1025',
    beneficiaryName: 'Ramesh Patil',
    beneficiaryCategory: 'Elderly',
    visitDate: '2026-09-20',
    visitTime: '02:00 PM',
    visitType: 'Elderly Follow-up',
    status: 'Normal',
    healthChecks: {
      bp: '130/85',
      weight: '64 kg',
      hb: '12.8 g/dL',
      sugar: '135 mg/dL'
    },
    observations: 'Elderly beneficiary taking prescribed Metformin regularly. Blood pressure stable.',
    symptoms: 'Mild knee stiffness in early morning',
    hasIssue: false,
    followUp: {
      required: true,
      date: '2026-10-05',
      priority: 'Normal',
      reason: 'Next monthly NCD refill and BP check'
    },
    referral: null,
    supportingDocId: null,
    notes: 'Provided 30 days stock of Metformin and advised daily gentle morning walk.',
    recordedBy: 'Sunita Patil',
    createdAt: '2026-09-20T14:20:00'
  },
  {
    id: 'VIS-904',
    beneficiaryId: 'ASHA1027',
    beneficiaryName: 'Lata Jadhav',
    beneficiaryCategory: 'Pregnant Woman',
    visitDate: '2026-09-20',
    visitTime: '04:00 PM',
    visitType: 'Pregnancy Follow-up',
    status: 'Pending',
    healthChecks: {
      bp: '108/68',
      weight: '49 kg',
      hb: '8.2 g/dL',
      sugar: 'Normal'
    },
    observations: 'Visit scheduled for 4:00 PM today. Follow-up on severe anemia and nutrition kit.',
    symptoms: 'Fatigue, Pallor',
    hasIssue: true,
    issue: {
      id: 'ISS-102',
      category: 'Severe Anemia in Pregnancy',
      description: 'Hemoglobin 8.2 g/dL. Requires injectable iron therapy at Sub-District Hospital.',
      riskLevel: 'High Risk'
    },
    followUp: {
      required: true,
      date: '2026-09-22',
      priority: 'Urgent',
      reason: 'Verify transport arrangements to Sub-District Hospital for Iron Sucrose'
    },
    referral: {
      required: true,
      reason: 'Severe Anemia (<9 g/dL) in 3rd Trimester',
      healthCentre: 'Sub-District Hospital Shirpur',
      priority: 'Urgent',
      status: 'Referred'
    },
    supportingDocId: 'DOC-504',
    notes: 'Coordinated with 102 Ambulance service for hospital visit on Monday.',
    recordedBy: 'Sunita Patil',
    createdAt: '2026-09-20T16:00:00'
  }
];

// Initial Supporting Documents
// Connected strictly: Beneficiary -> Visit -> Health Issue -> Supporting Document
const INITIAL_DOCUMENTS = [
  {
    id: 'DOC-501',
    fileName: 'bp_report.jpg',
    fileType: 'Medical Report',
    fileSize: '1.2 MB',
    uploadedOn: '20 Sep 2026',
    beneficiaryId: 'ASHA1023',
    beneficiaryName: 'Sita Patil',
    village: 'Rampur',
    visitId: 'VIS-901',
    visitDate: '20 Sep 2026',
    healthIssue: 'High Blood Pressure',
    description: 'BP higher than normal (140/90). Digital monitor reading snapshot and PHC nurse verification slip.',
    status: 'Pending', // 'Pending' | 'Approved' | 'Needs Correction'
    uploadedBy: 'Sunita Patil',
    correctionReason: '',
    previewUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 'DOC-502',
    fileName: 'prescription.pdf',
    fileType: 'Prescription',
    fileSize: '840 KB',
    uploadedOn: '12 Sep 2026',
    beneficiaryId: 'ASHA1023',
    beneficiaryName: 'Sita Patil',
    village: 'Rampur',
    visitId: 'VIS-880',
    visitDate: '12 Sep 2026',
    healthIssue: 'Iron Deficiency & Calcium',
    description: 'Doctor prescription from Rampur PHC for double dose IFA and Calcium D3 tablets.',
    status: 'Approved',
    uploadedBy: 'Sunita Patil',
    correctionReason: '',
    previewUrl: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 'DOC-503',
    fileName: 'lab_test.pdf',
    fileType: 'Lab Report',
    fileSize: '1.5 MB',
    uploadedOn: '05 Sep 2026',
    beneficiaryId: 'ASHA1025',
    beneficiaryName: 'Ramesh Patil',
    village: 'Kalapur',
    visitId: 'VIS-875',
    visitDate: '05 Sep 2026',
    healthIssue: 'Diabetic Fasting Glucose Assessment',
    description: 'Government Diagnostic Lab test report showing Fasting Sugar 135 mg/dL.',
    status: 'Approved',
    uploadedBy: 'Sunita Patil',
    correctionReason: '',
    previewUrl: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 'DOC-504',
    fileName: 'scan.jpg',
    fileType: 'Other',
    fileSize: '2.1 MB',
    uploadedOn: '15 Aug 2026',
    beneficiaryId: 'ASHA1027',
    beneficiaryName: 'Lata Jadhav',
    village: 'Shirpur',
    visitId: 'VIS-860',
    visitDate: '15 Aug 2026',
    healthIssue: 'Severe Anemia & Ultrasound Check',
    description: 'Ultrasound scan summary confirming single live fetus in cephalic presentation.',
    status: 'Approved',
    uploadedBy: 'Sunita Patil',
    correctionReason: '',
    previewUrl: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 'DOC-505',
    fileName: 'pmssy_slip.pdf',
    fileType: 'Referral Document',
    fileSize: '950 KB',
    uploadedOn: '18 Sep 2026',
    beneficiaryId: 'ASHA1024',
    beneficiaryName: 'Anita Shah',
    village: 'Bhagwan',
    visitId: 'VIS-895',
    visitDate: '18 Sep 2026',
    healthIssue: 'Delayed Booster Referral',
    description: 'Referral slip for specialist pediatric consultation at District Hospital.',
    status: 'Needs Correction',
    uploadedBy: 'Anita Shah (Worker)',
    correctionReason: 'Official Medical Officer stamp missing on page 2. Please re-upload verified signed copy.',
    previewUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=500&auto=format&fit=crop&q=80'
  }
];

// Initial Tasks
const INITIAL_TASKS = [
  {
    id: 'TSK-301',
    title: 'Verify ANC 3rd Trimester Hemoglobin',
    workerId: 'ASHA-101',
    workerName: 'Sunita Patil',
    beneficiaryName: 'Sita Patil',
    household: 'House 12, Rampur',
    dueDate: '2026-09-22',
    priority: 'Urgent',
    instructions: 'Re-test capillary Hb with digital hemoglobinometer before next ANC camp. Alert supervisor if below 10 g/dL.',
    status: 'In Progress' // 'Pending' | 'In Progress' | 'Completed' | 'Overdue'
  },
  {
    id: 'TSK-302',
    title: 'Administer DPT Booster Dose',
    workerId: 'ASHA-101',
    workerName: 'Sunita Patil',
    beneficiaryName: 'Anita Shah',
    household: 'House 45, Bhagwan',
    dueDate: '2026-09-20',
    priority: 'Normal',
    instructions: 'Ensure child receives DPT booster during Sub-Centre VHND session today.',
    status: 'Completed'
  },
  {
    id: 'TSK-303',
    title: 'Elderly NCD Medication Compliance Check',
    workerId: 'ASHA-101',
    workerName: 'Sunita Patil',
    beneficiaryName: 'Ramesh Patil',
    household: 'Lane 3, Kalapur',
    dueDate: '2026-09-23',
    priority: 'Normal',
    instructions: 'Inspect medicine strip count for Metformin 500mg and record blood pressure reading.',
    status: 'Pending'
  },
  {
    id: 'TSK-304',
    title: 'High Risk Severe Anemia Hospital Transfer',
    workerId: 'ASHA-101',
    workerName: 'Sunita Patil',
    beneficiaryName: 'Lata Jadhav',
    household: 'Bungalo 8, Shirpur',
    dueDate: '2026-09-21',
    priority: 'Urgent',
    instructions: 'Assist patient to board 102 Ambulance to Sub-District Hospital for IV Iron therapy.',
    status: 'Pending'
  }
];

// Initial Referrals
const INITIAL_REFERRALS = [
  {
    id: 'REF-701',
    beneficiaryId: 'ASHA1023',
    beneficiaryName: 'Sita Patil',
    workerName: 'Sunita Patil',
    reason: 'High Blood Pressure in 3rd Trimester (140/90 mmHg)',
    healthCentre: 'PHC Rampur',
    priority: 'Urgent',
    date: '2026-09-20',
    status: 'In Progress', // 'Pending' | 'Referred' | 'In Progress' | 'Completed'
    notes: 'Medical Officer consultation requested for anti-hypertensive therapy.'
  },
  {
    id: 'REF-702',
    beneficiaryId: 'ASHA1027',
    beneficiaryName: 'Lata Jadhav',
    workerName: 'Sunita Patil',
    reason: 'Severe Nutritional Anemia (Hb 8.2 g/dL)',
    healthCentre: 'Sub-District Hospital Shirpur',
    priority: 'Urgent',
    date: '2026-09-18',
    status: 'Referred',
    notes: 'Patient scheduled for IV Ferric Carboxymaltose.'
  },
  {
    id: 'REF-703',
    beneficiaryId: 'ASHA1025',
    beneficiaryName: 'Ramesh Patil',
    workerName: 'Sunita Patil',
    reason: 'Diabetic Foot & Retinopathy annual check',
    healthCentre: 'CHC Kalapur',
    priority: 'Normal',
    date: '2026-09-05',
    status: 'Completed',
    notes: 'Examination normal. Continue existing oral hypoglycemics.'
  }
];

// Initial Alerts
const INITIAL_ALERTS = [
  {
    id: 'ALT-1',
    type: 'High Risk',
    patientName: 'Sita Patil',
    beneficiaryId: 'ASHA1023',
    message: 'High Blood Pressure (140/90 mmHg) recorded today',
    date: '20 Sep 2026',
    time: '10:15 AM',
    badge: 'High Risk',
    resolved: false
  },
  {
    id: 'ALT-2',
    type: 'Follow-up',
    patientName: 'Lata Jadhav',
    beneficiaryId: 'ASHA1027',
    message: 'ANC Follow-up due tomorrow for Severe Anemia',
    date: '21 Sep 2026',
    time: '09:00 AM',
    badge: 'Follow-up',
    resolved: false
  },
  {
    id: 'ALT-3',
    type: 'Follow-up',
    patientName: 'Ramesh Patil',
    beneficiaryId: 'ASHA1025',
    message: 'Elderly check-up and NCD medicine refill pending',
    date: '23 Sep 2026',
    time: '02:00 PM',
    badge: 'Follow-up',
    resolved: false
  },
  {
    id: 'ALT-4',
    type: 'Info',
    patientName: 'Anita Shah',
    beneficiaryId: 'ASHA1024',
    message: 'Child immunization due: DPT Booster 1',
    date: '20 Sep 2026',
    time: '11:00 AM',
    badge: 'Info',
    resolved: false
  }
];

// Initial Workers list (for Supervisor & Admin views)
const INITIAL_WORKERS = [
  { id: 'ASHA-101', name: 'Sunita Patil', village: 'Rampur', totalVisits: 54, activeBeneficiaries: 38, status: 'Active', phone: '9876543210' },
  { id: 'ASHA-102', name: 'Anita Shah', village: 'Bhagwan', totalVisits: 42, activeBeneficiaries: 32, status: 'Active', phone: '9822334411' },
  { id: 'ASHA-103', name: 'Priya More', village: 'Shirpur', totalVisits: 38, activeBeneficiaries: 29, status: 'On Leave', phone: '9811223355' },
  { id: 'ASHA-104', name: 'Rohini Kale', village: 'Kalapur', totalVisits: 52, activeBeneficiaries: 41, status: 'Active', phone: '9890112233' }
];

const CATEGORY_LABELS = {
  BENEFICIARY_PHOTO: 'Beneficiary Photo',
  HEALTH_CARD: 'MCP Card',
  IMMUNIZATION_CARD: 'Immunization Card',
  USG_SCAN: 'USG Scan Report',
  BLOOD_TEST: 'Blood Test Report',
  REFERRAL_SLIP: 'Referral / Prescription',
  BIRTH_CERTIFICATE: 'Birth Certificate',
  HEALTH_DOCUMENT: 'Health Document',
  OTHER: 'Other Document'
};

// Converts a document stored in the database into the shape the review screens use
function mapServerDocument(d) {
  const isImage = (d.mimetype || '').startsWith('image/');
  const uploaded = d.uploadedAt ? new Date(d.uploadedAt) : null;
  const uploadedOn = uploaded
    ? uploaded.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : '';
  return {
    id: `srv-${d.parentId}-${d.id}`,
    source: 'server',
    sourceType: d.sourceType,
    parentId: d.parentId,
    docId: d.id,
    fileName: d.title || d.originalName || 'Document',
    fileType: CATEGORY_LABELS[d.category] || d.category || 'Document',
    fileSize: d.size ? `${Math.max(1, Math.round(d.size / 1024))} KB` : '',
    uploadedOn,
    beneficiaryId: d.beneficiaryId,
    beneficiaryName: d.beneficiaryName,
    visitDate: uploadedOn,
    healthIssue: d.healthIssue,
    description: d.category === 'BENEFICIARY_PHOTO'
      ? 'Photo uploaded by the ASHA worker while registering this beneficiary.'
      : (d.title || 'Document uploaded by ASHA worker.'),
    status: d.reviewStatus || 'Pending',
    uploadedBy: d.uploadedBy || d.workerId || 'ASHA Worker',
    correctionReason: d.correctionReason || '',
    previewUrl: isImage ? d.url : ''
  };
}

export function DataProvider({ children }) {
  // Load from LocalStorage or initialize with defaults
  const [beneficiaries, setBeneficiaries] = useState(() => {
    const saved = localStorage.getItem('asha_saathi_beneficiaries');
    return saved ? JSON.parse(saved) : INITIAL_BENEFICIARIES;
  });

  const [visits, setVisits] = useState(() => {
    const saved = localStorage.getItem('asha_saathi_visits');
    return saved ? JSON.parse(saved) : INITIAL_VISITS;
  });

  const { isAuthenticated, currentRole } = useAuth();

  const [localDocuments, setLocalDocuments] = useState(() => {
    const saved = localStorage.getItem('asha_saathi_documents');
    return saved ? JSON.parse(saved) : INITIAL_DOCUMENTS;
  });

  // Documents uploaded by ASHA workers (stored in the database) – visible to Supervisor / Admin
  const [serverDocuments, setServerDocuments] = useState([]);
  const canReviewDocs = isAuthenticated && (currentRole === 'SUPERVISOR' || currentRole === 'ADMIN');

  const refreshDocuments = useCallback(async () => {
    if (!canReviewDocs) {
      setServerDocuments([]);
      return;
    }
    try {
      const res = await api.getDocuments();
      setServerDocuments((res.documents || []).map(mapServerDocument));
    } catch (err) {
      console.warn('Could not load uploaded documents:', err.message);
    }
  }, [canReviewDocs]);

  useEffect(() => {
    refreshDocuments();
    if (!canReviewDocs) return undefined;
    const timer = setInterval(refreshDocuments, 20000);
    return () => clearInterval(timer);
  }, [refreshDocuments, canReviewDocs]);

  const documents = useMemo(() => [...serverDocuments, ...localDocuments], [serverDocuments, localDocuments]);

  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('asha_saathi_tasks');
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  const [referrals, setReferrals] = useState(() => {
    const saved = localStorage.getItem('asha_saathi_referrals');
    return saved ? JSON.parse(saved) : INITIAL_REFERRALS;
  });

  const [alerts, setAlerts] = useState(() => {
    const saved = localStorage.getItem('asha_saathi_alerts');
    return saved ? JSON.parse(saved) : INITIAL_ALERTS;
  });

  const [workers, setWorkers] = useState(() => {
    const saved = localStorage.getItem('asha_saathi_workers');
    return saved ? JSON.parse(saved) : INITIAL_WORKERS;
  });

  // Offline Simulation State
  const [isSimulatedOffline, setIsSimulatedOffline] = useState(() => {
    return localStorage.getItem('asha_simulated_offline') === 'true';
  });

  const [offlineQueue, setOfflineQueue] = useState(() => {
    const saved = localStorage.getItem('asha_offline_queue');
    return saved ? JSON.parse(saved) : [];
  });

  const [lastSyncTime, setLastSyncTime] = useState(() => {
    return localStorage.getItem('asha_last_synced_at') || '20 Sep 2026, 09:30 AM';
  });

  // Notifications
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('asha_saathi_notifications');
    return saved ? JSON.parse(saved) : [
      { id: 1, title: 'Document approved', desc: 'Prescription document for Sita Patil was approved by Supervisor Rajesh More', time: '1 hr ago', read: false, type: 'success' },
      { id: 2, title: 'New task assigned', desc: 'Verify ANC 3rd Trimester Hemoglobin assigned to you', time: '2 hrs ago', read: false, type: 'warning' },
      { id: 3, title: 'Follow-up due tomorrow', desc: 'Lata Jadhav ANC Follow-up due on 21 Sep', time: '1 day ago', read: false, type: 'info' },
      { id: 4, title: 'Referral updated', desc: 'Sita Patil referral accepted at Rampur PHC', time: '1 day ago', read: true, type: 'info' },
      { id: 5, title: 'Data synced successfully', desc: 'All field records uploaded to district health server', time: '1 day ago', read: true, type: 'success' }
    ];
  });

  // Persist changes to LocalStorage
  useEffect(() => {
    localStorage.setItem('asha_saathi_beneficiaries', JSON.stringify(beneficiaries));
  }, [beneficiaries]);

  useEffect(() => {
    localStorage.setItem('asha_saathi_visits', JSON.stringify(visits));
  }, [visits]);

  useEffect(() => {
    localStorage.setItem('asha_saathi_documents', JSON.stringify(localDocuments));
  }, [localDocuments]);

  useEffect(() => {
    localStorage.setItem('asha_saathi_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('asha_saathi_referrals', JSON.stringify(referrals));
  }, [referrals]);

  useEffect(() => {
    localStorage.setItem('asha_saathi_alerts', JSON.stringify(alerts));
  }, [alerts]);

  useEffect(() => {
    localStorage.setItem('asha_saathi_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('asha_saathi_workers', JSON.stringify(workers));
  }, [workers]);

  useEffect(() => {
    localStorage.setItem('asha_offline_queue', JSON.stringify(offlineQueue));
  }, [offlineQueue]);

  useEffect(() => {
    localStorage.setItem('asha_simulated_offline', isSimulatedOffline ? 'true' : 'false');
  }, [isSimulatedOffline]);

  // Offline toggle
  const toggleOfflineMode = () => {
    setIsSimulatedOffline(prev => !prev);
  };

  // Sync Offline Queue
  const syncOfflineQueue = () => {
    if (offlineQueue.length === 0) return { count: 0 };
    const syncedCount = offlineQueue.length;
    setOfflineQueue([]);
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', Today';
    setLastSyncTime(nowStr);
    localStorage.setItem('asha_last_synced_at', nowStr);

    // Push notification
    addNotification({
      title: 'Data synced successfully',
      desc: `${syncedCount} queued record(s) and documents synced to central health server.`,
      type: 'success'
    });

    return { count: syncedCount };
  };

  // Add Beneficiary
  const addBeneficiary = (newBen) => {
    const id = `ASHA${Math.floor(1000 + Math.random() * 9000)}`;
    const beneficiaryRecord = {
      id,
      assignedWorker: 'Sunita Patil',
      status: 'Normal',
      latestVitals: {
        bp: newBen.category === 'Elderly' ? '120/80' : '110/70',
        weight: newBen.weight || '50 kg',
        hb: newBen.hb || '12.0 g/dL',
        risk: 'Normal'
      },
      medicalHistory: [
        { date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }), notes: 'Initial community registration completed.' }
      ],
      ...newBen
    };

    if (isSimulatedOffline) {
      setOfflineQueue(prev => [...prev, { type: 'ADD_BENEFICIARY', data: beneficiaryRecord, timestamp: new Date().toISOString() }]);
    }

    setBeneficiaries(prev => [beneficiaryRecord, ...prev]);

    addNotification({
      title: 'Beneficiary Registered',
      desc: `${beneficiaryRecord.name} was successfully registered under ${beneficiaryRecord.village}.`,
      type: 'success'
    });

    return beneficiaryRecord;
  };

  // Update Beneficiary
  const updateBeneficiary = (id, updates) => {
    setBeneficiaries(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
  };

  // Complete Record Visit Workflow
  // Connects: Beneficiary -> Visit -> Health Issue -> Supporting Document -> Follow-up -> Referral
  const recordVisit = (visitData) => {
    const visitId = `VIS-${Math.floor(900 + Math.random() * 900)}`;
    const ben = beneficiaries.find(b => b.id === visitData.beneficiaryId);

    let createdDoc = null;

    // Handle Attached Document
    if (visitData.hasIssue && visitData.document) {
      const docId = `DOC-${Math.floor(500 + Math.random() * 500)}`;
      createdDoc = {
        id: docId,
        fileName: visitData.document.fileName || 'supporting_document.jpg',
        fileType: visitData.document.fileType || 'Medical Report',
        fileSize: visitData.document.fileSize || '1.2 MB',
        uploadedOn: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        beneficiaryId: visitData.beneficiaryId,
        beneficiaryName: ben ? ben.name : 'Unknown Beneficiary',
        village: ben ? ben.village : 'Rampur',
        visitId: visitId,
        visitDate: visitData.visitDate,
        healthIssue: visitData.issue?.category || 'Health Observation',
        description: visitData.issue?.description || visitData.observations || '',
        status: 'Pending', // Pending Supervisor Review
        uploadedBy: 'Sunita Patil',
        correctionReason: '',
        previewUrl: visitData.document.previewUrl || 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=500&auto=format&fit=crop&q=80'
      };

      setLocalDocuments(prev => [createdDoc, ...prev]);

      addNotification({
        title: 'Document sent to Supervisor Review',
        desc: `${createdDoc.fileName} for ${createdDoc.beneficiaryName} queued under Pending Documents.`,
        type: 'info'
      });
    }

    const newVisit = {
      id: visitId,
      beneficiaryId: visitData.beneficiaryId,
      beneficiaryName: ben ? ben.name : 'Unknown Beneficiary',
      beneficiaryCategory: ben ? ben.category : 'General',
      visitDate: visitData.visitDate,
      visitTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      visitType: visitData.visitType || 'Routine Visit',
      status: visitData.hasIssue ? (visitData.issue?.riskLevel === 'High Risk' ? 'High Risk' : 'Attention') : 'Normal',
      healthChecks: {
        bp: visitData.healthChecks?.bp || '120/80',
        weight: visitData.healthChecks?.weight || '55 kg',
        hb: visitData.healthChecks?.hb || '11.5 g/dL',
        sugar: visitData.healthChecks?.sugar || 'Normal'
      },
      observations: visitData.observations || '',
      symptoms: visitData.symptoms || '',
      hasIssue: visitData.hasIssue,
      issue: visitData.hasIssue ? {
        id: `ISS-${Math.floor(100 + Math.random() * 900)}`,
        category: visitData.issue?.category || 'General Issue',
        description: visitData.issue?.description || '',
        riskLevel: visitData.issue?.riskLevel || 'Medium'
      } : null,
      followUp: visitData.followUp?.required ? {
        required: true,
        date: visitData.followUp.date,
        priority: visitData.issue?.riskLevel === 'High Risk' ? 'Urgent' : 'Normal',
        reason: visitData.followUp.reason || 'Follow-up re-check'
      } : null,
      referral: visitData.referral?.required ? {
        required: true,
        reason: visitData.issue?.category || 'Specialist Evaluation',
        healthCentre: visitData.referral.healthCentre || 'PHC Rampur',
        priority: visitData.issue?.riskLevel === 'High Risk' ? 'Urgent' : 'Normal',
        status: 'Pending'
      } : null,
      supportingDocId: createdDoc ? createdDoc.id : null,
      notes: visitData.notes || '',
      recordedBy: 'Sunita Patil',
      createdAt: new Date().toISOString()
    };

    if (isSimulatedOffline) {
      setOfflineQueue(prev => [...prev, { type: 'RECORD_VISIT', data: newVisit, timestamp: new Date().toISOString() }]);
    }

    setVisits(prev => [newVisit, ...prev]);

    // Update Beneficiary History & Status
    if (ben) {
      const updatedStatus = visitData.hasIssue
        ? (visitData.issue?.riskLevel === 'High Risk' ? 'High Risk' : 'Attention')
        : 'Normal';

      const historyEntry = {
        date: newVisit.visitDate,
        notes: `Visit (${newVisit.visitType}): ${visitData.observations} ${visitData.hasIssue ? `[Identified: ${visitData.issue.category}]` : '[Normal]'}`
      };

      updateBeneficiary(ben.id, {
        status: updatedStatus,
        latestVitals: {
          ...ben.latestVitals,
          ...newVisit.healthChecks,
          risk: updatedStatus
        },
        medicalHistory: [historyEntry, ...(ben.medicalHistory || [])]
      });
    }

    // Auto-create Referral if needed
    if (newVisit.referral) {
      const refId = `REF-${Math.floor(700 + Math.random() * 300)}`;
      setReferrals(prev => [
        {
          id: refId,
          beneficiaryId: newVisit.beneficiaryId,
          beneficiaryName: newVisit.beneficiaryName,
          workerName: 'Sunita Patil',
          reason: newVisit.referral.reason,
          healthCentre: newVisit.referral.healthCentre,
          priority: newVisit.referral.priority,
          date: newVisit.visitDate,
          status: 'Pending',
          notes: newVisit.notes
        },
        ...prev
      ]);
    }

    // Auto-create Alert if High Risk
    if (visitData.hasIssue && visitData.issue?.riskLevel === 'High Risk') {
      setAlerts(prev => [
        {
          id: `ALT-${Date.now()}`,
          type: 'High Risk',
          patientName: newVisit.beneficiaryName,
          beneficiaryId: newVisit.beneficiaryId,
          message: `${visitData.issue.category} diagnosed during visit on ${newVisit.visitDate}`,
          date: newVisit.visitDate,
          time: newVisit.visitTime,
          badge: 'High Risk',
          resolved: false
        },
        ...prev
      ]);
    }

    return newVisit;
  };

  // Supervisor Action: Approve Document
  const reviewServerDocument = async (doc, status, reason) => {
    await api.reviewDocument(doc.sourceType, doc.parentId, doc.docId, status, reason);
    setServerDocuments(prev => prev.map(d =>
      d.id === doc.id ? { ...d, status, correctionReason: status === 'Needs Correction' ? reason : '' } : d
    ));
  };

  const approveDocument = (docId) => {
    const serverDoc = documents.find(d => d.id === docId && d.source === 'server');
    if (serverDoc) {
      reviewServerDocument(serverDoc, 'Approved', '')
        .then(() => addNotification({
          title: 'Document Approved',
          desc: `Supervisor approved "${serverDoc.fileName}" for ${serverDoc.beneficiaryName}.`,
          type: 'success'
        }))
        .catch(err => alert(err.message || 'Could not approve the document'));
      return;
    }
    setLocalDocuments(prev => prev.map(doc => {
      if (doc.id === docId) {
        return { ...doc, status: 'Approved', correctionReason: '' };
      }
      return doc;
    }));

    const targetDoc = documents.find(d => d.id === docId);

    addNotification({
      title: 'Document Approved',
      desc: `Supervisor approved "${targetDoc ? targetDoc.fileName : 'Document'}" for ${targetDoc ? targetDoc.beneficiaryName : 'Patient'}.`,
      type: 'success'
    });
  };

  // Supervisor Action: Request Correction
  const requestDocumentCorrection = (docId, reason) => {
    const serverDoc = documents.find(d => d.id === docId && d.source === 'server');
    if (serverDoc) {
      reviewServerDocument(serverDoc, 'Needs Correction', reason)
        .then(() => addNotification({
          title: 'Document Correction Requested',
          desc: `Supervisor requested correction for "${serverDoc.fileName}": "${reason}"`,
          type: 'warning'
        }))
        .catch(err => alert(err.message || 'Could not send the correction request'));
      return;
    }
    setLocalDocuments(prev => prev.map(doc => {
      if (doc.id === docId) {
        return { ...doc, status: 'Needs Correction', correctionReason: reason };
      }
      return doc;
    }));

    const targetDoc = documents.find(d => d.id === docId);

    addNotification({
      title: 'Document Correction Requested',
      desc: `Supervisor requested correction for "${targetDoc ? targetDoc.fileName : 'Document'}": "${reason}"`,
      type: 'warning'
    });
  };

  // ASHA Worker Action: Re-upload / Correct Document
  const reuploadDocument = (docId, newFileData) => {
    setLocalDocuments(prev => prev.map(doc => {
      if (doc.id === docId) {
        return {
          ...doc,
          fileName: newFileData.fileName || doc.fileName,
          fileSize: newFileData.fileSize || doc.fileSize,
          previewUrl: newFileData.previewUrl || doc.previewUrl,
          status: 'Pending',
          correctionReason: '',
          uploadedOn: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
        };
      }
      return doc;
    }));

    addNotification({
      title: 'Document Re-submitted',
      desc: 'Corrected document sent back to Supervisor for review.',
      type: 'info'
    });
  };

  // Referrals
  const createReferral = (data) => {
    const ben = beneficiaries.find(b => b.id === data.beneficiaryId);
    const newRef = {
      id: `REF-${Math.floor(700 + Math.random() * 300)}`,
      beneficiaryId: data.beneficiaryId,
      beneficiaryName: ben ? ben.name : 'Unknown',
      workerName: 'Sunita Patil',
      reason: data.reason,
      healthCentre: data.healthCentre,
      priority: data.priority || 'Normal',
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      status: 'Pending',
      notes: data.notes || ''
    };

    if (isSimulatedOffline) {
      setOfflineQueue(prev => [...prev, { type: 'CREATE_REFERRAL', data: newRef, timestamp: new Date().toISOString() }]);
    }

    setReferrals(prev => [newRef, ...prev]);

    addNotification({
      title: 'Referral Initiated',
      desc: `Referral created for ${newRef.beneficiaryName} to ${newRef.healthCentre}.`,
      type: 'info'
    });

    return newRef;
  };

  const updateReferralStatus = (refId, status) => {
    setReferrals(prev => prev.map(r => r.id === refId ? { ...r, status } : r));
  };

  // Tasks (Supervisor -> Worker)
  const createTask = (taskData) => {
    const newTask = {
      id: `TSK-${Math.floor(300 + Math.random() * 700)}`,
      title: taskData.title,
      workerId: taskData.workerId || 'ASHA-101',
      workerName: taskData.workerName || 'Sunita Patil',
      beneficiaryName: taskData.beneficiaryName || 'Household Visit',
      household: taskData.household || 'Assigned Area',
      dueDate: taskData.dueDate,
      priority: taskData.priority || 'Normal',
      instructions: taskData.instructions || '',
      status: 'Pending'
    };

    setTasks(prev => [newTask, ...prev]);

    addNotification({
      title: 'New Task Assigned',
      desc: `Supervisor assigned "${newTask.title}" for ${newTask.beneficiaryName}.`,
      type: 'warning'
    });

    return newTask;
  };

  const updateTaskStatus = (taskId, status) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status } : t));
  };

  // Alerts
  const resolveAlert = (alertId) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, resolved: true } : a));
  };

  // Notifications
  const addNotification = (notif) => {
    const item = {
      id: Date.now(),
      title: notif.title,
      desc: notif.desc,
      time: 'Just now',
      read: false,
      type: notif.type || 'info'
    };
    setNotifications(prev => [item, ...prev]);
  };

  const markNotificationRead = (id) => {
    setNotifications(prev => prev.map(n =>
      String(n.id) === String(id) ? { ...n, read: true } : n
    ));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Derived Counts & Metrics
  const stats = {
    totalBeneficiaries: beneficiaries.length,
    pregnantWomen: beneficiaries.filter(b => b.category === 'Pregnant Woman').length,
    children: beneficiaries.filter(b => b.category === 'Child').length,
    elderly: beneficiaries.filter(b => b.category === 'Elderly').length,
    highRisk: beneficiaries.filter(b => b.status === 'High Risk' || b.status === 'Attention').length,
    totalVisits: visits.length,
    completedVisitsToday: visits.filter(v => v.visitDate === '2026-09-20' && v.status !== 'Pending').length,
    pendingVisitsToday: visits.filter(v => v.visitDate === '2026-09-20' && v.status === 'Pending').length,
    pendingDocuments: documents.filter(d => d.status === 'Pending').length,
    approvedDocuments: documents.filter(d => d.status === 'Approved').length,
    needsCorrectionDocuments: documents.filter(d => d.status === 'Needs Correction').length,
    totalWorkers: workers.length,
    activeReferrals: referrals.filter(r => r.status !== 'Completed').length,
    pendingTasks: tasks.filter(t => t.status === 'Pending' || t.status === 'In Progress').length
  };

  return (
    <DataContext.Provider
      value={{
        beneficiaries,
        addBeneficiary,
        updateBeneficiary,
        visits,
        recordVisit,
        documents,
        refreshDocuments,
        approveDocument,
        requestDocumentCorrection,
        reuploadDocument,
        tasks,
        createTask,
        updateTaskStatus,
        referrals,
        createReferral,
        updateReferralStatus,
        alerts,
        resolveAlert,
        workers,
        notifications,
        addNotification,
        markNotificationRead,
        markAllNotificationsRead,
        stats,
        // Offline
        isSimulatedOffline,
        toggleOfflineMode,
        offlineQueue,
        syncOfflineQueue,
        lastSyncTime
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) {
    throw new Error('useData must be used within DataProvider');
  }
  return ctx;
}
