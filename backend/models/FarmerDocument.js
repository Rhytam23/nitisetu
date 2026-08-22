import mongoose from 'mongoose';

const farmerDocumentSchema = new mongoose.Schema({
    farmerId: {
        type: String,
        required: [true, 'farmerId is required'],
        index: true,
        trim: true
    },
    documentType: {
        type: String,
        required: [true, 'documentType is required'],
        enum: [
            'Aadhaar',
            'Land Ownership Record (Jamabandi)',
            'Land Lease Document',
            'Bank Passbook',
            'Crop Certificate',
            'Income Certificate',
            'Caste Certificate',
            'Domicile Certificate',
            'Electricity Bill',
            'Other'
        ],
        index: true
    },
    storageReference: {
        type: String,
        required: [true, 'storageReference is required'],
        unique: true
    },
    originalFilename: {
        type: String,
        required: true,
        trim: true
    },
    mimeType: {
        type: String,
        required: true,
        trim: true
    },
    fileSize: {
        type: Number,
        required: true,
        max: [5242880, 'File size cannot exceed 5MB']
    },
    status: {
        type: String,
        enum: ['Uploaded', 'Processing', 'Processed', 'Verified', 'Needs Review', 'Rejected', 'Expired'],
        default: 'Uploaded',
        index: true
    },
    classificationConfidence: {
        type: Number,
        default: 0.0,
        min: 0.0,
        max: 1.0
    },
    ocrEngineUsed: {
        type: String,
        default: 'Google-Cloud-Vision-OCR'
    },
    farmerConfirmed: {
        type: Boolean,
        default: false,
        index: true
    },
    confirmedAt: {
        type: Date,
        default: null
    },
    extractedFields: {
        ownerName: { type: String, default: null },
        landAcres: { type: Number, default: null },
        surveyNumber: { type: String, default: null },
        khasraNumber: { type: String, default: null },
        village: { type: String, default: null },
        district: { type: String, default: null },
        state: { type: String, default: null },
        location: { type: String, default: null },
        aadhaarMasked: { type: String, default: null },
        bankName: { type: String, default: null },
        accountMasked: { type: String, default: null },
        branch: { type: String, default: null },
        annualIncome: { type: Number, default: null },
        issueDate: { type: Date, default: null }
    },
    fieldConfidence: {
        type: Map,
        of: Number,
        default: {}
    },
    expiryDate: {
        type: Date,
        default: null,
        index: true
    },
    associatedSchemes: [{
        type: String,
        trim: true
    }]
}, {
    timestamps: true
});

// Compound Index for rapid ownership lookup
farmerDocumentSchema.index({ farmerId: 1, documentType: 1 });
farmerDocumentSchema.index({ farmerId: 1, createdAt: -1 });

const FarmerDocument = mongoose.models.FarmerDocument || mongoose.model('FarmerDocument', farmerDocumentSchema);

export default FarmerDocument;
