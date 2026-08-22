import { 
    uploadFarmerDocument, 
    confirmFarmerDocument,
    getFarmerDocuments, 
    getDocumentById, 
    getDocumentFilePath, 
    deleteFarmerDocument 
} from '../services/documentService.js';
import { sendResponse } from '../middleware/validation.js';
import { logError } from '../middleware/errorHandler.js';

export async function uploadDocumentHandler(req, res) {
    try {
        const { farmerId, documentType, expiryDate, associatedSchemes } = req.body;
        const file = req.file;

        if (!farmerId || !documentType) {
            return sendResponse(res, 400, false, null, null, 'farmerId and documentType are required');
        }
        if (!file) {
            return sendResponse(res, 400, false, null, null, 'No document file uploaded');
        }

        const doc = await uploadFarmerDocument({
            farmerId,
            documentType,
            file,
            expiryDate,
            associatedSchemes: associatedSchemes ? JSON.parse(associatedSchemes) : []
        });

        return sendResponse(res, 201, true, 'Document uploaded & processed via OCR pipeline.', doc);
    } catch (error) {
        logError('Document Upload Error', error);
        return sendResponse(res, 400, false, null, null, error.message);
    }
}

export async function confirmDocumentHandler(req, res) {
    try {
        const { id } = req.params;
        const { farmerId, updatedFields } = req.body;

        if (!farmerId) {
            return sendResponse(res, 400, false, null, null, 'farmerId is required');
        }

        const updatedDoc = await confirmFarmerDocument(id, farmerId, updatedFields || {});
        return sendResponse(res, 200, true, 'Document extracted parameters confirmed by farmer.', updatedDoc);
    } catch (error) {
        logError('Confirm Document Error', error);
        return sendResponse(res, 400, false, null, null, error.message);
    }
}

export async function getDocumentsHandler(req, res) {
    try {
        const farmerId = req.query.farmerId || req.params.farmerId;
        if (!farmerId) {
            return sendResponse(res, 400, false, null, null, 'farmerId parameter is required');
        }

        const documents = await getFarmerDocuments(farmerId);
        return sendResponse(res, 200, true, 'Farmer document vault retrieved.', documents);
    } catch (error) {
        logError('Get Documents Error', error);
        return sendResponse(res, 500, false, null, null, 'Failed to fetch document vault', error.message);
    }
}

export async function downloadDocumentHandler(req, res) {
    try {
        const { id } = req.params;
        const doc = await getDocumentById(id);
        if (!doc) {
            return sendResponse(res, 404, false, null, null, 'Document metadata not found');
        }

        const filePath = await getDocumentFilePath(doc.storageReference);
        if (!filePath) {
            return sendResponse(res, 404, false, null, null, 'Document file not found on storage');
        }

        res.setHeader('Content-Type', doc.mimeType);
        res.setHeader('Content-Disposition', `inline; filename="${doc.originalFilename}"`);
        return res.sendFile(filePath);
    } catch (error) {
        logError('Download Document Error', error);
        return sendResponse(res, 500, false, null, null, 'Failed to serve document file', error.message);
    }
}

export async function deleteDocumentHandler(req, res) {
    try {
        const { id } = req.params;
        const farmerId = req.query.farmerId || req.body.farmerId;

        await deleteFarmerDocument(id, farmerId);
        return sendResponse(res, 200, true, 'Document deleted successfully from vault.');
    } catch (error) {
        logError('Delete Document Error', error);
        return sendResponse(res, 400, false, null, null, error.message);
    }
}
