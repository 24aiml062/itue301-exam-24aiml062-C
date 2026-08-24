const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const Employee = require('../models/Employee');
const LeaveType = require('../models/LeaveType');
const LeaveRequest = require('../models/LeaveRequest');

dotenv.config({ path: __dirname + '/../.env' });

const seedData = async () => {
  try {
    const mongoUri =
      process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/itue301_leave_management';
    await mongoose.connect(mongoUri);
    console.log('[Seed] Connected to MongoDB...');

    // Clear existing collections
    await Employee.deleteMany({});
    await LeaveType.deleteMany({});
    await LeaveRequest.deleteMany({});
    console.log('[Seed] Cleared existing data.');

    // 1. Seed Leave Types (Casual, Sick, Earned, CompOff)
    const leaveTypes = await LeaveType.insertMany([
      { name: 'Casual', maxDaysPerYear: 12 },
      { name: 'Sick', maxDaysPerYear: 10 },
      { name: 'Earned', maxDaysPerYear: 15 },
      { name: 'CompOff', maxDaysPerYear: 5 },
    ]);
    console.log(`[Seed] Seeded ${leaveTypes.length} leave types.`);

    // 2. Hash default password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    // 3. Seed Employees (Employee, Manager, HR)
    const employees = await Employee.insertMany([
      {
        name: 'John Doe',
        email: 'john@techsolutions.com',
        password: hashedPassword,
        department: 'Information Technology',
        designation: 'Senior Software Engineer',
        role: 'employee',
        leaveBalance: 20,
      },
      {
        name: 'Alice Williams',
        email: 'hr@techsolutions.com',
        password: hashedPassword,
        department: 'Human Resources',
        designation: 'HR Lead',
        role: 'hr',
        leaveBalance: 25,
      },
      {
        name: 'Sarah Connor',
        email: 'manager@techsolutions.com',
        password: hashedPassword,
        department: 'Engineering',
        designation: 'Engineering Manager',
        role: 'manager',
        leaveBalance: 22,
      },
      {
        name: 'Student Candidate (24AIML062)',
        email: '24aiml062@charusat.edu.in',
        password: hashedPassword,
        department: 'AI & Data Science',
        designation: 'Junior Developer',
        role: 'employee',
        leaveBalance: 18,
      },
    ]);
    console.log(`[Seed] Seeded ${employees.length} employees.`);

    const emp1 = employees[0];
    const casualType = leaveTypes.find((lt) => lt.name === 'Casual');
    const sickType = leaveTypes.find((lt) => lt.name === 'Sick');
    const earnedType = leaveTypes.find((lt) => lt.name === 'Earned');

    // 4. Seed initial Leave Requests
    await LeaveRequest.insertMany([
      {
        employeeId: emp1._id,
        leaveTypeId: casualType._id,
        fromDate: new Date('2026-09-01'),
        toDate: new Date('2026-09-03'),
        days: 3,
        reason: 'Attending family wedding ceremony out of state',
        status: 'pending',
      },
      {
        employeeId: emp1._id,
        leaveTypeId: sickType._id,
        fromDate: new Date('2026-08-10'),
        toDate: new Date('2026-08-11'),
        days: 2,
        reason: 'Viral fever and doctor recommended bed rest',
        status: 'approved',
      },
      {
        employeeId: emp1._id,
        leaveTypeId: earnedType._id,
        fromDate: new Date('2026-07-15'),
        toDate: new Date('2026-07-20'),
        days: 6,
        reason: 'Annual vacation trip to the mountains',
        status: 'rejected',
      },
    ]);
    console.log('[Seed] Seeded initial leave requests.');

    console.log('[Seed] Database seeded successfully!');
    console.log('\n--- Test Credentials ---');
    console.log('1. Employee:  john@techsolutions.com     / password123 (Role: employee)');
    console.log('2. HR Lead:   hr@techsolutions.com       / password123 (Role: hr)');
    console.log('3. Manager:   manager@techsolutions.com  / password123 (Role: manager)');
    console.log('4. Candidate: 24aiml062@charusat.edu.in  / password123 (Role: employee)');
    console.log('------------------------\n');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
};

seedData();
