const { GoogleGenerativeAIEmbeddings } = require('@langchain/google-genai');
require('dotenv').config();

async function testEmbeddings() {
    console.log("Testing embeddings...");
    const embeddings = new GoogleGenerativeAIEmbeddings({
        modelName: "gemini-embedding-2-preview",
        apiKey: process.env.GOOGLE_API_KEY
    });
    const res = await embeddings.embedQuery("hello");
    console.log("Embedding success, length:", res.length);
}

testEmbeddings().catch(console.error);
