const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const {
  Admin,
  Supervisor,
  AshaWorker,
  Beneficiary,
  Visit,
  Alert,
  Task
} = require('../models');

async function seedMongoDatabase() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/Asha-worker-management';

  if (mongoose.connection.readyState !== 1) {
    console.log(`Connecting to ${uri} to seed simplified database...`);
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  }

  const existingCollections = await mongoose.connection.db.listCollections().toArray();
  const colNames = existingCollections.map(c => c.name);

  const dropCols = [
    'users', 'areas', 'pregnancyrecords', 'childhealthrecords',
    'elderlyhealthrecords', 'documents', 'followups', 'referrals',
    'notifications', 'auditlogs'
  ];

  for (const c of dropCols) {
    if (colNames.includes(c)) {
      try {
        await mongoose.connection.db.dropCollection(c);
        console.log(`🧹 Removed complex collection: ${c}`);
      } catch (err) {}
    }
  }

  await Admin.deleteMany({});
  await Supervisor.deleteMany({});
  await AshaWorker.deleteMany({});
  await Beneficiary.deleteMany({});
  await Visit.deleteMany({});
  await Alert.deleteMany({});
  await Task.deleteMany({});

  console.log('🌱 Seeding clean, easy-to-understand collections...');

  const pwHash = await bcrypt.hash('Asha@123', 10);

  await Admin.create({
    username: 'admin_rajesh',
    fullName: 'Dr. Rajesh Sharma (Chief Medical Officer)',
    mobile: '9822001122',
    email: 'admin.rajesh@district-health.gov.in',
    password: pwHash,
    role: 'admin',
    status: 'active'
  });

  await Supervisor.create({
    supervisorId: 'SUP-01',
    username: 'sup_pooja',
    fullName: 'Pooja Verma (Health Supervisor)',
    mobile: '9822003344',
    email: 'pooja.supervisor@district-health.gov.in',
    password: pwHash,
    assignedArea: 'Chandrapur Health Block',
    status: 'active'
  });

  await AshaWorker.create([
    {
      workerId: 'ASHA-101',
      fullName: 'Sunita Patil',
      mobile: '9876543210',
      username: 'asha_sunita',
      password: pwHash,
      assignedVillage: 'Chandrapur Sector 1 & 2',
      supervisorName: 'Pooja Verma (Supervisor)',
      assignedHealthCentre: 'Chandrapur Rural PHC',
      status: 'active'
    },
    {
      workerId: 'ASHA-102',
      fullName: 'Anita Sharma',
      mobile: '9812345678',
      username: 'asha_anita',
      password: pwHash,
      assignedVillage: 'Chandrapur Sector 3 & 4',
      supervisorName: 'Pooja Verma (Supervisor)',
      assignedHealthCentre: 'Chandrapur Rural PHC',
      status: 'active'
    }
  ]);

  await Beneficiary.create([
    {
      beneficiaryId: 'BEN-001',
      fullName: 'Kavita Suresh Rathod',
      age: 24,
      gender: 'female',
      mobile: '9890112233',
      address: 'House #42, Lane 3',
      village: 'Chandrapur Sector 1',
      assignedAshaWorker: 'Sunita Patil',
      category: 'pregnant',
      riskLevel: 'high',
      pregnancyDetails: {
        weeks: 24,
        expectedDeliveryDate: new Date('2026-11-20'),
        bloodPressure: '145/95',
        bloodGroup: 'B+',
        hemoglobin: 10.2
      },
      notes: 'High BP reported during 2nd trimester ANC check',
      status: 'active'
    },
    {
      beneficiaryId: 'BEN-002',
      fullName: 'Aarav Sachin Gaikwad',
      age: 1,
      gender: 'male',
      mobile: '9890445566',
      address: 'House #18, Main Road',
      village: 'Chandrapur Sector 1',
      assignedAshaWorker: 'Sunita Patil',
      category: 'child',
      riskLevel: 'normal',
      childDetails: {
        weight: 9.2,
        height: 74,
        nextVaccinationDate: new Date('2026-10-15'),
        vaccinationStatus: 'Up-to-date (BCG, OPV-1, Pentavalent-1)'
      },
      status: 'active'
    },
    {
      beneficiaryId: 'BEN-003',
      fullName: 'Ramchandra Patil',
      age: 68,
      gender: 'male',
      mobile: '9890887766',
      address: 'House #7, Temple Road',
      village: 'Chandrapur Sector 2',
      assignedAshaWorker: 'Sunita Patil',
      category: 'elderly',
      riskLevel: 'attention',
      elderlyDetails: {
        bloodPressure: '138/88',
        diabetes: true,
        conditions: ['Type 2 Diabetes', 'Mild Arthritis']
      },
      notes: 'Needs regular glucose and BP checkups',
      status: 'active'
    }
  ]);

  await Visit.create([
    {
      visitId: 'VIS-001',
      beneficiaryName: 'Kavita Suresh Rathod',
      ashaWorkerName: 'Sunita Patil',
      visitDate: new Date(),
      visitType: 'health_issue',
      bloodPressure: '145/95',
      temperature: 98.6,
      weight: 58,
      symptoms: ['Headache', 'Mild swelling in feet'],
      riskLevel: 'high',
      notes: 'Advised rest and referred to PHC Medical Officer for hypertensive review',
      status: 'completed'
    },
    {
      visitId: 'VIS-002',
      beneficiaryName: 'Aarav Sachin Gaikwad',
      ashaWorkerName: 'Sunita Patil',
      visitDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      visitType: 'routine',
      temperature: 98.2,
      weight: 9.2,
      symptoms: [],
      riskLevel: 'normal',
      notes: 'Child milestone growth is healthy',
      status: 'completed'
    }
  ]);

  await Alert.create([
    {
      alertId: 'ALT-001',
      beneficiaryName: 'Kavita Suresh Rathod',
      ashaWorkerName: 'Sunita Patil',
      type: 'high_risk',
      title: 'High Blood Pressure Alert (145/95)',
      message: 'Pregnant beneficiary Kavita Rathod has elevated BP. Immediate follow-up required.',
      priority: 'urgent',
      status: 'active'
    },
    {
      alertId: 'ALT-002',
      beneficiaryName: 'Aarav Sachin Gaikwad',
      ashaWorkerName: 'Sunita Patil',
      type: 'vaccination_due',
      title: 'Upcoming Immunization Due',
      message: 'Scheduled Measles & Rubella (MR-1) dose due on 15 Oct 2026.',
      priority: 'normal',
      status: 'active'
    }
  ]);

  await Task.create([
    {
      taskId: 'TSK-001',
      title: 'Conduct High-Risk ANC Home Visit',
      description: 'Visit Kavita Rathod to re-check BP and check iron tablet intake.',
      assignedToAsha: 'Sunita Patil',
      assignedBySupervisor: 'Pooja Verma (Supervisor)',
      beneficiaryName: 'Kavita Suresh Rathod',
      village: 'Chandrapur Sector 1',
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      priority: 'urgent',
      status: 'pending'
    },
    {
      taskId: 'TSK-002',
      title: 'Senior Citizen Checkup Drive',
      description: 'Conduct monthly BP and sugar checkups for elderly residents.',
      assignedToAsha: 'Anita Sharma',
      assignedBySupervisor: 'Pooja Verma (Supervisor)',
      beneficiaryName: 'Ramchandra Patil',
      village: 'Chandrapur Sector 2',
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      priority: 'medium',
      status: 'pending'
    }
  ]);

  console.log('✅ Simplified database successfully seeded!');
}

if (require.main === module) {
  require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
  seedMongoDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Seed error:', err);
      process.exit(1);
    });
}

module.exports = { seedMongoDatabase };