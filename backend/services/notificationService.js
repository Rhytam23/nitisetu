import NotificationRepository from '../repositories/NotificationRepository.js';
import DocumentRepository from '../repositories/DocumentRepository.js';
import { discoverEligibleSchemes } from './schemeService.js';

export async function generatePersonalizedNotifications(farmerProfile) {
    if (!farmerProfile || (!farmerProfile._id && !farmerProfile.id)) return [];
    const farmerId = String(farmerProfile._id || farmerProfile.id);

    const generated = [];

    // 1. Scheme Availability Notifications
    const discovered = discoverEligibleSchemes(farmerProfile);
    for (const scheme of discovered) {
        if (scheme.recommended) {
            generated.push({
                farmerId,
                type: 'SCHEME_AVAILABLE',
                title: `New Eligible Benefit: ${scheme.id}`,
                message: `Based on your ${farmerProfile.land_acres || 0}-acre landholding in ${farmerProfile.state || 'your state'}, you qualify for ${scheme.name}.`,
                priority: 'high',
                action: {
                    targetRoute: '/check',
                    actionLabel: 'Check Eligibility & Evidence'
                },
                relatedScheme: scheme.id
            });
        }
    }

    // 2. Fetch Vault Documents
    const vaultDocs = await DocumentRepository.findByFarmerId(farmerId);
    const availableTypes = new Set(vaultDocs.map(d => d.documentType));

    // 3. Profile Mismatch Detection (Profile vs Document OCR Extracted Data)
    for (const doc of vaultDocs) {
        if (doc.extractedFields && doc.extractedFields.landAcres !== null && doc.extractedFields.landAcres !== undefined) {
            const docLand = Number(doc.extractedFields.landAcres);
            const profileLand = Number(farmerProfile.land_acres || 0);

            if (Math.abs(docLand - profileLand) > 0.1) {
                generated.push({
                    farmerId,
                    type: 'PROFILE_MISMATCH',
                    title: `Profile Land Mismatch Detected`,
                    message: `Your uploaded ${doc.documentType} shows ${docLand} acres, but your profile currently states ${profileLand} acres. Click below to review.`,
                    priority: 'high',
                    action: {
                        targetRoute: '/vault',
                        actionLabel: 'Review Profile & Document'
                    },
                    relatedDocument: doc.documentType
                });
            }
        }
    }

    // 4. Missing Document Notifications
    const coreRequiredDocs = [
        { type: 'Aadhaar', name: 'Aadhaar Card' },
        { type: 'Land Ownership Record (Jamabandi)', name: 'Land Record (Jamabandi / Khasra)' },
        { type: 'Bank Passbook', name: 'Bank Passbook' }
    ];

    for (const doc of coreRequiredDocs) {
        if (!availableTypes.has(doc.type)) {
            generated.push({
                farmerId,
                type: 'DOCUMENT_REQUIRED',
                title: `Missing Document: ${doc.name}`,
                message: `Please upload your ${doc.name} to the Farmer Document Vault to complete PM-KISAN & PM-KMY application verification.`,
                priority: 'medium',
                action: {
                    targetRoute: '/vault',
                    actionLabel: 'Upload Document to Vault'
                },
                relatedDocument: doc.type
            });
        }
    }

    // 5. Verified Document Expiry Notifications (ONLY if verified expiryDate exists)
    const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    for (const doc of vaultDocs) {
        if (doc.expiryDate && new Date(doc.expiryDate) <= thirtyDaysFromNow) {
            generated.push({
                farmerId,
                type: 'DOCUMENT_EXPIRING',
                title: `Document Expiry Warning: ${doc.documentType}`,
                message: `Your uploaded ${doc.documentType} expires on ${new Date(doc.expiryDate).toLocaleDateString()}. Please upload an updated copy.`,
                priority: 'medium',
                action: {
                    targetRoute: '/vault',
                    actionLabel: 'Replace Document'
                },
                relatedDocument: doc.documentType
            });
        }
    }

    // Persist new unique notifications in DB
    const storedNotifications = [];
    for (const notif of generated) {
        const stored = await NotificationRepository.create(notif);
        if (stored) storedNotifications.push(stored);
        else storedNotifications.push({ _id: `notif_${Math.random()}`, ...notif, createdAt: new Date(), readAt: null });
    }

    return storedNotifications;
}

export async function getFarmerNotifications(farmerId) {
    if (!farmerId) return [];
    return await NotificationRepository.findByFarmerId(farmerId);
}

export async function getUnreadNotificationCount(farmerId) {
    if (!farmerId) return 0;
    return await NotificationRepository.getUnreadCount(farmerId);
}

export async function markNotificationAsRead(notificationId, farmerId) {
    return await NotificationRepository.markAsRead(notificationId, farmerId);
}

export async function markAllNotificationsAsRead(farmerId) {
    return await NotificationRepository.markAllAsRead(farmerId);
}
