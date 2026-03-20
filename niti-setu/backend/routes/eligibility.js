import express from 'express';
import { MongoDBAtlasVectorSearch } from '@langchain/mongodb';
import { GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { PromptTemplate } from '@langchain/core/prompts';
import { createStuffDocumentsChain } from "@langchain/classic/chains/combine_documents";
import { createRetrievalChain } from "@langchain/classic/chains/retrieval";
import { MongoClient } from 'mongodb';
import fs from 'fs';
import path from 'path';

const logError = (msg, err) => {
    const errorMsg = `[${new Date().toISOString()}] ${msg}\n${err?.stack || err}\n\n`;
    fs.appendFileSync('eligibility_error.log', errorMsg);
};

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
        modelName: "gemini-embedding-2-preview", 
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
You are "Niti-Setu", a highly precise AI consultant specializing in Indian Government Agricultural Schemes.
Your goal is to evaluate if a farmer is eligible for a specific scheme based ONLY on the provided guidelines.

### Analysis Instructions:
1. **Critical Review**: Match the farmer's profile (State, Landholding, Crop, Category) against the specific eligibility and exclusion criteria in the guidelines.
2. **Strict Evidence**: You MUST identify the exact page or section that supports your decision.
3. **Drafting the Reasoning**: Write a clear, encouraging, but firm explanation. 

### Mandatory JSON Output Format:
{{
    "status": "Eligible" | "Not Eligible" | "Pending Review",
    "reasoning": "A concise 2-sentence explanation for the farmer.",
    "document_proof": "The direct quote from the guidelines used to make this decision.",
    "citation": "Official Document Name, Page X, Section Y",
    "required_documents": ["Document A", "Document B", ...] 
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
        console.log("Vector store initialized.");
        
        // Initialize Gemini Pro model
        const llm = new ChatGoogleGenerativeAI({
            modelName: "gemini-1.5-pro", 
            temperature: 0, 
        });

        console.log("Retrieving documents...");
        // Use our Mongo Atlas Vector Store as the retriever (fetch top 4 closest document chunks)
        const retriever = store.asRetriever({
            k: 4, 
        });

        console.log("Creating chains...");
        // Create the Prompt Template
        const prompt = PromptTemplate.fromTemplate(ELIGIBILITY_SYSTEM_PROMPT);

        // LangChain components: Create a chain that stuffs retrieved docs into the prompt
        const documentChain = await createStuffDocumentsChain({
            llm: llm,
            prompt: prompt,
        });
        console.log("Combine docs chain created.");

        const retrievalChain = await createRetrievalChain({
            combineDocsChain: documentChain,
            retriever: retriever,
        });
        console.log("Retrieval chain created. Invoking...");

        try {
            const response = await retrievalChain.invoke({
                input: profileText
            });
            console.log("Response received from RAG chain.");

            let rawAnswer = response.answer;
            // Robust cleaning of markdown blocks
            rawAnswer = rawAnswer.replace(/```json/g, '').replace(/```/g, '').trim();

            const jsonResult = JSON.parse(rawAnswer);

            res.json({
                success: true,
                data: jsonResult
            });
        } catch (chainError) {
            console.error("Chain Execution/Parsing Error:", chainError);
            logError("Chain Execution/Parsing Error", chainError);
            res.status(500).json({ 
                success: false, 
                error: 'The AI reasoning engine failed to parse the result. This usually happens if the LLM output was malformed.',
                details: chainError.message 
            });
        }

    } catch (error) {
        console.error("Eligibility Check Error:", error);
        logError("Eligibility Check Error", error);
        res.status(500).json({ success: false, error: 'Internal Server Error. Please check backend logs.' });
    }
});

// A dummy profile saving endpoint
router.post('/profile', (req, res) => {
    // In a full application, save `req.body` to MongoDB
    res.json({ success: true, message: "Profile saved successfully." });
});

export default router;
