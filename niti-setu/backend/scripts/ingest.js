import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
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

async function ingestDocuments() {
  console.log("Starting Niti-Setu Document Ingestion...");
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const collection = client.db(DATABASE_NAME).collection(COLLECTION_NAME);

    // Initialize Embeddings model (Google Gemini text-embedding-004)
    const embeddings = new GoogleGenerativeAIEmbeddings({
      modelName: "text-embedding-004", // current standard for google 
    });

    const dataDir = path.join(__dirname, '..', 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir);
      console.log(`Created ${dataDir}. Please place PDF files here and run script again.`);
      return;
    }

    const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.pdf'));
    if (files.length === 0) {
      console.log(`No PDFs found in ${dataDir}.`);
      return;
    }

    for (const file of files) {
      const filePath = path.join(dataDir, file);
      console.log(`\nProcessing: ${file}`);
      
      // Load PDF
      const loader = new PDFLoader(filePath);
      const rawDocs = await loader.load();
      
      // Split Text
      const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
      });
      const docs = await textSplitter.splitDocuments(rawDocs);
      
      console.log(`-> Split into ${docs.length} chunks.`);

      // Add metadata so we know the source scheme
      const docsWithMetadata = docs.map(doc => {
          doc.metadata = {
              ...doc.metadata,
              scheme_name: file.replace('.pdf', ''),
              type: 'eligibility_guidelines'
          };
          return doc;
      });

      // Insert vectors
      console.log("-> Uploading embeddings to MongoDB Atlas Vector Store...");
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
    console.error("Ingestion Error:", error);
  } finally {
    await client.close();
  }
}

ingestDocuments();
