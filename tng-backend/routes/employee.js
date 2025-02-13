const express = require('express');
const Employee = require('../models/employee');
const verifyToken = require('../middleware/authMiddleware');

const router = express.Router();

// Protected route: Get all employees
router.get('/', verifyToken, async (req, res) => {
    try {
        const employees = await Employee.find();
        res.json(employees);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Protected route: Add a new employee
router.post('/add', verifyToken, async (req, res) => {
    const { name, position } = req.body;

    try {
        const newEmployee = new Employee({ name, position });
        await newEmployee.save();
        res.json(newEmployee);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Protected route: Delete an employee
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        await Employee.findByIdAndDelete(req.params.id);
        res.json({ message: 'Employee deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
