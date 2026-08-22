import mongoose from 'mongoose';

const farmerSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    land_acres: { type: Number, default: 0, min: 0 },
    crop: { type: String, default: '' },
    age: { type: Number, default: null },
    // Use sparse so that multiple farmers can omit phone without triggering duplicate error on "null/empty"
    phone: { type: String, unique: true, sparse: true, trim: true },
    aadhaar: { type: String, unique: true, sparse: true, trim: true }
}, { timestamps: true, strict: false });

const Farmer = mongoose.models.Farmer || mongoose.model('Farmer', farmerSchema);

export default Farmer;
