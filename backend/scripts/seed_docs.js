import mongoose from 'mongoose';
import dotenv from 'dotenv';
import FarmerDocument from '../models/FarmerDocument.js';

dotenv.config();

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const farmerId = 'demo_farmer_1';

  // Clear previous demo docs if any
  await FarmerDocument.deleteMany({ farmerId });

  const docs = [
    {
      farmerId,
      documentType: 'Aadhaar',
      storageReference: 'aadhaar_ramesh_kumar.pdf',
      originalFilename: 'Aadhaar_Card_Ramesh_Kumar.pdf',
      mimeType: 'application/pdf',
      fileSize: 450000,
      status: 'Verified',
      classificationConfidence: 0.98,
      ocrEngineUsed: 'Google-Cloud-Vision-OCR',
      farmerConfirmed: true,
      confirmedAt: new Date(),
      extractedFields: {
        ownerName: 'Ramesh Kumar',
        aadhaarMasked: 'XXXX-XXXX-8921',
        location: 'Lucknow, Uttar Pradesh'
      },
      associatedSchemes: ['PM-KISAN', 'PM-KMY']
    },
    {
      farmerId,
      documentType: 'Land Ownership Record (Jamabandi)',
      storageReference: 'jamabandi_khata_892.pdf',
      originalFilename: 'Jamabandi_RoR_Lucknow.pdf',
      mimeType: 'application/pdf',
      fileSize: 1200000,
      status: 'Verified',
      classificationConfidence: 0.95,
      ocrEngineUsed: 'Google-Cloud-Vision-OCR',
      farmerConfirmed: true,
      confirmedAt: new Date(),
      extractedFields: {
        ownerName: 'Ramesh Kumar',
        landAcres: 2.5,
        khasraNumber: '142/A',
        village: 'Malihabad',
        district: 'Lucknow',
        state: 'Uttar Pradesh'
      },
      associatedSchemes: ['PM-KISAN', 'PM-KUSUM']
    },
    {
      farmerId,
      documentType: 'Bank Passbook',
      storageReference: 'bank_passbook_sbi.pdf',
      originalFilename: 'SBI_Passbook_FrontPage.pdf',
      mimeType: 'application/pdf',
      fileSize: 850000,
      status: 'Needs Review',
      classificationConfidence: 0.89,
      ocrEngineUsed: 'Google-Cloud-Vision-OCR',
      farmerConfirmed: false,
      extractedFields: {
        ownerName: 'Ramesh Kumar',
        bankName: 'State Bank of India',
        accountMasked: 'XXXXXX4892',
        branch: 'Malihabad Main Branch'
      },
      associatedSchemes: ['PM-KISAN']
    }
  ];

  await FarmerDocument.insertMany(docs);
  console.log('Seeded 3 real documents into Document Vault for demo_farmer_1!');
  await mongoose.disconnect();
}

seed().catch(console.error);
