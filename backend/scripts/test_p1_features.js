import dns from 'dns';
import { verifyRetrievalPipeline } from './test_retrieval_verification.js';

try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

const PORT = process.env.PORT || 5001;
const BASE_URL = `http://127.0.0.1:${PORT}/api`;

async function runP1TestSuite() {
    console.log("==================================================");
    console.log("  Niti-Setu P1 Feature, Guidance & Security Test Suite ");
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

    // 1. Scheme Catalog API Test
    try {
        const startTime = Date.now();
        const res = await fetch(`${BASE_URL}/schemes`);
        const latency = Date.now() - startTime;
        const data = await res.json();

        assert(res.status === 200 && data.success === true, "GET /api/schemes returns HTTP 200 OK");
        assert(Array.isArray(data.data) && data.data.length === 3, "GET /api/schemes returns all 3 supported schemes (PM-KISAN, PM-KMY, PM-KUSUM)");
        assert(data.data.every(s => s.purpose && s.target_users && s.source_document), "Scheme catalog entries contain purpose, target_users, and source_document");
        console.log(`   ℹ️ GET /api/schemes Latency: ${latency}ms`);
    } catch (e) {
        assert(false, "GET /api/schemes test failed: " + e.message);
    }

    // 2. Scheme Auto-Discovery Test
    try {
        const startTime = Date.now();
        const res = await fetch(`${BASE_URL}/discover`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ state: 'Bihar', land_acres: 2, age: 30, crop: 'Wheat' })
        });
        const latency = Date.now() - startTime;
        const data = await res.json();

        assert(res.status === 200 && data.success === true, "POST /api/discover returns HTTP 200 OK");
        assert(Array.isArray(data.data), "POST /api/discover returns array of recommendations");
        assert(data.data.some(s => s.id === 'PM-KMY' && s.recommended === true), "PM-KMY is recommended for 2-acre farmer aged 30");
        console.log(`   ℹ️ POST /api/discover Latency: ${latency}ms`);
    } catch (e) {
        assert(false, "POST /api/discover test failed: " + e.message);
    }

    // 3. Eligibility Check with Application Guidance & Cross-Scheme Metadata Filtering
    try {
        const startTime = Date.now();
        const res = await fetch(`${BASE_URL}/check`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ state: 'Uttar Pradesh', land_acres: 3, scheme: 'PM-KISAN', preferred_language: 'hi' })
        });
        const latency = Date.now() - startTime;
        const data = await res.json();

        assert(res.status === 200 && data.success === true, "POST /api/check returns HTTP 200 OK");
        assert(data.data?.status && data.data?.document_proof, "Verdict payload contains status and verbatim document_proof");
        assert(data.data?.application_guidance?.application_pathway, "Verdict payload includes step-by-step Application Guidance pathway");
        assert(data.data?.application_guidance?.document_acquisition_guide, "Verdict payload includes Document Acquisition Guide with why & where");
        assert(Array.isArray(data.data?.discovered_schemes), "Verdict payload includes discovered schemes matrix");
        console.log(`   ℹ️ POST /api/check Latency: ${latency}ms`);
    } catch (e) {
        assert(false, "Eligibility & Guidance test failed: " + e.message);
    }

    // 4. Security & Authorization Check
    try {
        const resUnauth = await fetch(`${BASE_URL}/profile/507f1f77bcf86cd799439011`, {
            method: 'DELETE'
        });
        assert(resUnauth.status === 401 || resUnauth.status === 404, `DELETE /api/profile/:id enforcement verified (HTTP ${resUnauth.status})`);
    } catch (e) {
        assert(false, "Authorization security test failed: " + e.message);
    }

    // 5. Independent RAG Retrieval Pipeline Test
    try {
        console.log("\nPhase 5: Verifying RAG Policy Retrieval & Hallucination Resistance...");
        const ragOk = await verifyRetrievalPipeline();
        assert(ragOk === true, "Independent RAG retrieval test passed (3/3 query matches)");
    } catch (e) {
        assert(false, "RAG Retrieval Test failed: " + e.message);
    }

    console.log(`\n==================================================`);
    console.log(`P1 Test Execution Summary: ${passed} passed, ${failed} failed.`);
    if (failed > 0) process.exit(1);
}

runP1TestSuite();
