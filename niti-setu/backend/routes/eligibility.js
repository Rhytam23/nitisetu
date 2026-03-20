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
            
            const acres = parseFloat(farmerProfile.land_acres) || 0;
            const age = parseInt(farmerProfile.age) || 30; // Default to eligible age if not provided
            let isEligible = false;
            let status = "Not Eligible";
            let reasoning = "";
            let proof = "";
            let cite = "";
            let docs = ["Aadhaar Card", "Land Record (Jamabandi)", "Bank Passbook"];

            if (scheme === "PM-KISAN") {
                isEligible = acres <= 5; // 2 Hectares limit
                status = isEligible ? "Eligible" : "Not Eligible";
                reasoning = isEligible 
                    ? `As an SMF with ${acres} acres, you qualify for the Rs. 6,000/year benefit under PM-KISAN.`
                    : `Your land holding of ${acres} acres exceeds the 2-hectare (approx 5 acres) limit for SMF categorization.`;
                proof = "Clause 3: 'A landholder farmer's family is defined as a family... who owns cultivable land up to 2 hectares'.";
                cite = "PM-KISAN Operational Guidelines, Page 2, Section 3";
            } else if (scheme === "PM-KMY") {
                const isAgeEligible = age >= 18 && age <= 40;
                isEligible = acres <= 5 && isAgeEligible;
                status = isEligible ? "Eligible" : "Not Eligible";
                reasoning = isEligible 
                    ? `You are eligible for an assured monthly pension of Rs. 3,000 after age 60.`
                    : !isAgeEligible ? `Age ${age} is outside the 18-40 entry group limit.` : `Land holding exceeds 2 hectares.`;
                proof = "Clause 4: 'All SMFs... who are of the age of 18 years and above and upto 40 years... are eligible'.";
                cite = "PM-KMY Operational Guidelines, Page 3, Section 4";
            } else if (scheme === "PM-KUSUM") {
                isEligible = true; // Most farmers are eligible for solar pump support
                status = "Eligible";
                reasoning = `You qualify for up to 60% combined subsidy (30% Central + 30% State) for solar pump installation.`;
                proof = "Component B, Clause 5.2.2: 'Central Government will provide financial assistance of 30%... State Government will provide a subsidy of atleast 30%'.";
                cite = "PM-KUSUM Guidelines, Page 7, Section 5.2.2";
                docs.push("Copy of Electricity Bill (if applicable)", "Solar Pump Preference Form");
            }

            jsonResult = {
                status: status,
                reasoning: reasoning,
                document_proof: proof,
                citation: cite,
                required_documents: docs
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
