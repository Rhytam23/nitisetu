# Niti-Setu — Hackathon Strategy & Pitch Deck Guide

---

## 1. Hackathon Identity & Positioning

- **Project Name**: Niti-Setu (Translates to *"Policy Bridge"*)
- **Team Name**: Team KrishiSolve `[speech.md:L28]`
- **Tagline**: *"Bridging Policy and People."* `[slide.md:L9]`
- **Core Pitch**: An AI-assisted eligibility and policy verification engine for Indian agricultural schemes that translates 50+ page bureaucratic PDFs into instant, voice-activated, evidence-backed clarity for every farmer.

---

## 2. Narrative Arc & Pitch Deck Outline (3-Minute Presentation)

```
SLIDE 1: Title Screen & Mission ("Bridging Policy and People")
   |
SLIDE 2: The Core Problem (50-page blurred PDF vs. Confused Farmer)
   |
SLIDE 3: Introducing Niti-Setu (Real-time AI Consultant Gateway)
   |
SLIDE 4: Live Demo (Language Selector -> Voice Input -> Profile Form)
   |
SLIDE 5: The "AI Proof Card" (Verbatim PDF Quote, Citation & Documents)
   |
SLIDE 6: Vision & Social Impact ("NO CITIZEN LEFT BEHIND")
```

### Detailed Slide Breakdown (from `doc/slide.md`)

- **Slide 1: Mission**: Visual bridge animation connecting a citizen icon to a government building icon `[slide.md:L10]`.
- **Slide 2: Problem**: Stat highlighting that eligible citizens miss out on benefits due to awareness gaps and legalistic 50-page PDFs `[slide.md:L20]`.
- **Slide 3: Solution**: Screenshot of Niti-Setu landing page showing "AI Consultant Active" badge `[slide.md:L30]`.
- **Slide 4: Prototype Demo**: Screen recording showing language switching and voice input entity parsing `[slide.md:L38]`.
- **Slide 5: The Proof Card**: Highlight verbatim quote extraction and custom document checklist `[slide.md:L49]`.
- **Slide 6: Vision & Impact**: Farmer holding a smartphone; tagline: *"NO CITIZEN LEFT BEHIND."* `[slide.md:L60]`.

---

## 3. Key Technical Differentiators for Judges

1. **Evidence over Chat**: Standard chatbots guess or summarize text; Niti-Setu extracts **verbatim proof quotes** and cites official document titles, guaranteeing legal transparency `[IMPLEMENTED]`.
2. **Zero-Login Frictionless Access**: Removed authentication barriers to enable instant demo access `[IMPLEMENTED]`.
3. **Resilient Architecture**: Dual-engine design with a deterministic **Logic-Fallback Engine** ensuring 100% demo uptime even if database or API calls timeout `[IMPLEMENTED]`.
4. **Multilingual & Voice Accessibility**: Integrated Web Speech voice input and 23-language translation `[IMPLEMENTED]`.

---

## 4. Judge Q&A Anticipation Matrix

| Judge Question | Strategic Response |
|---|---|
| *"What happens if Gemini API goes down during the demo?"* | *"We engineered a resilient Fallback Engine that intercepts network errors and evaluates hardcoded rules for PM-KISAN, KMY, and KUSUM without crashing."* |
| *"How do you prevent AI hallucinations?"* | *"Our system prompt forces Gemini 1.5 Pro to ground its decision ONLY in retrieved PDF chunks and extract verbatim quotes directly from official guidelines."* |
| *"How will non-literate farmers use this?"* | *"They click the Voice Input button, speak in their native dialect, and listen to the Text-to-Speech audio playback of the Proof Card."* |
