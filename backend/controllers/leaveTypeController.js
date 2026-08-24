const LeaveType = require('../models/LeaveType');

/**
 * @desc    Get all leave types
 * @route   GET /api/v1/leave-types
 * @access  Public
 */
const getLeaveTypes = async (req, res, next) => {
  try {
    const leaveTypes = await LeaveType.find().sort({ name: 1 });
    res.status(200).json({
      success: true,
      count: leaveTypes.length,
      data: leaveTypes,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLeaveTypes,
};
