import express from 'express';
import { MongoDBAtlasVectorSearch } from '@langchain/mongodb';
import { GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { PromptTemplate } from '@langchain/core/prompts';
import { createStuffDocumentsChain } from "@langchain/classic/chains/combine_documents";
import { createRetrievalChain } from "@langchain/classic/chains/retrieval";
import { MongoClient } from 'mongodb';
import mongoose from 'mongoose';
import fs from 'fs';
import Farmer from '../models/Farmer.js';

function validateProfileInput(profile, { partial = false } = {}) {
    const errors = [];
    const has = (key) => Object.prototype.hasOwnProperty.call(profile, key);

    if (!partial || has('name')) {
        if (!profile.name || String(profile.name).trim().length < 2) {
            errors.push('name must be at least 2 characters');
        }
    }

    if (!partial || has('state')) {
        if (!profile.state || String(profile.state).trim().length < 2) {
            errors.push('state is required');
        }
    }

    if (has('land_acres')) {
        const acres = Number(profile.land_acres);
        if (!Number.isFinite(acres) || acres < 0) {
            errors.push('land_acres must be a non-negative number');
        }
    }

    if (has('age') && profile.age !== null && profile.age !== '') {
        const age = Number(profile.age);
        if (!Number.isInteger(age) || age < 18 || age > 100) {
            errors.push('age must be an integer between 18 and 100');
        }
    }

    if (has('phone') && profile.phone) {
        const phone = String(profile.phone).replace(/\D/g, '');
        if (phone.length !== 10) {
            errors.push('phone must be a 10-digit number');
        }
    }

    if (has('aadhaar') && profile.aadhaar) {
        const aadhaar = String(profile.aadhaar).replace(/\D/g, '');
        if (aadhaar.length !== 12) {
            errors.push('aadhaar must be a 12-digit number');
        }
    }

    return errors;
}

function buildProfilePayload(profile, { isUpdate = false } = {}) {
    const normalized = {
        ...profile
    };

    if (Object.prototype.hasOwnProperty.call(profile, 'name')) {
        normalized.name = String(profile.name).trim();
    }
    if (Object.prototype.hasOwnProperty.call(profile, 'state')) {
        normalized.state = String(profile.state).trim();
    }
    if (Object.prototype.hasOwnProperty.call(profile, 'crop')) {
        normalized.crop = String(profile.crop || '').trim();
    }
    if (Object.prototype.hasOwnProperty.call(profile, 'land_acres')) {
        normalized.land_acres = Number(profile.land_acres) || 0;
    }
    if (Object.prototype.hasOwnProperty.call(profile, 'age')) {
        normalized.age = profile.age === null || profile.age === '' ? null : parseInt(profile.age, 10);
    }
    if (Object.prototype.hasOwnProperty.call(profile, 'phone')) {
        normalized.phone = String(profile.phone || '').replace(/\D/g, '');
    }
    if (Object.prototype.hasOwnProperty.call(profile, 'aadhaar')) {
        normalized.aadhaar = String(profile.aadhaar || '').replace(/\D/g, '');
    }

    if (isUpdate) {
        normalized.updatedAt = new Date().toISOString();
    }

    return normalized;
}

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

// ---------- Farmer Profile API (uses MongoDB) ----------

/** POST /api/profile - Create a new farmer profile */
router.post('/profile', async (req, res) => {
    try {
        const profile = req.body;

        const errors = validateProfileInput(profile);
        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: errors
            });
        }

        const newFarmer = buildProfilePayload(profile);
        const createdFarmer = await Farmer.create(newFarmer);

        res.status(201).json({
            success: true,
            message: 'Profile saved successfully.',
            data: createdFarmer
        });
    } catch (err) {
        logError('POST /profile failed', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

/** GET /api/profile - List all farmer profiles */
router.get('/profile', async (req, res) => {
    try {
        const farmers = await Farmer.find().sort({ createdAt: -1 });
        res.json({ success: true, count: farmers.length, data: farmers });
    } catch (err) {
        logError('GET /profile failed', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

/** GET /api/profile/:id - Get a single farmer by ID */
router.get('/profile/:id', async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: false, error: 'Invalid farmer id' });
        }
        const farmer = await Farmer.findById(req.params.id);
        if (!farmer) {
            return res.status(404).json({ success: false, error: 'Farmer not found' });
        }
        res.json({ success: true, data: farmer });
    } catch (err) {
        logError('GET /profile/:id failed', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

/** PUT /api/profile/:id - Update a farmer profile */
router.put('/profile/:id', async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: false, error: 'Invalid farmer id' });
        }
        const errors = validateProfileInput(req.body, { partial: true });
        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: errors
            });
        }

        const updates = buildProfilePayload(req.body, { isUpdate: true });
        delete updates.createdAt;
        delete updates._id;

        const updatedFarmer = await Farmer.findByIdAndUpdate(
            req.params.id,
            { $set: updates },
            { new: true, runValidators: true }
        );

        if (!updatedFarmer) {
            return res.status(404).json({ success: false, error: 'Farmer not found' });
        }

        res.json({
            success: true,
            message: 'Profile updated successfully.',
            data: updatedFarmer
        });
    } catch (err) {
        logError('PUT /profile/:id failed', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

/** DELETE /api/profile/:id - Delete a farmer profile */
router.delete('/profile/:id', async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: false, error: 'Invalid farmer id' });
        }
        const deletedFarmer = await Farmer.findByIdAndDelete(req.params.id);
        if (!deletedFarmer) {
            return res.status(404).json({ success: false, error: 'Farmer not found' });
        }

        res.json({
            success: true,
            message: 'Profile deleted successfully.',
            data: deletedFarmer
        });
    } catch (err) {
        logError('DELETE /profile/:id failed', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

export default router;
