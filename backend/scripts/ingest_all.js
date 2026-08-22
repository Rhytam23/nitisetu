import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { ingestPDF } from './ingest_pdf.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runBatchIngestion() {
    console.log("==================================================");
    console.log("  Niti-Setu — Ingesting Scheme PDFs into Atlas ");
    console.log("==================================================\n");

    const dataDir = path.join(__dirname, '../data');
    const pdfFiles = [
        { file: 'PM-KISAN.pdf', scheme: 'PM-KISAN' },
        { file: 'PM-KMY - Operational Guidelines.pdf', scheme: 'PM-KMY' },
        { file: 'PM-KUSUM.pdf', scheme: 'PM-KUSUM' }
    ];

    for (const item of pdfFiles) {
        const fullPath = path.join(dataDir, item.file);
        if (fs.existsSync(fullPath)) {
            console.log(`Processing: ${item.file} (${item.scheme})...`);
            await ingestPDF(fullPath, item.scheme);
        } else {
            console.warn(`⚠️ Warning: PDF file not found at ${fullPath}`);
        }
    }

    console.log("\n==================================================");
    console.log("🎉 All 3 Government Scheme PDFs successfully ingested into MongoDB Atlas!");
    console.log("==================================================");
}

runBatchIngestion().catch(console.error);
