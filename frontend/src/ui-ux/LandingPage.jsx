import React, { useState } from 'react';
import { FileText, Mic, CheckCircle, ArrowRight, X, ShieldCheck, ChevronRight, BookOpen, Layers } from 'lucide-react';

const LandingPage = ({ onGetStarted }) => {
  const [showGuide, setShowGuide] = useState(false);

  const supportedSchemes = [
    {
      id: "PM-KISAN",
      title: "Pradhan Mantri Kisan Samman Nidhi",
      benefit: "₹6,000 / year direct transfer",
      target: "Landholding farmer families across India",
      sourceDoc: "PM-KISAN Operational Guidelines (2020)"
    },
    {
      id: "PM-KMY",
      title: "Pradhan Mantri Kisan Maan-Dhan Yojana",
      benefit: "₹3,000 / month pension after age 60",
      target: "Small & Marginal Farmers (18–40 years, ≤ 5 acres)",
      sourceDoc: "PM-KMY Operational Guidelines (2019)"
    },
    {
      id: "PM-KUSUM",
      title: "PM Kisan Urja Suraksha evam Utthan Mahabhiyan",
      benefit: "Up to 60% solar irrigation pump subsidy",
      target: "Farmers & agricultural landholders",
      sourceDoc: "PM-KUSUM Scheme Guidelines"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-teal-500/30 selection:text-white relative">
      
      {/* Top Navigation */}
      <nav className="w-full border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center text-slate-950 font-black text-lg">
              N
            </div>
            <div>
              <span className="text-xl font-bold text-white tracking-tight">Niti-Setu</span>
              <span className="text-xs text-slate-400 block -mt-1 font-medium">Government Benefit Verification</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowGuide(true)} 
              className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors hidden sm:block"
            >
              System Architecture
            </button>
            <button 
              onClick={onGetStarted}
              className="px-5 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
            >
              Evaluate Eligibility <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Hero Header */}
      <section className="py-16 sm:py-24 border-b border-slate-800/80 bg-gradient-to-b from-slate-900/50 to-slate-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs font-semibold">
            <ShieldCheck size={14} className="text-teal-400" />
            Official Government Policy Verification Engine
          </div>
          
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight">
            Scheme Eligibility Verified with <br className="hidden sm:inline" />
            <span className="text-teal-400">Verbatim Government Proof</span>
          </h1>

          <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed font-normal">
            Niti-Setu evaluates farmer landholding size, crop type, age, and state against 
            active government operational guidelines (PM-KISAN, PM-KMY, PM-KUSUM) to deliver 
            verifiable status verdicts, original document quotes, and step-by-step application guidance.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={onGetStarted}
              className="w-full sm:w-auto px-8 py-4 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2"
            >
              Start Eligibility Check <ArrowRight size={18} />
            </button>
            <button 
              onClick={() => setShowGuide(true)} 
              className="w-full sm:w-auto px-6 py-4 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
            >
              <BookOpen size={16} className="text-slate-400" />
              View Policy Knowledge Base
            </button>
          </div>
        </div>
      </section>

      {/* Structured Domain Workflow */}
      <section className="py-16 sm:py-20 max-w-5xl mx-auto px-4 sm:px-6 space-y-12">
        <div className="border-b border-slate-800 pb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-teal-400 mb-1">3-Step Verification Pathway</h2>
          <p className="text-xl sm:text-2xl font-bold text-white">How Policy Evidence is Retrieved and Verified</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900/60 p-6 rounded-xl border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center justify-center font-bold">
              <Mic size={20} />
            </div>
            <h3 className="text-lg font-bold text-white">1. Smart Voice or Form Input</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Speak or enter land size, state, crop, and age. Includes a live voice transcript confirmation card so farmers review extracted fields before evaluation.
            </p>
          </div>

          <div className="bg-slate-900/60 p-6 rounded-xl border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center justify-center font-bold">
              <FileText size={20} />
            </div>
            <h3 className="text-lg font-bold text-white">2. Vector Search Retrieval</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Queries 293 vectorized policy chunks indexed in MongoDB Atlas (`vector_index`) to match your profile directly against official document clauses.
            </p>
          </div>

          <div className="bg-slate-900/60 p-6 rounded-xl border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center justify-center font-bold">
              <CheckCircle size={20} />
            </div>
            <h3 className="text-lg font-bold text-white">3. Proof Card & Guidance</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Provides an untranslated verbatim policy quote, localized explanation, required document acquisition checklist (*Why & Where*), and step-by-step application steps.
            </p>
          </div>
        </div>
      </section>

      {/* Catalog of Active Supported Schemes */}
      <section className="py-16 bg-slate-900/40 border-t border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-8">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-teal-400 mb-1">Indexed Policy Knowledge</h2>
            <p className="text-xl sm:text-2xl font-bold text-white">Supported Central Agricultural Schemes</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {supportedSchemes.map((scheme) => (
              <div key={scheme.id} className="bg-slate-900 p-5 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded bg-teal-500/10 text-teal-300 font-bold text-xs border border-teal-500/20">
                    {scheme.id}
                  </span>
                </div>
                <h3 className="font-bold text-white text-base leading-snug">{scheme.title}</h3>
                <p className="text-xs text-teal-300 font-semibold">{scheme.benefit}</p>
                <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
                  <p><strong className="text-slate-300">Target:</strong> {scheme.target}</p>
                  <p><strong className="text-slate-300">Source:</strong> {scheme.sourceDoc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* System Architecture Modal */}
      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-2xl max-w-2xl w-full relative space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Layers className="text-teal-400" size={20} />
                  System Architecture & RAG Pipeline
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">How Niti-Setu processes queries without policy hallucination</p>
              </div>
              <button 
                onClick={() => setShowGuide(false)} 
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <h4 className="font-bold text-white mb-1">1. MongoDB Atlas Vector Search Index</h4>
                <p className="text-slate-400">All 3 official scheme operational guidelines are chunked into 293 searchable vectors indexed in MongoDB Atlas (`vector_index`, 3072 dimensions matching `gemini-embedding-2-preview`).</p>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <h4 className="font-bold text-white mb-1">2. Scheme Metadata Filtering</h4>
                <p className="text-slate-400">When evaluating a target scheme, `ragService.js` applies a `preFilter` metadata scope (`scheme_name: targetScheme`) to eliminate cross-scheme evidence contamination.</p>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <h4 className="font-bold text-white mb-1">3. Deterministic Fallback Circuit Breaker</h4>
                <p className="text-slate-400">If API limits or network timeouts occur, `eligibilityService.js` executes deterministic eligibility logic (`fallbackService.js`), guaranteeing 100% uptime with explicit engine status tags.</p>
              </div>
            </div>

            <button 
              onClick={() => { setShowGuide(false); onGetStarted(); }} 
              className="w-full py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs uppercase tracking-wider transition-colors"
            >
              Proceed to Profile Evaluation
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="py-10 border-t border-slate-800 text-center text-xs text-slate-500">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Niti-Setu Government Scheme Access Engine</p>
          <div className="flex gap-4 font-medium text-slate-400">
            <a href="#schemes" className="hover:text-teal-400 transition-colors">Supported Schemes</a>
            <a href="https://pmkisan.gov.in" target="_blank" rel="noreferrer" className="hover:text-teal-400 transition-colors">PM-KISAN Portal</a>
            <a href="https://pmkmy.gov.in" target="_blank" rel="noreferrer" className="hover:text-teal-400 transition-colors">PM-KMY Portal</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
