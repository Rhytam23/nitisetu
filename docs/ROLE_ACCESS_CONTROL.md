# Niti-Setu — Role-Based Access Control (RBAC) & Ownership Security

---

## 1. User Roles

1. **`FARMER`**: Can evaluate scheme eligibility, manage personal vault credentials, confirm OCR extractions, and receive personalized notifications.
2. **`ADMIN`**: Accesses platform analytics, registered farmer lists (PII masked), scheme operational status, document review queues, and administrative audit logs.

---

## 2. Server-Side Enforcement Rules

- **Role Enforcement (`requireRole('ADMIN')`)**: Any non-admin user attempting to access `/api/admin/*` receives `HTTP 403 Forbidden`.
- **Ownership Enforcement (`enforceOwnership`)**: Farmer A requesting Farmer B's documents (`GET /api/documents/farmer_B`) receives `HTTP 403 Forbidden`.
