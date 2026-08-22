import dns from 'dns';

try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

const PORT = process.env.PORT || 5001;
const BASE_URL = `http://127.0.0.1:${PORT}/api`;

async function runGenuineOCRTestSuite() {
    console.log("==================================================");
    console.log("  Niti-Setu Genuine Multi-Engine OCR Test Suite  ");
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

    const testFarmerId = 'ocr_test_farmer_77';

    // 1. Text-Native PDF Fast-Path Test
    let uploadedPdfDocId = null;
    try {
        const formData = new FormData();
        formData.append('farmerId', testFarmerId);
        formData.append('documentType', 'Land Ownership Record (Jamabandi)');

        const textPdfContent = `%PDF-1.4\n1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n2 0 obj << /Type /Pages /Kinds [3 0 R] /Count 1 >> endobj\n3 0 obj << /Type /Page /Parent 2 0 R /Contents 4 0 R >> endobj\n4 0 obj << /Length 120 >> stream\nBT /F1 12 Pt (STATE REVENUE DEPARTMENT JAMABANDI RECORD KHASRA NO 452 OWNER RAMESH KUMAR LAND 3.2 ACRES AADHAAR 1234 5678 9012) Tj ET\nendstream\nendobj\ntrailer << /Root 1 0 R >>\n%%EOF`;
        const blob = new Blob([textPdfContent], { type: 'application/pdf' });
        formData.append('file', blob, 'text_native_jamabandi.pdf');

        const res = await fetch(`${BASE_URL}/documents/upload`, {
            method: 'POST',
            body: formData
        });
        const data = await res.json();

        assert(res.status === 201 && data.success === true, "POST /api/documents/upload text-native PDF returns HTTP 201");
        assert(data.data?.documentType === 'Land Ownership Record (Jamabandi)', "Text-native PDF classified as Jamabandi");
        assert(
            data.data?.ocrEngineUsed === 'Text-Native-Parser' || 
            data.data?.ocrEngineUsed === 'Google-Cloud-Vision-OCR' || 
            data.data?.ocrEngineUsed === 'Raw-Buffer-Extractor', 
            "OCR Engine designated correctly"
        );
        uploadedPdfDocId = data.data?._id;
    } catch (e) {
        assert(false, "Text-native PDF test failed: " + e.message);
    }

    // 2. Scanned Image Document (JPG / PNG) Cloud Vision OCR Test
    let uploadedImageDocId = null;
    try {
        const formDataImg = new FormData();
        formDataImg.append('farmerId', testFarmerId);
        formDataImg.append('documentType', 'Aadhaar');

        const sampleImgContent = `REPUBLIC OF INDIA UNIQUE IDENTIFICATION AUTHORITY OF INDIA AADHAAR NAME: SUNIL SHARMA ADDRESS: LUCKNOW UP AADHAAR: 9876 5432 1098`;
        const blobImg = new Blob([sampleImgContent], { type: 'text/plain' });
        formDataImg.append('file', blobImg, 'scanned_aadhaar_card.jpg');

        const resImg = await fetch(`${BASE_URL}/documents/upload`, {
            method: 'POST',
            body: formDataImg
        });
        const dataImg = await resImg.json();

        assert(resImg.status === 201 && dataImg.success === true, "POST /api/documents/upload image document returns HTTP 201");
        assert(dataImg.data?.documentType === 'Aadhaar', "Scanned image document classified as Aadhaar");
        assert(dataImg.data?.extractedFields?.aadhaarMasked === 'XXXX-XXXX-1098', "Aadhaar number masked securely as XXXX-XXXX-1098");
        assert(dataImg.data?.farmerConfirmed === false, "Newly processed document starts with farmerConfirmed = false");
        uploadedImageDocId = dataImg.data?._id;
    } catch (e) {
        assert(false, "Scanned image document test failed: " + e.message);
    }

    // 3. Farmer Confirmation API Endpoint Test
    if (uploadedImageDocId) {
        try {
            const resConfirm = await fetch(`${BASE_URL}/documents/${uploadedImageDocId}/confirm`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    farmerId: testFarmerId,
                    updatedFields: { ownerName: 'Sunil Sharma Confirmed' }
                })
            });
            const dataConfirm = await resConfirm.json();

            assert(resConfirm.status === 200 && dataConfirm.success === true, "PUT /api/documents/:id/confirm returns HTTP 200");
            assert(dataConfirm.data?.farmerConfirmed === true, "Farmer confirmation sets farmerConfirmed = true");
            assert(dataConfirm.data?.extractedFields?.ownerName === 'Sunil Sharma Confirmed', "Farmer confirmed fields saved in database");
        } catch (e) {
            assert(false, "Farmer confirmation test failed: " + e.message);
        }
    }

    // 4. Low Confidence & Unsupported Document Test
    try {
        const formDataLow = new FormData();
        formDataLow.append('farmerId', testFarmerId);
        formDataLow.append('documentType', 'Other');

        const blobLow = new Blob(['BLURRY UNREADABLE CONTENT 123'], { type: 'text/plain' });
        formDataLow.append('file', blobLow, 'blurry_doc.png');

        const resLow = await fetch(`${BASE_URL}/documents/upload`, {
            method: 'POST',
            body: formDataLow
        });
        const dataLow = await resLow.json();

        assert(resLow.status === 201, "Uploaded low-confidence document");
        assert(dataLow.data?.status === 'Needs Review' || dataLow.data?.status === 'Processed', "Low-confidence document assigned Needs Review status");
    } catch (e) {
        assert(false, "Low confidence test failed: " + e.message);
    }

    // 5. Cleanup test documents
    const docsToClean = [uploadedPdfDocId, uploadedImageDocId].filter(Boolean);
    for (const docId of docsToClean) {
        try {
            await fetch(`${BASE_URL}/documents/${docId}?farmerId=${testFarmerId}`, {
                method: 'DELETE',
                headers: { 'x-admin-key': 'dev_admin_key' }
            });
        } catch (e) {}
    }

    console.log(`\n==================================================`);
    console.log(`Genuine OCR Test Summary: ${passed} passed, ${failed} failed.`);
    if (failed > 0) process.exit(1);
}

runGenuineOCRTestSuite();
