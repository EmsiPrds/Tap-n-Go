import { Router, Response } from 'express';
import Employee from '../models/employee.js';
import TimeLog from '../models/TimeLog.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { AuthRequest } from '../types/index.js';

const router = Router();

// Helper to get start and end of day
const getTodayStartEnd = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return { today, tomorrow };
};

// GET /api/dashboard/stats - Get dashboard statistics
router.get('/stats', verifyToken, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { today, tomorrow } = getTodayStartEnd();

        // Get all active employees
        const totalEmployees = await Employee.countDocuments({ status: 'active' });

        // Get today's time logs
        const todayLogs = await TimeLog.find({
            date: { $gte: today, $lt: tomorrow }
        }).populate('employeeId', 'shift_start');

        // Calculate stats
        let totalPresent = 0;
        let lateEmployees = 0;
        let onBreak = 0;
        let timedOut = 0;

        todayLogs.forEach((log) => {
            if (log.timeIn) {
                totalPresent++;
                
                // Check if late (assuming shift starts at 9:00 AM, adjust logic as needed)
                const employee = log.employeeId as any;
                if (employee && employee.shift_start) {
                    const [shiftHour, shiftMin] = employee.shift_start.split(':').map(Number);
                    const shiftStartTime = new Date(log.date);
                    shiftStartTime.setHours(shiftHour, shiftMin, 0, 0);
                    
                    if (log.timeIn && log.timeIn > shiftStartTime) {
                        lateEmployees++;
                    }
                }

                // Check if on break (has breakOut but no breakIn)
                if (log.breakOut && !log.breakIn) {
                    onBreak++;
                }

                // Check if timed out
                if (log.timeOut) {
                    timedOut++;
                }
            }
        });

        res.json({
            success: true,
            data: {
                totalPresent,
                lateEmployees,
                onBreak,
                timedOut,
                totalEmployees
            }
        });
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard stats',
            error: errorMessage
        });
    }
});

// GET /api/dashboard/recent-activity - Get recent attendance activity
router.get('/recent-activity', verifyToken, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const limit = parseInt(req.query.limit as string) || 10;
        const { today, tomorrow } = getTodayStartEnd();

        const recentLogs = await TimeLog.find({
            date: { $gte: today, $lt: tomorrow },
            timeIn: { $exists: true }
        })
        .populate('employeeId', 'first_name last_name employee_id avatar_url')
        .sort({ timeIn: -1 })
        .limit(limit);

        const activities = recentLogs.map((log) => {
            const employee = log.employeeId as any;
            return {
                id: log._id.toString(),
                employee: {
                    id: employee?._id?.toString(),
                    name: employee ? `${employee.first_name} ${employee.last_name}` : 'Unknown',
                    employee_id: employee?.employee_id || 'N/A',
                    avatar_url: employee?.avatar_url
                },
                time_in: log.timeIn?.toISOString(),
                status: log.status || 'present'
            };
        });

        res.json({
            success: true,
            data: activities
        });
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        res.status(500).json({
            success: false,
            message: 'Error fetching recent activity',
            error: errorMessage
        });
    }
});

// GET /api/dashboard/summary - Get today's summary
router.get('/summary', verifyToken, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { today, tomorrow } = getTodayStartEnd();

        const totalEmployees = await Employee.countDocuments({ status: 'active' });
        const presentEmployees = await TimeLog.countDocuments({
            date: { $gte: today, $lt: tomorrow },
            timeIn: { $exists: true }
        });
        const absentEmployees = totalEmployees - presentEmployees;
        const attendanceRate = totalEmployees > 0 
            ? Math.round((presentEmployees / totalEmployees) * 100) 
            : 0;

        res.json({
            success: true,
            data: {
                totalEmployees,
                present: presentEmployees,
                absent: absentEmployees,
                attendanceRate
            }
        });
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        res.status(500).json({
            success: false,
            message: 'Error fetching summary',
            error: errorMessage
        });
    }
});

export default router;

