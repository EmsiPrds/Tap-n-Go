import { Router, Response } from 'express';
import Employee from '../models/employee.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { AuthRequest } from '../types/index.js';

const router = Router();

// Protected route: Get all employees
router.get('/', verifyToken, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const employees = await Employee.find();  // Use the `find` method directly on the Employee model
        res.json(employees);
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        res.status(500).json({ message: 'Server error', error: errorMessage });
    }
});

// Protected route: Add a new employee
router.post('/add', verifyToken, async (req: AuthRequest, res: Response): Promise<void> => {
    const { name, position } = req.body as { name: string; position: string };

    try {
        const newEmployee = new Employee({ name, position });
        await newEmployee.save();
        res.json(newEmployee);
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        res.status(500).json({ message: 'Server error', error: errorMessage });
    }
});

// Protected route: Delete an employee
router.delete('/:id', verifyToken, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        await Employee.findByIdAndDelete(req.params.id);  // Use `findByIdAndDelete` directly on the Employee model
        res.json({ message: 'Employee deleted' });
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        res.status(500).json({ message: 'Server error', error: errorMessage });
    }
});

export default router;

