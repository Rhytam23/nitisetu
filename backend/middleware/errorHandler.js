import fs from 'fs';
import path from 'path';
import { sendResponse } from './validation.js';

export const logError = (msg, err) => {
    const time = new Date().toISOString();
    let sanitizedStack = err?.stack || String(err);
    
    // Mask sensitive keys/passwords if present in error message
    sanitizedStack = sanitizedStack
        .replace(/mongodb\+srv:\/\/[^@]+@/gi, 'mongodb+srv://[REDACTED]@')
        .replace(/AIzaSy[A-Za-z0-9_-]{33}/gi, '[REDACTED_API_KEY]');

    const errorMsg = `[${time}] ${msg}\n${sanitizedStack}\n\n`;
    try {
        fs.appendFileSync('eligibility_error.log', errorMsg);
    } catch (e) {
        console.error('Failed writing to error log:', e.message);
    }
};

export function globalErrorHandler(err, req, res, next) {
    console.error('Global Server Error:', err);
    logError('Global Server Exception', err);
    return sendResponse(res, 500, false, null, null, 'A critical error occurred in the Niti-Setu processing layer.', err.message);
}
