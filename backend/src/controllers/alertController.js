
const Alert = require('../models/Alert');

const createAlert = async (req, res) => {
  try {
    const { title, message, type, endDate } = req.body;

    if (!title || !message) {
      return res.status(400).json({ message: 'Title and message are required' });
    }

    const alert = await Alert.create({
      title,
      message,
      type: type || 'info',
      endDate: endDate || null,
      createdBy: req.user.userId || req.user._id,
    });

    return res.status(201).json(alert);
  } catch (err) {
    console.error('Error creating alert:', err);
    return res.status(500).json({ message: 'Failed to create alert' });
  }
};

const getAlerts = async (req, res) => {
  try {
    const alerts = await Alert.find()
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    return res.json(alerts);
  } catch (err) {
    console.error('Error fetching alerts:', err);
    return res.status(500).json({ message: 'Failed to fetch alerts' });
  }
};

const getActiveAlerts = async (req, res) => {
  try {
    const alerts = await Alert.getActiveAlerts();
    return res.json(alerts);
  } catch (err) {
    console.error('Error fetching active alerts:', err);
    return res.status(500).json({ message: 'Failed to fetch active alerts' });
  }
};

const updateAlert = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, message, type, isActive, endDate } = req.body;

    const alert = await Alert.findById(id);
    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }

    if (title !== undefined) alert.title = title;
    if (message !== undefined) alert.message = message;
    if (type !== undefined) alert.type = type;
    if (isActive !== undefined) alert.isActive = isActive;
    if (endDate !== undefined) alert.endDate = endDate;

    await alert.save();

    const populated = await Alert.findById(alert._id).populate('createdBy', 'name email');
    return res.json(populated);
  } catch (err) {
    console.error('Error updating alert:', err);
    return res.status(500).json({ message: 'Failed to update alert' });
  }
};

const deleteAlert = async (req, res) => {
  try {
    const { id } = req.params;

    const alert = await Alert.findById(id);
    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }

    await Alert.findByIdAndDelete(id);
    return res.json({ id, message: 'Alert deleted successfully' });
  } catch (err) {
    console.error('Error deleting alert:', err);
    return res.status(500).json({ message: 'Failed to delete alert' });
  }
};

module.exports = {
  createAlert,
  getAlerts,
  getActiveAlerts,
  updateAlert,
  deleteAlert,
};
