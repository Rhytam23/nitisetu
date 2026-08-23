import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        unique: true,
        trim: true,
        index: true
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        default: null
    },
    passwordHash: {
        type: String,
        required: [true, 'Password hash is required']
    },
    role: {
        type: String,
        enum: ['FARMER', 'ADMIN'],
        default: 'FARMER',
        index: true
    },
    state: {
        type: String,
        default: 'Uttar Pradesh',
        trim: true
    },
    district: {
        type: String,
        default: 'Lucknow',
        trim: true
    }
}, {
    timestamps: true
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;
