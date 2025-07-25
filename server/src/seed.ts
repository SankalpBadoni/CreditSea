import mongoose from 'mongoose';
import User from './models/User';
import dotenv from 'dotenv';

dotenv.config();

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/creditsea');
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }

    // Create default admin
    const admin = new User({
      username: 'admin',
      email: 'admin@creditsea.com',
      password: 'admin123',
      role: 'admin'
    });

    await admin.save();
    console.log('Admin user created successfully');

    // Create default verifier
    const verifier = new User({
      username: 'verifier1',
      email: 'verifier@creditsea.com',
      password: 'verifier123',
      role: 'verifier'
    });

    await verifier.save();
    console.log('Verifier user created successfully');

  } catch (error) {
    console.error('Error seeding users:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

seedUsers();
