import fs from 'fs';
import path from 'path';
import dns from 'dns';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { PDFParse } from 'pdf-parse';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { MongoDBAtlasVectorSearch } from '@langchain/mongodb';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { MongoClient } from 'mongodb';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

const DATABASE_NAME = 'niti-setu';
const COLLECTION_NAME = 'scheme_documents';

export async function ingestPDF(filePath, schemeName) {
    if (!process.env.MONGODB_URI || !process.env.GOOGLE_API_KEY) {
        console.error("❌ Missing environment variables (MONGODB_URI or GOOGLE_API_KEY).");
        process.exit(1);
    }

    console.log(`\n1. Loading PDF: ${filePath}...`);
    const dataBuffer = fs.readFileSync(filePath);
    const uint8Data = new Uint8Array(dataBuffer);

    const parser = new PDFParse(uint8Data);
    const parsedTextResult = await parser.getText();
    const fullText = typeof parsedTextResult === 'string' ? parsedTextResult : (parsedTextResult.text || '');

    console.log(`2. Splitting PDF text into chunks (1000ch / 200ov)...`);
    const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
    });

    const rawDocs = await textSplitter.createDocuments([fullText], [{
        scheme_name: schemeName,
        source: path.basename(filePath),
        type: 'eligibility_guidelines'
    }]);

    console.log(`   -> Created ${rawDocs.length} text chunks.`);
    console.log(`3. Connecting to MongoDB Atlas...`);

    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const collection = client.db(DATABASE_NAME).collection(COLLECTION_NAME);

    console.log("4. Initializing Gemini Embeddings & Vectorizing to MongoDB...");
    const embeddings = new GoogleGenerativeAIEmbeddings({
        modelName: "gemini-embedding-2-preview",
        apiKey: process.env.GOOGLE_API_KEY
    });

    await MongoDBAtlasVectorSearch.fromDocuments(
        rawDocs,
        embeddings,
        {
            collection,
            indexName: 'vector_index',
            textKey: 'text',
            embeddingKey: 'embedding',
        }
    );

    console.log(`✅ Success! ${path.basename(filePath)} ingested and vectorized into MongoDB Atlas.`);
    await client.close();
}

// CLI Execution if called directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    const args = process.argv.slice(2);
    if (args.length < 1) {
        console.error("Usage: node ingest_pdf.js <path_to_pdf> [scheme_name]");
        process.exit(1);
    }
    const pdfPath = args[0];
    const scheme = args[1] || path.basename(pdfPath, '.pdf');
    ingestPDF(pdfPath, scheme).catch(console.error);
}
