const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose');

const DATA_DIR = path.join(__dirname, '../../data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Initial default state
let memoryDB = {
  users: [],
  workers: [],
  families: [],
  pregnancies: [],
  children: [],
  vaccineConfigs: [],
  medicines: [],
  distributions: [],
  visits: [],
  notifications: [],
  tasks: [],
  referrals: [],
  facilities: [],
  auditLogs: []
};

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Load from disk if exists
function loadFromDisk() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf8');
      memoryDB = { ...memoryDB, ...JSON.parse(raw) };
    }
  } catch (err) {
    console.error('Error loading data from disk, using memory state:', err.message);
  }
}

// Persist to disk
function saveToDisk() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(memoryDB, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving data to disk:', err.message);
  }
}

loadFromDisk();

function isMongoConnected() {
  return mongoose.connection && mongoose.connection.readyState === 1 && !!mongoose.connection.db;
}

function getMongoCollection(name) {
  if (!isMongoConnected()) return null;
  return mongoose.connection.db.collection(name);
}

// Helpers to cleanly sync to user-friendly collections in MongoDB
async function syncToEasyCollections(collectionName, doc) {
  if (!isMongoConnected()) return;

  try {
    const db = mongoose.connection.db;

    // 1. If worker created/updated -> sync to ashaWorkers
    if (collectionName === 'workers') {
      const workerId = doc.workerId || `ASHA-MH-${String(doc._id).slice(0, 5)}`;
      await db.collection('ashaWorkers').updateOne(
        { $or: [{ workerId }, { mobile: doc.mobile }] },
        {
          $set: {
            workerId,
            fullName: doc.name || doc.fullName || 'ASHA Worker',
            mobile: doc.mobile || '',
            username: doc.username || '',
            assignedVillage: doc.assignedVillage || 'Chandrapur',
            assignedHealthCentre: doc.assignedHealthCentre || 'PHC Rural',
            supervisorName: doc.supervisorName || 'Pooja Verma (Supervisor)',
            status: (doc.status || 'active').toLowerCase(),
            joiningDate: doc.joiningDate ? new Date(doc.joiningDate) : new Date(),
            updatedAt: new Date()
          }
        },
        { upsert: true }
      );
    }

    // 2. If user created/updated -> sync to admins / supervisors / ashaWorkers
    if (collectionName === 'users') {
      const role = (doc.role || '').toLowerCase();
      if (role === 'admin') {
        await db.collection('admins').updateOne(
          { username: doc.username },
          {
            $set: {
              username: doc.username,
              fullName: doc.name || doc.fullName || 'Administrator',
              mobile: doc.mobile || '',
              email: doc.email || '',
              password: doc.password,
              role: 'admin',
              status: (doc.status || 'active').toLowerCase(),
              updatedAt: new Date()
            }
          },
          { upsert: true }
        );
      } else if (role === 'supervisor') {
        await db.collection('supervisors').updateOne(
          { username: doc.username },
          {
            $set: {
              supervisorId: doc.supervisorId || `SUP-${String(doc._id).slice(0, 4)}`,
              username: doc.username,
              fullName: doc.name || doc.fullName || 'Supervisor',
              mobile: doc.mobile || '',
              email: doc.email || '',
              password: doc.password,
              assignedArea: doc.assignedArea || 'Chandrapur Health Block',
              status: (doc.status || 'active').toLowerCase(),
              updatedAt: new Date()
            }
          },
          { upsert: true }
        );
      }
    }

    // 3. If family / pregnancy / child created/updated -> sync to beneficiaries
    if (['families', 'pregnancies', 'children'].includes(collectionName)) {
      let benId = doc.beneficiaryId || doc.familyId || doc.pregnancyId || doc.childId || doc._id;
      let benName = doc.womanName || doc.headName || doc.childName || doc.name || doc.fullName || 'Beneficiary';
      let cat = collectionName === 'pregnancies' ? 'pregnant' : (collectionName === 'children' ? 'child' : 'general');
      let risk = (doc.riskFlag || doc.riskLevel || 'normal').toLowerCase();

      const benPayload = {
        beneficiaryId: String(benId),
        fullName: benName,
        mobile: doc.mobile || doc.contactNumber || '',
        address: doc.address || '',
        village: doc.village || 'Chandrapur',
        assignedAshaWorker: doc.workerName || doc.workerId || 'Sunita Patil',
        category: cat,
        riskLevel: risk.includes('high') ? 'high' : (risk.includes('follow') ? 'attention' : 'normal'),
        status: 'active',
        notes: doc.notes || '',
        updatedAt: new Date()
      };

      if (cat === 'pregnant') {
        benPayload.pregnancyDetails = {
          weeks: doc.currentWeeks || doc.gestationalWeeks || 12,
          expectedDeliveryDate: doc.edd ? new Date(doc.edd) : null,
          bloodPressure: doc.bloodPressure || '120/80',
          bloodGroup: doc.bloodGroup || 'B+'
        };
      } else if (cat === 'child') {
        benPayload.childDetails = {
          weight: doc.weight || doc.birthWeight || 3.2,
          height: doc.height || 50,
          vaccinationStatus: doc.vaccinationStatus || 'Up-to-date'
        };
      }

      await db.collection('beneficiaries').updateOne(
        { beneficiaryId: String(benId) },
        { $set: benPayload },
        { upsert: true }
      );
    }

    // 4. If visit created/updated -> sync to visits
    if (collectionName === 'visits') {
      const visitId = doc.visitId || `VIS-${String(doc._id).slice(0, 5)}`;
      await db.collection('visits').updateOne(
        { visitId },
        {
          $set: {
            visitId,
            beneficiaryName: doc.beneficiaryName || doc.womanName || doc.childName || 'Beneficiary',
            ashaWorkerName: doc.workerName || doc.workerId || 'Sunita Patil',
            visitDate: doc.visitDate ? new Date(doc.visitDate) : new Date(),
            visitType: (doc.visitType || 'routine').toLowerCase(),
            bloodPressure: doc.bloodPressure || '120/80',
            temperature: doc.temperature || 98.4,
            weight: doc.weight || 50,
            symptoms: doc.symptoms || [],
            riskLevel: (doc.riskFlag || doc.riskLevel || 'normal').toLowerCase(),
            notes: doc.notes || '',
            status: (doc.status || 'completed').toLowerCase(),
            updatedAt: new Date()
          }
        },
        { upsert: true }
      );
    }

    // 5. If task created/updated -> sync to tasks
    if (collectionName === 'tasks') {
      const taskId = doc.taskId || `TSK-${String(doc._id).slice(0, 5)}`;
      await db.collection('tasks').updateOne(
        { taskId },
        {
          $set: {
            taskId,
            title: doc.title || 'Health Follow-up Task',
            description: doc.description || '',
            assignedToAsha: doc.assignedToWorker || doc.workerName || 'Sunita Patil',
            assignedBySupervisor: doc.assignedBy || 'Pooja Verma (Supervisor)',
            beneficiaryName: doc.beneficiaryName || '',
            dueDate: doc.dueDate ? new Date(doc.dueDate) : null,
            priority: (doc.priority || 'medium').toLowerCase(),
            status: (doc.status || 'pending').toLowerCase(),
            updatedAt: new Date()
          }
        },
        { upsert: true }
      );
    }

    // 6. If notification/alert -> sync to alerts
    if (collectionName === 'notifications') {
      const alertId = doc.notificationId || `ALT-${String(doc._id).slice(0, 5)}`;
      await db.collection('alerts').updateOne(
        { alertId },
        {
          $set: {
            alertId,
            beneficiaryName: doc.beneficiaryName || 'Beneficiary',
            ashaWorkerName: doc.workerName || 'Sunita Patil',
            type: (doc.type || 'high_risk').toLowerCase(),
            title: doc.title || 'Health Alert',
            message: doc.message || '',
            priority: (doc.priority || 'urgent').toLowerCase(),
            status: 'active',
            createdAt: new Date()
          }
        },
        { upsert: true }
      );
    }
  } catch (err) {
    console.warn(`[Sync Warning] Failed syncing to easy collections:`, err.message);
  }
}

// Collection helper class with real-time MongoDB persistence
class Collection {
  constructor(name) {
    this.name = name;
    if (!memoryDB[name]) {
      memoryDB[name] = [];
    }
  }

  async find(filter = {}) {
    // Read from MongoDB if available
    if (isMongoConnected()) {
      try {
        return await getMongoCollection(this.name).find(this._prepareFilter(filter)).toArray();
      } catch (err) {
        // fallback to memory
      }
    }
    return memoryDB[this.name].filter(item => matchFilter(item, filter)).map(item => ({ ...item }));
  }

  async findOne(filter = {}) {
    if (isMongoConnected()) {
      try {
        return await getMongoCollection(this.name).findOne(this._prepareFilter(filter));
      } catch (err) {
        // fallback to memory
      }
    }
    const item = memoryDB[this.name].find(item => matchFilter(item, filter));
    return item ? { ...item } : null;
  }

  async findById(id) {
    if (isMongoConnected()) {
      try {
        return await getMongoCollection(this.name).findOne({
          $or: [{ _id: id }, { id: id }, { workerId: id }, { familyId: id }]
        });
      } catch (err) {
        // fallback to memory
      }
    }
    const item = memoryDB[this.name].find(item => item._id === id || item.id === id || item.workerId === id || item.familyId === id);
    return item ? { ...item } : null;
  }

  async create(data) {
    const id = data._id || uuidv4();
    const doc = {
      _id: id,
      ...data,
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (this.name === 'visits' && !doc.visitId) {
      doc.visitId = `VIS-${String(id).replace(/[^a-zA-Z0-9]/g, '').slice(0, 8).toUpperCase()}`;
    }
    if (this.name === 'tasks' && !doc.taskId) {
      doc.taskId = `TSK-${String(id).replace(/[^a-zA-Z0-9]/g, '').slice(0, 8).toUpperCase()}`;
    }

    // Save locally
    memoryDB[this.name].push(doc);
    saveToDisk();

    // Persist directly into MongoDB!
    if (isMongoConnected()) {
      try {
        await getMongoCollection(this.name).insertOne({ ...doc });
        await syncToEasyCollections(this.name, doc);
      } catch (err) {
        console.warn(`[Mongo Write Warning] ${this.name}:`, err.message);
      }
    }

    return { ...doc };
  }

  async insertMany(dataArray) {
    const docs = dataArray.map(data => {
      const id = data._id || uuidv4();
      const item = {
        _id: id,
        ...data,
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      if (this.name === 'visits' && !item.visitId) {
        item.visitId = `VIS-${String(id).replace(/[^a-zA-Z0-9]/g, '').slice(0, 8).toUpperCase()}`;
      }
      if (this.name === 'tasks' && !item.taskId) {
        item.taskId = `TSK-${String(id).replace(/[^a-zA-Z0-9]/g, '').slice(0, 8).toUpperCase()}`;
      }
      return item;
    });

    memoryDB[this.name].push(...docs);
    saveToDisk();

    if (isMongoConnected()) {
      try {
        await getMongoCollection(this.name).insertMany(docs.map(d => ({ ...d })));
        for (const doc of docs) {
          await syncToEasyCollections(this.name, doc);
        }
      } catch (err) {
        console.warn(`[Mongo InsertMany Warning] ${this.name}:`, err.message);
      }
    }

    return docs.map(d => ({ ...d }));
  }

  async findByIdAndUpdate(id, updateData, options = {}) {
    const now = new Date().toISOString();
    let updatedDoc = null;

    if (isMongoConnected()) {
      try {
        const res = await getMongoCollection(this.name).findOneAndUpdate(
          { $or: [{ _id: id }, { id: id }, { workerId: id }, { familyId: id }] },
          { $set: { ...updateData, updatedAt: now } },
          { returnDocument: 'after' }
        );
        const doc = res && res.value !== undefined ? res.value : res;
        if (doc) {
          updatedDoc = doc;
          await syncToEasyCollections(this.name, updatedDoc);
        }
      } catch (err) {
        console.warn(`[Mongo Update Warning] ${this.name}:`, err.message);
      }
    }

    const index = memoryDB[this.name].findIndex(item => item._id === id || item.id === id || item.workerId === id || item.familyId === id);
    if (index !== -1) {
      const current = memoryDB[this.name][index];
      const memUpdated = {
        ...current,
        ...updateData,
        updatedAt: now
      };
      memoryDB[this.name][index] = memUpdated;
      saveToDisk();
      if (!updatedDoc) updatedDoc = memUpdated;
    }

    return updatedDoc;
  }

  async findOneAndUpdate(filter, updateData) {
    const now = new Date().toISOString();
    let updatedDoc = null;

    if (isMongoConnected()) {
      try {
        const res = await getMongoCollection(this.name).findOneAndUpdate(
          this._prepareFilter(filter),
          { $set: { ...updateData, updatedAt: now } },
          { returnDocument: 'after' }
        );
        const doc = res && res.value !== undefined ? res.value : res;
        if (doc) {
          updatedDoc = doc;
          await syncToEasyCollections(this.name, updatedDoc);
        }
      } catch (err) {
        console.warn(`[Mongo Update Warning] ${this.name}:`, err.message);
      }
    }

    const index = memoryDB[this.name].findIndex(item => matchFilter(item, filter));
    if (index !== -1) {
      const current = memoryDB[this.name][index];
      const memUpdated = {
        ...current,
        ...updateData,
        updatedAt: now
      };
      memoryDB[this.name][index] = memUpdated;
      saveToDisk();
      if (!updatedDoc) updatedDoc = memUpdated;
    }

    return updatedDoc;
  }

  async findByIdAndDelete(id) {
    if (isMongoConnected()) {
      try {
        await getMongoCollection(this.name).deleteOne({ $or: [{ _id: id }, { id: id }, { workerId: id }, { familyId: id }] });
      } catch (err) {
        console.warn(`[Mongo Delete Warning] ${this.name}:`, err.message);
      }
    }

    const index = memoryDB[this.name].findIndex(item => item._id === id || item.id === id || item.workerId === id || item.familyId === id);
    let removed = null;
    if (index !== -1) {
      removed = memoryDB[this.name].splice(index, 1)[0];
      saveToDisk();
    }

    return removed;
  }

  async deleteMany(filter = {}) {
    let mongoDeleted = 0;
    if (isMongoConnected()) {
      try {
        const res = await getMongoCollection(this.name).deleteMany(this._prepareFilter(filter));
        mongoDeleted = res ? res.deletedCount : 0;
      } catch (err) {
        // ignore
      }
    }

    const beforeCount = memoryDB[this.name].length;
    memoryDB[this.name] = memoryDB[this.name].filter(item => !matchFilter(item, filter));
    saveToDisk();

    return { deletedCount: mongoDeleted || (beforeCount - memoryDB[this.name].length) };
  }

  async countDocuments(filter = {}) {
    if (isMongoConnected()) {
      try {
        return await getMongoCollection(this.name).countDocuments(this._prepareFilter(filter));
      } catch (err) {
        // fallback to memory
      }
    }
    return memoryDB[this.name].filter(item => matchFilter(item, filter)).length;
  }

  _prepareFilter(filter) {
    if (!filter) return {};
    return { ...filter };
  }
}

function matchFilter(item, filter) {
  if (!filter || Object.keys(filter).length === 0) return true;

  for (const key of Object.keys(filter)) {
    const val = filter[key];

    // Logical operators (needed when running without MongoDB, e.g. { $or: [{ _id }, { workerId }] })
    if (key === '$or') {
      if (!Array.isArray(val) || !val.some(sub => matchFilter(item, sub))) return false;
      continue;
    }
    if (key === '$and') {
      if (!Array.isArray(val) || !val.every(sub => matchFilter(item, sub))) return false;
      continue;
    }

    if (val === null) {
      if (item[key] != null) return false;
      continue;
    }

    if (val && typeof val === 'object' && !Array.isArray(val) && !(val instanceof Date)) {
      if (val.$ne !== undefined && item[key] === val.$ne) return false;
      if (val.$in !== undefined && !val.$in.includes(item[key])) return false;
      if (val.$nin !== undefined && val.$nin.includes(item[key])) return false;
      if (val.$gte !== undefined && item[key] < val.$gte) return false;
      if (val.$lte !== undefined && item[key] > val.$lte) return false;
      if (val.$gt !== undefined && item[key] <= val.$gt) return false;
      if (val.$lt !== undefined && item[key] >= val.$lt) return false;
      if (val.$regex !== undefined) {
        const regex = new RegExp(val.$regex, val.$options || 'i');
        if (!regex.test(item[key] || '')) return false;
      }
    } else {
      if (item[key] !== val) return false;
    }
  }
  return true;
}

const db = {
  users: new Collection('users'),
  workers: new Collection('workers'),
  families: new Collection('families'),
  pregnancies: new Collection('pregnancies'),
  children: new Collection('children'),
  vaccineConfigs: new Collection('vaccineConfigs'),
  medicines: new Collection('medicines'),
  distributions: new Collection('distributions'),
  visits: new Collection('visits'),
  notifications: new Collection('notifications'),
  tasks: new Collection('tasks'),
  referrals: new Collection('referrals'),
  facilities: new Collection('facilities'),
  auditLogs: new Collection('auditLogs'),
  resetMemory: () => {
    Object.keys(memoryDB).forEach(k => { memoryDB[k] = []; });
    saveToDisk();
  },
  getRawData: () => memoryDB
};

module.exports = db;
