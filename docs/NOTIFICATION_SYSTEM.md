# Niti-Setu — Personalized Farmer Notification Engine Specification `[IMPLEMENTED]`

---

## 1. Executive Overview

The **Personalized Farmer Notification Engine** delivers actionable, event-driven notifications to Indian farmers. Notifications alert farmers to new scheme eligibility matches, missing document requirements for active schemes, application deadlines, and profile updates.

---

## 2. Notification Types & Trigger Rules

| Notification Type | Trigger Condition | Default Priority | Primary Action |
|---|---|---|---|
| `SCHEME_AVAILABLE` | New scheme discovered matching farmer profile parameters (land, age, crop, state) | `High` | Navigates to **Check Eligibility** |
| `DEADLINE_APPROACHING` | Application deadline approaching for an eligible scheme | `High` | Navigates to **Application Guidance** |
| `DOCUMENT_REQUIRED` | Required document for an eligible scheme is missing from Farmer Vault | `Medium` | Navigates to **Document Vault** |
| `DOCUMENT_EXPIRING` | Uploaded document in vault nearing expiration date (within 30 days) | `Medium` | Navigates to **Document Vault** |
| `APPLICATION_ACTION` | Next step in application pathway requires farmer action | `Low` | Navigates to **Application Guidance** |
| `PROFILE_UPDATE` | Profile details (land, age, category) require verification | `Low` | Navigates to **Profile Form** |
| `SCHEME_UPDATE` | Revision in official scheme operational guidelines | `Medium` | Navigates to **Scheme Details** |

---

## 3. Data Model Schema (`notifications`)

| Field Name | Type | Constraints / Description |
|---|---|---|
| `_id` | ObjectId | Primary Key |
| `farmerId` | String | Target Farmer Profile ID (Indexed) |
| `type` | String | Enum: `SCHEME_AVAILABLE`, `DEADLINE_APPROACHING`, `DOCUMENT_REQUIRED`, `DOCUMENT_EXPIRING`, `APPLICATION_ACTION`, `PROFILE_UPDATE`, `SCHEME_UPDATE` |
| `title` | String | Human-readable notification header |
| `message` | String | Contextual explanation detailing why it is relevant |
| `priority` | String | Enum: `high`, `medium`, `low` |
| `createdAt` | Date | Timestamp of creation (Indexed) |
| `readAt` | Date | Timestamp when read (null if unread) |
| `action` | Object | `{ targetRoute: String, actionLabel: String }` |
| `relatedScheme` | String | Optional scheme identifier (e.g. `PM-KISAN`) |
| `relatedDocument` | String | Optional document type (e.g. `Land Ownership Record (Jamabandi)`) |

---

## 4. Architecture & Delivery Scope

```
Farmer Profile + Schemes + Document Vault Status + Eligibility Rules
                               ↓
                   [ Notification Engine ]
                               ↓
                     (In-App Notification)
             ┌─────────────────┴─────────────────┐
             ▼                                   ▼
[ In-App Bell & Drawer ]             [ External Channels ]
    `[IMPLEMENTED]`                     `[PLANNED]`
(Unread badge, filtering,           (SMS / WhatsApp API
 contextual action links)            gateway integration)
```

---

## 5. Implementation Status

- **In-App Notification Engine**: `[IMPLEMENTED]` (`notificationService.js`, `/api/notifications`)
- **Notification Center UI**: `[IMPLEMENTED]` (`NotificationCenter.jsx` with unread count badge, category filters, mark read/unread, and action buttons)
- **External Delivery (SMS / WhatsApp)**: `[PLANNED]` (Architecture designed for future gateway integration)
