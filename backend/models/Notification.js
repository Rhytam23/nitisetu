import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    farmerId: {
        type: String,
        required: [true, 'farmerId is required'],
        index: true,
        trim: true
    },
    type: {
        type: String,
        required: [true, 'notification type is required'],
        enum: [
            'SCHEME_AVAILABLE',
            'DEADLINE_APPROACHING',
            'DOCUMENT_REQUIRED',
            'DOCUMENT_EXPIRING',
            'PROFILE_MISMATCH',
            'APPLICATION_ACTION',
            'PROFILE_UPDATE',
            'SCHEME_UPDATE'
        ],
        index: true
    },
    title: {
        type: String,
        required: [true, 'title is required'],
        trim: true
    },
    message: {
        type: String,
        required: [true, 'message is required'],
        trim: true
    },
    priority: {
        type: String,
        enum: ['high', 'medium', 'low'],
        default: 'medium',
        index: true
    },
    readAt: {
        type: Date,
        default: null,
        index: true
    },
    action: {
        targetRoute: { type: String, default: '' },
        actionLabel: { type: String, default: 'View Action' }
    },
    relatedScheme: {
        type: String,
        default: '',
        index: true
    },
    relatedDocument: {
        type: String,
        default: '',
        index: true
    }
}, {
    timestamps: true
});

// Compound Index for efficient unread and chronological queries
notificationSchema.index({ farmerId: 1, readAt: 1, createdAt: -1 });

const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);

export default Notification;
