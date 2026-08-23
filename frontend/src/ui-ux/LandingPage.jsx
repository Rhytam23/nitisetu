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
      sourceDoc: "PM-KISAN Operational Guidelines"
    },
    {
      id: "PM-KMY",
      title: "Pradhan Mantri Kisan Maan-Dhan Yojana",
      benefit: "₹3,000 / month pension after age 60",
      target: "Small & Marginal Farmers (18–40 years, ≤ 5 acres)",
      sourceDoc: "PM-KMY Operational Guidelines"
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
    <div className="min-h-screen bg-[#F8F5EC] text-[#202622] font-sans relative">
      
      {/* Top Header Navigation */}
      <header className="w-full border-b border-[#0F3523] bg-[#174A32] text-white sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center font-bold text-white text-lg">
              🏛️
            </div>
            <div>
              <span className="text-xl font-bold text-white tracking-tight font-poppins">Niti-Setu</span>
              <span className="text-xs text-[#E9B949] block -mt-1 font-semibold">Citizen Benefits Platform</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowGuide(true)} 
              className="text-xs font-semibold text-white/90 hover:text-white px-3 py-2 rounded-md hover:bg-[#2F6B4F] transition-colors hidden sm:block"
            >
              System Architecture
            </button>
            <button 
              onClick={onGetStarted}
              className="px-4 py-2 bg-[#E9B949] hover:bg-[#D9A838] text-[#174A32] rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
            >
              Evaluate Eligibility <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Hero Header */}
      <section className="py-16 sm:py-20 border-b border-[#DDE3DC] bg-[#F8F5EC]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-md bg-[#E8F5EC] border border-[#C6E7D2] text-[#287A4D] text-xs font-semibold">
            <ShieldCheck size={15} />
            Official Government Policy Verification Platform
          </div>
          
          <h1 className="text-3xl sm:text-5xl font-bold text-[#202622] tracking-tight leading-tight font-poppins">
            Find schemes you may qualify for with <span className="text-[#174A32]">official policy evidence</span>
          </h1>

          <p className="text-[#66706A] text-base sm:text-lg max-w-2xl mx-auto leading-relaxed font-normal">
            Niti-Setu checks your landholding size, crop type, age, and location against active government operational guidelines (PM-KISAN, PM-KMY, PM-KUSUM) to explain your eligibility, document requirements, and exact next steps.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button 
              onClick={onGetStarted}
              className="w-full sm:w-auto px-7 py-3.5 bg-[#174A32] hover:bg-[#2F6B4F] text-white font-semibold rounded-lg text-sm transition-all shadow-sm flex items-center justify-center gap-2"
            >
              Check Scheme Eligibility <ArrowRight size={18} />
            </button>
            <button 
              onClick={() => setShowGuide(true)} 
              className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-[#F8F5EC] text-[#2F6B4F] border border-[#2F6B4F] font-semibold rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
            >
              <BookOpen size={16} />
              View Policy Architecture
            </button>
          </div>
        </div>
      </section>

      {/* 3-Step Verification Pathway */}
      <section className="py-14 sm:py-16 max-w-5xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="border-b border-[#DDE3DC] pb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#2F6B4F] mb-1">Simple Verification Pathway</h2>
          <p className="text-xl sm:text-2xl font-bold text-[#202622] font-poppins">How your information is verified</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-[#DDE3DC] space-y-3 shadow-xs">
            <div className="w-9 h-9 rounded-lg bg-[#E8F5EC] text-[#174A32] border border-[#C6E7D2] flex items-center justify-center font-bold">
              <Mic size={18} />
            </div>
            <h3 className="text-base font-bold text-[#202622] font-poppins">1. Enter Your Details</h3>
            <p className="text-xs text-[#66706A] leading-relaxed">
              Enter your landholding size, state, crop type, and age via simple form inputs or voice input assistant.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-[#DDE3DC] space-y-3 shadow-xs">
            <div className="w-9 h-9 rounded-lg bg-[#E8F5EC] text-[#174A32] border border-[#C6E7D2] flex items-center justify-center font-bold">
              <FileText size={18} />
            </div>
            <h3 className="text-base font-bold text-[#202622] font-poppins">2. Guideline Matching</h3>
            <p className="text-xs text-[#66706A] leading-relaxed">
              The platform matches your profile parameters directly against active government policy operational clauses.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-[#DDE3DC] space-y-3 shadow-xs">
            <div className="w-9 h-9 rounded-lg bg-[#E8F5EC] text-[#174A32] border border-[#C6E7D2] flex items-center justify-center font-bold">
              <CheckCircle size={18} />
            </div>
            <h3 className="text-base font-bold text-[#202622] font-poppins">3. Policy Evidence & Steps</h3>
            <p className="text-xs text-[#66706A] leading-relaxed">
              Receive your eligibility status, verbatim policy quotes, document checklist, and step-by-step application guidance.
            </p>
          </div>
        </div>
      </section>

      {/* Catalog of Active Supported Schemes */}
      <section className="py-14 bg-white border-t border-b border-[#DDE3DC]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-6">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#2F6B4F] mb-1">Supported Public Benefits</h2>
            <p className="text-xl sm:text-2xl font-bold text-[#202622] font-poppins">Central Agricultural Schemes</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {supportedSchemes.map((scheme) => (
              <div key={scheme.id} className="bg-[#F8F5EC] p-5 rounded-xl border border-[#DDE3DC] space-y-3">
                <span className="px-2.5 py-0.5 rounded bg-[#174A32] text-white font-bold text-[11px] inline-block">
                  {scheme.id}
                </span>
                <h3 className="font-bold text-[#202622] text-sm leading-snug font-poppins">{scheme.title}</h3>
                <p className="text-xs text-[#2F6B4F] font-semibold">{scheme.benefit}</p>
                <div className="pt-2 border-t border-[#DDE3DC] text-[11px] text-[#66706A] space-y-1">
                  <p><strong className="text-[#202622]">Target:</strong> {scheme.target}</p>
                  <p><strong className="text-[#202622]">Source:</strong> {scheme.sourceDoc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* System Architecture Modal */}
      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#202622]/60 backdrop-blur-xs">
          <div className="bg-white border border-[#DDE3DC] p-6 sm:p-8 rounded-xl max-w-2xl w-full relative space-y-5 shadow-lg">
            <div className="flex items-center justify-between border-b border-[#DDE3DC] pb-4">
              <div>
                <h3 className="text-lg font-bold text-[#202622] flex items-center gap-2 font-poppins">
                  <Layers className="text-[#174A32]" size={20} />
                  System Architecture & Guideline Retrieval
                </h3>
                <p className="text-xs text-[#66706A] mt-0.5">How Niti-Setu matches farmer profiles against policy guidelines</p>
              </div>
              <button 
                onClick={() => setShowGuide(false)} 
                className="p-1.5 text-[#66706A] hover:text-[#202622] rounded-md hover:bg-[#F8F5EC] transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#66706A] leading-relaxed">
              <div className="bg-[#F8F5EC] p-4 rounded-lg border border-[#DDE3DC]">
                <h4 className="font-bold text-[#202622] mb-1">1. MongoDB Atlas Guideline Knowledge Base</h4>
                <p>Official scheme guidelines are chunked into 207 searchable passages indexed in MongoDB Atlas to prevent policy hallucinations.</p>
              </div>

              <div className="bg-[#F8F5EC] p-4 rounded-lg border border-[#DDE3DC]">
                <h4 className="font-bold text-[#202622] mb-1">2. Metadata-Scoped Search</h4>
                <p>When evaluating a target scheme, retrieval scopes clauses to eliminate cross-scheme rule contamination.</p>
              </div>

              <div className="bg-[#F8F5EC] p-4 rounded-lg border border-[#DDE3DC]">
                <h4 className="font-bold text-[#202622] mb-1">3. Deterministic Verification Backup</h4>
                <p>If network latency occurs, fallback evaluation logic verifies scheme requirements to ensure 100% platform availability.</p>
              </div>
            </div>

            <button 
              onClick={() => { setShowGuide(false); onGetStarted(); }} 
              className="w-full py-3 bg-[#174A32] hover:bg-[#2F6B4F] text-white font-semibold rounded-lg text-xs uppercase tracking-wider transition-colors"
            >
              Proceed to Scheme Evaluation
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="py-8 border-t border-[#DDE3DC] text-center text-xs text-[#66706A] bg-white">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 Niti-Setu — Citizen Benefits Platform</p>
          <div className="flex gap-4 font-medium text-[#2F6B4F]">
            <a href="https://pmkisan.gov.in" target="_blank" rel="noreferrer" className="hover:underline">PM-KISAN Portal</a>
            <a href="https://pmkmy.gov.in" target="_blank" rel="noreferrer" className="hover:underline">PM-KMY Portal</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
