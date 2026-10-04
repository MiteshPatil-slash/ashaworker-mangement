/**
 * ASHA SAATHI Community Health Management System
 * Simplified, Intuitive Database Models
 */

const Admin = require('./Admin');
const Supervisor = require('./Supervisor');
const AshaWorker = require('./AshaWorker');
const Beneficiary = require('./Beneficiary');
const Visit = require('./Visit');
const Alert = require('./Alert');
const Task = require('./Task');

module.exports = {
  Admin,
  Supervisor,
  AshaWorker,
  Beneficiary,
  Visit,
  Alert,
  Task
};
