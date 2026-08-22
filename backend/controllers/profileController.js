import mongoose from 'mongoose';
import FarmerRepository from '../repositories/FarmerRepository.js';
import { sendResponse, validateProfileInput } from '../middleware/validation.js';
import { isDBConnected } from '../config/db.js';
import { logError } from '../middleware/errorHandler.js';

function buildProfilePayload(profile, { isUpdate = false } = {}) {
    const normalized = { ...profile };

    if (Object.prototype.hasOwnProperty.call(profile, 'name')) {
        normalized.name = String(profile.name).trim();
    }
    if (Object.prototype.hasOwnProperty.call(profile, 'state')) {
        normalized.state = String(profile.state).trim();
    }
    if (Object.prototype.hasOwnProperty.call(profile, 'crop')) {
        normalized.crop = String(profile.crop || '').trim();
    }
    if (Object.prototype.hasOwnProperty.call(profile, 'land_acres')) {
        normalized.land_acres = Number(profile.land_acres) || 0;
    }
    if (Object.prototype.hasOwnProperty.call(profile, 'age')) {
        normalized.age = profile.age === null || profile.age === '' ? null : parseInt(profile.age, 10);
    }
    if (profile.phone && String(profile.phone).trim() !== '') {
        normalized.phone = String(profile.phone).replace(/\D/g, '');
    } else {
        delete normalized.phone;
    }
    if (profile.aadhaar && String(profile.aadhaar).trim() !== '') {
        normalized.aadhaar = String(profile.aadhaar).replace(/\D/g, '');
    } else {
        delete normalized.aadhaar;
    }

    if (isUpdate) {
        normalized.updatedAt = new Date().toISOString();
    }

    return normalized;
}

export async function createProfile(req, res) {
    try {
        if (!isDBConnected()) {
            return sendResponse(res, 503, false, null, null, 'Database is offline. Profile saving unavailable.');
        }
        const profile = req.body;
        const errors = validateProfileInput(profile);
        if (errors.length > 0) {
            return sendResponse(res, 400, false, null, null, 'Validation failed', errors);
        }

        const newFarmer = buildProfilePayload(profile);
        const createdFarmer = await FarmerRepository.create(newFarmer);
        return sendResponse(res, 201, true, 'Profile saved successfully.', createdFarmer);
    } catch (err) {
        if (err.code === 11000) {
            const field = Object.keys(err.keyValue || {})[0] || 'identifier';
            return sendResponse(res, 409, false, null, null, `A profile with this ${field} already exists.`);
        }
        logError('POST /profile failed', err);
        return sendResponse(res, 500, false, null, null, 'Internal Server Error', err.message);
    }
}

export async function getProfiles(req, res) {
    try {
        if (!isDBConnected()) return sendResponse(res, 503, false, null, null, 'Database offline');
        const farmers = await FarmerRepository.findAll();
        return sendResponse(res, 200, true, 'Profiles retrieved successfully.', farmers, null, { count: farmers.length });
    } catch (err) {
        logError('GET /profile failed', err);
        return sendResponse(res, 500, false, null, null, 'Internal Server Error', err.message);
    }
}

export async function getProfileById(req, res) {
    try {
        if (!isDBConnected()) return sendResponse(res, 503, false, null, null, 'Database offline');
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return sendResponse(res, 400, false, null, null, 'Invalid farmer id');
        }
        const farmer = await FarmerRepository.findById(req.params.id);
        if (!farmer) {
            return sendResponse(res, 404, false, null, null, 'Farmer not found');
        }
        return sendResponse(res, 200, true, 'Profile retrieved successfully.', farmer);
    } catch (err) {
        logError('GET /profile/:id failed', err);
        return sendResponse(res, 500, false, null, null, 'Internal Server Error', err.message);
    }
}

export async function updateProfile(req, res) {
    try {
        if (!isDBConnected()) return sendResponse(res, 503, false, null, null, 'Database offline');
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return sendResponse(res, 400, false, null, null, 'Invalid farmer id');
        }
        const errors = validateProfileInput(req.body, { partial: true });
        if (errors.length > 0) {
            return sendResponse(res, 400, false, null, null, 'Validation failed', errors);
        }

        const updates = buildProfilePayload(req.body, { isUpdate: true });
        delete updates.createdAt;
        delete updates._id;

        const updatedFarmer = await FarmerRepository.update(req.params.id, updates);
        if (!updatedFarmer) {
            return sendResponse(res, 404, false, null, null, 'Farmer not found');
        }

        return sendResponse(res, 200, true, 'Profile updated successfully.', updatedFarmer);
    } catch (err) {
        if (err.code === 11000) {
            const field = Object.keys(err.keyValue || {})[0] || 'identifier';
            return sendResponse(res, 409, false, null, null, `A profile with this ${field} already exists.`);
        }
        logError('PUT /profile/:id failed', err);
        return sendResponse(res, 500, false, null, null, 'Internal Server Error', err.message);
    }
}

export async function deleteProfile(req, res) {
    try {
        if (!isDBConnected()) return sendResponse(res, 503, false, null, null, 'Database offline');
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return sendResponse(res, 400, false, null, null, 'Invalid farmer id');
        }

        const deletedFarmer = await FarmerRepository.delete(req.params.id);
        if (!deletedFarmer) {
            return sendResponse(res, 404, false, null, null, 'Farmer not found');
        }

        return sendResponse(res, 200, true, 'Profile deleted successfully.', deletedFarmer);
    } catch (err) {
        logError('DELETE /profile/:id failed', err);
        return sendResponse(res, 500, false, null, null, 'Internal Server Error', err.message);
    }
}
