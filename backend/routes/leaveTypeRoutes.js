const express = require('express');
const router = express.Router();
const { getLeaveTypes } = require('../controllers/leaveTypeController');

// Public route: Task 3 requirement
router.get('/', getLeaveTypes);

module.exports = router;
