import User from '../models/User.js';
import { hashPassword, comparePassword, signJWT } from '../middleware/authMiddleware.js';
import { sendResponse } from '../middleware/validation.js';
import { logError } from '../middleware/errorHandler.js';
import AuditLog from '../models/AuditLog.js';

export async function registerFarmerHandler(req, res) {
    try {
        const { name, phone, password, state, district } = req.body;

        if (!name || !phone || !password) {
            return sendResponse(res, 400, false, null, null, 'Name, phone, and password are required for registration.');
        }

        const existingUser = await User.findOne({ phone: phone.trim() });
        if (existingUser) {
            return sendResponse(res, 409, false, null, null, 'An account with this phone number already exists.');
        }

        const passwordHash = hashPassword(password);

        const newUser = await User.create({
            name: name.trim(),
            phone: phone.trim(),
            passwordHash,
            role: 'FARMER',
            state: state || 'Uttar Pradesh',
            district: district || 'Lucknow'
        });

        const tokenPayload = {
            userId: String(newUser._id),
            _id: String(newUser._id),
            name: newUser.name,
            phone: newUser.phone,
            role: newUser.role,
            state: newUser.state,
            district: newUser.district
        };

        const token = signJWT(tokenPayload);

        return sendResponse(res, 201, true, 'Farmer account registered successfully.', {
            user: tokenPayload,
            token
        });
    } catch (error) {
        logError('Farmer Registration Error', error);
        return sendResponse(res, 500, false, null, null, 'Registration failed', error.message);
    }
}

export async function loginHandler(req, res) {
    try {
        const { identifier, phone, email, password } = req.body;
        const loginId = (identifier || phone || email || '').trim();

        if (!loginId || !password) {
            return sendResponse(res, 400, false, null, null, 'Phone/Email identifier and password are required.');
        }

        // Check for seeded Admin environment credentials first
        const adminEmailEnv = process.env.ADMIN_EMAIL || 'admin@nitisetu.gov.in';
        const adminPasswordEnv = process.env.ADMIN_PASSWORD || 'NitiSetuAdmin2026!';

        if ((loginId === adminEmailEnv || loginId === 'admin') && password === adminPasswordEnv) {
            const adminPayload = {
                userId: 'admin_sys_01',
                _id: 'admin_sys_01',
                name: 'System Administrator',
                email: adminEmailEnv,
                role: 'ADMIN'
            };
            const token = signJWT(adminPayload);

            try {
                await AuditLog.create({
                    adminId: 'admin_sys_01',
                    adminEmail: adminEmailEnv,
                    action: 'ADMIN_LOGIN',
                    target: 'System Platform',
                    details: 'Admin authenticated via seed environment credentials'
                });
            } catch (e) {}

            return sendResponse(res, 200, true, 'Admin login successful.', {
                user: adminPayload,
                token
            });
        }

        // Find user by phone or email
        const user = await User.findOne({
            $or: [{ phone: loginId }, { email: loginId.toLowerCase() }]
        });

        if (!user) {
            return sendResponse(res, 401, false, null, null, 'Invalid credentials. User account not found.');
        }

        const isMatch = comparePassword(password, user.passwordHash);
        if (!isMatch) {
            return sendResponse(res, 401, false, null, null, 'Invalid credentials. Password incorrect.');
        }

        const tokenPayload = {
            userId: String(user._id),
            _id: String(user._id),
            name: user.name,
            phone: user.phone,
            email: user.email,
            role: user.role,
            state: user.state,
            district: user.district
        };

        const token = signJWT(tokenPayload);

        return sendResponse(res, 200, true, 'Login successful.', {
            user: tokenPayload,
            token
        });
    } catch (error) {
        logError('Login Error', error);
        return sendResponse(res, 500, false, null, null, 'Login processing failed', error.message);
    }
}

export async function adminLoginHandler(req, res) {
    try {
        const { email, password } = req.body;
        const adminEmailEnv = process.env.ADMIN_EMAIL || 'admin@nitisetu.gov.in';
        const adminPasswordEnv = process.env.ADMIN_PASSWORD || 'NitiSetuAdmin2026!';

        if (!email || !password) {
            return sendResponse(res, 400, false, null, null, 'Admin email and password are required.');
        }

        if (email.trim() === adminEmailEnv && password === adminPasswordEnv) {
            const adminPayload = {
                userId: 'admin_sys_01',
                _id: 'admin_sys_01',
                name: 'System Administrator',
                email: adminEmailEnv,
                role: 'ADMIN'
            };
            const token = signJWT(adminPayload);

            try {
                await AuditLog.create({
                    adminId: 'admin_sys_01',
                    adminEmail: adminEmailEnv,
                    action: 'ADMIN_LOGIN',
                    target: 'System Platform',
                    details: 'Admin authenticated via seed credentials'
                });
            } catch (e) {}

            return sendResponse(res, 200, true, 'Admin login successful.', {
                user: adminPayload,
                token
            });
        }

        return sendResponse(res, 401, false, null, null, 'Invalid admin credentials.');
    } catch (error) {
        logError('Admin Login Error', error);
        return sendResponse(res, 500, false, null, null, 'Admin login failed', error.message);
    }
}

export async function getCurrentUserHandler(req, res) {
    return sendResponse(res, 200, true, 'Authenticated user context retrieved.', {
        user: req.user
    });
}

export async function logoutHandler(req, res) {
    return sendResponse(res, 200, true, 'User logged out successfully.');
}
