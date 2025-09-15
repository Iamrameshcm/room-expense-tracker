require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);

  const existing = await User.findOne({ email: process.env.ADMIN_EMAIL });
  if (existing) { console.log('Admin exists'); process.exit(0); }

  const hashed = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
  const admin = new User({
    name: process.env.ADMIN_NAME,
    email: process.env.ADMIN_EMAIL,
    password: hashed,
    role: 'admin'
  });
  await admin.save();
  console.log('Admin created:', admin.email);
  process.exit(0);
}
seed();
