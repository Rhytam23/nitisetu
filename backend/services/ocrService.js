import { extractRawTextFromDocument } from './ocrEngine.js';
import { extractStructuredFieldsWithGemini } from './geminiExtractionService.js';

export async function processDocumentOCR(fileBuffer, mimeType, requestedType = 'Other') {
    // 1. Raw Text Extraction via ocrEngine (Cloud Vision OCR or Text-Native PDF)
    const ocrResult = await extractRawTextFromDocument(fileBuffer, mimeType);
    const { rawText, confidence: rawConfidence, isTextNative, ocrEngineUsed } = ocrResult;

    // 2. Structured Entity Extraction & Confidence Scoring via Gemini
    const geminiResult = await extractStructuredFieldsWithGemini(rawText, requestedType);
    const { documentType, classificationConfidence, extractedFields, fieldConfidence } = geminiResult;

    // 3. Status Lifecycle Determination (Never mark Verified without authoritative API check)
    let status = 'Processed';
    const lowConfidenceFields = Object.values(fieldConfidence).some(c => c < 0.70);

    if (
        classificationConfidence < 0.75 || 
        rawConfidence < 0.60 || 
        lowConfidenceFields || 
        (documentType === 'Land Ownership Record (Jamabandi)' && (extractedFields.landAcres === null || extractedFields.landAcres === undefined))
    ) {
        status = 'Needs Review';
    }

    return {
        documentType,
        classificationConfidence,
        extractedFields,
        fieldConfidence,
        ocrEngineUsed,
        isTextNative,
        status,
        farmerConfirmed: false
    };
}
