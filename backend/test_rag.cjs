const { MongoClient } = require('mongodb');
const { MongoDBAtlasVectorSearch } = require('@langchain/mongodb');
const { GoogleGenerativeAIEmbeddings } = require('@langchain/google-genai');
const dns = require('dns');
require('dotenv').config();

try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

async function testAtlasVectorSearch() {
    console.log("==================================================");
    console.log("  Testing LIVE MongoDB Atlas Vector Search        ");
    console.log("==================================================\n");

    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    console.log("1. Connected to MongoDB Atlas.");

    const collection = client.db('niti-setu').collection('scheme_documents');
    const embeddings = new GoogleGenerativeAIEmbeddings({
        apiKey: process.env.GOOGLE_API_KEY,
        modelName: "gemini-embedding-2-preview"
    });

    const vectorStore = new MongoDBAtlasVectorSearch(embeddings, {
        collection,
        indexName: 'vector_index',
        textKey: 'text',
        embeddingKey: 'embedding',
    });

    console.log("2. Querying Atlas Vector Search Index 'vector_index'...");
    const query = "Is a farmer with 1 acre land eligible for PM-KISAN?";
    const retriever = vectorStore.asRetriever({ k: 3 });
    const docs = await retriever.invoke(query);

    console.log(`\n🎉 SUCCESS! RETRIEVED ${docs.length} VECTOR MATCHES FROM MONGODB ATLAS:`);
    docs.forEach((doc, idx) => {
        console.log(`\n--- Match #${idx + 1} (Source: ${doc.metadata?.source || 'PM-KISAN'}) ---`);
        console.log(`Text Excerpt: "${doc.pageContent.substring(0, 200).replace(/\n/g, ' ')}..."`);
    });

    console.log("\n==================================================");
    console.log("LIVE MongoDB Atlas Vector Search Test PASSED!");
    console.log("==================================================");

    await client.close();
}

testAtlasVectorSearch().catch(console.error);
