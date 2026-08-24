const jwt = require('jsonwebtoken');
const Employee = require('../models/Employee');

/**
 * Custom Auth Guard Middleware
 * Validates Bearer token in Authorization header.
 * Returns 401 if token is missing, expired, or invalid.
 */
const authGuard = async (req, res, next) => {
  try {
    let token = null;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No authentication token provided.',
      });
    }

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'cspit_itue301_exam_secret_key_2026'
    );

    // Fetch employee from database (excluding password)
    const employee = await Employee.findById(decoded.id).select('-password');
    if (!employee) {
      return res.status(401).json({
        success: false,
        message: 'User session invalid. Employee not found.',
      });
    }

    req.employee = employee;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication token.',
      error: error.message,
    });
  }
};

/**
 * Role-Based Authorization Guard Middleware
 * Checks if authenticated employee possesses one of the authorized roles.
 */
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.employee || !roles.includes(req.employee.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Role '${req.employee ? req.employee.role : 'unauthorized'}' is not authorized to access this resource.`,
      });
    }
    next();
  };
};

module.exports = { authGuard, authorizeRoles };
