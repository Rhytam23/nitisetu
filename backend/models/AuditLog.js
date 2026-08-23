import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
    adminId: {
        type: String,
        required: true,
        index: true
    },
    adminEmail: {
        type: String,
        required: true
    },
    action: {
        type: String,
        required: true,
        index: true
    },
    target: {
        type: String,
        default: 'System'
    },
    details: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

const AuditLog = mongoose.models.AuditLog || mongoose.model('AuditLog', auditLogSchema);

export default AuditLog;
