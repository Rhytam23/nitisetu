import express from 'express';
import multer from 'multer';
import { checkEligibility, getSchemes, discoverSchemes } from '../controllers/eligibilityController.js';
import { 
    createProfile, 
    getProfiles, 
    getProfileById, 
    updateProfile, 
    deleteProfile 
} from '../controllers/profileController.js';
import { 
    uploadDocumentHandler, 
    confirmDocumentHandler,
    getDocumentsHandler, 
    downloadDocumentHandler, 
    deleteDocumentHandler 
} from '../controllers/documentController.js';
import { 
    getNotificationsHandler, 
    generateNotificationsHandler, 
    markAsReadHandler, 
    markAllReadHandler 
} from '../controllers/notificationController.js';
import { requireAuth } from '../middleware/validation.js';

const router = express.Router();
const upload = multer({ 
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Scheme Discovery Routes
router.get('/schemes', getSchemes);
router.post('/discover', discoverSchemes);

// Eligibility Evaluation Route
router.post('/check', checkEligibility);

// Farmer Profile CRUD Routes
router.post('/profile', createProfile);
router.get('/profile', getProfiles);
router.get('/profile/:id', getProfileById);
router.put('/profile/:id', updateProfile);
router.delete('/profile/:id', requireAuth, deleteProfile);

// Farmer Document Vault Routes & OCR Confirmation
router.post('/documents/upload', upload.single('file'), uploadDocumentHandler);
router.put('/documents/:id/confirm', confirmDocumentHandler);
router.get('/documents', getDocumentsHandler);
router.get('/documents/:farmerId', getDocumentsHandler);
router.get('/documents/file/:id/download', downloadDocumentHandler);
router.delete('/documents/:id', requireAuth, deleteDocumentHandler);

// Personalized Farmer Notification Routes
router.get('/notifications', getNotificationsHandler);
router.get('/notifications/:farmerId', getNotificationsHandler);
router.post('/notifications/generate', generateNotificationsHandler);
router.put('/notifications/:id/read', markAsReadHandler);
router.put('/notifications/read-all', markAllReadHandler);

export default router;
