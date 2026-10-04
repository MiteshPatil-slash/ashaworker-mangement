const dataStore = require('../config/dataStore');
const { generateSmartTasks } = require('../services/taskEngine');
const { ROLES, MODULES } = require('../config/constants');
const { logAudit } = require('../services/audit');

const getTasks = async (req, res) => {
  try {
    const workerId = req.user.role === ROLES.ASHA ? req.user.workerId : req.query.workerId || null;

    // Run the rule-based task generator engine
    await generateSmartTasks(workerId);

    // Default view (e.g. the ASHA worker's own dashboard) shows only pending work.
    // Pass ?status=ALL (used by the Supervisor task-management screen) to see every status,
    // or ?status=COMPLETED etc. for a specific one, so updated/completed tasks aren't
    // hidden once their status changes.
    const filter = {};
    const statusParam = (req.query.status || 'PENDING').toUpperCase();
    if (statusParam !== 'ALL') {
      filter.status = statusParam;
    }
    if (workerId) {
      filter.workerId = workerId;
    }

    const tasks = await dataStore.tasks.find(filter);

    // Sort by priority (URGENT first, then HIGH, then NORMAL) and dueDate
    const priorityWeight = { URGENT: 3, HIGH: 2, NORMAL: 1, INFO: 0 };
    tasks.sort((a, b) => {
      const weightDiff = (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
      if (weightDiff !== 0) return weightDiff;
      return new Date(a.dueDate || 0) - new Date(b.dueDate || 0);
    });

    const summary = {
      totalPending: tasks.filter(t => t.status === 'PENDING').length,
      urgent: tasks.filter(t => t.priority === 'URGENT').length,
      high: tasks.filter(t => t.priority === 'HIGH').length,
      normal: tasks.filter(t => t.priority === 'NORMAL').length
    };

    res.json({ success: true, tasks, summary });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const createTask = async (req, res) => {
  try {
    const { title, workerId, workerName, beneficiaryName, household, dueDate, priority, instructions } = req.body;

    if (!title || !workerId) {
      return res.status(400).json({ success: false, message: 'Task title and assigned worker are required' });
    }

    const worker = await dataStore.workers.findOne({ workerId });
    if (!worker) {
      return res.status(404).json({ success: false, message: 'Assigned worker not found' });
    }

    const newTask = await dataStore.tasks.create({
      title,
      workerId,
      workerName: workerName || worker.name,
      beneficiaryName: beneficiaryName || '',
      household: household || '',
      description: instructions || '',
      instructions: instructions || '',
      dueDate: dueDate || new Date().toISOString().split('T')[0],
      priority: (priority || 'NORMAL').toUpperCase(),
      status: 'PENDING',
      module: MODULES.SYSTEM,
      assignedBy: req.user.username
    });

    await logAudit({
      user: req.user,
      action: 'TASK_CREATED',
      module: MODULES.SYSTEM,
      recordId: newTask._id,
      details: { title, workerId, dueDate, priority },
      ip: req.ip
    });

    res.status(201).json({ success: true, message: 'Task assigned successfully', task: newTask });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const allowed = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'OVERDUE'];
    if (!status || !allowed.includes(status.toUpperCase())) {
      return res.status(400).json({ success: false, message: `Status must be one of ${allowed.join(', ')}` });
    }

    const task = await dataStore.tasks.findByIdAndUpdate(id, {
      status: status.toUpperCase(),
      ...(status.toUpperCase() === 'COMPLETED' ? { completedAt: new Date().toISOString(), completedBy: req.user.username } : {})
    });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    res.json({ success: true, message: 'Task status updated', task });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const completeTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await dataStore.tasks.findByIdAndUpdate(id, {
      status: 'COMPLETED',
      completedAt: new Date().toISOString(),
      completedBy: req.user.username
    });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    res.json({ success: true, message: 'Task marked as completed', task });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await dataStore.tasks.findOne({ $or: [{ _id: id }, { taskId: id }] });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    if (req.user.role === ROLES.ASHA && task.workerId !== req.user.workerId) {
      return res.status(403).json({ success: false, message: 'You can only delete tasks assigned to you' });
    }

    await dataStore.tasks.findByIdAndDelete(task._id);

    await logAudit({
      user: req.user,
      action: 'TASK_DELETED',
      module: MODULES.SYSTEM,
      recordId: task.taskId || task._id,
      details: { title: task.title, workerId: task.workerId },
      ip: req.ip
    });

    res.json({ success: true, message: 'Task deleted permanently' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getTasks, completeTask, createTask, updateTaskStatus, deleteTask };
