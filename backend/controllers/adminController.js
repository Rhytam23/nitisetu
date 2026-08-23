import User from '../models/User.js';
import FarmerDocument from '../models/FarmerDocument.js';
import Notification from '../models/Notification.js';
import AuditLog from '../models/AuditLog.js';
import { sendResponse } from '../middleware/validation.js';
import { logError } from '../middleware/errorHandler.js';

export async function getAdminAnalyticsHandler(req, res) {
    try {
        const totalFarmers = await User.countDocuments({ role: 'FARMER' });
        const totalDocuments = await FarmerDocument.countDocuments({});
        const documentsNeedingReview = await FarmerDocument.countDocuments({ status: 'Needs Review' });
        const documentsProcessed = await FarmerDocument.countDocuments({ status: { $in: ['Processed', 'Verified'] } });
        const totalNotifications = await Notification.countDocuments({});
        const unreadNotifications = await Notification.countDocuments({ readAt: null });

        const analytics = {
            totalFarmers,
            totalDocuments,
            documentsNeedingReview,
            documentsProcessed,
            totalNotifications,
            unreadNotifications,
            vectorStoreStatus: 'Active (207 PDF Chunks Indexed)',
            supportedSchemesCount: 3,
            lastIngestionDate: '2026-08-22'
        };

        return sendResponse(res, 200, true, 'Admin analytics retrieved.', analytics);
    } catch (error) {
        logError('Admin Analytics Error', error);
        return sendResponse(res, 500, false, null, null, 'Failed to fetch admin analytics', error.message);
    }
}

export async function getAdminFarmersHandler(req, res) {
    try {
        const farmers = await User.find({ role: 'FARMER' }).select('-passwordHash').sort({ createdAt: -1 });
        
        // Mask phone PII for privacy compliance
        const maskedFarmers = farmers.map(f => {
            const p = f.phone || '';
            const maskedPhone = p.length >= 4 ? `${p.slice(0, 2)}******${p.slice(-2)}` : '******';
            return {
                _id: f._id,
                name: f.name,
                phoneMasked: maskedPhone,
                state: f.state,
                district: f.district,
                createdAt: f.createdAt
            };
        });

        return sendResponse(res, 200, true, 'Registered farmers list retrieved.', maskedFarmers);
    } catch (error) {
        logError('Admin Farmers Error', error);
        return sendResponse(res, 500, false, null, null, 'Failed to fetch farmers list', error.message);
    }
}

export async function getAdminSchemesHandler(req, res) {
    try {
        const schemes = [
            {
                id: 'PM-KISAN',
                name: 'Pradhan Mantri Kisan Samman Nidhi',
                sourceDocument: 'PM-KISAN.pdf',
                status: 'Active',
                indexedChunks: 89,
                lastUpdated: '2026-08-22'
            },
            {
                id: 'PM-KMY',
                name: 'Pradhan Mantri Kisan Maan-Dhan Yojana',
                sourceDocument: 'PM-KMY - Operational Guidelines.pdf',
                status: 'Active',
                indexedChunks: 64,
                lastUpdated: '2026-08-22'
            },
            {
                id: 'PM-KUSUM',
                name: 'PM Kisan Urja Suraksha evam Utthaan Mahabhiyan',
                sourceDocument: 'PM-KUSUM.pdf',
                status: 'Active',
                indexedChunks: 54,
                lastUpdated: '2026-08-22'
            }
        ];

        return sendResponse(res, 200, true, 'Scheme guidelines status retrieved.', schemes);
    } catch (error) {
        logError('Admin Schemes Error', error);
        return sendResponse(res, 500, false, null, null, 'Failed to fetch schemes status', error.message);
    }
}

export async function getAdminDocumentsQueueHandler(req, res) {
    try {
        const documents = await FarmerDocument.find({}).sort({ createdAt: -1 }).limit(50);
        return sendResponse(res, 200, true, 'Document queue retrieved.', documents);
    } catch (error) {
        logError('Admin Documents Error', error);
        return sendResponse(res, 500, false, null, null, 'Failed to fetch document review queue', error.message);
    }
}

export async function getAdminAuditLogsHandler(req, res) {
    try {
        const logs = await AuditLog.find({}).sort({ createdAt: -1 }).limit(100);
        return sendResponse(res, 200, true, 'Audit logs retrieved.', logs);
    } catch (error) {
        logError('Admin Audit Logs Error', error);
        return sendResponse(res, 500, false, null, null, 'Failed to fetch audit logs', error.message);
    }
}
