# Niti-Setu — Feature Implementation Status Matrix

---

## Complete Feature Matrix (P0, P1, P2 & Platform Access Layer)

| Feature Component | Status | Codebase Evidence | Current Functionality & Details |
|---|---|---|---|
| **Server-Side Authentication** | `[IMPLEMENTED]` | `User.js`, `authController.js`, `authMiddleware.js` | Cryptographic password hashing (`scrypt`), HMAC-SHA256 JWT tokens, farmer registration & login |
| **Role-Based Access Control (RBAC)** | `[IMPLEMENTED]` | `authMiddleware.js`, `eligibility.js` | Enforces `FARMER` and `ADMIN` roles. Returns `HTTP 403 Forbidden` if farmer accesses admin routes |
| **Resource Ownership Security** | `[IMPLEMENTED]` | `authMiddleware.js` (`enforceOwnership`) | Server-side check preventing Farmer A from accessing Farmer B's documents or notifications (`HTTP 403`) |
| **Farmer User Dashboard** | `[IMPLEMENTED]` | `FarmerDashboard.jsx` | Dedicated dashboard answering "What is happening with my benefits?" with quick action grid and vault status |
| **Admin Dashboard & Audit Trail** | `[IMPLEMENTED]` | `AdminDashboard.jsx`, `AuditLog.js`, `adminController.js` | Real DB analytics, farmer list (PII masked), scheme vector chunk status, OCR review queue, and audit logs |
| **Farmer Document Vault & Genuine OCR** | `[IMPLEMENTED]` | `DocumentVault.jsx`, `ocrEngine.js`, `ocrService.js` | Google Cloud Vision OCR for images/scanned PDFs, `pdf-parse` fast-path for text PDFs, Gemini entity extraction |
| **Proof Card & Policy Citation** | `[IMPLEMENTED]` | `ProofCard.jsx`, `ragService.js` | MongoDB Atlas Vector Search over 207 policy chunks; verbatim legal quotes + localized TTS explanations |
| **Personalized Notification Center** | `[IMPLEMENTED]` | `NotificationCenter.jsx`, `notificationService.js` | Header bell badge, priority filters, profile mismatch alerts, missing document reminders, expiry warnings |
| **Automated Platform Test Suite** | `[IMPLEMENTED]` | `test_auth_and_dashboards.js`, `test_genuine_ocr.js` | 67/67 automated assertions passing across all test suites |
