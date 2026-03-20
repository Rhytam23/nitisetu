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
    const farmerProfile = req.body;
    let jsonResult;
    let usedMock = false;

    try {
        // 1. Defensively construct profile text
        const state = farmerProfile.state || 'Unknown';
        const land_acres = parseFloat(farmerProfile.land_acres) || 0;
        const crop = farmerProfile.crop || 'Unknown';
        const scheme = farmerProfile.scheme || 'General';
        
        let profileText = `Farmer from ${state}, Landholding: ${land_acres} acres, Crop: ${crop}. Checking: ${scheme}`;
        console.log("Analyzing Profile:", profileText);

        // 2. Wrap ALL AI/DB logic in its own try/catch to ensure fallback
        try {
            // Check for obvious blockers before even trying AI
            if (!process.env.MONGODB_URI || !process.env.GOOGLE_API_KEY || process.env.MONGODB_URI.includes('mysandbox')) {
                throw new Error("Configuration incomplete or invalid. Skipping AI Engine.");
            }

            const store = await getVectorStore();
            
            // This constructor is known to throw TypeError if config is subtlely wrong
            const llm = new ChatGoogleGenerativeAI({
                modelName: "gemini-1.5-pro", 
                apiKey: process.env.GOOGLE_API_KEY,
                temperature: 0, 
            });

            const retriever = store.asRetriever({ k: 4 });
            const prompt = PromptTemplate.fromTemplate(ELIGIBILITY_SYSTEM_PROMPT);
            const documentChain = await createStuffDocumentsChain({ llm, prompt });
            const retrievalChain = await createRetrievalChain({
                combineDocsChain: documentChain,
                retriever: retriever,
            });

            const response = await retrievalChain.invoke({ input: profileText });
            let rawAnswer = response.answer;
            rawAnswer = rawAnswer.replace(/```json/g, '').replace(/```/g, '').trim();
            jsonResult = JSON.parse(rawAnswer);
            console.log("AI Engine success.");
        } catch (ragError) {
            console.warn("Niti-Setu Fallback Triggered:", ragError.message);
            usedMock = true;
            
            const isEligible = land_acres <= 5;
            jsonResult = {
                status: isEligible ? "Eligible" : "Not Eligible",
                reasoning: isEligible 
                    ? `Based on your profile (Land: ${land_acres} acres), you are likely eligible for the ${scheme} scheme benefits.`
                    : `Your land holding of ${land_acres} acres is above the threshold for most ${scheme} subsidies.`,
                document_proof: isEligible 
                    ? "Eligibility criteria for small and marginal farmers (up to 2 hectares) are met."
                    : "Exclusion criteria for large landholders (above 2 hectares) may apply.",
                citation: "Project Niti-Setu Internal Logic (Mock Fallback)",
                required_documents: ["Aadhaar Card", "Land Record", "Bank Passbook"]
            };
        }

        res.json({
            success: true,
            data: jsonResult,
            engine: usedMock ? "Logic-Fallback" : "RAG-AI"
        });

    } catch (fatalError) {
        console.error("FATAL Eligibility Error:", fatalError);
        logError("FATAL Eligibility Error", fatalError);
        res.status(500).json({ 
            success: false, 
            error: 'A critical error occurred in the Niti-Setu processing layer.',
            details: fatalError.message 
        });
    }
});

// A dummy profile saving endpoint
router.post('/profile', (req, res) => {
    // In a full application, save `req.body` to MongoDB
    res.json({ success: true, message: "Profile saved successfully." });
});

export default router;
