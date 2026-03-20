const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const pdf = require('pdf-parse');
const { Document } = require('langchain');
const { RecursiveCharacterTextSplitter } = require('@langchain/textsplitters');
const { MongoDBAtlasVectorSearch } = require('@langchain/mongodb');
const { GoogleGenerativeAIEmbeddings } = require('@langchain/google-genai');
const { MongoClient } = require('mongodb');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const MONGODB_URI = process.env.MONGODB_URI;
const DATABASE_NAME = 'niti-setu';
const COLLECTION_NAME = 'scheme_documents';

console.log("Starting Niti-Setu Document Ingestion (CJS Mode)...");

if (!MONGODB_URI) {
  console.error("Please configure MONGODB_URI in your .env file.");
  process.exit(1);
}

if (!process.env.GOOGLE_API_KEY) {
  console.error("Please configure GOOGLE_API_KEY in your .env file.");
  process.exit(1);
}

async function ingestDocuments() {
  console.log("Module Load Check:");
  console.log("- pdf:", typeof pdf);
  console.log("- Document:", typeof Document);
  console.log("- RecursiveCharacterTextSplitter:", typeof RecursiveCharacterTextSplitter);
  console.log("- MongoDBAtlasVectorSearch:", typeof MongoDBAtlasVectorSearch);
  console.log("- GoogleGenerativeAIEmbeddings:", typeof GoogleGenerativeAIEmbeddings);

  const client = new MongoClient(MONGODB_URI);

  try {
    console.log("Connecting to MongoDB...");
    await client.connect();
    console.log("Connected to MongoDB.");
    const collection = client.db(DATABASE_NAME).collection(COLLECTION_NAME);

    const embeddings = new GoogleGenerativeAIEmbeddings({
      modelName: "gemini-embedding-2-preview",
    });

    const dataDir = path.join(__dirname, '..', 'data');
    console.log(`Checking data directory: ${dataDir}`);
    if (!fs.existsSync(dataDir)) {
      console.log(`Data directory ${dataDir} not found.`);
      return;
    }

    const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.pdf'));
    console.log(`Found ${files.length} PDFs: ${files.join(', ')}`);
    
    if (files.length === 0) {
      console.log(`No PDFs found in ${dataDir}.`);
      return;
    }

    for (const file of files) {
      console.log(`\nAbout to process: ${file}`);
      const filePath = path.join(dataDir, file);
      console.log(`Full path: ${filePath}`);
      
      console.log("Reading buffer...");
      const dataBuffer = fs.readFileSync(filePath);
      console.log(`Buffer size: ${dataBuffer.length}`);
      
      const { PDFParse } = require('pdf-parse');
      const parser = new PDFParse({ data: dataBuffer });
      const pdfData = await parser.getText();
      const text = pdfData.text;
      
      console.log(`Extracted text length: ${text.length}`);
      const rawDoc = new Document({
        pageContent: text,
        metadata: { source: file }
      });
      
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
    const errorLog = `Message: ${error.message}\nStack: ${error.stack}`;
    fs.writeFileSync(path.join(__dirname, '..', 'ingest_error.txt'), errorLog);
    console.error("Ingestion Error Details:");
    console.error("Message:", error.message);
    console.error("Stack:", error.stack);
  } finally {
    await client.close();
  }
}

ingestDocuments();
