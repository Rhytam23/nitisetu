import { createRequire } from 'module';
import path from 'path';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

export async function extractRawTextFromDocument(fileBuffer, mimeType) {
    if (!fileBuffer) {
        return {
            rawText: '',
            confidence: 0.0,
            isTextNative: false,
            ocrEngineUsed: 'None'
        };
    }

    // 1. Optimization for Text-Native PDFs
    if (mimeType === 'application/pdf') {
        try {
            const parsed = await pdfParse(fileBuffer);
            const text = (parsed.text || '').trim();
            if (text.length > 40) {
                return {
                    rawText: text,
                    confidence: 0.95,
                    isTextNative: true,
                    ocrEngineUsed: 'Text-Native-Parser'
                };
            }
        } catch (e) {
            console.log('PDF text-native check failed, routing to Cloud Vision OCR...');
        }
    }

    // 2. Production OCR: Google Cloud Vision API
    const apiKey = process.env.GOOGLE_CLOUD_VISION_API_KEY || process.env.GEMINI_API_KEY;
    if (apiKey) {
        try {
            const base64Image = fileBuffer.toString('base64');
            const visionUrl = `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`;

            const response = await fetch(visionUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    requests: [
                        {
                            image: { content: base64Image },
                            features: [{ type: 'DOCUMENT_TEXT_DETECTION' }]
                        }
                    ]
                })
            });

            const visionData = await response.json();
            const fullTextAnnotation = visionData.responses?.[0]?.fullTextAnnotation;
            const text = fullTextAnnotation?.text || visionData.responses?.[0]?.textAnnotations?.[0]?.description || '';

            if (text && text.trim().length > 0) {
                return {
                    rawText: text.trim(),
                    confidence: 0.92,
                    isTextNative: false,
                    ocrEngineUsed: 'Google-Cloud-Vision-OCR'
                };
            }
        } catch (err) {
            console.error('Google Cloud Vision API Error:', err.message);
        }
    }

    // Heuristic string extraction for test/fallback buffers
    const fallbackText = fileBuffer.toString('utf8').replace(/[\x00-\x1F\x7F-\x9F]/g, ' ').trim();
    return {
        rawText: fallbackText,
        confidence: fallbackText.length > 20 ? 0.75 : 0.40,
        isTextNative: false,
        ocrEngineUsed: 'Raw-Buffer-Extractor'
    };
}
