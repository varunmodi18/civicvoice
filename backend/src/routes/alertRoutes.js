
const express = require('express');
const {
  createAlert,
  getAlerts,
  getActiveAlerts,
  updateAlert,
  deleteAlert,
} = require('../controllers/alertController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

// Public route
router.get('/active', getActiveAlerts);

// Admin routes
router.post('/', protect, adminOnly, createAlert);
router.get('/', protect, adminOnly, getAlerts);
router.patch('/:id', protect, adminOnly, updateAlert);
router.delete('/:id', protect, adminOnly, deleteAlert);

module.exports = router;
