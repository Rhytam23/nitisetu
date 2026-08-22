import { evaluateRAGEligibility } from './ragService.js';
import { evaluateFallbackEligibility } from './fallbackService.js';
import { getApplicationGuidance } from './applicationGuidanceService.js';
import { discoverEligibleSchemes } from './schemeService.js';
import { logError } from '../middleware/errorHandler.js';

const LANGUAGE_MAP = {
    'hi': 'Hindi', 'mr': 'Marathi', 'ta': 'Tamil', 'te': 'Telugu',
    'bn': 'Bengali', 'gu': 'Gujarati', 'kn': 'Kannada', 'ml': 'Malayalam',
    'pa': 'Punjabi', 'as': 'Assamese', 'sa': 'Sanskrit', 'mai': 'Maithili',
    'sat': 'Santali', 'doi': 'Dogri', 'mni': 'Manipuri', 'brx': 'Bodo',
    'kok': 'Konkani', 'ks': 'Kashmiri', 'ne': 'Nepali', 'sd': 'Sindhi', 'en': 'English'
};

const VALID_STATUSES = ['Eligible', 'Not Eligible', 'Pending Review', 'Unable to Determine'];

export async function processEligibilityCheck(requestBody) {
    const { 
        state, district, aadhaar, land_acres, crop, scheme, phone, age, 
        preferred_language = 'en' 
    } = requestBody;

    const targetLanguage = LANGUAGE_MAP[preferred_language] || 'English';
    const activeScheme = scheme || 'PM-KISAN';
    const farmerProfile = { state, district, aadhaar, land_acres, crop, scheme: activeScheme, phone, age };

    let profileText = `Farmer from ${farmerProfile.state || 'Unknown'} (District: ${farmerProfile.district || 'Unknown'}), Landholding: ${parseFloat(farmerProfile.land_acres) || 0} acres, Crop: ${farmerProfile.crop || 'Unknown'}. Scheme requested: ${activeScheme}`;
    if (farmerProfile.aadhaar) profileText += ` | Aadhaar provided: Yes.`;
    if (farmerProfile.age) profileText += ` | Age: ${farmerProfile.age}.`;

    let jsonResult = null;
    let usedFallback = false;

    // 1. Evaluate Primary RAG Pipeline
    try {
        if (!process.env.MONGODB_URI || !process.env.GOOGLE_API_KEY) {
            throw new Error("Configuration incomplete (missing MONGODB_URI or GOOGLE_API_KEY). Switching to logic fallback.");
        }
        
        jsonResult = await evaluateRAGEligibility(profileText, targetLanguage, activeScheme);
        
        // Validate returned status enum
        if (!jsonResult?.status || !VALID_STATUSES.includes(jsonResult.status)) {
            jsonResult.status = 'Pending Review';
        }
    } catch (ragError) {
        console.warn("Niti-Setu RAG Engine Unavailable. Executing Logic Fallback:", ragError.message);
        logError("RAG Pipeline Fallback Triggered", ragError);
        
        usedFallback = true;
        jsonResult = evaluateFallbackEligibility(farmerProfile, activeScheme, targetLanguage);
    }

    // 2. Attach Application Guidance (P1 Priority 7)
    const guidance = getApplicationGuidance(activeScheme, jsonResult.status);
    jsonResult.application_guidance = guidance;

    // 3. Attach Scheme Discovery Matrix (P1 Priority 2)
    const discoveredSchemes = discoverEligibleSchemes(farmerProfile);
    jsonResult.discovered_schemes = discoveredSchemes;

    return {
        result: jsonResult,
        engine: usedFallback ? "Logic-Fallback" : "RAG-AI"
    };
}
