import { Response } from 'express';
import Employee from '../models/employee.js';
import TimeLog from '../models/TimeLog.js';
import { AuthRequest } from '../types/index.js';

// Get all employees
export const getEmployees = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const employees = await Employee.find();
        res.json(employees);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ message: 'Error fetching employees', error: errorMessage });
    }
};

// Get all employees (alias for EmployeeRoutes)
export const getAllEmployees = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const employees = await Employee.find();
        res.json(employees);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ message: 'Error fetching employees', error: errorMessage });
    }
};

// Time in for an employee
export const timeIn = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { photoVerification } = req.body;

        const timeLog = new TimeLog({
            employeeId: id,
            timeIn: new Date(),
            date: new Date(),
            photoVerification: photoVerification || undefined
        });

        await timeLog.save();
        res.json({ message: 'Time in recorded', timeLog });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ message: 'Error recording time in', error: errorMessage });
    }
};

// Time out for an employee
export const timeOut = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const timeLog = await TimeLog.findOne({
            employeeId: id,
            date: { $gte: today }
        }).sort({ timeIn: -1 });

        if (!timeLog) {
            res.status(404).json({ message: 'No time in record found for today' });
            return;
        }

        if (timeLog.timeOut) {
            res.status(400).json({ message: 'Time out already recorded for today' });
            return;
        }

        timeLog.timeOut = new Date();
        await timeLog.save();

        res.json({ message: 'Time out recorded', timeLog });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ message: 'Error recording time out', error: errorMessage });
    }
};

// Get time logs for an employee
export const getTimeLogs = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const timeLogs = await TimeLog.find({ employeeId: id }).sort({ date: -1 });
        res.json(timeLogs);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ message: 'Error fetching time logs', error: errorMessage });
    }
};

