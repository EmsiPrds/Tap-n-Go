import { Router, Response } from 'express';
import TimeLog from '../models/TimeLog.js';
import Employee from '../models/employee.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { AuthRequest } from '../types/index.js';

const router = Router();

// Helper function to format attendance record
const formatAttendanceRecord = (log: any, employee: any) => {
    return {
        id: log._id.toString(),
        employee_id: employee?.employee_id || 'N/A',
        employee_name: employee ? `${employee.first_name} ${employee.last_name}` : 'Unknown',
        date: log.date.toISOString().split('T')[0],
        time_in: log.timeIn ? log.timeIn.toTimeString().split(' ')[0] : undefined,
        break_out: log.breakOut ? log.breakOut.toTimeString().split(' ')[0] : undefined,
        break_in: log.breakIn ? log.breakIn.toTimeString().split(' ')[0] : undefined,
        time_out: log.timeOut ? log.timeOut.toTimeString().split(' ')[0] : undefined,
        status: log.status || (log.timeIn ? 'present' : 'absent'),
        notes: log.notes,
        created_at: log.createdAt?.toISOString() || new Date().toISOString()
    };
};

// GET /api/attendance - Get attendance records with filtering
router.get('/', verifyToken, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { date, employee_id, status, page = '1', limit = '50' } = req.query;

        // Build query
        const query: any = {};

        // Filter by date
        if (date) {
            const filterDate = new Date(date as string);
            filterDate.setHours(0, 0, 0, 0);
            const nextDay = new Date(filterDate);
            nextDay.setDate(nextDay.getDate() + 1);
            query.date = { $gte: filterDate, $lt: nextDay };
        } else {
            // Default to today if no date specified
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            query.date = { $gte: today, $lt: tomorrow };
        }

        // Filter by employee_id
        if (employee_id) {
            const employee = await Employee.findOne({ employee_id: employee_id as string });
            if (employee) {
                query.employeeId = employee._id;
            } else {
                // Employee not found, return empty results
                res.json({
                    success: true,
                    data: [],
                    pagination: {
                        page: parseInt(page as string),
                        limit: parseInt(limit as string),
                        total: 0,
                        pages: 0
                    }
                });
                return;
            }
        }

        // Filter by status
        if (status && status !== 'all') {
            query.status = status;
        } else if (!status) {
            // If no status filter and no timeIn, include all records for the date
            // This allows showing absent employees
        }

        // Pagination
        const pageNum = parseInt(page as string);
        const limitNum = parseInt(limit as string);
        const skip = (pageNum - 1) * limitNum;

        // Get total count
        const total = await TimeLog.countDocuments(query);

        // Get attendance records
        const logs = await TimeLog.find(query)
            .populate('employeeId')
            .sort({ date: -1, timeIn: -1 })
            .skip(skip)
            .limit(limitNum);

        // Format response
        const records = logs.map((log) => {
            const employee = log.employeeId as any;
            return formatAttendanceRecord(log, employee);
        });

        // Also get employees without attendance records for the date (absent)
        if (!employee_id && (!status || status === 'absent' || status === 'all')) {
            const dateStr = date ? (date as string) : new Date().toISOString().split('T')[0];
            const filterDate = new Date(dateStr);
            filterDate.setHours(0, 0, 0, 0);

            const employeesWithAttendance = new Set(
                logs.map(log => (log.employeeId as any)?._id?.toString())
            );

            const allEmployees = await Employee.find({ status: 'active' });
            const absentEmployees = allEmployees
                .filter(emp => !employeesWithAttendance.has(emp._id.toString()))
                .map(emp => ({
                    id: `absent-${emp._id}`,
                    employee_id: emp.employee_id,
                    employee_name: `${emp.first_name} ${emp.last_name}`,
                    date: dateStr,
                    status: 'absent' as const,
                    created_at: new Date().toISOString()
                }));

            // Merge and sort
            const allRecords = [...records, ...absentEmployees].sort((a, b) => {
                if (a.employee_id < b.employee_id) return -1;
                if (a.employee_id > b.employee_id) return 1;
                return 0;
            });

            // Apply status filter if needed
            const filteredRecords = status && status !== 'all'
                ? allRecords.filter(r => r.status === status)
                : allRecords;

            res.json({
                success: true,
                data: filteredRecords,
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                    total: filteredRecords.length,
                    pages: Math.ceil(filteredRecords.length / limitNum)
                }
            });
        } else {
            res.json({
                success: true,
                data: records,
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                    total,
                    pages: Math.ceil(total / limitNum)
                }
            });
        }
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        res.status(500).json({
            success: false,
            message: 'Error fetching attendance records',
            error: errorMessage
        });
    }
});

export default router;

