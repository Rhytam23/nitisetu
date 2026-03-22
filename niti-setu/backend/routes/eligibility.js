import express from 'express';
import { MongoDBAtlasVectorSearch } from '@langchain/mongodb';
import { GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { PromptTemplate } from '@langchain/core/prompts';
import { createStuffDocumentsChain } from "@langchain/classic/chains/combine_documents";
import { createRetrievalChain } from "@langchain/classic/chains/retrieval";
import { MongoClient } from 'mongodb';
import mongoose from 'mongoose';
import fs from 'fs';
import FarmerRepository from '../repositories/FarmerRepository.js';

const sendResponse = (res, statusCode, success, message, data = null, error = null, details = null) => {
    const payload = { success };
    if (message) payload.message = message;
    if (data) payload.data = data;
    if (error) payload.error = error;
    if (details) payload.details = details;
    return res.status(statusCode).json(payload);
};

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
    if (profile.phone && String(profile.phone).trim() !== '') {
        normalized.phone = String(profile.phone).replace(/\D/g, '');
    } else {
        delete normalized.phone;
    }
    
    if (profile.aadhaar && String(profile.aadhaar).trim() !== '') {
        normalized.aadhaar = String(profile.aadhaar).replace(/\D/g, '');
    } else {
        delete normalized.aadhaar;
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
2. **Strict Evidence**: You MUST extract a direct, verbatim quote from the provided text that supports your decision. Do NOT fabricate page numbers or sections if they are not explicitly visible in the text.
3. **Drafting the Reasoning**: Write a clear, encouraging, but firm explanation. 

### Mandatory JSON Output Format:
{{
    "status": "Eligible" | "Not Eligible" | "Pending Review",
    "reasoning": "A concise 2-sentence explanation for the farmer in {language}.",
    "document_proof": "The EXACT, VERBATIM quote from the provided context supporting this decision (Keep this in the original document language).",
    "citation": "Name of the Source Document",
    "required_documents": ["Document A", "Document B", ...] 
}}

IMPORTANT: The "reasoning" MUST be written in {language}. 

Context (Scheme Guidelines):
{context}

Farmer Profile:
{input}
`;

router.post('/check', async (req, res) => {
    let jsonResult;
    let usedMock = false;

    try {
        // 1. Defensively construct profile text
        const { state, land_acres, crop, scheme, phone, preferred_language = 'en' } = req.body;
        
        // Map common codes to full names for the AI prompt
        const langNames = {
            'hi': 'Hindi', 'mr': 'Marathi', 'ta': 'Tamil', 'te': 'Telugu',
            'bn': 'Bengali', 'gu': 'Gujarati', 'kn': 'Kannada', 'ml': 'Malayalam',
            'pa': 'Punjabi', 'en': 'English'
        };
        const targetLanguage = langNames[preferred_language] || 'English'; // Default to English if code not found

        const farmerProfile = { state, land_acres, crop, scheme, phone };
        
        let profileText = `Farmer from ${farmerProfile.state || 'Unknown'}, Landholding: ${parseFloat(farmerProfile.land_acres) || 0} acres, Crop: ${farmerProfile.crop || 'Unknown'}. Checking: ${farmerProfile.scheme || 'General'}`;
        console.log("Analyzing Profile:", profileText);

        // 2. Wrap ALL AI/DB logic in its own try/catch to ensure fallback
        try {
            // Check for obvious blockers before even trying AI
            if (!process.env.MONGODB_URI || !process.env.GOOGLE_API_KEY) {
                throw new Error("Configuration incomplete or invalid. Skipping AI Engine.");
            }

            const store = await getVectorStore();
            
            const llm = new ChatGoogleGenerativeAI({
                modelName: "gemini-1.5-pro", 
                apiKey: process.env.GOOGLE_API_KEY,
                temperature: 0, 
            });

            // 1. Manually retrieve the documents from MongoDB
            const retriever = store.asRetriever({ k: 4 });
            const docs = await retriever.invoke(profileText);
            
            // 2. Format the context so the AI actually sees the Source Document names!
            const formattedContext = docs.map(d => `--- SOURCE DOCUMENT: ${d.metadata.scheme_name || d.metadata.source || 'Unknown'} ---\n${d.pageContent}`).join('\n\n');

            // 3. Format the prompt and invoke the LLM safely
            const promptTemplate = PromptTemplate.fromTemplate(ELIGIBILITY_SYSTEM_PROMPT);
            const finalPrompt = await promptTemplate.format({ 
                context: formattedContext, 
                input: profileText,
                language: targetLanguage 
            });
            
            const response = await llm.invoke(finalPrompt);
            
            // `response.content` is the string returned by Chat model
            let rawAnswer = response?.content || "";
            if (!rawAnswer) {
                throw new Error("AI returned an empty or undefined response.");
            }
            rawAnswer = String(rawAnswer).replace(/```json/gi, '').replace(/```/g, '').trim();
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
                isEligible = true; // Limits revised to include all landholders subject to exclusion criteria
                status = "Eligible";
                reasoning = `Based on current guidelines, all landholding farmers are eligible for PM-KISAN benefits, subject to specific exclusion criteria (like paying income tax).`;
                proof = "\"With a view to provide income support to all landholding farmers’ families in the country, having cultivable land, the Central Government has implemented a Central Sector Scheme, namely, 'Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)'\"";
                cite = "PM-KISAN OPERATIONAL GUIDELINES";
            } else if (scheme === "PM-KMY") {
                const isAgeEligible = age >= 18 && age <= 40;
                isEligible = acres <= 5 && isAgeEligible; // 2 Hectares = ~5 acres
                status = isEligible ? "Eligible" : "Not Eligible";
                reasoning = isEligible 
                    ? `You are eligible for an assured monthly pension of Rs. 3,000 after age 60.`
                    : !isAgeEligible ? `Age ${age} is outside the 18-40 entry group limit.` : `Land holding exceeds 2 hectares.`;
                proof = "\"All Small and Marginal Farmers (SMFs) in all States and Union Territories of the country, who are of the age of 18 years and above and upto the age of 40 years... are eligible\"";
                cite = "PM-KMY OPERATIONAL GUIDELINES";
            } else if (scheme === "PM-KUSUM") {
                isEligible = true;
                status = "Eligible";
                reasoning = `You qualify for up to 60% combined subsidy (30% Central + 30% State) for a standalone solar pump installation.`;
                proof = "\"The Central Government will provide financial assistance of 30%... The State Government will provide a subsidy of atleast 30%; and the remaining up to 40% is to be provided by bank loan/farmer.\"";
                cite = "PM-KUSUM Guidelines";
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

        return sendResponse(res, 200, true, "Eligibility checked successfully.", jsonResult, null, { engine: usedMock ? "Logic-Fallback" : "RAG-AI" });

    } catch (fatalError) {
        console.error("FATAL Eligibility Error:", fatalError);
        logError("FATAL Eligibility Error", fatalError);
        return sendResponse(res, 500, false, null, null, 'A critical error occurred in the Niti-Setu processing layer.', fatalError.message);
    }
});

// ---------- Farmer Profile API (uses MongoDB) ----------

/** POST /api/profile - Create a new farmer profile */
router.post('/profile', async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            return sendResponse(res, 503, false, null, null, 'Database is offline. Profile saving unavailable.');
        }
        const profile = req.body;

        const errors = validateProfileInput(profile);
        if (errors.length > 0) {
            return sendResponse(res, 400, false, null, null, 'Validation failed', errors);
        }

        const newFarmer = buildProfilePayload(profile);
        const createdFarmer = await FarmerRepository.create(newFarmer);

        return sendResponse(res, 201, true, 'Profile saved successfully.', createdFarmer);
    } catch (err) {
        if (err.code === 11000) {
            const field = Object.keys(err.keyValue)[0];
            return sendResponse(res, 409, false, null, null, `A profile with this ${field} already exists.`);
        }
        logError('POST /profile failed', err);
        return sendResponse(res, 500, false, null, null, 'Internal Server Error', err.message);
    }
});

/** GET /api/profile - List all farmer profiles */
router.get('/profile', async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) return sendResponse(res, 503, false, null, null, 'Database offline');
        const farmers = await FarmerRepository.findAll();
        return sendResponse(res, 200, true, 'Profiles retrieved successfully.', farmers, null, { count: farmers.length });
    } catch (err) {
        logError('GET /profile failed', err);
        return sendResponse(res, 500, false, null, null, 'Internal Server Error', err.message);
    }
});

/** GET /api/profile/:id - Get a single farmer by ID */
router.get('/profile/:id', async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) return sendResponse(res, 503, false, null, null, 'Database offline');
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return sendResponse(res, 400, false, null, null, 'Invalid farmer id');
        }
        const farmer = await FarmerRepository.findById(req.params.id);
        if (!farmer) {
            return sendResponse(res, 404, false, null, null, 'Farmer not found');
        }
        return sendResponse(res, 200, true, 'Profile retrieved successfully.', farmer);
    } catch (err) {
        logError('GET /profile/:id failed', err);
        return sendResponse(res, 500, false, null, null, 'Internal Server Error', err.message);
    }
});

/** PUT /api/profile/:id - Update a farmer profile */
router.put('/profile/:id', async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) return sendResponse(res, 503, false, null, null, 'Database offline');
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return sendResponse(res, 400, false, null, null, 'Invalid farmer id');
        }
        const errors = validateProfileInput(req.body, { partial: true });
        if (errors.length > 0) {
            return sendResponse(res, 400, false, null, null, 'Validation failed', errors);
        }

        const updates = buildProfilePayload(req.body, { isUpdate: true });
        delete updates.createdAt;
        delete updates._id;

        const updatedFarmer = await FarmerRepository.update(req.params.id, updates);

        if (!updatedFarmer) {
            return sendResponse(res, 404, false, null, null, 'Farmer not found');
        }

        return sendResponse(res, 200, true, 'Profile updated successfully.', updatedFarmer);
    } catch (err) {
        if (err.code === 11000) {
            const field = Object.keys(err.keyValue)[0];
            return sendResponse(res, 409, false, null, null, `A profile with this ${field} already exists.`);
        }
        logError('PUT /profile/:id failed', err);
        return sendResponse(res, 500, false, null, null, 'Internal Server Error', err.message);
    }
});

/** DELETE /api/profile/:id - Delete a farmer profile */
router.delete('/profile/:id', async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) return sendResponse(res, 503, false, null, null, 'Database offline');
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return sendResponse(res, 400, false, null, null, 'Invalid farmer id');
        }
        // TODO: Access Control / Authorization should go here before deletion
        const deletedFarmer = await FarmerRepository.delete(req.params.id);
        if (!deletedFarmer) {
            return sendResponse(res, 404, false, null, null, 'Farmer not found');
        }

        return sendResponse(res, 200, true, 'Profile deleted successfully.', deletedFarmer);
    } catch (err) {
        logError('DELETE /profile/:id failed', err);
        return sendResponse(res, 500, false, null, null, 'Internal Server Error', err.message);
    }
});

export default router;
