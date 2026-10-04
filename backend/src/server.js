const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

const { connectDB } = require('./config/db');
const { seedInitialData, ensureSupervisorUser } = require('./config/seedData');
const { errorHandler } = require('./middleware/error');

const authRoutes = require('./routes/auth.routes');
const workerRoutes = require('./routes/worker.routes');
const familyRoutes = require('./routes/family.routes');
const pregnancyRoutes = require('./routes/pregnancy.routes');
const childRoutes = require('./routes/child.routes');
const medicineRoutes = require('./routes/medicine.routes');
const visitRoutes = require('./routes/visit.routes');
const taskRoutes = require('./routes/task.routes');
const notificationRoutes = require('./routes/notification.routes');
const facilityRoutes = require('./routes/facility.routes');
const reportRoutes = require('./routes/report.routes');
const auditRoutes = require('./routes/audit.routes');
const documentRoutes = require('./routes/document.routes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'ASHA Smart Management System API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/families', familyRoutes);
app.use('/api/pregnancies', pregnancyRoutes);
app.use('/api/children', childRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/visits', visitRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/facilities', facilityRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/audit-logs', auditRoutes);
app.use('/api/documents', documentRoutes);

app.use(errorHandler);

const startServer = async () => {
  await connectDB();

  try {
    await seedInitialData();
  } catch (err) {
    console.warn('⚠️  Skipped local data seeding:', err.message);
  }

  try {
    await ensureSupervisorUser();
  } catch (err) {
    console.warn('⚠️  Could not ensure supervisor account:', err.message);
  }

  if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
      console.log(`🚀 ASHA Smart Management Backend running on port ${PORT}`);
      console.log(`📡 Health check available at http://localhost:${PORT}/api/health`);
    });
  }
};

startServer();

module.exports = app;