# Niti-Setu — Problem Statement & Product Vision

---

## 1. Core Problem

Across India, central and state governments launch numerous public welfare schemes designed to provide direct financial assistance, pensions, and agricultural infrastructure subsidies to rural citizens. However, millions of eligible small and marginal farmers fail to receive these benefits due to a severe **Awareness and Accessibility Gap**.

Key dimensions of the problem include:
- **Scheme Awareness Gaps**: Farmers are often unaware of active schemes or do not know if their specific landholding, crop type, age, or social category qualifies them.
- **Complex Government Guidelines**: Official scheme notifications are published in dense, 50+ page bureaucratic PDF documents filled with complex legalistic and administrative terminology.
- **Difficult Eligibility Verification**: Determining eligibility requires navigating intricate criteria, multi-tiered landholding thresholds, and exclusion clauses (e.g., income tax exclusions or institutional landholder limits).
- **Language Barriers**: Scheme guidelines are predominantly published in English or official administrative Hindi, excluding non-English speakers and regional dialect users.
- **Digital and Typing Barriers**: Standard web portals require typing text, managing login credentials, and navigating complex dropdown menus—creating high friction for citizens with limited digital literacy.
- **Dependence on Intermediaries**: Due to systemic complexity, farmers frequently rely on local middlemen or agents, often paying fees simply to find out if they qualify.
- **Lack of Decision Transparency**: Existing government portals or chatbots rarely explain *why* an applicant is eligible or ineligible, offering no verifiable proof or reference back to official government orders.

---

## 2. Target Users

### Primary Users
- **Indian Farmers & Agricultural Landholders**: Small, marginal, and large farmers seeking immediate, clear eligibility information for agricultural schemes `[IMPLEMENTED]`.
- **Rural & Non-English Citizens**: Individuals with low English literacy or limited digital proficiency requiring voice assistance and native regional language interfaces `[IMPLEMENTED]`.

### Secondary Users
- **Agricultural Assistance Workers**: Village-level extension officers (`Gram Sevaks`) helping farmers check scheme eligibility in the field `[PLANNED]`.
- **CSC (Common Service Center) Operators**: Kiosk operators assisting rural citizens with government scheme discovery and document preparation `[PLANNED]`.

---

## 3. Existing Challenges & Why Current Solutions Fail

Current government portals, manual inquiries, and generic AI tools fail rural citizens due to fundamental structural limitations:

| Challenge | Existing Portals & Manual Inquiries | Generic AI Chatbots | Niti-Setu Solution |
|---|---|---|---|
| **Document Complexity** | Dense 50+ page administrative PDFs | May hallucinate or invent rules | RAG extraction directly over official PDF text `[IN PROGRESS]` |
| **Language Access** | Mostly English or bureaucratic Hindi | Variable translation accuracy | 23 Indian languages via UI translation `[IMPLEMENTED]` |
| **User Interface** | Mandatory login, passwords, complex forms | Text-only typing prompt | Zero-login consultation, Web Speech voice input `[IMPLEMENTED]` |
| **Decision Transparency** | Unexplained "Pass / Fail" or manual review | Summarized answers without proof | **AI Proof Card**: Verbatim PDF quotes + official citations `[IMPLEMENTED]` |
| **Intermediary Dependency** | High (citizens pay fees for information) | Moderate | Direct self-service or assisted kiosk consultation `[IMPLEMENTED]` |

---

## 4. Niti-Setu Solution

**Niti-Setu** (translating to *"Policy Bridge"*) is an AI-powered public-benefit access platform that acts as a real-time policy consultant for Indian government schemes.

### Core Product Flow
1. **Farmer Profile**: Captures State, District, Land Holding (acres), Crop, Age, Category, and Scheme selection via voice or form `[IMPLEMENTED]`.
2. **Scheme Discovery**: User selects target scheme (PM-KISAN, PM-KMY, PM-KUSUM) `[IMPLEMENTED]`.
3. **Eligibility Analysis**: Hybrid engine evaluates profile against official guidelines via Gemini RAG or deterministic logic `[IMPLEMENTED]`.
4. **Policy Verification**: Extracts verbatim policy text supporting the decision `[IMPLEMENTED]`.
5. **AI Proof Card**: Renders decision status, localized consultant explanation, quote proof, and citation `[IMPLEMENTED]`.
6. **Required Documents**: Generates dynamic checklist of required application papers `[IMPLEMENTED]`.
7. **Application Guidance**: Assists farmer with next steps for formal submission `[PLANNED]`.

---

## 5. Core Innovation

> **"Eligibility with evidence, not just answers."**

Standard AI tools or chatbots output generic text that can hallucinate or misinform users about legal policies. Niti-Setu's core innovation is the **AI Proof Card**:
1. It obligates the AI to extract **verbatim text** directly from official government PDF orders `[IMPLEMENTED]`.
2. It provides **official document citations**, giving farmers legally verifiable proof `[IMPLEMENTED]`.
3. It transforms complex bureaucratic policy into a transparent, trustworthy visual audit that citizens can present to local officials with confidence `[IMPLEMENTED]`.

---

## 6. Expected Impact

- **Reduces Information Barriers**: Delivers immediate scheme eligibility clarity to rural citizens `[IMPLEMENTED]`.
- **Eliminates Middlemen**: Enables direct self-service policy checking without paying agent fees `[IMPLEMENTED]`.
- **Bypasses Digital Literacy Barriers**: Voice input and regional languages allow non-literate farmers to access national policy `[IMPLEMENTED]`.
- **Accelerates Application Readiness**: Provides custom document checklists, reducing incomplete application rejections `[IMPLEMENTED]`.

---

## 7. Future Vision

- **Document OCR Scanning**: Camera-based optical character recognition for scanning land records (`Jamabandi`) and Aadhaar cards `[PLANNED]`.
- **Mobile OTP Authentication**: Secure farmer profile ownership and saved consultation history `[PLANNED]`.
- **Native Regional AI Models**: Integration with Bhashini for native voice-to-voice regional dialogue `[PLANNED]`.
- **Scheme Library Expansion**: Ingesting state-level agricultural and social welfare schemes `[PLANNED]`.

---

## 8. One-Line Product Definition

"Niti-Setu is an AI-assisted eligibility and policy verification engine that translates complex government scheme guidelines into instant, evidence-backed clarity for every Indian farmer."
