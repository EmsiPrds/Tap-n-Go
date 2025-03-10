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

// Create Admin User
const createAdmin = async () => {
    const username = 'admin';
    const plainPassword = '123';  // This will be the login password

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
