# Niti-Setu — Data Model Specification

---

## 1. Confirmed Implemented Data Models

### 1.1 Farmer Profile Model (`Farmer.js`) `[IMPLEMENTED]`
- **Collection Name**: `farmers` (Database: `niti-setu`)
- **Schema Location**: [backend/models/Farmer.js](file:///e:/nitisetu/backend/models/Farmer.js)
- **Options**: `{ timestamps: true, strict: false }`

| Field Name | Type | Required | Default | Constraint / Index | Description |
|---|---|---|---|---|---|
| `_id` | ObjectId | System | Auto | Primary Key | MongoDB Unique ID |
| `name` | String | Yes | None | Trimmed, min length 2 | Full name of farmer |
| `state` | String | Yes | None | Trimmed | State of residence |
| `land_acres` | Number | No | 0 | Min: 0 | Total cultivable landholding in acres |
| `crop` | String | No | `""` | Trimmed | Primary crop cultivated (e.g. Wheat) |
| `age` | Number | No | `null` | Integer 18–100 | Age of farmer |
| `phone` | String | No | `undefined` | Unique, Sparse | 10-digit mobile number |
| `aadhaar` | String | No | `undefined` | Unique, Sparse | 12-digit Aadhaar number |
| `createdAt` | Date | System | Auto | Index | Creation timestamp |
| `updatedAt` | Date | System | Auto | None | Last update timestamp |

---

### 1.2 Farmer Document Vault Model (`FarmerDocument.js`) `[IMPLEMENTED]`
- **Collection Name**: `farmer_documents` (Database: `niti-setu`)
- **Schema Location**: [backend/models/FarmerDocument.js](file:///e:/nitisetu/backend/models/FarmerDocument.js)
- **Options**: `{ timestamps: true }`

| Field Name | Type | Required | Default | Constraint / Index | Description |
|---|---|---|---|---|---|
| `_id` | ObjectId | System | Auto | Primary Key | Document Unique ID |
| `farmerId` | String | Yes | None | Compound Index (`farmerId` + `documentType`) | Associated Farmer Profile ID |
| `documentType` | String | Yes | None | Enum | `Aadhaar`, `Land Ownership Record (Jamabandi)`, `Land Lease Document`, `Bank Passbook`, `Crop Certificate`, `Income Certificate`, `Caste Certificate`, `Domicile Certificate`, `Electricity Bill`, `Other` |
| `storageReference` | String | Yes | None | Unique | Secure server UUID storage filename |
| `originalFilename` | String | Yes | None | Trimmed | Original uploaded filename |
| `mimeType` | String | Yes | None | Trimmed | Verified MIME type |
| `fileSize` | Number | Yes | None | Max 5MB | File size in bytes |
| `status` | String | Yes | `Uploaded` | Enum | `Uploaded`, `Processing`, `Verified`, `Needs Review`, `Rejected`, `Expired` |
| `expiryDate` | Date | No | `null` | Index | Expiration date if applicable |
| `associatedSchemes` | Array<String> | No | `[]` | Index | Schemes requiring document |

---

### 1.3 Personalized Farmer Notification Model (`Notification.js`) `[IMPLEMENTED]`
- **Collection Name**: `notifications` (Database: `niti-setu`)
- **Schema Location**: [backend/models/Notification.js](file:///e:/nitisetu/backend/models/Notification.js)
- **Options**: `{ timestamps: true }`

| Field Name | Type | Required | Default | Constraint / Index | Description |
|---|---|---|---|---|---|
| `_id` | ObjectId | System | Auto | Primary Key | Notification Unique ID |
| `farmerId` | String | Yes | None | Compound Index (`farmerId` + `createdAt`) | Target Farmer Profile ID |
| `type` | String | Yes | None | Enum | `SCHEME_AVAILABLE`, `DEADLINE_APPROACHING`, `DOCUMENT_REQUIRED`, `DOCUMENT_EXPIRING`, `APPLICATION_ACTION`, `PROFILE_UPDATE`, `SCHEME_UPDATE` |
| `title` | String | Yes | None | Trimmed | Notification header |
| `message` | String | Yes | None | Trimmed | Explanation of relevance and action |
| `priority` | String | Yes | `medium` | Enum (`high`, `medium`, `low`) | Urgency tier |
| `readAt` | Date | No | `null` | Index | Timestamp when read |
| `action` | Object | No | `{}` | Structure | `{ targetRoute: String, actionLabel: String }` |
| `relatedScheme` | String | No | `""` | Index | Related scheme ID (e.g. `PM-KISAN`) |
| `relatedDocument` | String | No | `""` | Index | Related document type |

---

### 1.4 Scheme Document Vector Model `[IMPLEMENTED]`
- **Collection Name**: `scheme_documents` (Database: `niti-setu`)
- **Atlas Index Name**: `vector_index`
- **Vector Spec**: 3072 dimensions, Cosine similarity over `embedding`

| Field Name | Type | Required | Description |
|---|---|---|---|
| `_id` | ObjectId | System | Primary Key |
| `text` | String | Yes | Text chunk from official policy PDF |
| `embedding` | Array<Number> | Yes | 3072-dimensional vector embedding |
| `metadata.source` | String | Yes | Original PDF filename (e.g. `PM-KISAN.pdf`) |
| `metadata.scheme_name` | String | Yes | Name of scheme (e.g. `PM-KISAN`) |
| `metadata.type` | String | Yes | Document type (`eligibility_guidelines`) |
