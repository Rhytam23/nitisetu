import crypto from 'crypto';
import { sendResponse } from './validation.js';

const JWT_SECRET = process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET || 'nitisetu_secure_jwt_secret_key_2026_prod';

// Password Hashing using Node native crypto.scrypt
export function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString('hex');
    const derivedKey = crypto.scryptSync(password, salt, 64).toString('hex');
    return `${salt}:${derivedKey}`;
}

export function comparePassword(password, storedHash) {
    if (!storedHash || !storedHash.includes(':')) return false;
    const [salt, key] = storedHash.split(':');
    const derivedKey = crypto.scryptSync(password, salt, 64).toString('hex');
    return crypto.timingSafeEqual(Buffer.from(key, 'hex'), Buffer.from(derivedKey, 'hex'));
}

// HMAC-SHA256 JWT Token Generation & Verification
export function signJWT(payload, expiresInSeconds = 86400) {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
    const body = Buffer.from(JSON.stringify({ ...payload, exp })).toString('base64url');
    
    const signature = crypto
        .createHmac('sha256', JWT_SECRET)
        .update(`${header}.${body}`)
        .digest('base64url');

    return `${header}.${body}.${signature}`;
}

export function verifyJWT(token) {
    if (!token || typeof token !== 'string') return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [header, body, signature] = parts;
    const expectedSignature = crypto
        .createHmac('sha256', JWT_SECRET)
        .update(`${header}.${body}`)
        .digest('base64url');

    if (signature !== expectedSignature) return null;

    try {
        const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
        if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
            return null; // Expired
        }
        return payload;
    } catch (e) {
        return null;
    }
}

// Authentication Middleware
export function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'] || req.headers['x-access-token'];
    let token = null;

    if (authHeader) {
        if (authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7).trim();
        } else {
            token = authHeader.trim();
        }
    }

    if (!token) {
        return sendResponse(res, 401, false, null, null, 'Authentication required. Please log in.');
    }

    const decoded = verifyJWT(token);
    if (!decoded) {
        return sendResponse(res, 401, false, null, null, 'Invalid or expired session. Please log in again.');
    }

    req.user = decoded;
    next();
}

// Role-Based Access Control Middleware
export function requireRole(requiredRole) {
    return (req, res, next) => {
        if (!req.user) {
            return sendResponse(res, 401, false, null, null, 'Authentication required.');
        }

        if (req.user.role !== requiredRole && req.user.role !== 'ADMIN') {
            return sendResponse(res, 403, false, null, null, `Forbidden. Requires ${requiredRole} privileges.`);
        }

        next();
    };
}

// Resource Ownership Protection Middleware (Farmer A cannot access Farmer B's data)
export function enforceOwnership(req, res, next) {
    if (!req.user) {
        return sendResponse(res, 401, false, null, null, 'Authentication required.');
    }

    // Admins have override privileges
    if (req.user.role === 'ADMIN') {
        return next();
    }

    const requestedFarmerId = req.params.farmerId || req.query.farmerId || req.body.farmerId;
    
    if (requestedFarmerId && requestedFarmerId !== req.user.userId && requestedFarmerId !== req.user._id) {
        return sendResponse(res, 403, false, null, null, 'Forbidden. You do not have permission to access another farmer\'s data.');
    }

    next();
}
