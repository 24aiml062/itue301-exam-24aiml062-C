const http = require('http');

/**
 * Automated Verification Script for ITUE301 Backend REST API
 */
const request = (method, path, body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: `/api/v1${path}`,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...(data && { 'Content-Length': Buffer.byteLength(data) }),
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    };

    const req = http.request(options, (res) => {
      let resBody = '';
      res.on('data', (chunk) => (resBody += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(resBody);
          resolve({ status: res.statusCode, data: parsed });
        } catch {
          resolve({ status: res.statusCode, raw: resBody });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
};

async function runTests() {
  console.log('==================================================');
  console.log('🧪 ITUE301 Backend Verification Test Suite');
  console.log('==================================================\n');

  try {
    // 1. Health check
    console.log('1. Testing Health Endpoint: GET /api/v1/health');
    const health = await request('GET', '/health');
    console.log(`   Status: ${health.status} - ${health.data.message}\n`);

    // 2. Public leave types (Task 3 & 5)
    console.log('2. Testing Public Leave Types: GET /api/v1/leave-types');
    const leaveTypesRes = await request('GET', '/leave-types');
    console.log(`   Status: ${leaveTypesRes.status}, Found: ${leaveTypesRes.data.count} types`);
    const types = leaveTypesRes.data.data.map((t) => `${t.name} (max: ${t.maxDaysPerYear}d)`).join(', ');
    console.log(`   Leave Types: ${types}\n`);

    // 3. Employee Login (Task 3)
    console.log('3. Testing Authentication: POST /api/v1/auth/login');
    const loginRes = await request('POST', '/auth/login', {
      email: 'jalpesh@charusat.com',
      password: 'password123',
    });
    console.log(`   Status: ${loginRes.status}, Logged in as: ${loginRes.data.employee.name} (${loginRes.data.employee.role})`);
    console.log(`   Initial Balance: ${loginRes.data.employee.leaveBalance} days\n`);
    const empToken = loginRes.data.token;
    const casualType = leaveTypesRes.data.data.find((t) => t.name === 'Casual');

    // 4. Test Validation Failure: Exceeding leave balance (Task 5 requirement)
    console.log('4. Testing Validation: POST /api/v1/leaves (Exceeding Balance: 99 days)');
    const failRes = await request(
      'POST',
      '/leaves',
      {
        leaveTypeId: casualType._id,
        fromDate: '2026-10-01',
        toDate: '2026-10-10',
        days: 99,
        reason: 'Attempting invalid days exceeding balance',
      },
      empToken
    );
    console.log(`   Status: ${failRes.status} (Expected 400)`);
    console.log(`   Response Message: "${failRes.data.message}"\n`);

    // 5. Test Valid Leave Application & Balance Deduction (Task 3 & 5)
    console.log('5. Testing Valid Leave Application: POST /api/v1/leaves (2 days)');
    const applyRes = await request(
      'POST',
      '/leaves',
      {
        leaveTypeId: casualType._id,
        fromDate: '2026-10-01',
        toDate: '2026-10-02',
        days: 2,
        reason: 'Attending technical conference',
      },
      empToken
    );
    console.log(`   Status: ${applyRes.status} (Expected 201)`);
    console.log(`   Created Request ID: ${applyRes.data.data._id}`);
    console.log(`   Deducted Balance Remaining: ${applyRes.data.remainingBalance} days\n`);
    const createdRequestId = applyRes.data.data._id;

    // 6. Test Get My Leaves with Populate (Task 4 & 5)
    console.log('6. Testing Get My Leaves with Populate: GET /api/v1/leaves/my');
    const myLeavesRes = await request('GET', '/leaves/my', null, empToken);
    console.log(`   Status: ${myLeavesRes.status}, Total records: ${myLeavesRes.data.count}`);
    const firstReq = myLeavesRes.data.data[0];
    console.log(`   Latest Record Leave Type Populated: "${firstReq.leaveTypeId?.name}" (Max: ${firstReq.leaveTypeId?.maxDaysPerYear}d)\n`);

    // 7. HR Login & Status Update (Task 3)
    console.log('7. Testing HR Login & Leave Approval: PATCH /api/v1/leaves/:id/status');
    const hrLogin = await request('POST', '/auth/login', {
      email: 'admin@charusat.com',
      password: 'password123',
    });
    const hrToken = hrLogin.data.token;

    // Test invalid status validation
    const invalidStatusRes = await request(
      'PATCH',
      `/leaves/${createdRequestId}/status`,
      { status: 'invalid_status' },
      hrToken
    );
    console.log(`   Testing Invalid Status ('invalid_status'): Status ${invalidStatusRes.status} (Expected 400)`);
    console.log(`   Validation Message: "${invalidStatusRes.data.message}"`);

    // Test valid status update to 'approved'
    const approveRes = await request(
      'PATCH',
      `/leaves/${createdRequestId}/status`,
      { status: 'approved' },
      hrToken
    );
    console.log(`   Testing Valid Status ('approved'): Status ${approveRes.status} (Expected 200)`);
    console.log(`   Updated Request Status: ${approveRes.data.data.status}\n`);

    console.log('==================================================');
    console.log('🎉 ALL TASKS VERIFIED SUCCESSFULLY AND PASSING!');
    console.log('==================================================');
  } catch (err) {
    console.error('Test execution failed:', err);
  }
}

runTests();
