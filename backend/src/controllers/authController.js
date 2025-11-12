
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (res, userId) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });

  res.cookie('jwt', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Please provide all fields' });
  }

  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const user = await User.create({
    name,
    email,
    password,
    role: 'citizen',
  });

  generateToken(res, user._id);

  const data = user.toObject();
  delete data.password;
  res.status(201).json(data);
};

const loginUser = async (req, res) => {
  const { email, password, expectedRole } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }

  const user = await User.findOne({ email }).populate('department', 'name');
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const match = await user.matchPassword(password);
  if (!match) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  if (expectedRole && user.role !== expectedRole) {
    return res.status(403).json({
      message: `This account is a ${user.role} account, not ${expectedRole}.`,
    });
  }

  generateToken(res, user._id);

  const data = user.toObject();
  delete data.password;
  res.json(data);
};

const logoutUser = async (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  res.json({ message: 'Logged out' });
};

const getMe = async (req, res) => {
  res.json(req.user);
};

const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res
      .status(400)
      .json({ message: 'Current password and new password are required' });
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const match = await user.matchPassword(currentPassword);
  if (!match) {
    return res.status(400).json({ message: 'Current password is incorrect' });
  }

  user.password = newPassword;
  await user.save();

  generateToken(res, user._id);

  res.json({ message: 'Password updated successfully' });
};

module.exports = { registerUser, loginUser, logoutUser, getMe, changePassword };
