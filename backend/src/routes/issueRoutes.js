
const express = require('express');
const {
  createIssue,
  getIssuesForAdmin,
  getIssuesForDepartment,
  getIssuesForCitizen,
  updateIssueStatus,
  addDepartmentUpdate,
  deleteIssue,
} = require('../controllers/issueController');
const { protect, adminOnly, departmentOnly } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, createIssue);

router.get('/admin', protect, adminOnly, getIssuesForAdmin);
router.patch('/:id', protect, adminOnly, updateIssueStatus);
router.delete('/:id', protect, adminOnly, deleteIssue);

router.get('/department', protect, departmentOnly, getIssuesForDepartment);
router.patch('/:id/department-update', protect, departmentOnly, addDepartmentUpdate);

router.get('/mine', protect, getIssuesForCitizen);

module.exports = router;
