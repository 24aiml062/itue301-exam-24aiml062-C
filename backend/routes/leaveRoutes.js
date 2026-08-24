const express = require('express');
const router = express.Router();
const {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  updateLeaveStatus,
} = require('../controllers/leaveRequestController');
const { authGuard, authorizeRoles } = require('../middleware/authGuard');

// All leave routes require authGuard
router.use(authGuard);

// POST /api/v1/leaves - Apply for leave (protected)
router.post('/', applyLeave);

// GET /api/v1/leaves/my - Return the employee's own requests (protected)
router.get('/my', getMyLeaves);

// GET /api/v1/leaves - Return all requests (protected for HR and Manager)
router.get('/', authorizeRoles('manager', 'hr'), getAllLeaves);

// PATCH /api/v1/leaves/:id/status - Manager approves/rejects a request (protected: manager only)
router.patch('/:id/status', authorizeRoles('manager'), updateLeaveStatus);

module.exports = router;
