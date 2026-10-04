const dataStore = require('../config/dataStore');
const { ROLES, MODULES } = require('../config/constants');
const { logAudit } = require('../services/audit');

const getFacilities = async (req, res) => {
  try {
    const { search, type } = req.query;
    let facilities = await dataStore.facilities.find();

    if (type) {
      facilities = facilities.filter(f => f.type === type);
    }
    if (search) {
      const q = search.toLowerCase();
      facilities = facilities.filter(f =>
        f.name?.toLowerCase().includes(q) ||
        f.address?.toLowerCase().includes(q) ||
        f.services?.some(s => s.toLowerCase().includes(q))
      );
    }

    res.json({ success: true, facilities });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const addFacility = async (req, res) => {
  try {
    const { name, type, address, contactNumber, emergencyNumber, doctorInCharge, services, operatingHours, coordinates } = req.body;

    if (!name || !type || !contactNumber) {
      return res.status(400).json({ success: false, message: 'Facility name, type, and contact number are required' });
    }

    const facility = await dataStore.facilities.create({
      name,
      type,
      address: address || '',
      contactNumber,
      emergencyNumber: emergencyNumber || '108',
      doctorInCharge: doctorInCharge || '',
      services: services || ['Primary Care'],
      operatingHours: operatingHours || '9:00 AM - 5:00 PM',
      coordinates: coordinates || { lat: 19.9615, lng: 79.2961 }
    });

    await logAudit({
      user: req.user,
      action: 'FACILITY_ADDED',
      module: MODULES.SYSTEM,
      recordId: facility._id,
      details: { name, type },
      ip: req.ip
    });

    res.status(201).json({ success: true, message: 'Facility added successfully', facility });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getFacilities, addFacility };
