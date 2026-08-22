import Notification from '../models/Notification.js';
import { isDBConnected } from '../config/db.js';

class NotificationRepository {
    async create(notificationData) {
        if (!isDBConnected()) return null;
        return await Notification.create(notificationData);
    }

    async findByFarmerId(farmerId, { limit = 20 } = {}) {
        if (!isDBConnected()) return [];
        return await Notification.find({ farmerId })
            .sort({ createdAt: -1 })
            .limit(limit);
    }

    async getUnreadCount(farmerId) {
        if (!isDBConnected()) return 0;
        return await Notification.countDocuments({ farmerId, readAt: null });
    }

    async markAsRead(notificationId, farmerId) {
        if (!isDBConnected()) return null;
        return await Notification.findOneAndUpdate(
            { _id: notificationId, farmerId },
            { readAt: new Date() },
            { new: true }
        );
    }

    async markAllAsRead(farmerId) {
        if (!isDBConnected()) return null;
        return await Notification.updateMany(
            { farmerId, readAt: null },
            { readAt: new Date() }
        );
    }

    async deleteById(notificationId, farmerId) {
        if (!isDBConnected()) return null;
        return await Notification.findOneAndDelete({ _id: notificationId, farmerId });
    }
}

export default new NotificationRepository();
