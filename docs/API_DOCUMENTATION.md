# Niti-Setu — API Documentation Specification

---

## Overview

All API endpoints are prefixed with `/api`. Base local server URL defaults to `http://localhost:5001`. The backend responds with standard JSON payloads wrapping `success`, `message`, `data`, `error`, and `details`.

---

## 1. Health Check Endpoint `[IMPLEMENTED]`

### `GET /api/health`
- **Purpose**: Server status check and database connection state verification.
- **Authentication**: None (Public)
- **Request Headers**: None
- **Response Format (200 OK)**:
```json
{
  "status": "ok",
  "message": "Niti-Setu Backend is running",
  "database": "connected"
}
```
*(Note: `database` returns `"connected"` if MongoDB is active, or `"offline"` if disconnected).*

---

## 2. Eligibility Evaluation Endpoint `[IMPLEMENTED]`

### `POST /api/check`
- **Purpose**: Run AI RAG semantic search or deterministic logic evaluation for a farmer profile against government scheme guidelines.
- **Authentication**: None (Public)
- **Request Body**:
```json
{
  "state": "Uttar Pradesh",
  "district": "Varanasi",
  "land_acres": 2.5,
  "crop": "Wheat",
  "scheme": "PM-KISAN",
  "aadhaar": "123456789012",
  "phone": "9876543210",
  "age": 35,
  "preferred_language": "hi"
}
```
- **Response Format (200 OK)**:
```json
{
  "success": true,
  "message": "Eligibility checked successfully.",
  "data": {
    "status": "Eligible",
    "reasoning": "वर्तमान दिशा-निर्देशों के आधार पर, सभी भूमिधारक किसान PM-KISAN लाभों के लिए पात्र हैं...",
    "document_proof": "\"With a view to provide income support to all landholding farmers’ families...\"",
    "citation": "PM-KISAN OPERATIONAL GUIDELINES",
    "required_documents": [
      "Aadhaar Card",
      "Land Record (Jamabandi)",
      "Bank Passbook"
    ]
  },
  "details": {
    "engine": "Logic-Fallback"
  }
}
```
- **Error Responses**:
  - `500 Internal Server Error`: Critical processing exception writing to `eligibility_error.log`.

---

## 3. Farmer Profile CRUD Endpoints `[IMPLEMENTED]`

### `POST /api/profile` `[IMPLEMENTED]`
- **Purpose**: Create a new farmer profile in MongoDB.
- **Authentication**: None (Public)
- **Validation Rules**:
  - `name`: Required string, min 2 characters.
  - `state`: Required string.
  - `land_acres`: Optional non-negative number.
  - `age`: Optional integer between 18 and 100.
  - `phone`: Optional 10-digit number.
  - `aadhaar`: Optional 12-digit number.
- **Request Body**:
```json
{
  "name": "Ramesh Kumar",
  "state": "Uttar Pradesh",
  "land_acres": 2.5,
  "crop": "Wheat",
  "phone": "9876543210"
}
```
- **Response (201 Created)**: Returns saved farmer object with `_id` and timestamps.
- **Error Responses**:
  - `400 Bad Request`: Validation failure (`errors` array returned).
  - `409 Conflict`: Duplicate `phone` or `aadhaar` (MongoDB E11000).
  - `503 Service Unavailable`: Database is offline.

---

### `GET /api/profile` `[IMPLEMENTED]`
- **Purpose**: List all saved farmer profiles sorted by `createdAt: -1`.
- **Authentication**: None (Public)
- **Response (200 OK)**: Returns array of farmer objects with `count` in `details`.
- **Error Responses**: `503 Service Unavailable` if database is offline.

---

### `GET /api/profile/:id` `[IMPLEMENTED]`
- **Purpose**: Retrieve a single farmer profile by ObjectId.
- **Authentication**: None (Public)
- **Response (200 OK)**: Returns farmer object.
- **Error Responses**:
  - `400 Bad Request`: Invalid ObjectId.
  - `404 Not Found`: Farmer not found.
  - `503 Service Unavailable`: Database offline.

---

### `PUT /api/profile/:id` `[IMPLEMENTED]`
- **Purpose**: Partially update an existing farmer profile.
- **Authentication**: None (Public)
- **Request Body**: JSON containing fields to update (e.g. `{ "land_acres": 5 }`).
- **Response (200 OK)**: Returns updated farmer object.
- **Error Responses**: `400 Bad Request`, `404 Not Found`, `409 Conflict`, `503 Service Unavailable`.

---

### `DELETE /api/profile/:id` `[IMPLEMENTED]`
- **Purpose**: Delete a farmer profile by ID.
- **Authentication**: None (Public) `[TODO: Access Control / Authorization in future]`
- **Response (200 OK)**: Returns deleted farmer object.
- **Error Responses**: `400 Bad Request`, `404 Not Found`, `503 Service Unavailable`.
