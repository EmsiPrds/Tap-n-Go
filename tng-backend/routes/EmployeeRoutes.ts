import { Router } from 'express';
import { getAllEmployees, timeIn, timeOut, getTimeLogs } from '../controllers/employeeController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', verifyToken, getAllEmployees);
router.post('/:id/timein', verifyToken, timeIn);
router.post('/:id/timeout', verifyToken, timeOut);
router.get('/:id/timelogs', verifyToken, getTimeLogs);

export default router;

