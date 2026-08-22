import { processEligibilityCheck } from '../services/eligibilityService.js';
import { getSchemeCatalog, discoverEligibleSchemes } from '../services/schemeService.js';
import { sendResponse } from '../middleware/validation.js';
import { logError } from '../middleware/errorHandler.js';

export async function checkEligibility(req, res) {
    try {
        const { result, engine } = await processEligibilityCheck(req.body);
        return sendResponse(res, 200, true, "Eligibility checked successfully.", result, null, { engine });
    } catch (error) {
        logError("FATAL Eligibility Check Error", error);
        return sendResponse(res, 500, false, null, null, 'A critical error occurred in the Niti-Setu processing layer.', error.message);
    }
}

export async function getSchemes(req, res) {
    try {
        const catalog = getSchemeCatalog();
        return sendResponse(res, 200, true, "Scheme catalog retrieved successfully.", catalog);
    } catch (error) {
        logError("GET /api/schemes failed", error);
        return sendResponse(res, 500, false, null, null, "Failed to retrieve scheme catalog", error.message);
    }
}

export async function discoverSchemes(req, res) {
    try {
        const profile = req.body;
        const recommendations = discoverEligibleSchemes(profile);
        return sendResponse(res, 200, true, "Scheme discovery completed successfully.", recommendations);
    } catch (error) {
        logError("POST /api/discover failed", error);
        return sendResponse(res, 500, false, null, null, "Failed to execute scheme discovery", error.message);
    }
}
