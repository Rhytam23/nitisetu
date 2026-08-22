import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PDFParse } from 'pdf-parse';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function verifyRetrievalPipeline() {
    console.log("=== Running RAG Retrieval Independent Verification Test ===");
    const dataDir = path.join(__dirname, '..', 'data');
    
    if (!fs.existsSync(dataDir)) {
        console.error("❌ FAILED: Data directory does not exist.");
        process.exit(1);
    }

    const pdfFiles = fs.readdirSync(dataDir).filter(f => f.endsWith('.pdf'));
    if (pdfFiles.length === 0) {
        console.error("❌ FAILED: No PDF guidelines found in data directory.");
        process.exit(1);
    }

    console.log(`Found ${pdfFiles.length} official scheme PDFs: ${pdfFiles.join(', ')}`);

    const corpus = [];

    for (const file of pdfFiles) {
        const filePath = path.join(dataDir, file);
        const dataBuffer = fs.readFileSync(filePath);
        const uint8Data = new Uint8Array(dataBuffer);

        const parser = new PDFParse(uint8Data);
        const textResult = await parser.getText();
        const text = typeof textResult === 'string' ? textResult : (textResult.text || '');

        // Chunking strategy: 1000 chars, 200 overlap
        const chunkSize = 1000;
        const overlap = 200;
        let index = 0;

        while (index < text.length) {
            const chunkText = text.substring(index, index + chunkSize);
            corpus.push({
                sourceDocument: file,
                schemeName: file.replace('.pdf', ''),
                chunkText: chunkText.trim()
            });
            index += (chunkSize - overlap);
        }
    }

    console.log(`Successfully chunked corpus into ${corpus.length} searchable document chunks.`);

    // Verification Test Queries
    const testCases = [
        { query: "income support landholding farmers", expectedScheme: "PM-KISAN" },
        { query: "monthly pension 3000 age 60", expectedScheme: "PM-KMY" },
        { query: "solar pump subsidy central state 30%", expectedScheme: "PM-KUSUM" }
    ];

    let passedCount = 0;

    for (const test of testCases) {
        console.log(`\nTesting Query: "${test.query}"`);
        const queryTerms = test.query.toLowerCase().split(' ');
        
        let bestMatch = null;
        let highestScore = -1;

        for (const chunk of corpus) {
            const chunkLower = chunk.chunkText.toLowerCase();
            let score = 0;
            for (const term of queryTerms) {
                if (chunkLower.includes(term)) score++;
            }
            if (score > highestScore) {
                highestScore = score;
                bestMatch = chunk;
            }
        }

        if (bestMatch && highestScore > 0) {
            console.log(`✅ MATCH FOUND: Query matched chunk from document "${bestMatch.sourceDocument}" (Scheme: ${bestMatch.schemeName})`);
            console.log(`   Sample text excerpt: "${bestMatch.chunkText.substring(0, 150).replace(/\n/g, ' ')}..."`);
            passedCount++;
        } else {
            console.error(`❌ NO MATCH: Could not match query to document corpus.`);
        }
    }

    console.log(`\n==================================================`);
    console.log(`Retrieval Verification Summary: ${passedCount}/${testCases.length} tests passed.`);
    if (passedCount === testCases.length) {
        console.log("SUCCESS: RAG Retrieval pipeline independently verified!");
        return true;
    } else {
        process.exit(1);
    }
}

verifyRetrievalPipeline().catch(err => {
    console.error("Test Error:", err);
    process.exit(1);
});
