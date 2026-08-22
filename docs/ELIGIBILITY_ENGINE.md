# Niti-Setu — Eligibility Engine Specification

---

## 1. Overview & Dual-Engine Architecture

Niti-Setu uses a hybrid evaluation engine combining **AI-driven RAG reasoning** with **Deterministic Logic Validation**. This ensures 100% decision availability even when cloud AI models or database connections are offline.

```
Incoming Profile Input (/api/check)
                 |
                 v
     +-----------------------+
     | Configuration Check   |
     +-----------------------+
         /               \
 (Online & Valid)    (Missing/Error)
       /                   \
      v                     v
+------------------+   +-----------------------+
|  RAG AI Engine   |   | Deterministic Logic   |
| (Gemini 1.5 Pro) |   | Fallback Engine       |
+------------------+   +-----------------------+
      \                     /
       v                   v
   Unified Standard JSON Output
```

---

## 2. Scheme-Specific Rule Specifications

### 2.1 PM-KISAN (Pradhan Mantri Kisan Samman Nidhi) `[IMPLEMENTED]`
- **Objective**: Direct income support of ₹6,000 per year in three installments to cultivable landholding farmer families.
- **Eligibility Rules**:
  - **Landholding**: All landholding farmers' families possessing cultivable land.
  - **Exclusions**: Institutional landholders, high economic status holders, active/retired government employees, income tax payers of previous assessment year, professionals (doctors, engineers, lawyers, CA).
- **Fallback Rule**:
  - Status: `Eligible` (subject to tax exclusion declaration).
  - Proof Quote: `"With a view to provide income support to all landholding farmers’ families in the country, having cultivable land..."`
  - Required Documents: Aadhaar Card, Land Record (Jamabandi), Bank Passbook.

### 2.2 PM-KMY (Pradhan Mantri Kisan Maan-Dhan Yojana) `[IMPLEMENTED]`
- **Objective**: Voluntary pension scheme providing ₹3,000 monthly pension after age 60 to Small and Marginal Farmers (SMFs).
- **Eligibility Rules**:
  - **Age Limit**: Entry group between **18 and 40 years**.
  - **Landholding Limit**: Cultivable land **up to 2 hectares (5 acres)**.
  - **Exclusions**: SMFs covered under any other statutory social security scheme (e.g., NPS, EPFO, ESIC).
- **Fallback Rule**:
  - `Age >= 18 && Age <= 40` AND `Land <= 5 acres` -> Status: `Eligible`.
  - Outside age limit -> Status: `Not Eligible` (Reasoning: `"Age X is outside the 18-40 entry group limit."`).
  - Land > 5 acres -> Status: `Not Eligible` (Reasoning: `"Land holding exceeds 2 hectares."`).

### 2.3 PM-KUSUM (Pradhan Mantri Kisan Urja Suraksha evam Utthaan Mahabhiyan) `[IMPLEMENTED]`
- **Objective**: Solar pump installation subsidy for de-dieselization of the farm sector.
- **Eligibility Rules**: Individual farmers, water user associations, farmer producer organizations (FPOs).
- **Subsidy Structure**: Central Financial Assistance (CFA) of 30% + State Government subsidy of 30% = **60% combined subsidy**.
- **Fallback Rule**:
  - Status: `Eligible`.
  - Proof Quote: `"The Central Government will provide financial assistance of 30%... The State Government will provide a subsidy of atleast 30%..."`
  - Required Documents: Aadhaar Card, Land Record, Bank Passbook, Copy of Electricity Bill, Solar Pump Preference Form.

---

## 3. Decision States & Output Schema

The engine outputs one of three decision states:

1. **`Eligible`**: Profile meets all specified guidelines with supporting policy proof.
2. **`Not Eligible`**: Profile explicitly violates eligibility bounds (e.g., land size or age limits).
3. **`Pending Review`**: Missing critical documentation or demographic ambiguity requiring physical verification.

### Standard Output Schema `[IMPLEMENTED]`
```json
{
  "status": "Eligible" | "Not Eligible" | "Pending Review",
  "reasoning": "Localized 2-sentence explanation",
  "document_proof": "Verbatim quote from PDF",
  "citation": "Official Document Name",
  "required_documents": ["Doc 1", "Doc 2"]
}
```

---

## 4. Deterministic Logic vs. AI Reasoning

| Feature | Deterministic Logic Engine `[IMPLEMENTED]` | AI RAG Engine `[IMPLEMENTED]` |
|---|---|---|
| **Execution Trigger** | DB/AI offline or key missing | DB & Gemini API online |
| **Flexibility** | Evaluates fixed hardcoded criteria | Dynamically evaluates un-coded policy nuances |
| **Proof Source** | Fixed pre-programmed quotes | Verbatim excerpt extracted live from PDF chunks |
| **Language Generation** | Dictionary-based string substitution | Native LLM multilingual text generation |
| **Execution Latency** | < 10ms | ~ 1.5 to 2.5 seconds |
