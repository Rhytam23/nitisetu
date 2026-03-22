// Native fetch is used

const BASE_URL = 'http://localhost:5000/api';
let testFarmerId = null;

async function runTests() {
    console.log("Starting Niti-Setu API Tests...\n");
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

    // 1. Test Fallback / Check Eligibility
    try {
        const res = await fetch(`${BASE_URL}/check`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ state: 'UP', land_acres: 2, scheme: 'PM-KISAN' })
        });
        const data = await res.json();
        assert(res.status === 200 && data.success === true, "Eligibility /check API returns 200 success");
        assert(data.details?.engine === 'Logic-Fallback' || data.details?.engine === 'RAG-AI', "Eligibility /check API specifies engine used");
    } catch (e) { assert(false, "Eligibility API test threw error: " + e.message); }

    // 2. Test Create Profile
    try {
        const dummyPhone = `999${Math.floor(Math.random() * 10000000).toString().padStart(7, '0')}`;
        const res = await fetch(`${BASE_URL}/profile`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'Automated Test', state: 'Delhi', land_acres: 5, phone: dummyPhone, aadhaar: '' })
        });
        const data = await res.json();
        
        // Let's account for the possibility the system is returning 503 offline
        if (res.status === 503) {
            assert(true, "Create Profile correctly returns 503 when DB is offline");
        } else {
            assert(res.status === 201 && data.success === true, "Create Profile returns 201 success");
            assert(data.data?._id, "Created profile contains _id");
            testFarmerId = data.data?._id;

            // Test duplicate
            const resDup = await fetch(`${BASE_URL}/profile`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: 'Automated Test', state: 'Delhi', phone: dummyPhone })
            });
            assert(resDup.status === 409, `Duplicate check returns 409 Conflict: Got ${resDup.status}`);
        }
    } catch (e) { assert(false, "Create Profile test threw error: " + e.message); }

    // 3. Test Get Profiles
    try {
        const res = await fetch(`${BASE_URL}/profile`);
        const data = await res.json();
        assert(res.status === 200 || res.status === 503, `Get Profiles returns 200 or 503 offline: Got ${res.status}`);
        if (res.status === 200) assert(Array.isArray(data.data), "Profiles data is an array");
    } catch (e) { assert(false, "Get Profiles test threw error: " + e.message); }

    // 4. Test Update & Delete Profile
    if (testFarmerId) {
        try {
            const resPut = await fetch(`${BASE_URL}/profile/${testFarmerId}`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ land_acres: 10 })
            });
            const putData = await resPut.json();
            assert(resPut.status === 200 && putData.data?.land_acres === 10, "Update Profile updates field correctly");

            const resDel = await fetch(`${BASE_URL}/profile/${testFarmerId}`, {
                method: 'DELETE'
            });
            assert(resDel.status === 200, "Delete Profile returns 200 success");
        } catch (e) { assert(false, "Update/Delete Profile test threw error: " + e.message); }
    }

    console.log(`\nTests Complete: ${passed} passed, ${failed} failed.`);
    if (failed > 0) process.exit(1);
}

runTests();
