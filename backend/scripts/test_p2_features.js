import dns from 'dns';

try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

const PORT = process.env.PORT || 5001;
const BASE_URL = `http://127.0.0.1:${PORT}/api`;

async function runP2FeatureTestSuite() {
    console.log("==================================================");
    console.log("  Niti-Setu P2 Advanced Features Test Suite      ");
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

    const testFarmerId = 'p2_test_farmer_88';

    // 1. OCR Document Upload & Field Extraction Test
    let uploadedDocId = null;
    try {
        const formData = new FormData();
        formData.append('farmerId', testFarmerId);
        formData.append('documentType', 'Land Ownership Record (Jamabandi)');

        const sampleText = `BHULEKH REVENUE RECORD JAMABANDI KHASRA NO 452 OWNER NAME: RAMESH KUMAR CULTIVABLE LAND: 3.2 ACRES AADHAAR: 1234 5678 9012`;
        const blob = new Blob([sampleText], { type: 'text/plain' });
        formData.append('file', blob, 'jamabandi_record_452.txt');

        const res = await fetch(`${BASE_URL}/documents/upload`, {
            method: 'POST',
            body: formData
        });
        const data = await res.json();

        assert(res.status === 201 && data.success === true, "POST /api/documents/upload returns HTTP 201 Created");
        assert(data.data?.documentType === 'Land Ownership Record (Jamabandi)', `OCR classifies document type as Jamabandi (Got: ${data.data?.documentType})`);
        assert(data.data?.classificationConfidence >= 0.80, "Classification confidence score is >= 0.80");
        assert(data.data?.status === 'Processed' || data.data?.status === 'Needs Review', "Document status is Processed/Needs Review (Never fake Verified)");
        assert(data.data?.extractedFields?.landAcres === 3.2, `OCR extracts exact land acres (3.2 Acres, Got: ${data.data?.extractedFields?.landAcres})`);
        assert(data.data?.extractedFields?.aadhaarMasked === 'XXXX-XXXX-9012', `OCR masks Aadhaar number (XXXX-XXXX-9012, Got: ${data.data?.extractedFields?.aadhaarMasked})`);
        uploadedDocId = data.data?._id;
    } catch (e) {
        assert(false, "OCR upload test failed: " + e.message);
    }

    // 2. Profile Mismatch Notification Trigger Test
    try {
        const mismatchProfile = {
            _id: testFarmerId,
            state: 'Uttar Pradesh',
            land_acres: 2.0, // Profile states 2.0, document shows 3.2
            crop: 'Wheat',
            age: 30
        };

        const res = await fetch(`${BASE_URL}/notifications/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(mismatchProfile)
        });
        const data = await res.json();

        if (!data.data?.some(n => n.type === 'PROFILE_MISMATCH')) {
            console.log("Notification Debug Payload:", data.data);
        }

        assert(res.status === 200 && data.success === true, "POST /api/notifications/generate returns HTTP 200 OK");
        assert(Array.isArray(data.data) && data.data.some(n => n.type === 'PROFILE_MISMATCH'), "Notification engine generates PROFILE_MISMATCH alert for land difference");
    } catch (e) {
        assert(false, "Profile mismatch notification test failed: " + e.message);
    }

    // 3. Document Expiry Alert Test
    try {
        const formDataExp = new FormData();
        formDataExp.append('farmerId', testFarmerId);
        formDataExp.append('documentType', 'Income Certificate');
        const expiryDate = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // Expiration in 10 days
        formDataExp.append('expiryDate', expiryDate);
        
        const blobExp = new Blob(['INCOME CERTIFICATE TAHSILDAR ANNUAL INCOME 45000'], { type: 'text/plain' });
        formDataExp.append('file', blobExp, 'income_certificate.txt');

        const resExp = await fetch(`${BASE_URL}/documents/upload`, {
            method: 'POST',
            body: formDataExp
        });
        const dataExp = await resExp.json();
        assert(resExp.status === 201, "Income certificate with expiry uploaded");

        // Trigger notifications
        const resNotif = await fetch(`${BASE_URL}/notifications/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ _id: testFarmerId, state: 'UP', land_acres: 3.2 })
        });
        const dataNotif = await resNotif.json();

        assert(Array.isArray(dataNotif.data) && dataNotif.data.some(n => n.type === 'DOCUMENT_EXPIRING'), "Notification engine generates DOCUMENT_EXPIRING alert for verified expiry date");
    } catch (e) {
        assert(false, "Document expiry notification test failed: " + e.message);
    }

    // 4. Cleanup test documents
    if (uploadedDocId) {
        try {
            await fetch(`${BASE_URL}/documents/${uploadedDocId}?farmerId=${testFarmerId}`, {
                method: 'DELETE',
                headers: { 'x-admin-key': 'dev_admin_key' }
            });
        } catch (e) {}
    }

    console.log(`\n==================================================`);
    console.log(`P2 Test Execution Summary: ${passed} passed, ${failed} failed.`);
    if (failed > 0) process.exit(1);
}

runP2FeatureTestSuite();
