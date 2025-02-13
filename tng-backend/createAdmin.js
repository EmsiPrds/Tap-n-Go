const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('./models/Admin');

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/TapNGoDB')
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

// Create Admin User
const createAdmin = async () => {
    const username = 'admin';
    const plainPassword = '123';  // This will be the login password

    const existingAdmin = await Admin.findOne({ username });
    if (existingAdmin) {
        console.log('Admin already exists');
        mongoose.disconnect();
        return;
    }

    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const newAdmin = new Admin({
        username: username,
        password: hashedPassword
    });

    await newAdmin.save();
    console.log('Admin created successfully');
    mongoose.disconnect();  // Close connection after creation
};

createAdmin();
