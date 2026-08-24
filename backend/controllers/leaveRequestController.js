const LeaveRequest = require('../models/LeaveRequest');
const Employee = require('../models/Employee');
const LeaveType = require('../models/LeaveType');

/**
 * @desc    Apply for a new leave request
 * @route   POST /api/v1/leaves
 * @access  Protected (Employee/Manager/HR)
 */
const applyLeave = async (req, res, next) => {
  try {
    const { leaveTypeId, fromDate, toDate, days, reason } = req.body;

    // Check required fields
    if (!leaveTypeId || !fromDate || !toDate || !days) {
      return res.status(400).json({
        success: false,
        message: 'Please provide leaveTypeId, fromDate, toDate, and days',
      });
    }

    const numDays = Number(days);
    if (isNaN(numDays) || numDays < 1) {
      return res.status(400).json({
        success: false,
        message: 'Leave days must be a positive number of at least 1',
      });
    }

    // Verify leave type exists
    const leaveType = await LeaveType.findById(leaveTypeId);
    if (!leaveType) {
      return res.status(400).json({
        success: false,
        message: 'Invalid leave type selected',
      });
    }

    // Fetch employee and check current balance
    const employee = await Employee.findById(req.employee._id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    // Validation: Check if requested days exceed employee leave balance
    if (numDays > employee.leaveBalance) {
      return res.status(400).json({
        success: false,
        message: `Requested leave days (${numDays}) exceeds your remaining leave balance (${employee.leaveBalance}).`,
        currentBalance: employee.leaveBalance,
        requestedDays: numDays,
      });
    }

    // Create Leave Request
    const leaveRequest = await LeaveRequest.create({
      employeeId: employee._id,
      leaveTypeId,
      fromDate: new Date(fromDate),
      toDate: new Date(toDate),
      days: numDays,
      reason: reason || '',
      status: 'pending',
    });

    // Deduct days from employee leave balance
    employee.leaveBalance -= numDays;
    await employee.save();

    // Populate leaveTypeId for response
    await leaveRequest.populate('leaveTypeId', 'name maxDaysPerYear');

    res.status(201).json({
      success: true,
      message: 'Leave request submitted successfully',
      data: leaveRequest,
      remainingBalance: employee.leaveBalance,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get logged-in employee's own leave requests
 * @route   GET /api/v1/leaves/my
 * @access  Protected
 */
const getMyLeaves = async (req, res, next) => {
  try {
    const leaves = await LeaveRequest.find({ employeeId: req.employee._id })
      .populate('leaveTypeId', 'name maxDaysPerYear')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: leaves.length,
      data: leaves,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all leave requests (for HR and Manager oversight)
 * @route   GET /api/v1/leaves
 * @access  Protected (HR / Manager)
 */
const getAllLeaves = async (req, res, next) => {
  try {
    const leaves = await LeaveRequest.find()
      .populate('employeeId', 'name email department designation leaveBalance')
      .populate('leaveTypeId', 'name maxDaysPerYear')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: leaves.length,
      data: leaves,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Approve or reject a leave request
 * @route   PATCH /api/v1/leaves/:id/status
 * @access  Protected (Manager / HR)
 */
const updateLeaveStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate allowed status values per exam specification
    const ALLOWED = ['approved', 'rejected'];
    if (!status || !ALLOWED.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status '${status}'. Allowed values are: ${ALLOWED.join(', ')}`,
      });
    }

    const leaveRequest = await LeaveRequest.findById(id);
    if (!leaveRequest) {
      return res.status(404).json({
        success: false,
        message: `Leave request with ID ${id} not found`,
      });
    }

    const previousStatus = leaveRequest.status;

    // If request is rejected from pending/approved, restore the employee's deducted leave balance
    if (status === 'rejected' && previousStatus !== 'rejected') {
      await Employee.findByIdAndUpdate(leaveRequest.employeeId, {
        $inc: { leaveBalance: leaveRequest.days },
      });
    } else if (status === 'approved' && previousStatus === 'rejected') {
      // Re-deduct if previously rejected
      const emp = await Employee.findById(leaveRequest.employeeId);
      if (emp.leaveBalance < leaveRequest.days) {
        return res.status(400).json({
          success: false,
          message: 'Cannot approve request: employee has insufficient leave balance',
        });
      }
      emp.leaveBalance -= leaveRequest.days;
      await emp.save();
    }

    leaveRequest.status = status;
    await leaveRequest.save();

    await leaveRequest.populate('employeeId', 'name email department designation leaveBalance');
    await leaveRequest.populate('leaveTypeId', 'name maxDaysPerYear');

    res.status(200).json({
      success: true,
      message: `Leave request has been ${status}`,
      data: leaveRequest,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  updateLeaveStatus,
};
