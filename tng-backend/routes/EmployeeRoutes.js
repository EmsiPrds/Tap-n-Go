import { Router } from 'express';
const router = Router();
import { getAllEmployees, timeIn, timeOut, getTimeLogs } from '../controllers/employeeController.js';
router.get('/', getAllEmployees);
router.post('/:id/timein', timeIn);
router.post('/:id/timeout', timeOut);
router.get('/:id/timelogs', getTimeLogs);
export default router;