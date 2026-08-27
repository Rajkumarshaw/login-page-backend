import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Admin from '../models/Admin.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env variables from current folder or workspace root
dotenv.config();
if (!process.env.MONGODB_URI) {
  dotenv.config({ path: path.join(__dirname, '../../.env') });
}

const seedAdmin = async () => {
  try {
    const dbUri = process.env.MONGODB_URI;
    if (!dbUri) {
      throw new Error('MONGODB_URI is not defined in environment variables.');
    }

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be defined in environment variables.');
    }

    console.log('Connecting to database for seeding...');
    await mongoose.connect(dbUri);
    console.log('Database connected.');

    // Look for existing admin with this email
    let admin = await Admin.findOne({ email: adminEmail.toLowerCase() });

    if (admin) {
      console.log(`Admin user with email ${adminEmail} already exists. Updating password...`);
      admin.password = adminPassword; // Pre-save hook will hash it
      await admin.save();
      console.log('Admin password updated successfully.');
    } else {
      console.log(`Creating new admin user: ${adminEmail}...`);
      admin = new Admin({
        email: adminEmail.toLowerCase(),
        password: adminPassword, // Pre-save hook will hash it
      });
      await admin.save();
      console.log('Admin user created successfully.');
    }

    console.log('Admin seeding completed.');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error.message);
    process.exit(1);
  }
};

seedAdmin();
