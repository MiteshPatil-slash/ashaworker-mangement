const bcrypt = require('bcryptjs');
const dataStore = require('./dataStore');
const { ROLES, RISK_FLAGS, VISIT_STATUS, VISIT_TYPES, MEDICINE_STATUS, NOTIFICATION_PRIORITY, MODULES } = require('./constants');
const { calculateEDD } = require('../services/pregnancyCalc');

async function seedInitialData() {
  const userCount = await dataStore.users.countDocuments();
  if (userCount > 0) {
    return; // Already seeded
  }

  console.log('🌱 Seeding initial demo data for ASHA Smart Management System...');

  const passwordHash = await bcrypt.hash('Admin@123', 10);
  const ashaPasswordHash = await bcrypt.hash('Asha@123', 10);

  // 1. Users & Workers
  const adminUser = await dataStore.users.create({
    username: 'admin',
    password: passwordHash,
    role: ROLES.ADMIN,
    name: 'Dr. Ashok Deshmukh (District Health Officer)',
    mobile: '9822001122',
    email: 'admin@district-health.gov.in',
    status: 'ACTIVE',
    mustChangePassword: false
  });

  const worker1User = await dataStore.users.create({
    username: 'asha_sunita',
    password: ashaPasswordHash,
    role: ROLES.ASHA,
    name: 'Sunita Patil',
    mobile: '9876543210',
    workerId: 'ASHA-MH-00101',
    status: 'ACTIVE',
    mustChangePassword: false
  });

  const worker2User = await dataStore.users.create({
    username: 'asha_anita',
    password: ashaPasswordHash,
    role: ROLES.ASHA,
    name: 'Anita Sharma',
    mobile: '9812345678',
    workerId: 'ASHA-MH-00102',
    status: 'ACTIVE',
    mustChangePassword: false
  });

  const worker1 = await dataStore.workers.create({
    userId: worker1User._id,
    workerId: 'ASHA-MH-00101',
    username: 'asha_sunita',
    name: 'Sunita Patil',
    mobile: '9876543210',
    assignedVillage: 'Chandrapur Sector 1 & 2',
    assignedHealthCentre: 'Chandrapur Rural Primary Health Centre (PHC)',
    status: 'ACTIVE',
    joiningDate: '2023-01-15'
  });

  const worker2 = await dataStore.workers.create({
    userId: worker2User._id,
    workerId: 'ASHA-MH-00102',
    username: 'asha_anita',
    name: 'Anita Sharma',
    mobile: '9812345678',
    assignedVillage: 'Wardha East Sub-Division',
    assignedHealthCentre: 'Wardha Sub-Centre',
    status: 'ACTIVE',
    joiningDate: '2023-04-10'
  });

  // 2. Health Facilities Directory
  const facilities = await dataStore.facilities.insertMany([
    {
      name: 'Chandrapur Rural Primary Health Centre (PHC)',
      type: 'PHC',
      address: 'Near Gram Panchayat Office, Chandrapur Village',
      contactNumber: '+91 7172 254101',
      emergencyNumber: '108',
      doctorInCharge: 'Dr. Rajesh Verma (MBBS)',
      services: ['24x7 Normal Delivery', 'Antenatal Clinic', 'Routine Immunization', 'Basic Pathology Lab', 'Pharmacy'],
      operatingHours: '24 Hours (Emergency & Labour Room)',
      coordinates: { lat: 19.9615, lng: 79.2961 }
    },
    {
      name: 'Wardha Community Health Centre (CHC)',
      type: 'CHC',
      address: 'Main Road, Near Bus Stand, Wardha',
      contactNumber: '+91 7152 233400',
      emergencyNumber: '108',
      doctorInCharge: 'Dr. Meenakshi Joshi (MD OBGYN)',
      services: ['Specialist OBGYN', 'Pediatric Care', 'C-Section Facility', 'Blood Storage Unit', 'Ultrasound USG'],
      operatingHours: '24 Hours',
      coordinates: { lat: 20.7453, lng: 78.6022 }
    },
    {
      name: 'District Civil Hospital Chandrapur',
      type: 'DISTRICT_HOSPITAL',
      address: 'Civil Lines, Chandrapur, Maharashtra 442401',
      contactNumber: '+91 7172 260200',
      emergencyNumber: '102 / 108',
      doctorInCharge: 'Dr. Suresh Kale (Civil Surgeon)',
      services: ['Tertiary Maternal Care', 'NICU & PICU', 'Blood Bank', 'Emergency Trauma Care', 'High-Risk Pregnancy Unit'],
      operatingHours: '24 Hours',
      coordinates: { lat: 19.9535, lng: 79.3032 }
    },
    {
      name: 'Chandrapur Sub-Centre Sector 2',
      type: 'SUB_CENTRE',
      address: 'Sector 2 Community Hall, Chandrapur',
      contactNumber: '+91 9422 109876',
      emergencyNumber: '108',
      doctorInCharge: 'Sister Vandana (ANM)',
      services: ['Weekly VHND', 'Immunization', 'IFA / Calcium Distribution', 'Home Visit Base'],
      operatingHours: '9:00 AM - 4:00 PM',
      coordinates: { lat: 19.9680, lng: 79.2910 }
    }
  ]);

  // 3. Families
  const fam1 = await dataStore.families.create({
    familyId: 'FAM-MH-0101',
    headOfFamily: 'Ramesh Patil',
    contactNumber: '9876543210',
    address: 'House #14, Shivaji Nagar, Chandrapur',
    village: 'Chandrapur Sector 1',
    category: 'BPL',
    workerId: worker1.workerId,
    members: [
      { name: 'Ramesh Patil', relation: 'Self/Head', age: 32, gender: 'Male' },
      { name: 'Sunita Patil', relation: 'Wife', age: 29, gender: 'Female' },
      { name: 'Aarav Patil', relation: 'Son', age: 0, gender: 'Male' }
    ]
  });

  const fam2 = await dataStore.families.create({
    familyId: 'FAM-MH-0102',
    headOfFamily: 'Rajesh Deshmukh',
    contactNumber: '9822334455',
    address: 'House #28, Ward 3, Near Water Tank, Chandrapur',
    village: 'Chandrapur Sector 1',
    category: 'APL',
    workerId: worker1.workerId,
    members: [
      { name: 'Rajesh Deshmukh', relation: 'Self/Head', age: 30, gender: 'Male' },
      { name: 'Priya Deshmukh', relation: 'Wife', age: 24, gender: 'Female' },
      { name: 'Ananya Deshmukh', relation: 'Daughter', age: 1, gender: 'Female' }
    ]
  });

  const fam3 = await dataStore.families.create({
    familyId: 'FAM-MH-0103',
    headOfFamily: 'Santosh Gaikwad',
    contactNumber: '9765432109',
    address: 'House #52, North Basti, Chandrapur',
    village: 'Chandrapur Sector 2',
    category: 'BPL',
    workerId: worker1.workerId,
    members: [
      { name: 'Santosh Gaikwad', relation: 'Self/Head', age: 34, gender: 'Male' },
      { name: 'Meena Gaikwad', relation: 'Wife', age: 28, gender: 'Female' },
      { name: 'Kavita Gaikwad', relation: 'Mother', age: 60, gender: 'Female' }
    ]
  });

  const fam4 = await dataStore.families.create({
    familyId: 'FAM-MH-0104',
    headOfFamily: 'Sachin Shinde',
    contactNumber: '9422887766',
    address: 'House #09, Market Road, Chandrapur',
    village: 'Chandrapur Sector 2',
    category: 'APL',
    workerId: worker1.workerId,
    members: [
      { name: 'Sachin Shinde', relation: 'Self/Head', age: 26, gender: 'Male' },
      { name: 'Pooja Shinde', relation: 'Wife', age: 22, gender: 'Female' }
    ]
  });

  // Calculate past dates for LMP
  const dateOffset = (daysAgo) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().split('T')[0];
  };

  const lmpPriya = dateOffset(168); // ~24 weeks ago
  const lmpMeena = dateOffset(245); // ~35 weeks ago
  const lmpPooja = dateOffset(56);  // ~8 weeks ago

  // 4. Pregnancies
  const preg1 = await dataStore.pregnancies.create({
    womanName: 'Priya Deshmukh',
    age: 24,
    mobile: '9822334455',
    address: 'House #28, Ward 3, Chandrapur',
    familyId: fam2.familyId,
    workerId: worker1.workerId,
    bloodGroup: 'B+',
    gravida: 2,
    parity: 1,
    lmpDate: lmpPriya,
    expectedDeliveryDate: calculateEDD(lmpPriya),
    riskLevel: RISK_FLAGS.NORMAL,
    riskReasons: ['Standard routine maternal protocol'],
    status: 'ACTIVE',
    ancVisits: [
      {
        code: 'ANC_1',
        date: dateOffset(110),
        weightKg: 52,
        bloodPressure: '118/76',
        hemoglobin: 11.4,
        ttDose: 'TT-1 given',
        ifaDistributed: 60,
        remarks: 'Normal baseline checkup. Advised nutritious diet.'
      },
      {
        code: 'ANC_2',
        date: dateOffset(40),
        weightKg: 55,
        bloodPressure: '120/80',
        hemoglobin: 11.2,
        ttDose: 'TT-2 given',
        ifaDistributed: 60,
        remarks: 'Fetal heart sound clear. USG report normal.'
      }
    ],
    documents: [
      { title: 'MCP Health Card', type: 'HEALTH_CARD', url: '/uploads/sample-mcp-card.jpg', uploadedAt: dateOffset(110) }
    ]
  });

  const preg2 = await dataStore.pregnancies.create({
    womanName: 'Meena Gaikwad',
    age: 28,
    mobile: '9765432109',
    address: 'House #52, North Basti, Chandrapur',
    familyId: fam3.familyId,
    workerId: worker1.workerId,
    bloodGroup: 'O+',
    gravida: 2,
    parity: 1,
    lmpDate: lmpMeena,
    expectedDeliveryDate: calculateEDD(lmpMeena),
    riskLevel: RISK_FLAGS.HIGH_PRIORITY,
    riskReasons: ['Elevated Blood Pressure (>= 140/90 mmHg)', 'Symptoms of Pre-eclampsia (Severe headache/blurred vision)'],
    status: 'ACTIVE',
    ancVisits: [
      {
        code: 'ANC_1',
        date: dateOffset(180),
        weightKg: 56,
        bloodPressure: '124/82',
        hemoglobin: 10.2,
        ttDose: 'TT-1 given',
        ifaDistributed: 60,
        remarks: 'First registration completed.'
      },
      {
        code: 'ANC_2',
        date: dateOffset(100),
        weightKg: 59,
        bloodPressure: '132/86',
        hemoglobin: 9.8,
        ttDose: 'TT-2 given',
        ifaDistributed: 60,
        remarks: 'Mild pedal edema noted. Advised rest.'
      },
      {
        code: 'ANC_3',
        date: dateOffset(15),
        weightKg: 62,
        bloodPressure: '146/96',
        hemoglobin: 9.5,
        ttDose: 'Completed',
        ifaDistributed: 60,
        remarks: 'BP elevated (146/96). Referred immediately to District Civil Hospital.'
      }
    ],
    documents: [
      { title: 'ANC Referral Slip', type: 'REFERRAL_DOC', url: '/uploads/sample-referral.jpg', uploadedAt: dateOffset(15) }
    ]
  });

  const preg3 = await dataStore.pregnancies.create({
    womanName: 'Pooja Shinde',
    age: 22,
    mobile: '9422887766',
    address: 'House #09, Market Road, Chandrapur',
    familyId: fam4.familyId,
    workerId: worker1.workerId,
    bloodGroup: 'A+',
    gravida: 1,
    parity: 0,
    lmpDate: lmpPooja,
    expectedDeliveryDate: calculateEDD(lmpPooja),
    riskLevel: RISK_FLAGS.NEEDS_FOLLOW_UP,
    riskReasons: ['Moderate Anemia (Hb 7-10.9 g/dL) - Needs IFA tracking'],
    status: 'ACTIVE',
    ancVisits: [
      {
        code: 'ANC_1',
        date: dateOffset(10),
        weightKg: 46,
        bloodPressure: '110/70',
        hemoglobin: 9.6,
        ttDose: 'TT-1 given',
        ifaDistributed: 60,
        remarks: 'Early pregnancy registration. Hb 9.6 g/dL. Instructed on green leafy vegetables & daily IFA tablet.'
      }
    ],
    documents: []
  });

  // 5. Referrals
  await dataStore.referrals.create({
    patientName: 'Meena Gaikwad',
    category: 'PREGNANCY',
    patientId: preg2._id,
    familyId: fam3.familyId,
    workerId: worker1.workerId,
    reason: 'Elevated BP (146/96 mmHg) in 35th week with headache',
    priority: 'HIGH',
    facilityId: facilities[2]._id,
    facilityName: facilities[2].name,
    referralDate: dateOffset(2),
    status: 'PENDING',
    remarks: 'Referred for specialist OBGYN evaluation and antihypertensive management.'
  });

  // 6. Children
  const dobAarav = dateOffset(120); // ~4 months
  const dobAnanya = dateOffset(420); // ~14 months

  await dataStore.children.create({
    childId: 'CHD-MH-2026-0012',
    childName: 'Aarav Patil',
    dateOfBirth: dobAarav,
    gender: 'Male',
    motherName: 'Sunita Patil',
    fatherName: 'Ramesh Patil',
    familyId: fam1.familyId,
    workerId: worker1.workerId,
    birthWeightKg: 3.2,
    placeOfBirth: 'Chandrapur Rural PHC',
    deliveryType: 'Normal Institutional',
    completedVaccines: [
      { vaccineCode: 'BIRTH_BCG', givenDate: dobAarav, batchNo: 'BCG-4412', givenBy: 'ANM Vandana' },
      { vaccineCode: 'BIRTH_OPV0', givenDate: dobAarav, batchNo: 'OPV-9910', givenBy: 'ANM Vandana' },
      { vaccineCode: 'BIRTH_HEPB', givenDate: dobAarav, batchNo: 'HEP-1120', givenBy: 'ANM Vandana' },
      { vaccineCode: 'W6_OPV1', givenDate: dateOffset(78), batchNo: 'OPV-9910', givenBy: 'ANM Vandana' },
      { vaccineCode: 'W6_PENTA1', givenDate: dateOffset(78), batchNo: 'PEN-3321', givenBy: 'ANM Vandana' },
      { vaccineCode: 'W6_ROTA1', givenDate: dateOffset(78), batchNo: 'ROT-8841', givenBy: 'ANM Vandana' },
      { vaccineCode: 'W6_IPV1', givenDate: dateOffset(78), batchNo: 'IPV-0021', givenBy: 'ANM Vandana' },
      { vaccineCode: 'W6_PCV1', givenDate: dateOffset(78), batchNo: 'PCV-5561', givenBy: 'ANM Vandana' },
      { vaccineCode: 'W10_OPV2', givenDate: dateOffset(50), batchNo: 'OPV-9910', givenBy: 'ANM Vandana' },
      { vaccineCode: 'W10_PENTA2', givenDate: dateOffset(50), batchNo: 'PEN-3322', givenBy: 'ANM Vandana' },
      { vaccineCode: 'W10_ROTA2', givenDate: dateOffset(50), batchNo: 'ROT-8842', givenBy: 'ANM Vandana' }
    ],
    growthRecords: [
      { date: dobAarav, weightKg: 3.2, heightCm: 50, muacCm: 11.5, notes: 'Birth measurement' },
      { date: dateOffset(78), weightKg: 4.8, heightCm: 56, muacCm: 12.8, notes: '6-week visit, exclusive breastfeeding' },
      { date: dateOffset(50), weightKg: 5.8, heightCm: 60, muacCm: 13.5, notes: '10-week checkup' },
      { date: dateOffset(10), weightKg: 6.5, heightCm: 63, muacCm: 14.1, notes: 'Healthy growth on curve' }
    ],
    documents: []
  });

  await dataStore.children.create({
    childId: 'CHD-MH-2025-0089',
    childName: 'Ananya Deshmukh',
    dateOfBirth: dobAnanya,
    gender: 'Female',
    motherName: 'Priya Deshmukh',
    fatherName: 'Rajesh Deshmukh',
    familyId: fam2.familyId,
    workerId: worker1.workerId,
    birthWeightKg: 2.9,
    placeOfBirth: 'District Civil Hospital Chandrapur',
    deliveryType: 'Normal Institutional',
    completedVaccines: [
      { vaccineCode: 'BIRTH_BCG', givenDate: dobAnanya, batchNo: 'BCG-4412', givenBy: 'Staff Nurse' },
      { vaccineCode: 'BIRTH_OPV0', givenDate: dobAnanya, batchNo: 'OPV-9910', givenBy: 'Staff Nurse' },
      { vaccineCode: 'BIRTH_HEPB', givenDate: dobAnanya, batchNo: 'HEP-1120', givenBy: 'Staff Nurse' },
      { vaccineCode: 'W6_OPV1', givenDate: dateOffset(378), batchNo: 'OPV-9910', givenBy: 'ANM' },
      { vaccineCode: 'W6_PENTA1', givenDate: dateOffset(378), batchNo: 'PEN-3321', givenBy: 'ANM' },
      { vaccineCode: 'W6_ROTA1', givenDate: dateOffset(378), batchNo: 'ROT-8841', givenBy: 'ANM' },
      { vaccineCode: 'W10_OPV2', givenDate: dateOffset(350), batchNo: 'OPV-9910', givenBy: 'ANM' },
      { vaccineCode: 'W10_PENTA2', givenDate: dateOffset(350), batchNo: 'PEN-3322', givenBy: 'ANM' },
      { vaccineCode: 'W10_ROTA2', givenDate: dateOffset(350), batchNo: 'ROT-8842', givenBy: 'ANM' },
      { vaccineCode: 'W14_OPV3', givenDate: dateOffset(320), batchNo: 'OPV-9910', givenBy: 'ANM' },
      { vaccineCode: 'W14_PENTA3', givenDate: dateOffset(320), batchNo: 'PEN-3323', givenBy: 'ANM' },
      { vaccineCode: 'W14_ROTA3', givenDate: dateOffset(320), batchNo: 'ROT-8843', givenBy: 'ANM' },
      { vaccineCode: 'M9_MR1', givenDate: dateOffset(150), batchNo: 'MR-7711', givenBy: 'ANM' },
      { vaccineCode: 'M9_VITA1', givenDate: dateOffset(150), batchNo: 'VIT-1099', givenBy: 'ANM' }
    ],
    growthRecords: [
      { date: dobAnanya, weightKg: 2.9, heightCm: 49, muacCm: 11.2, notes: 'Birth measurement' },
      { date: dateOffset(320), weightKg: 6.8, heightCm: 65, muacCm: 13.6, notes: '14-week check' },
      { date: dateOffset(150), weightKg: 8.5, heightCm: 72, muacCm: 14.5, notes: '9-month checkup' },
      { date: dateOffset(20), weightKg: 9.3, heightCm: 76, muacCm: 14.8, notes: '14-month routine measurement' }
    ],
    documents: []
  });

  // 7. Medicine Inventory
  await dataStore.medicines.insertMany([
    {
      medicineName: 'Iron & Folic Acid (IFA) Tablets (Red)',
      genericName: 'Ferrous Sulphate 100mg + Folic Acid 0.5mg',
      category: 'Maternal Nutrition',
      batchNo: 'IFA-2025-A',
      unit: 'Tablets',
      availableQuantity: 340,
      minThreshold: 100,
      expiryDate: '2027-05-15',
      workerId: worker1.workerId,
      status: MEDICINE_STATUS.AVAILABLE
    },
    {
      medicineName: 'Calcium & Vitamin D3 (500mg)',
      genericName: 'Calcium Carbonate 500mg + Vit D3 250 IU',
      category: 'Maternal Nutrition',
      batchNo: 'CAL-2025-C',
      unit: 'Tablets',
      availableQuantity: 180,
      minThreshold: 100,
      expiryDate: '2027-01-10',
      workerId: worker1.workerId,
      status: MEDICINE_STATUS.AVAILABLE
    },
    {
      medicineName: 'Oral Rehydration Salts (ORS)',
      genericName: 'WHO Standard ORS Formula',
      category: 'Child Health / Diarrhea',
      batchNo: 'ORS-2024-X',
      unit: 'Sachets',
      availableQuantity: 42,
      minThreshold: 50,
      expiryDate: '2026-11-20',
      workerId: worker1.workerId,
      status: MEDICINE_STATUS.LOW_STOCK
    },
    {
      medicineName: 'Zinc Sulphate Tablets (20mg)',
      genericName: 'Dispersible Zinc Sulphate 20mg',
      category: 'Child Health / Diarrhea',
      batchNo: 'ZINC-2024-M',
      unit: 'Tablets',
      availableQuantity: 18,
      minThreshold: 40,
      expiryDate: dateOffset(-25), // Expiring in 25 days
      workerId: worker1.workerId,
      status: MEDICINE_STATUS.EXPIRING_SOON
    },
    {
      medicineName: 'Paracetamol Pediatric Suspension',
      genericName: 'Paracetamol 120mg / 5ml',
      category: 'Pediatric Care',
      batchNo: 'PCM-2025-D',
      unit: 'Bottles',
      availableQuantity: 65,
      minThreshold: 20,
      expiryDate: '2027-08-15',
      workerId: worker1.workerId,
      status: MEDICINE_STATUS.AVAILABLE
    },
    {
      medicineName: 'Albendazole Chewable (400mg)',
      genericName: 'Albendazole 400mg',
      category: 'Deworming',
      batchNo: 'ALB-2025-K',
      unit: 'Tablets',
      availableQuantity: 95,
      minThreshold: 30,
      expiryDate: '2027-03-20',
      workerId: worker1.workerId,
      status: MEDICINE_STATUS.AVAILABLE
    },
    {
      medicineName: 'Amoxicillin Dispersible (125mg)',
      genericName: 'Amoxicillin 125mg DT',
      category: 'Pediatric Respiratory',
      batchNo: 'AMX-2024-Z',
      unit: 'Tablets',
      availableQuantity: 0,
      minThreshold: 30,
      expiryDate: '2026-12-31',
      workerId: worker1.workerId,
      status: MEDICINE_STATUS.OUT_OF_STOCK
    }
  ]);

  // 8. Medicine Distribution Logs
  await dataStore.distributions.insertMany([
    {
      medicineName: 'Iron & Folic Acid (IFA) Tablets (Red)',
      quantity: 60,
      date: dateOffset(10),
      recipientName: 'Pooja Shinde',
      familyId: fam4.familyId,
      beneficiaryType: 'PREGNANT_WOMAN',
      workerId: worker1.workerId,
      remarks: 'Issued 2-month daily supply at 1st ANC registration.'
    },
    {
      medicineName: 'Calcium & Vitamin D3 (500mg)',
      quantity: 60,
      date: dateOffset(40),
      recipientName: 'Priya Deshmukh',
      familyId: fam2.familyId,
      beneficiaryType: 'PREGNANT_WOMAN',
      workerId: worker1.workerId,
      remarks: 'Issued second trimester calcium supplement.'
    },
    {
      medicineName: 'Oral Rehydration Salts (ORS)',
      quantity: 4,
      date: dateOffset(5),
      recipientName: 'Aarav Patil',
      familyId: fam1.familyId,
      beneficiaryType: 'CHILD',
      workerId: worker1.workerId,
      remarks: 'Given for mild diarrhea home management counseling.'
    }
  ]);

  // 9. Home Visits
  const todayStr = new Date().toISOString().split('T')[0];

  await dataStore.visits.insertMany([
    {
      beneficiaryName: 'Priya Deshmukh',
      beneficiaryType: 'PREGNANT_WOMAN',
      familyId: fam2.familyId,
      workerId: worker1.workerId,
      visitType: VISIT_TYPES.PREGNANCY_ANC,
      scheduledDate: dateOffset(3),
      scheduledTime: '10:30 AM',
      completedDate: dateOffset(3),
      status: VISIT_STATUS.COMPLETED,
      location: 'House #28, Ward 3, Chandrapur',
      observations: 'BP 120/80, Fetal heart sound audible, Mother feeling energetic and taking IFA regularly.',
      servicesProvided: ['Vitals check', 'Dietary counseling', 'Institutional delivery discussion'],
      remarks: 'Visit completed successfully. Family well-prepared.',
      nextFollowUpDate: dateOffset(-20)
    },
    {
      beneficiaryName: 'Meena Gaikwad',
      beneficiaryType: 'PREGNANT_WOMAN',
      familyId: fam3.familyId,
      workerId: worker1.workerId,
      visitType: VISIT_TYPES.PREGNANCY_ANC,
      scheduledDate: todayStr,
      scheduledTime: '11:00 AM',
      status: VISIT_STATUS.PENDING,
      location: 'House #52, North Basti, Chandrapur',
      observations: '',
      servicesProvided: [],
      remarks: 'High-priority check for elevated BP and referral status confirmation.',
      priority: 'URGENT'
    },
    {
      beneficiaryName: 'Aarav Patil',
      beneficiaryType: 'CHILD',
      familyId: fam1.familyId,
      workerId: worker1.workerId,
      visitType: VISIT_TYPES.CHILD_IMMUNIZATION,
      scheduledDate: todayStr,
      scheduledTime: '02:00 PM',
      status: VISIT_STATUS.PENDING,
      location: 'House #14, Shivaji Nagar, Chandrapur',
      observations: '',
      servicesProvided: [],
      remarks: '14-week vaccination round due check & growth measurement.',
      priority: 'NORMAL'
    },
    {
      beneficiaryName: 'Pooja Shinde',
      beneficiaryType: 'PREGNANT_WOMAN',
      familyId: fam4.familyId,
      workerId: worker1.workerId,
      visitType: VISIT_TYPES.PREGNANCY_ANC,
      scheduledDate: dateOffset(-5),
      scheduledTime: '04:00 PM',
      status: VISIT_STATUS.PENDING,
      location: 'House #09, Market Road, Chandrapur',
      observations: '',
      servicesProvided: [],
      remarks: 'Routine 1st trimester follow-up check.',
      priority: 'NORMAL'
    }
  ]);

  // 10. Audit Logs
  await dataStore.auditLogs.insertMany([
    {
      userId: adminUser._id,
      username: adminUser.username,
      role: ROLES.ADMIN,
      action: 'WORKER_ACCOUNT_PROVISIONED',
      module: MODULES.WORKER,
      recordId: worker1.workerId,
      details: { workerName: worker1.name, area: worker1.assignedVillage },
      ip: '192.168.1.10',
      timestamp: dateOffset(30) + 'T09:15:00Z'
    },
    {
      userId: worker1User._id,
      username: worker1User.username,
      role: ROLES.ASHA,
      workerId: worker1.workerId,
      action: 'PREGNANCY_REGISTERED',
      module: MODULES.PREGNANCY,
      recordId: preg1._id,
      details: { womanName: 'Priya Deshmukh', familyId: fam2.familyId },
      ip: '192.168.1.45',
      timestamp: dateOffset(20) + 'T10:45:00Z'
    },
    {
      userId: worker1User._id,
      username: worker1User.username,
      role: ROLES.ASHA,
      workerId: worker1.workerId,
      action: 'HIGH_RISK_REFERRAL_CREATED',
      module: MODULES.REFERRAL,
      recordId: preg2._id,
      details: { patient: 'Meena Gaikwad', reason: 'High BP (146/96)' },
      ip: '192.168.1.45',
      timestamp: dateOffset(2) + 'T14:20:00Z'
    }
  ]);

  console.log('✅ Initial demo data successfully seeded.');
}

// Makes sure a Supervisor login exists, even on databases seeded before this role was added.
async function ensureSupervisorUser() {
  const existing = await dataStore.users.findOne({ username: 'supervisor' });
  if (existing) return;
  const hash = await bcrypt.hash('Super@123', 10);
  await dataStore.users.create({
    username: 'supervisor',
    password: hash,
    role: ROLES.SUPERVISOR,
    name: 'Pooja Verma (Health Supervisor)',
    mobile: '9822003344',
    email: 'pooja.supervisor@district-health.gov.in',
    status: 'ACTIVE',
    mustChangePassword: false
  });
  console.log('✅ Supervisor account created (username: supervisor).');
}

if (require.main === module) {
  const path = require('path');
  require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
  const { connectDB } = require('./db');

  (async () => {
    await connectDB();
    const forceReset = process.argv.includes('--force') || process.argv.includes('--reset');
    if (forceReset) {
      console.log('🔄 Performing clean database reset...');
      dataStore.resetMemory();
      const mongoose = require('mongoose');
      if (mongoose.connection && mongoose.connection.readyState === 1 && mongoose.connection.db) {
        const collections = await mongoose.connection.db.listCollections().toArray();
        for (const col of collections) {
          await mongoose.connection.db.collection(col.name).deleteMany({});
        }
      }
    }
    await seedInitialData();
    await ensureSupervisorUser();
    console.log('✅ Seeding complete!');
    process.exit(0);
  })().catch(err => {
    console.error('Seed error:', err);
    process.exit(1);
  });
}

module.exports = { seedInitialData, ensureSupervisorUser };

