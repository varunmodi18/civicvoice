
const path = require('path');
const dotenv = require('dotenv');
dotenv.config(); // <-- let it load from current working dir (backend)

const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Department = require('../models/Department');
const Issue = require('../models/Issue');

const seed = async () => {
  try {
    await connectDB();

    await User.deleteMany({});
    await Department.deleteMany({});
    await Issue.deleteMany({});

    const admin = await User.create({
      name: 'System Admin',
      email: 'admin@civicvoice.local',
      password: 'Admin@123',
      role: 'admin',
    });

    const citizens = await User.create([
      {
        name: 'Citizen One',
        email: 'citizen1@civicvoice.local',
        password: 'Citizen@123',
        role: 'citizen',
      },
      {
        name: 'Citizen Two',
        email: 'citizen2@civicvoice.local',
        password: 'Citizen@123',
        role: 'citizen',
      },
      {
        name: 'Citizen Three',
        email: 'citizen3@civicvoice.local',
        password: 'Citizen@123',
        role: 'citizen',
      },
    ]);

    const departments = await Department.create([
      { name: 'Roads & Transport', description: 'Potholes, signals, congestion' },
      { name: 'Water & Sewage', description: 'Leaks, contamination, flooding' },
      { name: 'Power', description: 'Outages, streetlights, power safety' },
    ]);

    const [roads, water, power] = departments;

    const deptUsers = await User.create([
      {
        name: 'Roads Officer',
        email: 'roads@civicvoice.local',
        password: 'Dept@123',
        role: 'department',
        department: roads._id,
      },
      {
        name: 'Water Officer',
        email: 'water@civicvoice.local',
        password: 'Dept@123',
        role: 'department',
        department: water._id,
      },
      {
        name: 'Power Officer',
        email: 'power@civicvoice.local',
        password: 'Dept@123',
        role: 'department',
        department: power._id,
      },
    ]);

    console.log('Seed data created');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
};

seed();
