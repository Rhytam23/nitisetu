# Niti-Setu — Complete Backend API Specification & Integration Contract

---

## 1. Architecture & Service Layer Security Model

Niti-Setu strictly adheres to a 4-tier decoupled service architecture:

```
[ React + Vite Frontend ]
           │
           │  (HTTPS / REST / JSON)
           v
[ Express.js Backend API ]  <--- Validates JWT, Roles & Resource Ownership
           │
           ├───► [ MongoDB Atlas Cloud ]  (Database & Vector Search Index: 207 chunks)
           ├───► [ Google Cloud Vision API ]  (DOCUMENT_TEXT_DETECTION for scanned documents)
           └───► [ Gemini 1.5 Flash LLM ]  (Structured Entity Extraction & Grounded Reasoning)
```

### Security Directives
- **Zero Frontend Secret Exposure**: `MONGODB_URI`, `GOOGLE_API_KEY`, `GOOGLE_CLOUD_VISION_API_KEY`, and `ADMIN_JWT_SECRET` remain strictly server-side in `backend/.env`.
- **Derived Ownership**: User ownership is derived directly from the authenticated JWT context (`req.user.userId`). Client-side parameter spoofing (`farmerId`) returns `HTTP 403 Forbidden`.
- **Role Guards**: Backend `requireRole('ADMIN')` middleware rejects any non-admin requesting `/api/admin/*` with `HTTP 403 Forbidden`. Unauthenticated requests return `HTTP 401 Unauthorized`.

---

## 2. Authentication API Endpoints (`/api/auth/*`)

### A. Register Farmer Account
- **Route**: `POST /api/auth/register`
- **Authentication**: None (Public)
- **Request Body**:
  ```json
  {
    "name": "Ramesh Kumar",
    "phone": "9876543210",
    "password": "FarmerPassword2026!",
    "state": "Uttar Pradesh",
    "district": "Lucknow"
  }
  ```
- **Response** (`HTTP 201 Created`):
  ```json
  {
    "success": true,
    "message": "Farmer account registered successfully.",
    "data": {
      "user": {
        "userId": "66c7b...",
        "name": "Ramesh Kumar",
        "phone": "9876543210",
        "role": "FARMER",
        "state": "Uttar Pradesh",
        "district": "Lucknow"
      },
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
    }
  }
  ```

---

### B. Farmer / Admin Login
- **Route**: `POST /api/auth/login`
- **Authentication**: None (Public)
- **Request Body**:
  ```json
  {
    "identifier": "9876543210",
    "password": "FarmerPassword2026!"
  }
  ```
- **Response** (`HTTP 200 OK`): Returns user context and JWT token. Rejects invalid credentials with `HTTP 401 Unauthorized`.

---

### C. System Admin Login
- **Route**: `POST /api/auth/admin-login`
- **Authentication**: None (Public)
- **Request Body**:
  ```json
  {
    "email": "admin@nitisetu.gov.in",
    "password": "NitiSetuAdmin2026!"
  }
  ```
- **Response** (`HTTP 200 OK`): Returns `role: "ADMIN"` payload and JWT token. Logs entry in `AuditLog.js`.

---

### D. Current Session Verification
- **Route**: `GET /api/auth/me`
- **Authentication**: `Required` (`Bearer <token>`)
- **Response** (`HTTP 200 OK`): Returns active decoded user session context.

---

## 3. Scheme Eligibility & RAG Retrieval API (`/api/check`)

### Evaluate Scheme Eligibility
- **Route**: `POST /api/check`
- **Authentication**: Optional / Recommended
- **Request Body**:
  ```json
  {
    "state": "Uttar Pradesh",
    "district": "Lucknow",
    "locality": "Malihabad",
    "land_acres": 2.5,
    "crop": "Wheat",
    "age": 30,
    "social_category": "General",
    "scheme": "PM-KISAN",
    "preferred_language": "hi"
  }
  ```
- **Processing Flow**:
  1. Performs Cosine similarity search against MongoDB Atlas Vector Search (`vector_index`) over 207 indexed PDF policy chunks.
  2. Passes retrieved chunks to Gemini 1.5 Flash with strict JSON verdict prompt.
- **Response** (`HTTP 200 OK`):
  ```json
  {
    "success": true,
    "data": {
      "status": "Eligible",
      "reasoning": "आपको प्रति वर्ष ₹6,000 की वित्तीय सहायता मिलेगी।",
      "document_proof": "All landholding farmers' families having cultivable landholding in their names are eligible...",
      "citation": "PM-KISAN.pdf",
      "required_documents": ["Land Ownership Record (Jamabandi)", "Aadhaar Card", "Bank Passbook"],
      "evaluation_engine": "RAG-Gemini-Vector"
    }
  }
  ```

---

## 4. Document Vault & Genuine OCR API (`/api/documents/*`)

### A. Upload & Process Document
- **Route**: `POST /api/documents/upload`
- **Authentication**: `Required`
- **Payload**: `multipart/form-data` (`file`: PDF/PNG/JPG/WEBP, max 5MB; `documentType`: string).
- **Processing**:
  - Scanned PDF / Image → Google Cloud Vision API (`DOCUMENT_TEXT_DETECTION`).
  - Text-Native PDF → `pdf-parse` fast-path.
  - Entity Extraction → Gemini 1.5 Flash extracts JSON fields + per-field confidence.
- **Response** (`HTTP 201 Created`): Returns document metadata, OCR engine used, field confidence, and starts `farmerConfirmed: false`.

---

### B. Confirm OCR Extracted Data
- **Route**: `PUT /api/documents/:id/confirm`
- **Authentication**: `Required` (`enforceOwnership`)
- **Request Body**:
  ```json
  {
    "confirmedFields": {
      "ownerName": "Ramesh Kumar",
      "landAcres": 2.5,
      "khasraNumber": "412/9"
    }
  }
  ```
- **Response** (`HTTP 200 OK`): Updates document metadata with `farmerConfirmed: true` and `confirmedAt: timestamp`.

---

### C. Fetch Farmer Document Vault
- **Route**: `GET /api/documents/:farmerId`
- **Authentication**: `Required` (`enforceOwnership`)
- **Response** (`HTTP 200 OK`): Returns array of documents belonging exclusively to the authenticated farmer. Returns `HTTP 403 Forbidden` if Farmer A attempts to access Farmer B's documents.

---

### D. Private Document File Stream
- **Route**: `GET /api/documents/file/:id/download`
- **Authentication**: Public / Authenticated Stream Handler
- **Response** (`HTTP 200 OK`): Streams raw file binary from non-static storage. Rejects non-whitelisted extensions.

---

## 5. Personalized Notification API (`/api/notifications/*`)

### A. Fetch Farmer Notifications
- **Route**: `GET /api/notifications/:farmerId`
- **Authentication**: `Required` (`enforceOwnership`)
- **Response** (`HTTP 200 OK`):
  ```json
  {
    "success": true,
    "data": {
      "notifications": [
        {
          "_id": "66c7f...",
          "type": "PROFILE_MISMATCH",
          "title": "Land Area Profile Difference",
          "message": "Extracted OCR land size (3.2 acres) differs from profile (2.5 acres).",
          "priority": "high",
          "readAt": null,
          "createdAt": "2026-08-23T06:00:00.000Z"
        }
      ],
      "unreadCount": 1
    }
  }
  ```

---

### B. Generate Event-Driven Notifications
- **Route**: `POST /api/notifications/generate`
- **Authentication**: `Required`
- **Triggers**: Evaluates profile state against vault documents for `SCHEME_AVAILABLE`, `DOCUMENT_REQUIRED`, `PROFILE_MISMATCH`, and `DOCUMENT_EXPIRING`.

---

## 6. Admin Management & Analytics API (`/api/admin/*`)

> [!CAUTION]
> All `/api/admin/*` endpoints require `authenticateToken` AND `requireRole('ADMIN')`. Non-admin requests receive `HTTP 403 Forbidden`.

### A. Real Platform Analytics
- **Route**: `GET /api/admin/analytics`
- **Response** (`HTTP 200 OK`): Returns real database counts for `totalFarmers`, `totalDocuments`, `documentsNeedingReview`, `totalNotifications`, and vector index chunk status (207 chunks). Zero fake numbers.

---

### B. Registered Farmers List (PII Masked)
- **Route**: `GET /api/admin/farmers`
- **Response** (`HTTP 200 OK`): Returns farmer accounts with masked phone numbers (`98******10`).

---

### C. Administrative Audit Logs
- **Route**: `GET /api/admin/audit-logs`
- **Response** (`HTTP 200 OK`): Returns administrative action logs (`AdminLogin`, `DocumentReview`, `SchemeAction`).

---

## 7. API Error Handling Specification

All endpoints return uniform JSON error structures:

```json
{
  "success": false,
  "error": "Human-readable error explanation",
  "details": null
}
```

### HTTP Error Status Code Matrix
- `400 Bad Request` — Missing required body fields or invalid parameter formats.
- `401 Unauthorized` — Missing or expired JWT session token.
- `403 Forbidden` — Insufficient role privileges (`FARMER` accessing `/api/admin/*`) or cross-user data access.
- `409 Conflict` — Registration attempt with an existing phone number.
- `413 Payload Too Large` — File upload exceeding 5MB ceiling.
- `500 Internal Server Error` — Server-side error (sanitized without stack trace exposure).
