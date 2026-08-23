# Niti-Setu — Authentication Architecture & Security Specification

---

## 1. Authentication Overview

Niti-Setu implements server-side authentication using **cryptographic password hashing (`scrypt`)** and **HMAC-SHA256 JSON Web Tokens (JWT)**.

- **Farmer Authentication**: Farmers register or log in using their phone number and password.
- **Admin Authentication**: Admins log in securely using environment seed credentials (`ADMIN_EMAIL`, `ADMIN_PASSWORD`) or DB Admin accounts.
- **Session Security**: Passwords are **never stored in plaintext**. Tokens expire after 24 hours.

---

## 2. API Endpoints

- `POST /api/auth/register` — Registers a new Farmer account (`name`, `phone`, `password`, `state`, `district`).
- `POST /api/auth/login` — Authenticates Farmer or Admin (`identifier` + `password`).
- `POST /api/auth/admin-login` — Dedicated Admin authentication.
- `GET /api/auth/me` — Retrieves current user token context.
- `POST /api/auth/logout` — Ends active session.
