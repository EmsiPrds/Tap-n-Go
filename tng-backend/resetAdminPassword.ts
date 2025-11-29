import 'dotenv/config';
import mongoose from 'mongoose';
import Admin from './models/Admin.js';

// Configuration
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/TapNGoDB";
const DEFAULT_ADMIN_USERNAME = process.env.DEFAULT_ADMIN_USERNAME || "admin";
const DEFAULT_ADMIN_PASSWORD = process.env.DEFAULT_ADMIN_PASSWORD || "123";

/**
 * Reset admin password
 * This script resets the admin password to ensure it's properly hashed
 */
const resetAdminPassword = async (): Promise<void> => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log("✓ MongoDB connected");

    // Find admin
    const admin = await Admin.findOne({
      username: DEFAULT_ADMIN_USERNAME,
    }).select('+password');

    if (!admin) {
      console.log(`✗ Admin user '${DEFAULT_ADMIN_USERNAME}' not found`);
      console.log("  Run createAdmin.js first to create the admin user.");
      await mongoose.disconnect();
      return;
    }

    // Reset password (the pre-save hook will hash it automatically)
    admin.password = DEFAULT_ADMIN_PASSWORD;
    admin.loginAttempts = 0;
    admin.lockUntil = undefined;
    admin.isActive = true;
    
    await admin.save();

    console.log("✓ Admin password reset successfully!");
    console.log(`  Username: ${DEFAULT_ADMIN_USERNAME}`);
    console.log(`  Password: ${DEFAULT_ADMIN_PASSWORD}`);
    console.log("  Login attempts reset");
    console.log("  Account unlocked");

    await mongoose.disconnect();
    console.log("✓ Database connection closed");
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("✗ Error resetting admin password:", errorMessage);
    console.error(error);
    process.exit(1);
  }
};

// Run the script
resetAdminPassword();

