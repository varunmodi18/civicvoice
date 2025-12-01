
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

  if (issue.geoLocation?.latitude && issue.geoLocation?.longitude) {
    parts.push('Precise map coordinates captured for field teams.');
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
    geoLocation,
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

  let parsedGeoLocation = null;
  if (geoLocation && typeof geoLocation === 'object') {
    const latitude = Number(geoLocation.latitude);
    const longitude = Number(geoLocation.longitude);
    if (!Number.isNaN(latitude) && !Number.isNaN(longitude)) {
      parsedGeoLocation = {
        latitude,
        longitude,
      };
      const accuracy = Number(geoLocation.accuracy);
      if (!Number.isNaN(accuracy)) {
        parsedGeoLocation.accuracy = accuracy;
      }
      if (
        typeof geoLocation.source === 'string' &&
        ['device_location', 'map_click', 'manual', 'search'].includes(geoLocation.source)
      ) {
        parsedGeoLocation.source = geoLocation.source;
      }
    }
  }

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
    geoLocation: parsedGeoLocation,
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
  const { status, comment, resolutionEvidence } = req.body;

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
    const allowed = ['pending', 'in_review', 'completed', 'reopened'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }
    issue.status = status;
  }

  // Handle resolution evidence upload when marking as completed
  if (resolutionEvidence) {
    const parsedEvidence = Array.isArray(resolutionEvidence)
      ? resolutionEvidence
      : [resolutionEvidence];
    
    if (!issue.resolutionEvidence) {
      issue.resolutionEvidence = [];
    }
    issue.resolutionEvidence.push(...parsedEvidence);
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

const reopenIssue = async (req, res) => {
  const { id } = req.params;
  const { comment } = req.body;

  if (!comment) {
    return res
      .status(400)
      .json({ message: 'Please provide a reason for reopening the issue' });
  }

  const issue = await Issue.findById(id);
  if (!issue) {
    return res.status(404).json({ message: 'Issue not found' });
  }

  // Only allow reopening of completed issues
  if (issue.status !== 'completed') {
    return res
      .status(400)
      .json({ message: 'Only completed issues can be reopened' });
  }

  // Check authorization: admin or the citizen who created it
  if (req.user.role === 'citizen' && issue.createdBy.toString() !== req.user._id.toString()) {
    return res
      .status(403)
      .json({ message: 'You can only reopen your own issues' });
  }

  if (req.user.role !== 'admin' && req.user.role !== 'citizen') {
    return res
      .status(403)
      .json({ message: 'Only citizens and admins can reopen issues' });
  }

  // Update status to reopened
  issue.status = 'reopened';

  // Add a department update with the reopen comment
  issue.departmentUpdates.push({
    text: `Issue reopened: ${comment}`,
    status: 'reopened',
    addedBy: req.user._id,
    department: issue.forwardedTo,
  });

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

const rateIssue = async (req, res) => {
  const { id } = req.params;
  const { rating, review } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ message: 'Rating must be between 1 and 5' });
  }

  const issue = await Issue.findById(id);
  if (!issue) {
    return res.status(404).json({ message: 'Issue not found' });
  }

  // Only allow rating completed issues
  if (issue.status !== 'completed') {
    return res.status(400).json({ message: 'Can only rate completed issues' });
  }

  // Check if the user is the creator or an admin
  const userId = req.user.userId || req.user._id;
  if (issue.createdBy && issue.createdBy.toString() !== userId.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized to rate this issue' });
  }

  issue.rating = rating;
  issue.review = review || '';
  issue.reviewedAt = new Date();

  await issue.save();

  const populated = await Issue.findById(issue._id)
    .populate('createdBy', 'name email')
    .populate('forwardedTo', 'name');

  return res.json(populated);
};

module.exports = {
  createIssue,
  getIssuesForAdmin,
  getIssuesForDepartment,
  getIssuesForCitizen,
  updateIssueStatus,
  addDepartmentUpdate,
  reopenIssue,
  deleteIssue,
  rateIssue,
};
