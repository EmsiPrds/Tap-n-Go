<<<<<<< HEAD
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth');
const employeeRoutes = require('./routes/employee');
=======
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import employeeRoutes from './routes/employee.js';
>>>>>>> d16eb7d84847a594d3ae5d1a73e4ecd32720bd00

const app = express();

// CORS Configuration - Only allow frontend origin
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);

<<<<<<< HEAD
// MongoDB Connection
const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/TapNGoDB';
mongoose.connect(mongoURI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));
=======
// MongoDB Connection without deprecated options
mongoose.connect('mongodb://127.0.0.1:27017/TapNGoDB')
  .then(() => console.log('MongoDB connected'))
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);  // Exit process with failure
  });
>>>>>>> d16eb7d84847a594d3ae5d1a73e4ecd32720bd00

// Default Route
app.get('/', (req, res) => {
    res.send('Time Tracking System API Running');
});

// Test Route for Frontend
app.get('/api/test', (req, res) => {
    res.json({ message: 'Frontend and Backend are connected!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
