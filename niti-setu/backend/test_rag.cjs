const { MongoClient } = require('mongodb');
const { MongoDBAtlasVectorSearch } = require('@langchain/mongodb');
const { GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI } = require('@langchain/google-genai');
const { PromptTemplate } = require('@langchain/core/prompts');
const { createStuffDocumentsChain } = require("@langchain/classic/chains/combine_documents");
const { createRetrievalChain } = require("@langchain/classic/chains/retrieval");
require('dotenv').config();

async function testRAG() {
    console.log("Starting RAG test...");
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    console.log("Connected to MongoDB.");

    const collection = client.db('niti-setu').collection('scheme_documents');
    const embeddings = new GoogleGenerativeAIEmbeddings({
        modelName: "gemini-embedding-2-preview",
    });

    const vectorStore = new MongoDBAtlasVectorSearch(embeddings, {
        collection,
        indexName: 'vector_index',
        textKey: 'text',
        embeddingKey: 'embedding',
    });

    const llm = new ChatGoogleGenerativeAI({
        modelName: "gemini-1.5-pro",
        apiKey: process.env.GOOGLE_API_KEY,
    });

    const prompt = PromptTemplate.fromTemplate("Answer the following based on context: {context}\n\nQuestion: {input}");

    console.log("Creating chains...");
    const combineDocsChain = await createStuffDocumentsChain({
        llm,
        prompt,
    });

    const retrievalChain = await createRetrievalChain({
        retriever: vectorStore.asRetriever({ k: 1 }),
        combineDocsChain,
    });

    console.log("Invoking chain...");
    const res = await retrievalChain.invoke({
        input: "Is a farmer with 1 acre land eligible for PM-KISAN?",
    });

    console.log("Response:", res.answer);
    await client.close();
}

testRAG().catch(console.error);
