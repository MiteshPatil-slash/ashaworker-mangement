const request = require('supertest');
const app = require('../src/server');
const { calculateEDD, calculateGestationalAge, evaluatePregnancyRisk } = require('../src/services/pregnancyCalc');
const { generateChildVaccineSchedule } = require('../src/services/vaccineSchedule');

describe('ASHA Smart Management System - Backend API & Services', () => {
  let adminToken = '';
  let ashaToken = '';

  beforeAll(async () => {
    // Wait for seed data to initialize
    await new Promise(r => setTimeout(r, 1000));

    // Admin login
    const adminRes = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'Admin@123' });
    adminToken = adminRes.body.token;

    // ASHA Worker login
    const ashaRes = await request(app)
      .post('/api/auth/login')
      .send({ username: 'asha_sunita', password: 'Asha@123' });
    ashaToken = ashaRes.body.token;
  });

  describe('1. Health Check Endpoint', () => {
    it('should return 200 and healthy status', async () => {
      const res = await request(app).get('/api/health');
      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual('healthy');
      expect(res.body.service).toContain('ASHA');
    });
  });

  describe('2. Authentication & Authorization', () => {
    it('should authenticate Admin user and return JWT', async () => {
      expect(adminToken).toBeDefined();
      expect(adminToken.length).toBeGreaterThan(10);
    });

    it('should authenticate ASHA Worker user', async () => {
      expect(ashaToken).toBeDefined();
      expect(ashaToken.length).toBeGreaterThan(10);
    });

    it('should reject invalid credentials with 401', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'admin', password: 'WrongPassword!' });
      expect(res.statusCode).toEqual(401);
      expect(res.body.success).toBe(false);
    });

    it('should allow Admin to view Audit Logs', async () => {
      const res = await request(app)
        .get('/api/audit-logs')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.logs)).toBe(true);
    });

    it('should forbid ASHA Worker from accessing Admin Audit Logs', async () => {
      const res = await request(app)
        .get('/api/audit-logs')
        .set('Authorization', `Bearer ${ashaToken}`);
      expect(res.statusCode).toEqual(403);
    });
  });

  describe('3. Pregnancy Calculations & Clinical-Protocol Risk Flags', () => {
    it('should accurately calculate EDD (+280 days from LMP)', () => {
      const lmp = '2026-01-01';
      const edd = calculateEDD(lmp);
      expect(edd).toEqual('2026-10-08');
    });

    it('should compute gestational weeks and trimester stage', () => {
      const lmp = '2026-01-01';
      const res = calculateGestationalAge(lmp);
      expect(res.weeks).toBeGreaterThanOrEqual(0);
      expect(res.trimester).toBeDefined();
    });

    it('should flag elevated BP (145/95) as HIGH_PRIORITY protocol alert', () => {
      const evalRes = evaluatePregnancyRisk({ systolicBP: 145, diastolicBP: 95 });
      expect(evalRes.riskLevel).toEqual('HIGH_PRIORITY');
      expect(evalRes.reasons.some(r => r.includes('Blood Pressure'))).toBe(true);
      expect(evalRes.disclaimer).toBeDefined();
    });

    it('should flag normal parameters as NORMAL', () => {
      const evalRes = evaluatePregnancyRisk({ systolicBP: 118, diastolicBP: 78, hemoglobin: 12.0 });
      expect(evalRes.riskLevel).toEqual('NORMAL');
    });
  });

  describe('4. Child Care & Vaccine Engine', () => {
    it('should generate complete National Immunization Schedule for newborn', () => {
      const dob = '2026-06-01';
      const schedule = generateChildVaccineSchedule(dob, []);
      expect(schedule.length).toBeGreaterThan(10);
      expect(schedule.some(v => v.code === 'BIRTH_BCG')).toBe(true);
      expect(schedule.some(v => v.code === 'W6_PENTA1')).toBe(true);
    });

    it('should mark completed vaccines accordingly', () => {
      const dob = '2026-01-01';
      const completed = [{ vaccineCode: 'BIRTH_BCG', givenDate: '2026-01-01', batchNo: 'BCG-01' }];
      const schedule = generateChildVaccineSchedule(dob, completed);
      const bcg = schedule.find(v => v.code === 'BIRTH_BCG');
      expect(bcg.status).toEqual('COMPLETED');
    });
  });

  describe('5. Medicine Inventory & Safety Checks', () => {
    it('should fetch inventory list with status indicators', async () => {
      const res = await request(app)
        .get('/api/medicines')
        .set('Authorization', `Bearer ${ashaToken}`);
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body.medicines)).toBe(true);
      expect(res.body.medicines.length).toBeGreaterThan(0);
    });

    it('should distribute available medicine and update remaining stock', async () => {
      const getMedRes = await request(app)
        .get('/api/medicines')
        .set('Authorization', `Bearer ${ashaToken}`);
      const ifaMed = getMedRes.body.medicines.find(m => m.medicineName.includes('IFA'));

      if (ifaMed && ifaMed.availableQuantity >= 10) {
        const prevQty = ifaMed.availableQuantity;
        const distRes = await request(app)
          .post('/api/medicines/distribute')
          .set('Authorization', `Bearer ${ashaToken}`)
          .send({
            medicineId: ifaMed._id,
            quantity: 10,
            recipientName: 'Test Beneficiary',
            beneficiaryType: 'PREGNANT_WOMAN'
          });

        expect(distRes.statusCode).toEqual(200);
        expect(distRes.body.remainingStock).toEqual(prevQty - 10);
      }
    });
  });

  describe('6. Smart Task & Notification Generator', () => {
    it('should retrieve prioritized smart tasks for worker', async () => {
      const res = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${ashaToken}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.tasks)).toBe(true);
      expect(res.body.summary).toBeDefined();
    });

    it('should retrieve centralized notifications', async () => {
      const res = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${ashaToken}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.notifications)).toBe(true);
    });
  });

  afterAll(async () => {
    const mongoose = require('mongoose');
    if (mongoose.connection && mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });
});
