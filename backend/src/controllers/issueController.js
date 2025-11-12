
const Issue = require('../models/Issue');
const Department = require('../models/Department');

const buildSummary = (issue) => {
  const parts = [];
  parts.push(
    `Citizen reports a ${issue.severity.toLowerCase()} severity ${issue.issueType} at ${issue.location}${
      issue.landmark ? ` (landmark: ${issue.landmark})` : ''
    }.`
  );

  if (issue.impact) {
    parts.push(`Impact: ${issue.impact}.`);
  }

  if (issue.recurrence) {
    parts.push(`Recurrence: ${issue.recurrence}.`);
  }

  if (issue.evidenceUrls && issue.evidenceUrls.length > 0) {
    parts.push(
      `Citizen attached ${issue.evidenceUrls.length} piece(s) of evidence (photos/videos).`
    );
  }

  if (issue.contactName || issue.contactPhone || issue.contactEmail) {
    parts.push(
      `Contact: ${issue.contactName || 'N/A'}${
        issue.contactPhone ? `, phone: ${issue.contactPhone}` : ''
      }${issue.contactEmail ? `, email: ${issue.contactEmail}` : ''}.`
    );
  }

  return parts.join(' ');
};

const createIssue = async (req, res) => {
  const {
    issueType,
    location,
    landmark,
    severity,
    description,
    impact,
    recurrence,
    evidenceUrls,
    contactName,
    contactPhone,
    contactEmail,
    preferredContactMethod,
  } = req.body;

  if (!issueType || !location || !severity || !description) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const normalizedSeverity = String(severity).toLowerCase();
  const normalizedRecurrence = recurrence ? String(recurrence).toLowerCase() : 'new';

  const parsedEvidenceUrls = Array.isArray(evidenceUrls)
    ? evidenceUrls
    : evidenceUrls
    ? [evidenceUrls]
    : [];

  const issue = new Issue({
    issueType,
    location,
    landmark,
    severity: normalizedSeverity,
    description,
    impact,
    recurrence: normalizedRecurrence,
    evidenceUrls: parsedEvidenceUrls,
    contactName,
    contactPhone,
    contactEmail,
    preferredContactMethod,
    status: 'pending',
    createdBy: req.user ? req.user._id : null,
  });

  issue.summary = buildSummary(issue);

  const saved = await issue.save();

  return res.status(201).json({
    message: 'Issue created successfully',
    issueId: saved.publicId,
    issue: saved,
  });
};

const getIssuesForAdmin = async (req, res) => {
  const issues = await Issue.find()
    .populate('forwardedTo', 'name')
    .populate('createdBy', 'name email')
    .populate('departmentUpdates.addedBy', 'name email')
    .populate('departmentUpdates.department', 'name')
    .sort({ createdAt: -1 });

  res.json(issues);
};

const getIssuesForDepartment = async (req, res) => {
  if (!req.user || req.user.role !== 'department' || !req.user.department) {
    return res
      .status(403)
      .json({ message: 'Department user and department assignment required' });
  }

  const issues = await Issue.find({ forwardedTo: req.user.department })
    .populate('forwardedTo', 'name')
    .populate('createdBy', 'name email')
    .populate('departmentUpdates.addedBy', 'name email')
    .populate('departmentUpdates.department', 'name')
    .sort({ createdAt: -1 });

  res.json(issues);
};

const getIssuesForCitizen = async (req, res) => {
  if (!req.user || req.user.role !== 'citizen') {
    return res.status(403).json({ message: 'Citizen access only' });
  }

  const issues = await Issue.find({ createdBy: req.user._id })
    .populate('forwardedTo', 'name')
    .populate('departmentUpdates.addedBy', 'name email')
    .populate('departmentUpdates.department', 'name')
    .sort({ createdAt: -1 });

  res.json(issues);
};

const updateIssueStatus = async (req, res) => {
  const { id } = req.params;
  const { status, forwardedTo } = req.body;

  const issue = await Issue.findById(id);
  if (!issue) {
    return res.status(404).json({ message: 'Issue not found' });
  }

  if (status) {
    const allowed = ['pending', 'in_review', 'forwarded', 'completed'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }
    issue.status = status;
  }

  if (forwardedTo) {
    const dept = await Department.findById(forwardedTo);
    if (!dept) {
      return res.status(400).json({ message: 'Department not found' });
    }
    issue.forwardedTo = dept._id;
    if (!status) {
      issue.status = 'pending';
    }
  }

  const updated = await issue.save();
  const populated = await Issue.findById(updated._id)
    .populate('forwardedTo', 'name')
    .populate('createdBy', 'name email')
    .populate('departmentUpdates.addedBy', 'name email')
    .populate('departmentUpdates.department', 'name');

  res.json(populated);
};

const addDepartmentUpdate = async (req, res) => {
  if (!req.user || req.user.role !== 'department' || !req.user.department) {
    return res
      .status(403)
      .json({ message: 'Department user and department assignment required' });
  }

  const { id } = req.params;
  const { status, comment } = req.body;

  if (!comment && !status) {
    return res
      .status(400)
      .json({ message: 'Provide at least a comment or a status update' });
  }

  const issue = await Issue.findById(id);
  if (!issue) {
    return res.status(404).json({ message: 'Issue not found' });
  }

  // Get the department ID - handle both populated object and direct ID
  const userDeptId = req.user.department._id ? req.user.department._id.toString() : req.user.department.toString();
  const issueForwardedToId = issue.forwardedTo ? issue.forwardedTo.toString() : null;

  if (!issueForwardedToId || issueForwardedToId !== userDeptId) {
    return res
      .status(403)
      .json({ message: 'Issue is not assigned to your department' });
  }

  if (status) {
    const allowed = ['pending', 'in_review', 'completed'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }
    issue.status = status;
  }

  if (comment) {
    issue.departmentUpdates.push({
      text: comment,
      status: status || issue.status,
      addedBy: req.user._id,
      department: req.user.department._id || req.user.department,
    });
  }

  const saved = await issue.save();

  const populated = await Issue.findById(saved._id)
    .populate('forwardedTo', 'name')
    .populate('createdBy', 'name email')
    .populate('departmentUpdates.addedBy', 'name email')
    .populate('departmentUpdates.department', 'name');

  res.json(populated);
};

const deleteIssue = async (req, res) => {
  const { id } = req.params;

  const issue = await Issue.findById(id);
  if (!issue) {
    return res.status(404).json({ message: 'Issue not found' });
  }

  await issue.deleteOne();
  return res.json({ id, message: 'Issue deleted successfully' });
};

module.exports = {
  createIssue,
  getIssuesForAdmin,
  getIssuesForDepartment,
  getIssuesForCitizen,
  updateIssueStatus,
  addDepartmentUpdate,
  deleteIssue,
};
