import dns from 'dns';

try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

const PORT = process.env.PORT || 5001;
const BASE_URL = `http://127.0.0.1:${PORT}/api`;

async function runVaultAndNotificationTestSuite() {
    console.log("==================================================");
    console.log("  Niti-Setu Document Vault & Notification Test Suite ");
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

    const testFarmerId = 'test_farmer_99';

    // 1. Upload Document to Vault API Test
    let uploadedDocId = null;
    try {
        const formData = new FormData();
        formData.append('farmerId', testFarmerId);
        formData.append('documentType', 'Land Ownership Record (Jamabandi)');
        
        const blob = new Blob(['Sample Jamabandi Land Record Content'], { type: 'application/pdf' });
        formData.append('file', blob, 'jamabandi_record.pdf');

        const res = await fetch(`${BASE_URL}/documents/upload`, {
            method: 'POST',
            body: formData
        });
        const data = await res.json();

        assert(res.status === 201 && data.success === true, "POST /api/documents/upload returns HTTP 201 Created");
        assert(data.data?.documentType === 'Land Ownership Record (Jamabandi)', "Uploaded document has correct documentType");
        assert(data.data?.storageReference, "Uploaded document metadata contains storageReference");
        uploadedDocId = data.data?._id;
    } catch (e) {
        assert(false, "POST /api/documents/upload test failed: " + e.message);
    }

    // 2. Fetch Vault Documents API Test
    try {
        const res = await fetch(`${BASE_URL}/documents/${testFarmerId}`);
        const data = await res.json();

        assert(res.status === 200 && data.success === true, "GET /api/documents/:farmerId returns HTTP 200 OK");
        assert(Array.isArray(data.data) && data.data.length > 0, "Document vault returns document list for farmer");
        assert(data.data.some(d => d.documentType === 'Land Ownership Record (Jamabandi)'), "Vault contains uploaded Jamabandi document");
    } catch (e) {
        assert(false, "GET /api/documents/:farmerId test failed: " + e.message);
    }

    // 3. Document Private Download Stream API Test
    if (uploadedDocId) {
        try {
            const res = await fetch(`${BASE_URL}/documents/file/${uploadedDocId}/download`);
            assert(res.status === 200, "GET /api/documents/file/:id/download returns HTTP 200 OK with private file payload");
        } catch (e) {
            assert(false, "Document download test failed: " + e.message);
        }
    }

    // 4. Generate Personalized Notifications API Test
    try {
        const profilePayload = {
            _id: testFarmerId,
            state: 'Uttar Pradesh',
            land_acres: 2.5,
            crop: 'Wheat',
            age: 30
        };

        const res = await fetch(`${BASE_URL}/notifications/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(profilePayload)
        });
        const data = await res.json();

        assert(res.status === 200 && data.success === true, "POST /api/notifications/generate returns HTTP 200 OK");
        assert(Array.isArray(data.data) && data.data.length > 0, "Notification engine returns personalized notifications");
        assert(data.data.some(n => n.type === 'SCHEME_AVAILABLE'), "Notification list includes SCHEME_AVAILABLE alert");
        assert(data.data.some(n => n.type === 'DOCUMENT_REQUIRED'), "Notification list includes DOCUMENT_REQUIRED alert");
    } catch (e) {
        assert(false, "POST /api/notifications/generate test failed: " + e.message);
    }

    // 5. Fetch Notifications & Unread Count API Test
    let targetNotifId = null;
    try {
        const res = await fetch(`${BASE_URL}/notifications/${testFarmerId}`);
        const data = await res.json();

        assert(res.status === 200 && data.success === true, "GET /api/notifications/:farmerId returns HTTP 200 OK");
        assert(data.data?.notifications?.length > 0, "Notification response contains notifications array");
        assert(typeof data.data?.unreadCount === 'number', "Notification response contains unreadCount integer");
        targetNotifId = data.data?.notifications?.[0]?._id;
    } catch (e) {
        assert(false, "GET /api/notifications/:farmerId test failed: " + e.message);
    }

    // 6. Mark Notification as Read API Test
    if (targetNotifId) {
        try {
            const res = await fetch(`${BASE_URL}/notifications/${targetNotifId}/read`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ farmerId: testFarmerId })
            });
            const data = await res.json();

            assert(res.status === 200 && data.success === true, "PUT /api/notifications/:id/read returns HTTP 200 OK");
        } catch (e) {
            assert(false, "Mark notification read test failed: " + e.message);
        }
    }

    // 7. Delete Document API Test
    if (uploadedDocId) {
        try {
            const res = await fetch(`${BASE_URL}/documents/${uploadedDocId}?farmerId=${testFarmerId}`, {
                method: 'DELETE',
                headers: { 'x-admin-key': 'dev_admin_key' }
            });
            const data = await res.json();

            assert(res.status === 200 && data.success === true, "DELETE /api/documents/:id returns HTTP 200 OK");
        } catch (e) {
            assert(false, "Delete document test failed: " + e.message);
        }
    }

    console.log(`\n==================================================`);
    console.log(`Vault & Notification Test Summary: ${passed} passed, ${failed} failed.`);
    if (failed > 0) process.exit(1);
}

runVaultAndNotificationTestSuite();
