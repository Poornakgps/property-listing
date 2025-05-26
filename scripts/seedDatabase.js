// scripts/seedDatabase.js
// Database seeding script for initial data setup
const mongoose = require('mongoose');
const User = require('../src/models/User');
const Property = require('../src/models/Property');
const config = require('../src/config/env');

const seedUsers = [
  {
    name: 'Admin User',
    email: 'admin@propertyplatform.com',
    password: 'admin123',
    role: 'admin',
    isVerified: true
  },
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    role: 'user',
    isVerified: true
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'password123',
    role: 'user',
    isVerified: true
  }
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('Connected to MongoDB');

    await User.deleteMany({});
    await Property.deleteMany({});
    console.log('Cleared existing data');

    const users = await User.insertMany(seedUsers);
    console.log(`Created ${users.length} users`);

    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();