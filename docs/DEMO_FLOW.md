# Niti-Setu — Sector 4.0 Demonstration Flow

---

## 🎭 10-Step Live Demonstration Scenario

1. **Farmer Onboarding**: Farmer arrives at Niti-Setu landing page and clicks *"Launch AI Consultant"*.
2. **Language Selection**: Farmer selects native language (e.g., Hindi / Tamil / Marathi) from the 23-language dropdown.
3. **Voice Input Assistance**: Farmer clicks **"Voice Input"** and speaks: *"My name is Ramesh. I have 2.5 acres of land in Uttar Pradesh growing wheat."*
4. **Smart Entity Extraction Preview**: System displays a **Voice Confirmation Card** showing extracted fields:
   - Land: `2.5 Acres`
   - State: `Uttar Pradesh`
   - Crop: `Wheat`
5. **Farmer Confirmation**: Farmer reviews and clicks **"Confirm & Auto-fill Form"**.
6. **Scheme Auto-Discovery**: Farmer selects **"Auto-Discover All Schemes"** and clicks **"Evaluate Eligibility & Proof"**.
7. **Vector Retrieval & AI Reasoning**: System queries MongoDB Atlas Vector Search (`vector_index`), retrieves top matching policy chunks from `PM-KISAN.pdf`, and passes context to Gemini 1.5 Pro.
8. **AI Verdict & Verbatim Proof**: Proof Card renders:
   - **Verdict Status**: `Eligible`
   - **AI Explanation**: Localized 2-sentence explanation in Hindi/selected language.
   - **Verbatim Policy Evidence**: Original untranslated quote directly from `PM-KISAN` guidelines.
   - **Citation**: Official document name and section.
9. **Application Guidance & Document Acquisition**: System renders:
   - **Document Acquisition Checklist**: Lists required documents (Aadhaar, Jamabandi, Bank Passbook) with *Why Needed* and *Where to Obtain*.
   - **Step-by-Step Pathway**: Step 1 to Step 4 official application procedure.
10. **Actionable Next Steps**: Farmer listens to audio playback via TTS or clicks official government portal guidance link.
