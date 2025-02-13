const express = require('express');
const router = express.Router();
const { getAllEmployees, timeIn, timeOut, getTimeLogs } = require('../controllers/EmployeeController');
router.get('/', getAllEmployees);
router.post('/:id/timein', timeIn);
router.post('/:id/timeout', timeOut);
router.get('/:id/timelogs', getTimeLogs);
module.exports = router;