import { Router } from 'express';
import Employee from '../models/employee.js';  // Only import the model
import verifyToken from '../middleware/authMiddleware.js';

const router = Router();

// Protected route: Get all employees
router.get('/', verifyToken, async (req, res) => {
    try {
        const employees = await Employee.find();  // Use the `find` method directly on the Employee model
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
        await Employee.findByIdAndDelete(req.params.id);  // Use `findByIdAndDelete` directly on the Employee model
        res.json({ message: 'Employee deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
