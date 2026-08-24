const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const Employee = require('../models/Employee');
const LeaveType = require('../models/LeaveType');
const LeaveRequest = require('../models/LeaveRequest');

dotenv.config({ path: __dirname + '/../.env' });

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MONGO_URI is not defined in environment variables');
    }
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

    // 3. Seed Employees corresponding to the 3 Exam User Roles (Employee, Manager, HR)
    const employees = await Employee.insertMany([
      {
        name: 'Jalpesh',
        email: 'jalpesh@charusat.com',
        password: hashedPassword,
        department: 'Information Technology',
        designation: 'Software Engineer',
        role: 'employee',
        leaveBalance: 20,
      },
      {
        name: 'Rushabh',
        email: 'rushabh@charusat.com',
        password: hashedPassword,
        department: 'Engineering',
        designation: 'Team Manager',
        role: 'manager',
        leaveBalance: 22,
      },
      {
        name: 'Admin Office',
        email: 'admin@charusat.com',
        password: hashedPassword,
        department: 'Human Resources',
        designation: 'HR Specialist',
        role: 'hr',
        leaveBalance: 25,
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
    console.log('\n--- Test Credentials (The 3 Exam Roles: Employee, Manager, HR) ---');
    console.log('1. Employee: jalpesh@charusat.com  / password123 (Name: Jalpesh, Role: employee)');
    console.log('2. Manager:  rushabh@charusat.com  / password123 (Name: Rushabh, Role: manager)');
    console.log('3. HR:       admin@charusat.com    / password123 (Name: Admin Office, Role: hr)');
    console.log('-------------------------------------------------------------------\n');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
};

seedData();
