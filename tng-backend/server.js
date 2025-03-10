import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import employeeRoutes from './routes/employee.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);

// MongoDB Connection without deprecated options
mongoose.connect('mongodb://127.0.0.1:27017/TapNGoDB')
  .then(() => console.log('MongoDB connected'))
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);  // Exit process with failure
  });

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
