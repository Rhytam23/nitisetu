import { 
    generatePersonalizedNotifications, 
    getFarmerNotifications, 
    getUnreadNotificationCount, 
    markNotificationAsRead, 
    markAllNotificationsAsRead 
} from '../services/notificationService.js';
import { sendResponse } from '../middleware/validation.js';
import { logError } from '../middleware/errorHandler.js';

export async function getNotificationsHandler(req, res) {
    try {
        const farmerId = req.query.farmerId || req.params.farmerId;
        if (!farmerId) {
            return sendResponse(res, 400, false, null, null, 'farmerId parameter is required');
        }

        const notifications = await getFarmerNotifications(farmerId);
        const unreadCount = await getUnreadNotificationCount(farmerId);

        return sendResponse(res, 200, true, 'Notifications retrieved.', { notifications, unreadCount });
    } catch (error) {
        logError('Get Notifications Error', error);
        return sendResponse(res, 500, false, null, null, 'Failed to fetch notifications', error.message);
    }
}

export async function generateNotificationsHandler(req, res) {
    try {
        const farmerProfile = req.body;
        if (!farmerProfile || (!farmerProfile._id && !farmerProfile.id)) {
            return sendResponse(res, 400, false, null, null, 'Farmer profile with ID is required');
        }

        const normalizedProfile = {
            _id: farmerProfile._id || farmerProfile.id,
            ...farmerProfile
        };

        const notifications = await generatePersonalizedNotifications(normalizedProfile);
        return sendResponse(res, 200, true, 'Notifications generated successfully.', notifications);
    } catch (error) {
        logError('Generate Notifications Error', error);
        return sendResponse(res, 500, false, null, null, 'Failed to generate notifications', error.message);
    }
}

export async function markAsReadHandler(req, res) {
    try {
        const { id } = req.params;
        const { farmerId } = req.body;

        if (!farmerId) {
            return sendResponse(res, 400, false, null, null, 'farmerId is required');
        }

        const updated = await markNotificationAsRead(id, farmerId);
        return sendResponse(res, 200, true, 'Notification marked as read.', updated);
    } catch (error) {
        logError('Mark Read Error', error);
        return sendResponse(res, 500, false, null, null, 'Failed to mark notification read', error.message);
    }
}

export async function markAllReadHandler(req, res) {
    try {
        const { farmerId } = req.body;
        if (!farmerId) {
            return sendResponse(res, 400, false, null, null, 'farmerId is required');
        }

        await markAllNotificationsAsRead(farmerId);
        return sendResponse(res, 200, true, 'All notifications marked as read.');
    } catch (error) {
        logError('Mark All Read Error', error);
        return sendResponse(res, 500, false, null, null, 'Failed to mark all notifications read', error.message);
    }
}
