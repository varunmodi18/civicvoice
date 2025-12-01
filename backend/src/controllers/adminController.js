
const User = require('../models/User');
const Department = require('../models/Department');
const Issue = require('../models/Issue');
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const createAdminUser = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Missing fields' });
  }

  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const user = await User.create({ name, email, password, role: 'admin' });
  const obj = user.toObject();
  delete obj.password;

  res.status(201).json(obj);
};

const createDepartment = async (req, res) => {
  const { name, description } = req.body;
  if (!name) {
    return res.status(400).json({ message: 'Name is required' });
  }

  const existing = await Department.findOne({ name });
  if (existing) {
    return res.status(400).json({ message: 'Department already exists' });
  }

  const dept = await Department.create({ name, description });
  res.status(201).json(dept);
};

const listDepartments = async (req, res) => {
  const depts = await Department.find().sort({ name: 1 });
  res.json(depts);
};

const createDepartmentUser = async (req, res) => {
  const { name, email, password, departmentName } = req.body;

  if (!name || !email || !password || !departmentName) {
    return res
      .status(400)
      .json({ message: 'Name, email, password and departmentName are required' });
  }

  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(400).json({ message: 'User with this email already exists' });
  }

  // Find or create the department
  let dept = await Department.findOne({ name: departmentName });
  if (!dept) {
    dept = await Department.create({ name: departmentName });
  }

  const user = await User.create({
    name,
    email,
    password,
    role: 'department',
    department: dept._id,
  });

  const populated = await User.findById(user._id)
    .select('-password')
    .populate('department', 'name');

  return res.status(201).json(populated);
};

const listDepartmentUsers = async (req, res) => {
  const users = await User.find({ role: 'department' })
    .select('-password')
    .populate('department', 'name');
  res.json(users);
};

const updateDepartmentUser = async (req, res) => {
  const { id } = req.params;
  const { name, email, departmentId } = req.body;

  const user = await User.findOne({ _id: id, role: 'department' });
  if (!user) {
    return res.status(404).json({ message: 'Department user not found' });
  }

  if (email && email !== user.email) {
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: 'Another user with this email exists' });
    }
    user.email = email;
  }

  if (name) {
    user.name = name;
  }

  if (departmentId) {
    const dept = await Department.findById(departmentId);
    if (!dept) {
      return res.status(400).json({ message: 'Department not found' });
    }
    user.department = dept._id;
  }

  await user.save();

  const populated = await User.findById(user._id)
    .select('-password')
    .populate('department', 'name');

  return res.json(populated);
};

const deleteDepartmentUser = async (req, res) => {
  const { id } = req.params;
  const user = await User.findOne({ _id: id, role: 'department' });
  if (!user) {
    return res.status(404).json({ message: 'Department user not found' });
  }

  await user.deleteOne();
  return res.json({ id, message: 'Department user deleted' });
};

const processGeneralInput = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim() === '') {
      return res.status(400).json({ message: 'Text input is required' });
    }

    // Use OpenAI to parse the unstructured text into structured complaint data
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are an assistant that extracts structured complaint information from unstructured text (SMS, WhatsApp, emails, etc.). 
Extract the following fields and return ONLY a valid JSON object (no markdown, no code blocks, no explanation):
{
  "issueType": "string (e.g., 'Water Supply Issue', 'Road Damage', 'Electricity Problem', 'Garbage Collection', 'Street Light', etc.)",
  "location": "string (extract full address or location mentioned)",
  "landmark": "string (extract nearby landmark if mentioned)",
  "severity": "string (one of: 'low', 'medium', 'high', 'critical' - infer from urgency words like 'urgent', 'emergency', etc.)",
  "description": "string (full detailed description of the issue, preserve all details)",
  "summary": "string (brief 1-line summary, max 100 chars)",
  "impact": "string (describe impact if mentioned, e.g., 'water wastage', 'traffic disruption', 'safety hazard')",
  "recurrence": "string (one of: 'new', 'recurring', 'ongoing' - infer from text like 'since X days', 'happening again', etc.)",
  "contactName": "string (extract name if mentioned)",
  "contactPhone": "string (extract phone number if mentioned, format as-is)",
  "contactEmail": "string (extract email if mentioned)",
  "preferredContactMethod": "string (one of: 'phone', 'email', 'none' - infer from context or default to 'none')"
}

Rules:
- If a field cannot be determined, set it to an empty string
- For severity: 'critical' if words like 'emergency', 'danger', 'urgent'; 'high' if 'urgent', 'important'; 'medium' if moderately urgent; 'low' otherwise
- For issueType: categorize based on keywords (water/pipe = Water Supply, road/pothole = Road Damage, etc.)
- For recurrence: 'ongoing' if mentions duration, 'recurring' if mentions 'again' or 'repeated', otherwise 'new'
- Preserve exact phone numbers and emails as found in text`,
        },
        {
          role: 'user',
          content: text,
        },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });

    const parsedData = JSON.parse(completion.choices[0].message.content);

    // Validate and structure the data
    const structuredData = {
      issueType: parsedData.issueType || 'General Complaint',
      location: parsedData.location || 'Location not specified',
      landmark: parsedData.landmark || '',
      severity: ['low', 'medium', 'high', 'critical'].includes(parsedData.severity)
        ? parsedData.severity
        : 'medium',
      description: parsedData.description || text,
      summary: parsedData.summary || text.substring(0, 100),
      impact: parsedData.impact || '',
      recurrence: ['new', 'recurring', 'ongoing'].includes(parsedData.recurrence)
        ? parsedData.recurrence
        : 'new',
      contactName: parsedData.contactName || '',
      contactPhone: parsedData.contactPhone || '',
      contactEmail: parsedData.contactEmail || '',
      preferredContactMethod: ['phone', 'email', 'none'].includes(parsedData.preferredContactMethod)
        ? parsedData.preferredContactMethod
        : 'none',
    };

    // Return the structured data without creating the issue yet
    res.status(200).json({
      message: 'Text processed successfully',
      structuredData,
      originalText: text,
    });
  } catch (error) {
    console.error('Error processing general input:', error);
    res.status(500).json({
      message: 'Failed to process input',
      error: error.message,
    });
  }
};

const createComplaintFromStructuredData = async (req, res) => {
  try {
    const structuredData = req.body;

    // Validate required fields
    if (!structuredData.issueType || !structuredData.location || !structuredData.severity || !structuredData.description) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Create the issue
    const issueData = {
      issueType: structuredData.issueType,
      location: structuredData.location,
      landmark: structuredData.landmark || '',
      severity: structuredData.severity,
      description: structuredData.description,
      summary: structuredData.summary || structuredData.description.substring(0, 100),
      impact: structuredData.impact || '',
      recurrence: structuredData.recurrence || 'new',
      contactName: structuredData.contactName || '',
      contactPhone: structuredData.contactPhone || '',
      contactEmail: structuredData.contactEmail || '',
      preferredContactMethod: structuredData.preferredContactMethod || 'none',
      status: 'pending',
      createdBy: req.user?.userId || null,
    };

    const issue = await Issue.create(issueData);
    const populatedIssue = await Issue.findById(issue._id)
      .populate('createdBy', 'name email')
      .populate('forwardedTo', 'name');

    res.status(201).json({
      message: 'Complaint created successfully',
      issue: populatedIssue,
    });
  } catch (error) {
    console.error('Error creating complaint:', error);
    res.status(500).json({
      message: 'Failed to create complaint',
      error: error.message,
    });
  }
};

module.exports = {
  createAdminUser,
  createDepartment,
  listDepartments,
  createDepartmentUser,
  listDepartmentUsers,
  updateDepartmentUser,
  deleteDepartmentUser,
  processGeneralInput,
  createComplaintFromStructuredData,
};
