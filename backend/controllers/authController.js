const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Employee = require('../models/Employee');

/**
 * Generate JWT Token Helper
 */
const generateToken = (employee) => {
  return jwt.sign(
    {
      id: employee._id,
      email: employee.email,
      role: employee.role,
      name: employee.name,
    },
    process.env.JWT_SECRET || 'cspit_itue301_exam_secret_key_2026',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

/**
 * @desc    Authenticate employee & return JWT token
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password',
      });
    }

    const employee = await Employee.findOne({ email: email.toLowerCase() });
    if (!employee) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Compare password (supports bcrypt hash or direct comparison for seed data safety)
    const isMatch =
      (await bcrypt.compare(password, employee.password)) ||
      password === employee.password;

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const token = generateToken(employee);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      employee: {
        _id: employee._id,
        name: employee.name,
        email: employee.email,
        department: employee.department,
        designation: employee.designation,
        role: employee.role,
        leaveBalance: employee.leaveBalance,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current authenticated employee profile
 * @route   GET /api/v1/auth/me
 * @access  Protected
 */
const getMe = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.employee._id).select('-password');
    res.status(200).json({
      success: true,
      employee,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  getMe,
};
