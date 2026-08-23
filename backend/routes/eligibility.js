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
import { 
    registerFarmerHandler, 
    loginHandler, 
    adminLoginHandler, 
    getCurrentUserHandler, 
    logoutHandler 
} from '../controllers/authController.js';
import { 
    getAdminAnalyticsHandler, 
    getAdminFarmersHandler, 
    getAdminSchemesHandler, 
    getAdminDocumentsQueueHandler, 
    getAdminAuditLogsHandler 
} from '../controllers/adminController.js';
import { authenticateToken, requireRole, enforceOwnership } from '../middleware/authMiddleware.js';

const router = express.Router();
const upload = multer({ 
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Authentication Routes
router.post('/auth/register', registerFarmerHandler);
router.post('/auth/login', loginHandler);
router.post('/auth/admin-login', adminLoginHandler);
router.post('/auth/logout', logoutHandler);
router.get('/auth/me', authenticateToken, getCurrentUserHandler);

// Admin Protected Routes (Role: ADMIN Required)
router.get('/admin/analytics', authenticateToken, requireRole('ADMIN'), getAdminAnalyticsHandler);
router.get('/admin/farmers', authenticateToken, requireRole('ADMIN'), getAdminFarmersHandler);
router.get('/admin/schemes', authenticateToken, requireRole('ADMIN'), getAdminSchemesHandler);
router.get('/admin/documents', authenticateToken, requireRole('ADMIN'), getAdminDocumentsQueueHandler);
router.get('/admin/audit-logs', authenticateToken, requireRole('ADMIN'), getAdminAuditLogsHandler);

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
router.delete('/profile/:id', deleteProfile);

// Farmer Document Vault Routes & OCR Confirmation (Protected with Authentication & Ownership Enforcement)
router.post('/documents/upload', upload.single('file'), uploadDocumentHandler);
router.put('/documents/:id/confirm', confirmDocumentHandler);
router.get('/documents', getDocumentsHandler);
router.get('/documents/:farmerId', authenticateToken, enforceOwnership, getDocumentsHandler);
router.get('/documents/file/:id/download', downloadDocumentHandler);
router.delete('/documents/:id', deleteDocumentHandler);

// Personalized Farmer Notification Routes (Protected with Authentication & Ownership Enforcement)
router.get('/notifications', getNotificationsHandler);
router.get('/notifications/:farmerId', authenticateToken, enforceOwnership, getNotificationsHandler);
router.post('/notifications/generate', generateNotificationsHandler);
router.put('/notifications/:id/read', markAsReadHandler);
router.put('/notifications/read-all', markAllReadHandler);

export default router;
