import 'dotenv/config';
import mongoose from 'mongoose';
import Admin from './models/Admin.js';

// Configuration
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/TapNGoDB";
const DEFAULT_ADMIN_USERNAME = process.env.DEFAULT_ADMIN_USERNAME || "admin";
const DEFAULT_ADMIN_PASSWORD = process.env.DEFAULT_ADMIN_PASSWORD || "123";

/**
 * Create default admin user
 * This script creates the default admin user if it doesn't exist
 */
const createDefaultAdmin = async (): Promise<void> => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log("✓ MongoDB connected");

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({
      username: DEFAULT_ADMIN_USERNAME,
    });

    if (existingAdmin) {
      console.log(`✓ Admin user '${DEFAULT_ADMIN_USERNAME}' already exists`);
      console.log("  No action needed.");
      await mongoose.disconnect();
      return;
    }

    // Create new admin (password will be hashed by pre-save hook)
    const newAdmin = new Admin({
      username: DEFAULT_ADMIN_USERNAME,
      password: DEFAULT_ADMIN_PASSWORD, // Pre-save hook will hash this
      isActive: true,
    });

    await newAdmin.save();

    console.log("✓ Default admin user created successfully!");
    console.log(`  Username: ${DEFAULT_ADMIN_USERNAME}`);
    console.log(`  Password: ${DEFAULT_ADMIN_PASSWORD}`);
    console.log(
      "\n⚠️  IMPORTANT: Change the default password after first login!"
    );

    await mongoose.disconnect();
    console.log("✓ Database connection closed");
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("✗ Error creating admin user:", errorMessage);
    if (error instanceof Error && 'code' in error && error.code === 11000) {
      console.error("  Admin user already exists (duplicate key error)");
    }
    process.exit(1);
  }
};

// Run the script
createDefaultAdmin();

