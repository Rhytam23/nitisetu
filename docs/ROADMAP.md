# Niti-Setu — Product Roadmap & Milestone Tracking

---

## 📌 Milestone Roadmap Overview

- **Milestone 0 (P0)**: Core RAG Vector Pipeline & Prototype Verification `[COMPLETED]`
- **Milestone 1 (P1)**: Sector 4.0 Transformation, Scheme Discovery & Application Guidance `[COMPLETED]`
- **Milestone 2 (P2)**: Intelligent Document Vault, OCR Processing & Personalized Notification Center `[COMPLETED]`
- **Milestone 3 (P3)**: External Delivery Gateways & Multi-State Scale `[PLANNED]`

---

## 🎯 P2 Features Status

| Feature ID | Feature Name | Status | Technical Scope |
|---|---|---|---|
| **P2.1** | **Document OCR & Classification** | `[IMPLEMENTED]` | PDF/image parser extracting land acres, khasra number, owner name, masked Aadhaar, confidence scores |
| **P2.2** | **Document-Scheme Cross-Check** | `[IMPLEMENTED]` | Syncs ProofCard required documents with Vault (`✓ Available` vs `⚠ Upload to Vault`) |
| **P2.3** | **Profile Mismatch Assistance** | `[IMPLEMENTED]` | Compares OCR landholding vs profile; presents interactive `[Update Profile]` / `[Keep Existing]` |
| **P2.4** | **Smart Notifications Engine** | `[IMPLEMENTED]` | Triggers `SCHEME_AVAILABLE`, `DOCUMENT_REQUIRED`, `PROFILE_MISMATCH`, `DOCUMENT_EXPIRING` |
| **P2.5** | **Verified Expiry Alerts** | `[IMPLEMENTED]` | Triggers `DOCUMENT_EXPIRING` warnings for verified document expiry dates within 30 days |
| **P2.6** | **Notification Center UI** | `[IMPLEMENTED]` | Header bell badge, drawer, category filters, unread count, mark-read, action links |
| **P2.7** | **Document Security & File Hygiene** | `[IMPLEMENTED]` | Storage reference UUIDs, private download stream, 5MB file ceiling, log sanitization |
| **P2.8** | **Cloud Object Storage (S3 / Blob)** | `[CONFIGURATION REQUIRED]` | Local directory storage active; S3/Blob storage binding documented for production cloud deployment |

---

## 🚀 Future Scope (P3 & Beyond)

1. **Native Bhashini Speech & Translation API**: Upgrade Web Speech STT and Google Translate DOM script with official Bhashini API wrapper.
2. **SMS & WhatsApp Gateway Integration**: Expand notification engine to deliver SMS/WhatsApp alerts for offline farmers.
3. **CSC Portal Direct Integration**: Provide direct SSO integration with Common Service Center (CSC) operator portals.
