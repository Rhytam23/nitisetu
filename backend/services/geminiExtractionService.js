import { ChatGoogleGenerativeAI } from '@langchain/google-genai';

export async function extractStructuredFieldsWithGemini(rawText, requestedDocumentType = 'Other') {
    if (!rawText || rawText.trim().length === 0) {
        return {
            documentType: requestedDocumentType,
            classificationConfidence: 0.0,
            extractedFields: {},
            fieldConfidence: {}
        };
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // Default structure template
    const defaultFields = {
        ownerName: null,
        landAcres: null,
        surveyNumber: null,
        khasraNumber: null,
        village: null,
        district: null,
        state: null,
        issueDate: null,
        aadhaarMasked: null,
        bankName: null,
        accountMasked: null,
        branch: null,
        annualIncome: null,
        expiryDate: null
    };

    const defaultConfidence = {
        ownerName: 0.50,
        landAcres: 0.50,
        khasraNumber: 0.50,
        aadhaarMasked: 0.50,
        bankName: 0.50,
        annualIncome: 0.50
    };

    if (apiKey) {
        try {
            const llm = new ChatGoogleGenerativeAI({
                modelName: 'gemini-1.5-flash',
                apiKey,
                temperature: 0.0
            });

            const prompt = `You are an expert Indian Government Document Analyzer. Parse the following OCR extracted document text.
Extract ONLY fields that are explicitly present in the text. DO NOT fabricate or guess missing values. If a field is missing, set it to null.

Text to analyze:
"""
${rawText}
"""

Requested Document Type Hint: "${requestedDocumentType}"

Return strictly a valid JSON object matching this schema (no markdown blocks around json):
{
  "documentType": "Aadhaar" | "Land Ownership Record (Jamabandi)" | "Bank Passbook" | "Income Certificate" | "Caste Certificate" | "Domicile Certificate" | "Crop Certificate" | "Other",
  "classificationConfidence": number between 0.0 and 1.0,
  "extractedFields": {
    "ownerName": string or null,
    "landAcres": number or null,
    "surveyNumber": string or null,
    "khasraNumber": string or null,
    "village": string or null,
    "district": string or null,
    "state": string or null,
    "issueDate": string (YYYY-MM-DD) or null,
    "aadhaarMasked": string (format: "XXXX-XXXX-1234") or null,
    "bankName": string or null,
    "accountMasked": string (format: "XXXX-XXXX-5678") or null,
    "branch": string or null,
    "annualIncome": number or null,
    "expiryDate": string (YYYY-MM-DD) or null
  },
  "fieldConfidence": {
    "ownerName": number between 0.0 and 1.0,
    "landAcres": number between 0.0 and 1.0,
    "khasraNumber": number between 0.0 and 1.0,
    "aadhaarMasked": number between 0.0 and 1.0,
    "bankName": number between 0.0 and 1.0,
    "annualIncome": number between 0.0 and 1.0
  }
}`;

            const response = await llm.invoke(prompt);
            const content = response.content.replace(/```json/gi, '').replace(/```/g, '').trim();
            const parsed = JSON.parse(content);

            if (parsed && parsed.extractedFields) {
                // Ensure sensitive numbers are masked
                if (parsed.extractedFields.aadhaarMasked && !parsed.extractedFields.aadhaarMasked.startsWith('XXXX')) {
                    const digits = parsed.extractedFields.aadhaarMasked.replace(/\D/g, '');
                    parsed.extractedFields.aadhaarMasked = digits.length >= 4 ? `XXXX-XXXX-${digits.slice(-4)}` : null;
                }

                return {
                    documentType: parsed.documentType || requestedDocumentType,
                    classificationConfidence: Number((parsed.classificationConfidence || 0.85).toFixed(2)),
                    extractedFields: { ...defaultFields, ...parsed.extractedFields },
                    fieldConfidence: { ...defaultConfidence, ...(parsed.fieldConfidence || {}) }
                };
            }
        } catch (e) {
            console.error('Gemini Extraction Notice: Falling back to pattern rules:', e.message);
        }
    }

    // Heuristic Rule Fallback when API Key is offline/mocked
    const lowerText = rawText.toLowerCase();
    let docType = requestedDocumentType;
    let classConf = 0.80;

    if (lowerText.includes('jamabandi') || lowerText.includes('khasra') || lowerText.includes('bhulekh') || lowerText.includes('land record')) {
        docType = 'Land Ownership Record (Jamabandi)';
        classConf = 0.95;
    } else if (lowerText.includes('aadhaar') || lowerText.includes('uidai')) {
        docType = 'Aadhaar';
        classConf = 0.92;
    } else if (lowerText.includes('passbook') || lowerText.includes('ifsc') || lowerText.includes('bank')) {
        docType = 'Bank Passbook';
        classConf = 0.88;
    } else if (lowerText.includes('income certificate') || lowerText.includes('annual income')) {
        docType = 'Income Certificate';
        classConf = 0.90;
    }

    const fields = { ...defaultFields };
    const fieldConf = { ...defaultConfidence };

    // Land match
    const landMatch = rawText.match(/([\d.]+)\s*(acres?|hectares?|ha|acre)/i);
    if (landMatch) {
        let val = parseFloat(landMatch[1]);
        if (landMatch[2].toLowerCase().startsWith('h')) val = Number((val * 2.471).toFixed(2));
        fields.landAcres = val;
        fieldConf.landAcres = 0.94;
    }

    // Khasra match
    const khasraMatch = rawText.match(/(?:khasra|khatauni|survey)\s*(?:no\.?|number)?\s*[:\-]?\s*([\w\/]+)/i);
    if (khasraMatch) {
        fields.khasraNumber = khasraMatch[1];
        fields.surveyNumber = khasraMatch[1];
        fieldConf.khasraNumber = 0.90;
    }

    // Aadhaar match
    const aadhaarMatch = rawText.match(/\b\d{4}\s*\d{4}\s*(\d{4})\b/);
    if (aadhaarMatch) {
        fields.aadhaarMasked = `XXXX-XXXX-${aadhaarMatch[1]}`;
        fieldConf.aadhaarMasked = 0.98;
    }

    // Name match
    const nameMatch = rawText.match(/(?:name|owner|holder)\s*[:\-]?\s*([A-Za-z\s]{3,30})/i);
    if (nameMatch) {
        fields.ownerName = nameMatch[1].trim();
        fieldConf.ownerName = 0.92;
    }

    return {
        documentType: docType,
        classificationConfidence: Number(classConf.toFixed(2)),
        extractedFields: fields,
        fieldConfidence: fieldConf
    };
}
