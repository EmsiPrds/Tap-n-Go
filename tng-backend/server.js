const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const employeeRoutes = require('./routes/employee');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);


// MongoDB Connection
mongoose.connect('mongodb://127.0.0.1:27017/TapNGoDB')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Default Route
app.get('/', (req, res) => {
    res.send('Time Tracking System API Running');
});

// Test Route for Frontend
app.get('/api/test', (req, res) => {
    res.json({ message: 'Frontend and Backend are connected!' });
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
