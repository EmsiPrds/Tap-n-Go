<<<<<<< HEAD
require("dotenv").config();
const mongoose = require("mongoose");
const Admin = require("./models/Admin");

// Configuration
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/TapNGoDB";
const DEFAULT_ADMIN_USERNAME = process.env.DEFAULT_ADMIN_USERNAME || "admin";
const DEFAULT_ADMIN_PASSWORD = process.env.DEFAULT_ADMIN_PASSWORD || "123";
=======
import { connect, disconnect } from 'mongoose';
import bcrypt from 'bcryptjs'; // Default import for bcryptjs
import Admin from './models/Admin.js';

// Connect to MongoDB
const connectToDb = async () => {
    try {
        await connect('mongodb://127.0.0.1:27017/TapNGoDB');
        console.log('MongoDB connected');
    } catch (err) {
        console.log('MongoDB connection failed:', err);
        process.exit(1); // Exit the process if DB connection fails
    }
};
>>>>>>> d16eb7d84847a594d3ae5d1a73e4ecd32720bd00

/**
 * Create default admin user
 * This script creates the default admin user if it doesn't exist
 */
const createDefaultAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log("✓ MongoDB connected");

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({
      username: DEFAULT_ADMIN_USERNAME,
    });

<<<<<<< HEAD
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
    console.error("✗ Error creating admin user:", error.message);
    if (error.code === 11000) {
      console.error("  Admin user already exists (duplicate key error)");
    }
    process.exit(1);
  }
};

// Run the script
createDefaultAdmin();
=======
    try {
        const existingAdmin = await Admin.findOne({ username });
        if (existingAdmin) {
            console.log('Admin already exists');
            return; // Exit if admin already exists
        }

        const hashedPassword = await bcrypt.hash(plainPassword, 10); // Using bcrypt.hash
        const newAdmin = new Admin({
            username: username,
            password: hashedPassword
        });

        await newAdmin.save();
        console.log('Admin created successfully');
    } catch (err) {
        console.log('Error creating admin:', err);
    } finally {
        // Disconnect from DB after operation is complete
        disconnect();
    }
};

const main = async () => {
    await connectToDb();
    await createAdmin();
};

main();
>>>>>>> d16eb7d84847a594d3ae5d1a73e4ecd32720bd00
