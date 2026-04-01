import express from 'express';
import User from '../models/User.js';

const router = express.Router();

const sendResponse = (res, statusCode, success, message, data = null, error = null) => {
    return res.status(statusCode).json({ success, message, data, error });
};

// Register endpoint
router.post('/register', async (req, res) => {
    try {
        const { email, password, name, phone } = req.body;

        if (!email || !password || !name) {
            return sendResponse(res, 400, false, 'Missing required fields: email, password, and name are required.');
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return sendResponse(res, 400, false, 'User already exists with this email.');
        }

        const newUser = await User.create({ email, password, name, phone });

        // For this MVP, we omit password in the response
        const userResponse = newUser.toObject();
        delete userResponse.password;

        return sendResponse(res, 201, true, 'User registered successfully.', userResponse);
    } catch (err) {
        return sendResponse(res, 500, false, null, null, err.message);
    }
});

// Login endpoint (Simple password check for MVP)
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return sendResponse(res, 400, false, 'Email and password are required.');
        }

        const user = await User.findOne({ email });
        if (!user || user.password !== password) {
            return sendResponse(res, 401, false, 'Invalid email or password.');
        }

        const userResponse = user.toObject();
        delete userResponse.password;

        return sendResponse(res, 200, true, 'Login successful.', { 
            user: userResponse, 
            token: 'mock-jwt-token-niti' 
        });
    } catch (err) {
        return sendResponse(res, 500, false, null, null, err.message);
    }
});

export default router;
