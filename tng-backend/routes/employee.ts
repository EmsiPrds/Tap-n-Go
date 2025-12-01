import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import Employee from '../models/employee.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { AuthRequest } from '../types/index.js';

const router = Router();

// Helper function to format employee response
const formatEmployeeResponse = (employee: any) => {
    return {
        id: employee._id.toString(),
        employee_id: employee.employee_id,
        first_name: employee.first_name,
        last_name: employee.last_name,
        email: employee.email,
        department: employee.department,
        position: employee.position,
        avatar_url: employee.avatar_url,
        shift_start: employee.shift_start,
        shift_end: employee.shift_end,
        status: employee.status,
        created_at: employee.createdAt?.toISOString() || new Date().toISOString()
    };
};

// Protected route: Get all employees
router.get('/', verifyToken, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const employees = await Employee.find().sort({ createdAt: -1 });
        const formattedEmployees = employees.map(formatEmployeeResponse);
        res.json({
            success: true,
            data: formattedEmployees
        });
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        res.status(500).json({ 
            success: false,
            message: 'Server error', 
            error: errorMessage 
        });
    }
});

// Validation rules for adding employee
const addEmployeeValidation = [
    body('employee_id')
        .trim()
        .notEmpty().withMessage('Employee ID is required')
        .isLength({ min: 3, max: 20 }).withMessage('Employee ID must be between 3 and 20 characters')
        .matches(/^[A-Z0-9_]+$/).withMessage('Employee ID can only contain uppercase letters, numbers, and underscores'),
    body('first_name')
        .trim()
        .notEmpty().withMessage('First name is required')
        .isLength({ min: 2, max: 50 }).withMessage('First name must be between 2 and 50 characters'),
    body('last_name')
        .trim()
        .notEmpty().withMessage('Last name is required')
        .isLength({ min: 2, max: 50 }).withMessage('Last name must be between 2 and 50 characters'),
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please provide a valid email address')
        .normalizeEmail(),
    body('department')
        .trim()
        .notEmpty().withMessage('Department is required')
        .isLength({ min: 2, max: 50 }).withMessage('Department must be between 2 and 50 characters'),
    body('position')
        .trim()
        .notEmpty().withMessage('Position is required')
        .isLength({ min: 2, max: 50 }).withMessage('Position must be between 2 and 50 characters'),
    body('shift_start')
        .trim()
        .notEmpty().withMessage('Shift start time is required')
        .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Shift start must be in HH:MM format (24-hour)'),
    body('shift_end')
        .trim()
        .notEmpty().withMessage('Shift end time is required')
        .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Shift end must be in HH:MM format (24-hour)'),
    body('status')
        .optional()
        .isIn(['active', 'inactive']).withMessage('Status must be either active or inactive'),
    body('avatar_url')
        .optional()
        .isURL().withMessage('Avatar URL must be a valid URL')
];

// Protected route: Add a new employee  
router.post('/', verifyToken, ...addEmployeeValidation, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array().map(err => ({
                    field: err.type === 'field' ? err.path : 'unknown',
                    message: err.msg
                }))
            });
            return;
        }

        const {
            employee_id,
            first_name,
            last_name,
            email,
            department,
            position,
            avatar_url,
            shift_start,
            shift_end,
            status = 'active'
        } = req.body;

        // Check if employee_id already exists
        const existingEmployeeById = await Employee.findOne({ employee_id: employee_id.toUpperCase() });
        if (existingEmployeeById) {
            res.status(400).json({
                success: false,
                message: 'Employee ID already exists'
            });
            return;
        }

        // Check if email already exists
        const existingEmployeeByEmail = await Employee.findOne({ email: email.toLowerCase() });
        if (existingEmployeeByEmail) {
            res.status(400).json({
                success: false,
                message: 'Email already exists'
            });
            return;
        }

        // Create new employee
        const newEmployee = new Employee({
            employee_id: employee_id.toUpperCase(),
            first_name: first_name.trim(),
            last_name: last_name.trim(),
            email: email.toLowerCase().trim(),
            department: department.trim(),
            position: position.trim(),
            avatar_url: avatar_url?.trim(),
            shift_start: shift_start.trim(),
            shift_end: shift_end.trim(),
            status
        });

        await newEmployee.save();

        res.status(201).json({
            success: true,
            message: 'Employee created successfully',
            data: formatEmployeeResponse(newEmployee)
        });
    } catch (err: any) {
        // Handle duplicate key errors
        if (err.code === 11000) {
            const field = Object.keys(err.keyPattern)[0];
            res.status(400).json({
                success: false,
                message: `${field === 'employee_id' ? 'Employee ID' : 'Email'} already exists`
            });
            return;
        }

        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        res.status(500).json({ 
            success: false,
            message: 'Server error', 
            error: errorMessage 
        });
    }
});

// Protected route: Get employee by ID
router.get('/:id', verifyToken, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const employee = await Employee.findById(req.params.id);
        if (!employee) {
            res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
            return;
        }
        res.json({
            success: true,
            data: formatEmployeeResponse(employee)
        });
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        res.status(500).json({ 
            success: false,
            message: 'Server error', 
            error: errorMessage 
        });
    }
});

// Protected route: Delete an employee
router.delete('/:id', verifyToken, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const deletedEmployee = await Employee.findByIdAndDelete(req.params.id);
        if (!deletedEmployee) {
            res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
            return;
        }
        res.json({ 
            success: true,
            message: 'Employee deleted successfully' 
        });
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        res.status(500).json({ 
            success: false,
            message: 'Server error', 
            error: errorMessage 
        });
    }
});

export default router;

