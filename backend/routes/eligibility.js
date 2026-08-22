import express from 'express';
import { checkEligibility, getSchemes, discoverSchemes } from '../controllers/eligibilityController.js';
import { 
    createProfile, 
    getProfiles, 
    getProfileById, 
    updateProfile, 
    deleteProfile 
} from '../controllers/profileController.js';
import { requireAuth } from '../middleware/validation.js';

const router = express.Router();

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

export default router;
