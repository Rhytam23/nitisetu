import mongoose from 'mongoose';

const farmerSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    land_acres: { type: Number, default: 0, min: 0 },
    crop: { type: String, default: '' },
    age: { type: Number, default: null },
    phone: { type: String, default: '' },
    aadhaar: { type: String, default: '' }
}, { timestamps: true, strict: false });

const Farmer = mongoose.models.Farmer || mongoose.model('Farmer', farmerSchema);

export default Farmer;
