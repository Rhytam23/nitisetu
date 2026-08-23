# Niti-Setu — Farmer & Admin Dashboards Specification

---

## 1. Farmer User Dashboard (`FarmerDashboard.jsx`)
- **Profile Summary**: Displays name, location, and account completeness badge.
- **Benefits Overview**: Live status for PM-KISAN, PM-KMY, and PM-KUSUM.
- **Vault Status**: Overview of uploaded documents, missing mandatory files, and OCR review alerts.
- **Quick Action Grid**: One-click navigation to *Evaluate Eligibility*, *Document Vault*, *Notifications*, and *Policy Proof Cards*.

---

## 2. Admin Dashboard (`AdminDashboard.jsx`)
- **Platform Overview**: Real DB metrics for Total Farmers, Total Vault Documents, OCR Queue, and Vector Index status (no fake numbers).
- **Farmer Management**: Displays registered platform farmers with masked phone numbers (`98******10`).
- **Scheme RAG Status**: Displays vector index chunk counts (207 chunks across 3 official PDFs).
- **Audit Logs**: Real-time audit trail recording administrative actions (`AuditLog.js`).
