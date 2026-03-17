import express from 'express';
import { MongoDBAtlasVectorSearch } from '@langchain/mongodb';
import { GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { PromptTemplate } from '@langchain/core/prompts';
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { createRetrievalChain } from "langchain/chains/retrieval";
import { MongoClient } from 'mongodb';

const router = express.Router();

// Define Database connection constants
const DATABASE_NAME = 'niti-setu';
const COLLECTION_NAME = 'scheme_documents';

// Store client connection globally for API reuse
let mongoClient;
let vectorStore;

// Initialize LangChain components lazily on first request
async function getVectorStore() {
    if (vectorStore) return vectorStore;

    if (!process.env.MONGODB_URI || !process.env.GOOGLE_API_KEY) {
        throw new Error("Missing MONGODB_URI or GOOGLE_API_KEY");
    }

    if (!mongoClient) {
        mongoClient = new MongoClient(process.env.MONGODB_URI);
        await mongoClient.connect();
    }
    
    const collection = mongoClient.db(DATABASE_NAME).collection(COLLECTION_NAME);
    
    const embeddings = new GoogleGenerativeAIEmbeddings({
        modelName: "text-embedding-004", 
    });

    vectorStore = new MongoDBAtlasVectorSearch(embeddings, {
        collection,
        indexName: 'vector_index',
        textKey: 'text',
        embeddingKey: 'embedding',
    });

    return vectorStore;
}

// System Prompt for our Eligibility Rules Engine
const ELIGIBILITY_SYSTEM_PROMPT = `
You are "Niti-Setu", an expert AI consultant for Indian Government Agricultural Schemes.
You have been provided with official PDF scheme documents below.

Examine the Farmer's Profile carefully. 
Then, analyze the provided scheme guidelines and determine if the farmer is eligible.

You MUST respond strictly in the following JSON format:
{{
    "status": "Eligible" | "Not Eligible" | "Pending Review",
    "reasoning": "A simple 2-3 sentence explanation for the farmer.",
    "document_proof": "The exact wording or snippet from the provided guidelines that proves your decision.",
    "citation": "Page X, Paragraph Y of [Scheme Name]",
    "required_documents": ["List", "of", "required", "documents", "mentioned", "in", "the", "guidelines"]
}}

Context (Scheme Guidelines):
{context}

Farmer Profile:
{input}
`;

router.post('/check', async (req, res) => {
    try {
        const farmerProfile = req.body;
        
        // Convert the profile object into a readable text query for semantic search
        let profileText = `Farmer from ${farmerProfile.state || 'Unknown State'}, `;
        profileText += `Landholding: ${farmerProfile.land_acres || 0} acres, `;
        profileText += `Crop: ${farmerProfile.crop || 'Unknown'}, `;
        profileText += `Category: ${farmerProfile.social_category || 'General'}. `;
        if (farmerProfile.scheme) {
            profileText += `Checking eligibility for scheme: ${farmerProfile.scheme}`;
        }

        console.log("Analyzing Profile:", profileText);

        const store = await getVectorStore();
        
        // Initialize Gemini Pro model
        const llm = new ChatGoogleGenerativeAI({
            modelName: "gemini-1.5-pro", 
            temperature: 0, 
        });

        // Create the Prompt Template
        const prompt = PromptTemplate.fromTemplate(ELIGIBILITY_SYSTEM_PROMPT);

        // LangChain components: Create a chain that stuffs retrieved docs into the prompt
        const documentChain = await createStuffDocumentsChain({
            llm: llm,
            prompt: prompt,
        });

        // Use our Mongo Atlas Vector Store as the retriever (fetch top 4 closest document chunks)
        const retriever = store.asRetriever({
            k: 4, 
        });

        const retrievalChain = await createRetrievalChain({
            combineDocsChain: documentChain,
            retriever: retriever,
        });

        // Execute the RAG pipeline
        const response = await retrievalChain.invoke({
            input: profileText
        });

        // Gemini should return a JSON string based on our prompt instruction.
        // We'll clean it up in case it includes markdown backticks.
        let rawAnswer = response.answer;
        if (rawAnswer.startsWith('```json')) {
            rawAnswer = rawAnswer.substring(7, rawAnswer.length - 3);
        } else if (rawAnswer.startsWith('```')) {
            rawAnswer = rawAnswer.substring(3, rawAnswer.length - 3);
        }

        const jsonResult = JSON.parse(rawAnswer);

        res.json({
            success: true,
            data: jsonResult
        });

    } catch (error) {
        console.error("Eligibility Check Error:", error);
        res.status(500).json({ success: false, error: 'Failed to process eligibility check.' });
    }
});

// A dummy profile saving endpoint
router.post('/profile', (req, res) => {
    // In a full application, save `req.body` to MongoDB
    res.json({ success: true, message: "Profile saved successfully." });
});

export default router;
