# Niti-Setu — Security Audit & Vulnerability Assessment

---

## 1. Security Architecture Overview

This document provides a realistic security audit of the current Niti-Setu codebase. Because Niti-Setu was originally constructed during a hackathon MVP phase, several production security controls remain unimplemented.

---

## 2. Security Audit Matrix

| Security Area | Current Implementation Status | Risk Rating | Description |
|---|---|---|---|
| **Authentication** | Unauthenticated `[PLANNED]` | **HIGH** | All API endpoints (`/api/check`, `/api/profile`) are completely open without token or session checks. |
| **Authorization** | Missing `[PLANNED]` | **HIGH** | `DELETE /api/profile/:id` allows any caller to delete any farmer profile. Contains `// TODO: Access Control`. |
| **Aadhaar & PII Handling** | Regex Validated `[IMPLEMENTED]` | **MEDIUM** | Aadhaar (12-digit) and Phone (10-digit) are validated but stored as plaintext strings in MongoDB without field-level encryption. |
| **Secrets Management** | `.env` File `[IMPLEMENTED]` | **MEDIUM** | `GOOGLE_API_KEY` and `MONGODB_URI` are loaded via `dotenv`. `.env` is listed in `.gitignore`. |
| **API Input Validation** | Strict Helper Functions `[IMPLEMENTED]` | **LOW** | `validateProfileInput()` rejects invalid types, negative land acres, and malformed strings. |
| **Data Exposure** | Open Profile Listing `[PLANNED]` | **HIGH** | `GET /api/profile` returns all stored farmer documents without pagination or user ownership filtering. |
| **Rate Limiting** | None `[PLANNED]` | **MEDIUM** | No Express rate-limiting middleware (`express-rate-limit`) to prevent API abuse or Gemini API quota exhaustion. |
| **Error Logging** | Local File Sync `[IMPLEMENTED]` | **LOW** | Errors write to `eligibility_error.log` via `fs.appendFileSync` without masking API keys. |

---

## 3. Detailed Vulnerability Analysis

### 1. Unrestricted Profile Management (OWASP A01: Broken Access Control)
- **Vulnerability**: `GET /api/profile` and `DELETE /api/profile/:id` can be invoked by any anonymous HTTP client.
- **Code Reference**: [backend/routes/eligibility.js:L409-L426](file:///e:/nitisetu/backend/routes/eligibility.js#L409-L426).
- **Remediation Plan**: Implement JWT bearer token or Firebase mobile OTP authentication middleware before routing to profile modification handlers.

### 2. Plaintext Sensitive Identity Storage (PII)
- **Vulnerability**: `aadhaar` (12-digit UIDAI number) and `phone` are saved directly to MongoDB Atlas unencrypted.
- **Remediation Plan**: Hash Aadhaar numbers using SHA-256 before storage or implement Mongoose field-level encryption (`mongoose-field-encryption`).

### 3. API Denial of Service & LLM Quota Exhaustion
- **Vulnerability**: `POST /api/check` invokes Google Gemini 1.5 Pro on every request without rate limits or CAPTCHA.
- **Remediation Plan**: Add `express-rate-limit` (e.g., max 10 eligibility requests per minute per IP).

---

## 4. Planned Security Hardening Roadmap `[PLANNED]`

1. **Phase 1: Rate Limiting & Input Sanitization**: Attach `express-rate-limit` and `helmet` security headers to Express `app.js`.
2. **Phase 2: OTP Authentication**: Implement phone number + OTP login using Firebase Auth or AWS Cognito.
3. **Phase 3: PII Field Hashing**: Hash Aadhaar inputs so identity numbers are never stored in raw readable format.
4. **Phase 4: Cloud Secrets Vault**: Transition API keys from local `.env` files to cloud secret managers (AWS Secrets Manager / GitHub Secrets).
