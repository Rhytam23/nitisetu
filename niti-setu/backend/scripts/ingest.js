import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');
import { Document } from 'langchain';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { MongoDBAtlasVectorSearch } from '@langchain/mongodb';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { MongoClient } from 'mongodb';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MONGODB_URI = process.env.MONGODB_URI;
const DATABASE_NAME = 'niti-setu';
const COLLECTION_NAME = 'scheme_documents';

if (!MONGODB_URI) {
  console.error("Please configure MONGODB_URI in your .env file.");
  process.exit(1);
}

if (!process.env.GOOGLE_API_KEY) {
  console.error("Please configure GOOGLE_API_KEY in your .env file.");
  process.exit(1);
}

console.log("Module Load Check:");
console.log("- pdf:", typeof pdf);
console.log("- Document:", typeof Document);
console.log("- RecursiveCharacterTextSplitter:", typeof RecursiveCharacterTextSplitter);
console.log("- MongoDBAtlasVectorSearch:", typeof MongoDBAtlasVectorSearch);
console.log("- GoogleGenerativeAIEmbeddings:", typeof GoogleGenerativeAIEmbeddings);

async function ingestDocuments() {
  console.log("Starting Niti-Setu Document Ingestion (Direct Mode)...");
  const client = new MongoClient(MONGODB_URI);

  try {
    console.log("Connecting to MongoDB...");
    await client.connect();
    console.log("Connected to MongoDB.");
    const collection = client.db(DATABASE_NAME).collection(COLLECTION_NAME);
    console.log(`Using collection: ${COLLECTION_NAME}`);

    console.log("Initializing Google Gemini Embeddings...");
    const embeddings = new GoogleGenerativeAIEmbeddings({
      modelName: "text-embedding-004",
    });
    console.log("Embeddings initialized.");

    const dataDir = path.join(__dirname, '..', 'data');
    console.log(`Checking data directory: ${dataDir}`);
    if (!fs.existsSync(dataDir)) {
      console.log(`Data directory ${dataDir} not found.`);
      return;
    }

    console.log("Reading data directory...");
    const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.pdf'));
    console.log(`Found ${files.length} PDFs: ${files.join(', ')}`);
    
    if (files.length === 0) {
      console.log(`No PDFs found in ${dataDir}.`);
      return;
    }

    for (const file of files) {
      const filePath = path.join(dataDir, file);
      console.log(`\nProcessing file: ${file} at ${filePath}`);
      console.log(`pdf module type: ${typeof pdf}`);
      
      console.log("Reading file buffer...");
      const dataBuffer = fs.readFileSync(filePath);
      console.log(`Read ${dataBuffer.length} bytes.`);
      
      console.log("Parsing PDF with pdf-parse...");
      const data = await pdf(dataBuffer);
      console.log("PDF parsed successfully.");
      
      console.log("Creating LangChain Document...");
      const rawDoc = new Document({
        pageContent: data.text,
        metadata: { source: file }
      });
      console.log("Document created.");
      
      const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
      });
      
      const docs = await textSplitter.splitDocuments([rawDoc]);
      console.log(`-> Split into ${docs.length} chunks.`);

      const docsWithMetadata = docs.map(doc => {
          doc.metadata = {
              ...doc.metadata,
              scheme_name: file.replace('.pdf', ''),
              type: 'eligibility_guidelines'
          };
          return doc;
      });

      console.log("-> Uploading to MongoDB Atlas...");
      await MongoDBAtlasVectorSearch.fromDocuments(docsWithMetadata, embeddings, {
        collection,
        indexName: 'vector_index',
        textKey: 'text',
        embeddingKey: 'embedding',
      });
      console.log(`-> Successfully ingested ${file}`);
    }

    console.log("\nAll documents ingested successfully!");
  } catch (error) {
    console.error("Ingestion Error Details:");
    console.error("Message:", error.message);
    console.error("Stack:", error.stack);
  } finally {
    await client.close();
  }
}

ingestDocuments();
