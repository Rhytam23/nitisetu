const { MongoClient } = require('mongodb');
const { MongoDBAtlasVectorSearch } = require('@langchain/mongodb');
const { GoogleGenerativeAIEmbeddings } = require('@langchain/google-genai');
const { PDFLoader } = require('@langchain/community/document_loaders/fs/pdf');
const { RecursiveCharacterTextSplitter } = require('@langchain/textsplitters');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function ingestPDF(filePath, sourceName) {
    if (!process.env.MONGODB_URI || !process.env.GOOGLE_API_KEY) {
        console.error("Missing environment variables.");
        process.exit(1);
    }

    console.log(`1. Loading PDF: ${filePath}...`);
    const loader = new PDFLoader(filePath);
    const docs = await loader.load();

    console.log(`2. Splitting PDF into smaller chunks...`);
    // Split text to fit into embedding model limits and improve RAG retrieval accuracy
    const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
    });
    
    const splitDocs = await textSplitter.splitDocuments(docs);
    
    // Inject custom metadata so you can filter by scheme if you have multiple PDFs
    const docsWithMetadata = splitDocs.map(doc => {
       doc.metadata = { ...doc.metadata, source: sourceName || 'Official Scheme PDF' };
       return doc;
    });

    console.log(`   -> Created ${docsWithMetadata.length} embedding chunks.`);
    console.log(`3. Connecting to MongoDB Atlas...`);
    
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();

    const collection = client.db('niti-setu').collection('scheme_documents');
    
    console.log("   -> Initializing AI Embeddings...");
    const embeddings = new GoogleGenerativeAIEmbeddings({
        modelName: "gemini-embedding-2-preview",
        apiKey: process.env.GOOGLE_API_KEY
    });

    console.log("4. Generating Vectors and Pushing to MongoDB. This might take a minute...");
    // Vector search ingestion
    await MongoDBAtlasVectorSearch.fromDocuments(
        docsWithMetadata,
        embeddings,
        {
            collection,
            indexName: 'vector_index', // This MUST match the Atlas Triggers/Vector Search Index name
            textKey: 'text',
            embeddingKey: 'embedding',
        }
    );

    console.log("5. Success! PDF fully ingested and vectorized into MongoDB.");
    await client.close();
}

const args = process.argv.slice(2);
if (args.length < 1) {
    console.error("Usage: node ingest_pdf.cjs <path_to_pdf> [scheme_name]");
    process.exit(1);
}

const pdfPath = args[0];
const schemeName = args[1] || 'Unknown Scheme';

ingestPDF(pdfPath, schemeName).catch(console.error);
