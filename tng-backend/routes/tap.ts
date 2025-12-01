import { Router, Response } from 'express';
import Employee from '../models/employee.js';
import TimeLog from '../models/TimeLog.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { AuthRequest } from '../types/index.js';

const router = Router();

// Helper to format time log response
const formatTimeLogResponse = (timeLog: any) => {
    return {
        id: timeLog._id.toString(),
        employee_id: timeLog.employeeId?.toString() || '',
        date: timeLog.date?.toISOString() || new Date().toISOString(),
        time_in: timeLog.timeIn?.toISOString(),
        break_out: timeLog.breakOut?.toISOString(),
        break_in: timeLog.breakIn?.toISOString(),
        time_out: timeLog.timeOut?.toISOString(),
        status: timeLog.status || 'present',
        notes: timeLog.notes || '',
        created_at: timeLog.createdAt?.toISOString() || new Date().toISOString()
    };
};

// Get today's time log for an employee
router.get('/:id/today', verifyToken, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        
        // Verify employee exists
        const employee = await Employee.findById(id);
        if (!employee) {
            res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
            return;
        }

        // Get today's date (start of day)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Find today's time log
        const timeLog = await TimeLog.findOne({
            employeeId: id,
            date: { $gte: today, $lt: tomorrow }
        });

        if (!timeLog) {
            res.json({
                success: true,
                data: null
            });
            return;
        }

        res.json({
            success: true,
            data: formatTimeLogResponse(timeLog)
        });
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        res.status(500).json({
            success: false,
            message: 'Error fetching today\'s time log',
            error: errorMessage
        });
    }
});

// Time In
router.post('/:id/time-in', verifyToken, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { photoVerification, notes } = req.body;

        // Verify employee exists
        const employee = await Employee.findById(id);
        if (!employee) {
            res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
            return;
        }

        // Check if employee is active
        if (employee.status !== 'active') {
            res.status(400).json({
                success: false,
                message: 'Employee is not active'
            });
            return;
        }

        // Get today's date
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Check if time in already exists for today
        const existingLog = await TimeLog.findOne({
            employeeId: id,
            date: { $gte: today, $lt: tomorrow }
        });

        if (existingLog) {
            if (existingLog.timeIn) {
                res.status(400).json({
                    success: false,
                    message: 'Time in already recorded for today'
                });
                return;
            }
            // Update existing log
            existingLog.timeIn = new Date();
            existingLog.notes = notes || existingLog.notes;
            existingLog.photoVerification = photoVerification || existingLog.photoVerification;
            existingLog.status = 'present';
            await existingLog.save();
            
            res.json({
                success: true,
                message: 'Time in recorded successfully',
                data: formatTimeLogResponse(existingLog)
            });
            return;
        }

        // Create new time log
        const timeLog = new TimeLog({
            employeeId: id,
            timeIn: new Date(),
            date: today,
            status: 'present',
            notes: notes || '',
            photoVerification: photoVerification || undefined
        });

        await timeLog.save();

        res.json({
            success: true,
            message: 'Time in recorded successfully',
            data: formatTimeLogResponse(timeLog)
        });
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        res.status(500).json({
            success: false,
            message: 'Error recording time in',
            error: errorMessage
        });
    }
});

// Break Out
router.post('/:id/break-out', verifyToken, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { notes, photoVerification } = req.body;

        // Get today's date
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Find today's time log
        const timeLog = await TimeLog.findOne({
            employeeId: id,
            date: { $gte: today, $lt: tomorrow }
        });

        if (!timeLog) {
            res.status(404).json({
                success: false,
                message: 'No time in record found for today'
            });
            return;
        }

        if (!timeLog.timeIn) {
            res.status(400).json({
                success: false,
                message: 'Please time in first'
            });
            return;
        }

        if (timeLog.breakOut) {
            res.status(400).json({
                success: false,
                message: 'Break out already recorded for today'
            });
            return;
        }

        if (timeLog.breakIn && timeLog.breakOut) {
            res.status(400).json({
                success: false,
                message: 'Break already completed. Cannot break out again.'
            });
            return;
        }

        timeLog.breakOut = new Date();
        timeLog.status = 'on-break';
        if (notes) {
            timeLog.notes = (timeLog.notes ? timeLog.notes + '\n' : '') + notes;
        }
        // Store photo verification if provided
        if (photoVerification) {
            // In a production app, you might want to store multiple photos for different actions
            // For now, we'll append to notes or store in a separate field
            timeLog.photoVerification = photoVerification;
        }
        await timeLog.save();

        res.json({
            success: true,
            message: 'Break out recorded successfully',
            data: formatTimeLogResponse(timeLog)
        });
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        res.status(500).json({
            success: false,
            message: 'Error recording break out',
            error: errorMessage
        });
    }
});

// Break In
router.post('/:id/break-in', verifyToken, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { notes, photoVerification } = req.body;

        // Get today's date
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Find today's time log
        const timeLog = await TimeLog.findOne({
            employeeId: id,
            date: { $gte: today, $lt: tomorrow }
        });

        if (!timeLog) {
            res.status(404).json({
                success: false,
                message: 'No time in record found for today'
            });
            return;
        }

        if (!timeLog.breakOut) {
            res.status(400).json({
                success: false,
                message: 'No break out record found. Please break out first.'
            });
            return;
        }

        if (timeLog.breakIn) {
            res.status(400).json({
                success: false,
                message: 'Break in already recorded for today'
            });
            return;
        }

        timeLog.breakIn = new Date();
        timeLog.status = 'present';
        if (notes) {
            timeLog.notes = (timeLog.notes ? timeLog.notes + '\n' : '') + notes;
        }
        // Store photo verification if provided
        if (photoVerification) {
            timeLog.photoVerification = photoVerification;
        }
        await timeLog.save();

        res.json({
            success: true,
            message: 'Break in recorded successfully',
            data: formatTimeLogResponse(timeLog)
        });
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        res.status(500).json({
            success: false,
            message: 'Error recording break in',
            error: errorMessage
        });
    }
});

// Time Out
router.post('/:id/time-out', verifyToken, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { notes, photoVerification } = req.body;

        // Get today's date
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Find today's time log
        const timeLog = await TimeLog.findOne({
            employeeId: id,
            date: { $gte: today, $lt: tomorrow }
        });

        if (!timeLog) {
            res.status(404).json({
                success: false,
                message: 'No time in record found for today'
            });
            return;
        }

        if (!timeLog.timeIn) {
            res.status(400).json({
                success: false,
                message: 'Please time in first'
            });
            return;
        }

        if (timeLog.timeOut) {
            res.status(400).json({
                success: false,
                message: 'Time out already recorded for today'
            });
            return;
        }

        // Check if currently on break
        if (timeLog.status === 'on-break' && timeLog.breakOut && !timeLog.breakIn) {
            res.status(400).json({
                success: false,
                message: 'Please break in first before timing out'
            });
            return;
        }

        timeLog.timeOut = new Date();
        timeLog.status = 'present';
        if (notes) {
            timeLog.notes = (timeLog.notes ? timeLog.notes + '\n' : '') + notes;
        }
        // Store photo verification if provided
        if (photoVerification) {
            timeLog.photoVerification = photoVerification;
        }
        await timeLog.save();

        res.json({
            success: true,
            message: 'Time out recorded successfully',
            data: formatTimeLogResponse(timeLog)
        });
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        res.status(500).json({
            success: false,
            message: 'Error recording time out',
            error: errorMessage
        });
    }
});

export default router;

