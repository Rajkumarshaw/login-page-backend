import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SERVER_URL = 'http://localhost:5000';

const runTests = async () => {
  console.log('==================================================');
  console.log('    AgeFlow Security & Privacy Verification       ');
  console.log('==================================================');
  
  // Start the server in the background
  console.log('Spawning backend server...');
  const serverProcess = spawn('node', [path.join(__dirname, '../server.js')], {
    env: { ...process.env, PORT: '5000', NODE_ENV: 'test' },
    stdio: 'pipe'
  });

  // Wait for the server to spin up
  await new Promise((resolve) => {
    serverProcess.stdout.on('data', (data) => {
      const output = data.toString();
      console.log(`[Server Output]: ${output.trim()}`);
      if (output.includes('Server running')) {
        resolve();
      }
    });
  });

  console.log('\nStarting security tests...');

  let testsPassed = 0;
  let totalTests = 0;

  const assert = (condition, message) => {
    totalTests++;
    if (condition) {
      console.log(`  ✅ PASSED: ${message}`);
      testsPassed++;
    } else {
      console.error(`  ❌ FAILED: ${message}`);
    }
  };

  try {
    // ----------------------------------------------------
    // TEST 1: Submit public record
    // ----------------------------------------------------
    console.log('\nTEST 1: Public Submission & Privacy Isolation');
    const publicSubmitRes = await fetch(`${SERVER_URL}/api/records`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'John Doe',
        dateOfBirth: '1995-04-12'
      })
    });
    
    assert(
      publicSubmitRes.status === 201,
      'Public calculator accepts submissions (status 201)'
    );
    
    const publicData = await publicSubmitRes.json();
    assert(
      publicData.age && publicData.age.years !== undefined,
      'Public calculator returns calculated age details'
    );
    assert(
      publicData.records === undefined && publicData.admin === undefined,
      'Public response does not leak user list or admin credentials'
    );

    // ----------------------------------------------------
    // TEST 3: Call GET /api/admin/records without authentication
    // ----------------------------------------------------
    console.log('\nTEST 3: Admin Endpoint Protection (Unauthenticated GET)');
    const getRecordsUnauth = await fetch(`${SERVER_URL}/api/admin/records`);
    assert(
      getRecordsUnauth.status === 401,
      `Unauthenticated GET /api/admin/records is blocked with 401 (got ${getRecordsUnauth.status})`
    );

    // ----------------------------------------------------
    // TEST 6: Call DELETE without authentication
    // ----------------------------------------------------
    console.log('\nTEST 6: Admin Endpoint Protection (Unauthenticated DELETE)');
    const deleteRecordUnauth = await fetch(`${SERVER_URL}/api/admin/records/507f1f77bcf86cd799439011`, {
      method: 'DELETE'
    });
    assert(
      deleteRecordUnauth.status === 401,
      `Unauthenticated DELETE /api/admin/records/:id is blocked with 401 (got ${deleteRecordUnauth.status})`
    );

    // ----------------------------------------------------
    // TEST 7: Call PUT without authentication
    // ----------------------------------------------------
    console.log('\nTEST 7: Admin Endpoint Protection (Unauthenticated PUT)');
    const editRecordUnauth = await fetch(`${SERVER_URL}/api/admin/records/507f1f77bcf86cd799439011`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Malicious Update',
        dateOfBirth: '1995-04-12'
      })
    });
    assert(
      editRecordUnauth.status === 401,
      `Unauthenticated PUT /api/admin/records/:id is blocked with 401 (got ${editRecordUnauth.status})`
    );

    // ----------------------------------------------------
    // TEST 4: Login as admin & fetch records
    // ----------------------------------------------------
    console.log('\nTEST 4: Admin Authentication & Access Grant');
    const loginRes = await fetch(`${SERVER_URL}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@ageflow.com',
        password: 'AdminPassword123!'
      })
    });

    assert(
      loginRes.status === 200,
      'Admin login succeeds with 200'
    );

    // Capture the cookie header
    const setCookie = loginRes.headers.get('set-cookie');
    assert(
      setCookie !== null && setCookie.includes('token='),
      'Login response correctly sets JWT inside set-cookie header'
    );

    const authHeaders = {
      'Content-Type': 'application/json',
      'Cookie': setCookie || ''
    };

    // Access records with auth cookie
    const getRecordsAuth = await fetch(`${SERVER_URL}/api/admin/records`, {
      headers: authHeaders
    });
    assert(
      getRecordsAuth.status === 200,
      'Authenticated GET /api/admin/records returns 200'
    );
    
    const records = await getRecordsAuth.json();
    assert(
      Array.isArray(records) && records.length > 0,
      'Authenticated request returns a list of records'
    );
    assert(
      records[0].name === 'John Doe',
      'Retrieved records contain correct submitted data'
    );

    // Access stats
    const getStatsAuth = await fetch(`${SERVER_URL}/api/admin/stats`, {
      headers: authHeaders
    });
    assert(
      getStatsAuth.status === 200,
      'Authenticated GET /api/admin/stats returns 200'
    );
    
    const stats = await getStatsAuth.json();
    assert(
      stats.total === 1 && stats.averageAge !== undefined,
      'Admin stats returns correct totals and calculated indicators'
    );

    // Edit record
    console.log('\nTEST: Modify record as admin');
    const recordId = records[0]._id;
    const editRes = await fetch(`${SERVER_URL}/api/admin/records/${recordId}`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({
        name: 'John Edited',
        dateOfBirth: '1990-05-20'
      })
    });
    assert(
      editRes.status === 200,
      'Authenticated PUT /api/admin/records/:id returns 200'
    );
    
    const editData = await editRes.json();
    assert(
      editData.record.name === 'John Edited',
      'Record is updated with the new name'
    );

    // Delete record
    console.log('\nTEST: Delete record as admin');
    const deleteRes = await fetch(`${SERVER_URL}/api/admin/records/${recordId}`, {
      method: 'DELETE',
      headers: authHeaders
    });
    assert(
      deleteRes.status === 200,
      'Authenticated DELETE /api/admin/records/:id returns 200'
    );

    const checkDeleteRes = await fetch(`${SERVER_URL}/api/admin/records`, {
      headers: authHeaders
    });
    const checkDeleteData = await checkDeleteRes.json();
    assert(
      checkDeleteData.length === 0,
      'Record was successfully removed from the database'
    );

    // ----------------------------------------------------
    // TEST 5: Logout & verify unauth
    // ----------------------------------------------------
    console.log('\nTEST 5: Admin Logout Session Expiry');
    const logoutRes = await fetch(`${SERVER_URL}/api/admin/logout`, {
      method: 'POST',
      headers: authHeaders
    });
    assert(
      logoutRes.status === 200,
      'Logout request succeeds with 200'
    );

    const postLogoutCookie = logoutRes.headers.get('set-cookie');
    const getRecordsPostLogout = await fetch(`${SERVER_URL}/api/admin/records`, {
      headers: {
        'Cookie': postLogoutCookie || ''
      }
    });
    assert(
      getRecordsPostLogout.status === 401,
      'Accessing admin records after logging out is blocked with 401'
    );

    // ----------------------------------------------------
    // TEST 8: Check API responses do not leak secrets
    // ----------------------------------------------------
    console.log('\nTEST 8: Security Leaks Auditing');
    const loginData = await loginRes.json();
    assert(
      loginData.admin.password === undefined,
      'Admin password hash is not leaked in auth response'
    );
    assert(
      JSON.stringify(loginData).includes('JWT_SECRET') === false,
      'JWT Secret is not leaked in auth response'
    );

  } catch (error) {
    console.error('Test execution crashed with error:', error.message);
  } finally {
    console.log('\nShutting down backend server...');
    serverProcess.kill();
  }

  console.log(`\n==================================================`);
  console.log(`VERIFICATION RESULT: Passed ${testsPassed}/${totalTests} tests.`);
  console.log(`==================================================`);

  if (testsPassed === totalTests) {
    console.log('🎉 SUCCESS: All AgeFlow security gates verified!');
    process.exit(0);
  } else {
    console.error('❌ FAILURE: Security test mismatch.');
    process.exit(1);
  }
};

runTests();
