import { verifyRetrievalPipeline } from './test_retrieval_verification.js';

const PORT = process.env.PORT || 5001;
const BASE_URL = `http://127.0.0.1:${PORT}/api`;
let testFarmerId = null;

async function runTests() {
    console.log("==================================================");
    console.log("  Niti-Setu Automated Integration & RAG Test Suite");
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

    // 1. Run RAG Retrieval Pipeline Verification Test
    try {
        console.log("Phase 1: Testing RAG Policy Retrieval Pipeline...");
        const ragPassed = await verifyRetrievalPipeline();
        assert(ragPassed === true, "RAG Independent Retrieval Test passed (Query -> Relevant Chunk -> Source Document)");
    } catch (e) {
        assert(false, "RAG Retrieval Test failed: " + e.message);
    }

    console.log("\nPhase 2: Testing API Endpoints & Health Check...");
    
    // 2. Health Endpoint Test
    try {
        const res = await fetch(`${BASE_URL}/health`);
        const data = await res.json();
        assert(res.status === 200 && data.status === 'ok', "GET /api/health returns 200 status 'ok'");
        assert(data.database === 'connected' || data.database === 'offline', `Health endpoint specifies database state ('${data.database}')`);
    } catch (e) {
        assert(false, "Health API test failed (Ensure backend server is running on port 5001): " + e.message);
    }

    // 3. Check Eligibility API Test
    try {
        const res = await fetch(`${BASE_URL}/check`, {
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ state: 'Uttar Pradesh', land_acres: 2.5, scheme: 'PM-KISAN', preferred_language: 'en' })
        });
        const data = await res.json();
        assert(res.status === 200 && data.success === true, "POST /api/check returns 200 success");
        assert(data.data?.status && data.data?.document_proof && data.data?.citation, "Eligibility result contains status, document_proof, and citation");
        assert(data.details?.engine === 'Logic-Fallback' || data.details?.engine === 'RAG-AI', `Eligibility result specifies evaluation engine used ('${data.details?.engine}')`);
    } catch (e) { 
        assert(false, "Eligibility /check API test threw error: " + e.message); 
    }

    // 4. Farmer Profile CRUD Tests
    try {
        const dummyPhone = `999${Math.floor(Math.random() * 10000000).toString().padStart(7, '0')}`;
        const res = await fetch(`${BASE_URL}/profile`, {
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'Automated Test Farmer', state: 'Uttar Pradesh', land_acres: 3, phone: dummyPhone })
        });
        const data = await res.json();
        
        if (res.status === 503) {
            assert(true, "POST /api/profile returns HTTP 503 Service Unavailable when DB is offline (graceful handling)");
        } else {
            assert(res.status === 201 && data.success === true, "POST /api/profile returns 201 Created");
            assert(data.data?._id, "Created profile contains MongoDB ObjectId");
            testFarmerId = data.data?._id;

            // Test duplicate conflict
            const resDup = await fetch(`${BASE_URL}/profile`, {
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: 'Duplicate Test Farmer', state: 'Uttar Pradesh', phone: dummyPhone })
            });
            assert(resDup.status === 409, `Duplicate check returns HTTP 409 Conflict for existing phone number`);
        }
    } catch (e) { 
        assert(false, "Create Profile test threw error: " + e.message); 
    }

    // 5. Get Profiles Test
    try {
        const res = await fetch(`${BASE_URL}/profile`);
        const data = await res.json();
        assert(res.status === 200 || res.status === 503, `GET /api/profile returns 200 OK or 503 Offline (Got ${res.status})`);
        if (res.status === 200) assert(Array.isArray(data.data), "Profiles payload data is an array");
    } catch (e) { 
        assert(false, "Get Profiles test threw error: " + e.message); 
    }

    // 6. Update & Delete Profile Test
    if (testFarmerId) {
        try {
            const resPut = await fetch(`${BASE_URL}/profile/${testFarmerId}`, {
                method: 'PUT', 
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ land_acres: 10 })
            });
            const putData = await resPut.json();
            assert(resPut.status === 200 && putData.data?.land_acres === 10, "PUT /api/profile/:id updates field correctly");

            const resDel = await fetch(`${BASE_URL}/profile/${testFarmerId}`, {
                method: 'DELETE',
                headers: { 'Authorization': 'Bearer admin-test-token' }
            });
            assert(resDel.status === 200, "DELETE /api/profile/:id with Authorization header returns 200 success");
        } catch (e) { 
            assert(false, "Update/Delete Profile test threw error: " + e.message); 
        }
    }

    console.log(`\n==================================================`);
    console.log(`Test Execution Complete: ${passed} passed, ${failed} failed.`);
    if (failed > 0) process.exit(1);
}

runTests();
