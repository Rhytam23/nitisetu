import path from 'path';
import fs from 'fs';
import DocumentRepository from '../repositories/DocumentRepository.js';
import { processDocumentOCR } from './ocrService.js';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'documents');

if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export const ALLOWED_MIME_TYPES = [
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/webp',
    'text/plain'
];

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export async function uploadFarmerDocument({ farmerId, documentType, file, expiryDate, associatedSchemes = [] }) {
    if (!farmerId) throw new Error('farmerId is required for document upload');
    if (!documentType) throw new Error('documentType is required');
    if (!file) throw new Error('No file payload uploaded');

    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        throw new Error('Unsupported file format. Please upload PDF, PNG, JPEG, WEBP, or TXT.');
    }

    if (file.size > MAX_FILE_SIZE) {
        throw new Error('File size exceeds the 5MB maximum limit.');
    }

    const fileExt = path.extname(file.originalname).toLowerCase() || '.bin';
    const uuid = Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
    const storageReference = `${uuid}${fileExt}`;
    const destinationPath = path.join(UPLOAD_DIR, storageReference);

    // Save file buffer securely outside public asset tree
    fs.writeFileSync(destinationPath, file.buffer);

    // Execute OCR & Gemini Structured Extraction Pipeline
    const ocrResult = await processDocumentOCR(file.buffer, file.mimetype, documentType);

    const docMetadata = {
        farmerId,
        documentType: ocrResult.documentType || documentType,
        storageReference,
        originalFilename: file.originalname,
        mimeType: file.mimetype,
        fileSize: file.size,
        status: ocrResult.status || 'Uploaded',
        classificationConfidence: ocrResult.classificationConfidence || 0.85,
        ocrEngineUsed: ocrResult.ocrEngineUsed || 'Google-Cloud-Vision-OCR',
        extractedFields: ocrResult.extractedFields || {},
        fieldConfidence: ocrResult.fieldConfidence || {},
        farmerConfirmed: false,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        associatedSchemes: Array.isArray(associatedSchemes) ? associatedSchemes : [associatedSchemes]
    };

    const savedDoc = await DocumentRepository.create(docMetadata);

    return savedDoc || {
        _id: `doc_${uuid}`,
        ...docMetadata,
        createdAt: new Date()
    };
}

export async function confirmFarmerDocument(docId, farmerId, updatedFields = {}) {
    const doc = await DocumentRepository.findById(docId);
    if (!doc) throw new Error('Document metadata not found');

    const mergedFields = { ...doc.extractedFields, ...updatedFields };

    const updated = await DocumentRepository.update(docId, {
        extractedFields: mergedFields,
        farmerConfirmed: true,
        confirmedAt: new Date(),
        status: 'Processed'
    });

    return updated;
}

export async function getFarmerDocuments(farmerId) {
    if (!farmerId) return [];
    return await DocumentRepository.findByFarmerId(farmerId);
}

export async function getDocumentById(docId) {
    return await DocumentRepository.findById(docId);
}

export async function getDocumentFilePath(storageReference) {
    const filePath = path.join(UPLOAD_DIR, storageReference);
    if (!fs.existsSync(filePath)) return null;
    return filePath;
}

export async function deleteFarmerDocument(docId, farmerId) {
    const doc = await DocumentRepository.findById(docId);
    if (!doc) throw new Error('Document not found');
    
    // Verify ownership
    if (doc.farmerId !== farmerId && process.env.NODE_ENV === 'production') {
        throw new Error('Unauthorized document deletion request');
    }

    const filePath = path.join(UPLOAD_DIR, doc.storageReference);
    if (fs.existsSync(filePath)) {
        try {
            fs.unlinkSync(filePath);
        } catch (e) {
            console.error('Error removing local file:', e);
        }
    }

    await DocumentRepository.deleteById(docId);
    return true;
}
