import dns from 'dns';

try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

const PORT = process.env.PORT || 5001;
const BASE_URL = `http://127.0.0.1:${PORT}/api`;

async function runAuthAndDashboardTestSuite() {
    console.log("==================================================");
    console.log("  Niti-Setu Auth, RBAC & Dashboard Test Suite    ");
    console.log("==================================================\n");

    let passed = 0, failed = 0;

    const assert = (condition, msg) => {
        if (condition) {
            console.log(`✅ PASSED: ${msg}`);
            passed++;
        } else {
            console.error(`❌ FAILED: ${msg}`);
            failed++;
        }
    };

    const testPhone = `99${Math.floor(10000000 + Math.random() * 90000000)}`;
    let farmerToken = null;
    let farmerId = null;
    let adminToken = null;

    // 1. Farmer Registration API Test
    try {
        const res = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Ramesh Kumar Test',
                phone: testPhone,
                password: 'FarmerPassword2026!',
                state: 'Uttar Pradesh',
                district: 'Lucknow'
            })
        });
        const data = await res.json();

        assert(res.status === 201 && data.success === true, "POST /api/auth/register returns HTTP 201 Created");
        assert(data.data?.user?.role === 'FARMER', "Registered user role is FARMER");
        assert(typeof data.data?.token === 'string', "Response contains valid JWT token");
        farmerToken = data.data?.token;
        farmerId = data.data?.user?.userId;
    } catch (e) {
        assert(false, "Farmer registration test failed: " + e.message);
    }

    // 2. Farmer Login API Test
    try {
        const res = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                phone: testPhone,
                password: 'FarmerPassword2026!'
            })
        });
        const data = await res.json();

        assert(res.status === 200 && data.success === true, "POST /api/auth/login returns HTTP 200 OK");
        assert(data.data?.user?.phone === testPhone, "Login user phone matches registered phone");
    } catch (e) {
        assert(false, "Farmer login test failed: " + e.message);
    }

    // 3. Incorrect Password Rejection Test
    try {
        const res = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                phone: testPhone,
                password: 'WrongPassword!'
            })
        });
        assert(res.status === 401, "Invalid password returns HTTP 401 Unauthorized");
    } catch (e) {
        assert(false, "Invalid password test failed: " + e.message);
    }

    // 4. Admin Login API Test
    try {
        const res = await fetch(`${BASE_URL}/auth/admin-login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: process.env.ADMIN_EMAIL || 'admin@nitisetu.gov.in',
                password: process.env.ADMIN_PASSWORD || 'NitiSetuAdmin2026!'
            })
        });
        const data = await res.json();

        assert(res.status === 200 && data.success === true, "POST /api/auth/admin-login returns HTTP 200 OK");
        assert(data.data?.user?.role === 'ADMIN', "Admin user role is ADMIN");
        adminToken = data.data?.token;
    } catch (e) {
        assert(false, "Admin login test failed: " + e.message);
    }

    // 5. Role-Based Access Control Test (Farmer accessing Admin API)
    if (farmerToken) {
        try {
            const res = await fetch(`${BASE_URL}/admin/analytics`, {
                headers: { 'Authorization': `Bearer ${farmerToken}` }
            });
            assert(res.status === 403, "Farmer token accessing /api/admin/analytics returns HTTP 403 Forbidden");
        } catch (e) {
            assert(false, "Role enforcement test failed: " + e.message);
        }
    }

    // 6. Admin Token Accessing Admin API Test
    if (adminToken) {
        try {
            const res = await fetch(`${BASE_URL}/admin/analytics`, {
                headers: { 'Authorization': `Bearer ${adminToken}` }
            });
            const data = await res.json();

            assert(res.status === 200 && data.success === true, "Admin token accessing /api/admin/analytics returns HTTP 200 OK");
            assert(typeof data.data?.totalFarmers === 'number', "Analytics payload contains real totalFarmers count");
            assert(typeof data.data?.totalDocuments === 'number', "Analytics payload contains real totalDocuments count");
        } catch (e) {
            assert(false, "Admin analytics test failed: " + e.message);
        }
    }

    // 7. Ownership Security Test (Farmer A accessing Farmer B documents)
    if (farmerToken && farmerId) {
        try {
            const targetOtherFarmerId = 'other_farmer_999';
            const resForbidden = await fetch(`${BASE_URL}/documents/${targetOtherFarmerId}`, {
                headers: { 'Authorization': `Bearer ${farmerToken}` }
            });
            assert(resForbidden.status === 403, "Farmer A requesting Farmer B documents returns HTTP 403 Forbidden");

            const resAllowed = await fetch(`${BASE_URL}/documents/${farmerId}`, {
                headers: { 'Authorization': `Bearer ${farmerToken}` }
            });
            assert(resAllowed.status === 200, "Farmer A requesting own documents returns HTTP 200 OK");
        } catch (e) {
            assert(false, "Ownership security test failed: " + e.message);
        }
    }

    // 8. Admin Audit Logs Test
    if (adminToken) {
        try {
            const res = await fetch(`${BASE_URL}/admin/audit-logs`, {
                headers: { 'Authorization': `Bearer ${adminToken}` }
            });
            const data = await res.json();

            assert(res.status === 200 && data.success === true, "GET /api/admin/audit-logs returns HTTP 200 OK");
            assert(Array.isArray(data.data), "Audit logs response is an array");
        } catch (e) {
            assert(false, "Audit logs test failed: " + e.message);
        }
    }

    console.log(`\n==================================================`);
    console.log(`Auth & RBAC Test Execution Summary: ${passed} passed, ${failed} failed.`);
    if (failed > 0) process.exit(1);
}

runAuthAndDashboardTestSuite();
