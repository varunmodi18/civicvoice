
const express = require('express');
const {
  createAdminUser,
  createDepartment,
  listDepartments,
  createDepartmentUser,
  listDepartmentUsers,
  updateDepartmentUser,
  deleteDepartmentUser,
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/users', protect, adminOnly, createAdminUser);

router.post('/departments', protect, adminOnly, createDepartment);
router.get('/departments', protect, adminOnly, listDepartments);

router.get('/department-users', protect, adminOnly, listDepartmentUsers);
router.post('/department-users', protect, adminOnly, createDepartmentUser);
router.patch('/department-users/:id', protect, adminOnly, updateDepartmentUser);
router.delete('/department-users/:id', protect, adminOnly, deleteDepartmentUser);

module.exports = router;
