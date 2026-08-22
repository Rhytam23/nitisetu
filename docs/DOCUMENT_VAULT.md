# Niti-Setu — Farmer Document Vault Specification `[IMPLEMENTED]`

---

## 1. Executive Overview

The **Farmer Document Vault** provides a secure, personal document repository for Indian farmers. Rather than requiring farmers to re-upload key credentials (such as Aadhaar, Jamabandi land records, or bank passbooks) during every scheme evaluation, the vault securely stores document metadata and file references, linking them directly to scheme eligibility checks and application guidance.

---

## 2. Security & Storage Architecture

### Security Controls
- **Data Minimization & Confidentiality**: Uploaded binary files are saved in secure server storage (`backend/uploads/documents/`) using UUID storage references. Only document metadata is persisted in MongoDB (`farmer_documents`).
- **File Validation**: Restricted to safe document types (`application/pdf`, `image/png`, `image/jpeg`, `image/webp`).
- **File Size Ceiling**: Enforced maximum file size limit of **5 MB**.
- **Private Access Control**: Direct public static access to document files is disabled. Files can only be downloaded or viewed via authenticated route `GET /api/documents/:id/download` after verifying ownership (`farmerId`).
- **Log Sanitization**: PII, raw Aadhaar numbers, and storage path credentials are scrubbed from error logs.

---

## 3. Data Model Schema (`farmer_documents`)

| Field Name | Type | Constraints / Description |
|---|---|---|
| `_id` | ObjectId | Primary Key |
| `farmerId` | String | Associated Farmer Profile ID (Indexed) |
| `documentType` | String | Enum: `Aadhaar`, `Land Ownership Record (Jamabandi)`, `Land Lease Document`, `Bank Passbook`, `Crop Certificate`, `Income Certificate`, `Caste Certificate`, `Domicile Certificate`, `Electricity Bill`, `Other` |
| `storageReference` | String | Secure UUID filename stored on server |
| `originalFilename` | String | Original uploaded filename |
| `mimeType` | String | MIME type (`application/pdf`, `image/jpeg`, etc.) |
| `fileSize` | Number | Size in bytes (≤ 5,242,880) |
| `status` | String | Enum: `Uploaded`, `Processing`, `Verified`, `Needs Review`, `Rejected`, `Expired` |
| `uploadedAt` | Date | Timestamp of upload (Default: `Date.now`) |
| `expiryDate` | Date | Optional expiration date |
| `associatedSchemes` | Array[String] | Schemes requiring this document (e.g. `["PM-KISAN", "PM-KMY"]`) |

---

## 4. Document-Scheme Integration

When Niti-Setu evaluates eligibility or renders a **Proof Card**, the engine inspects the farmer's document vault:

```
[ Eligibility Verdict / Proof Card ]
                 ↓
      Extract Required Documents
                 ↓
     Query Vault by farmerId & documentType
       ┌─────────┴─────────┐
       ▼                   ▼
 [ Document Found ]   [ Document Missing ]
       ↓                   ↓
  ✓ Available in Vault   ⚠ Required Document
                         [ Upload to Vault Button ]
```

---

## 5. Implementation Status

- **Storage & Metadata API**: `[IMPLEMENTED]` (`/api/documents/upload`, `/api/documents`, `/api/documents/:id`, `/api/documents/:id/download`, `/api/documents/:id`)
- **Frontend Vault Interface**: `[IMPLEMENTED]` (`DocumentVault.jsx`)
- **Eligibility Integration**: `[IMPLEMENTED]` (`ProofCard.jsx` vault status badge and quick upload bridge)
- **Automated OCR & Classification**: `[PLANNED]` (Metadata and type selection supported; automated OCR extraction reserved for future update)
