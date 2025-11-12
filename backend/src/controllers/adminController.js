
const User = require('../models/User');
const Department = require('../models/Department');

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
  const { name, email, password, departmentId } = req.body;

  if (!name || !email || !password || !departmentId) {
    return res
      .status(400)
      .json({ message: 'Name, email, password and departmentId are required' });
  }

  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(400).json({ message: 'User with this email already exists' });
  }

  const dept = await Department.findById(departmentId);
  if (!dept) {
    return res.status(400).json({ message: 'Department not found' });
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

module.exports = {
  createAdminUser,
  createDepartment,
  listDepartments,
  createDepartmentUser,
  listDepartmentUsers,
  updateDepartmentUser,
  deleteDepartmentUser,
};
