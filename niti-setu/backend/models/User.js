import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    email: { 
        type: String, 
        required: true, 
        unique: true, 
        lowercase: true, 
        trim: true 
    },
    password: { 
        type: String, 
        required: true 
    },
    name: { 
        type: String, 
        required: true 
    },
    phone: { 
        type: String, 
        sparse: true, 
        unique: true 
    },
    role: { 
        type: String, 
        enum: ['farmer', 'admin'], 
        default: 'farmer' 
    }
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;
