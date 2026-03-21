import React, { useState } from 'react';
import { ShieldCheck, Mic, FileSearch, Zap, ArrowRight, ChevronDown, X } from 'lucide-react';

const LandingPage = ({ onGetStarted }) => {
  const [showGuide, setShowGuide] = useState(false);

  return (
    <div className="min-h-screen bg-[#0B0E14] text-slate-200 font-sans selection:bg-brand-500/30 selection:text-white relative overflow-hidden">
      
      {/* Guide Modal Phase */}
      {showGuide && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900/90 backdrop-blur-3xl border border-white/10 p-6 sm:p-10 rounded-[2rem] shadow-[0_30px_60px_rgba(0,0,0,0.8)] max-w-2xl w-full relative">
            <button onClick={() => setShowGuide(false)} className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-full transition-colors border border-white/5">
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <h3 className="text-2xl sm:text-3xl font-black text-white mb-6 sm:mb-8 tracking-tight drop-shadow-[0_0_15px_rgba(16,185,129,0.2)]">How Niti-Setu Works</h3>
            
            <div className="space-y-6 sm:space-y-8">
              <div className="flex items-start gap-4 sm:gap-6 group">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-400 flex items-center justify-center font-black shrink-0 transition-transform group-hover:scale-110 shadow-[0_0_20px_rgba(16,185,129,0.2)]">1</div>
                <div>
                  <h4 className="text-lg sm:text-xl font-bold text-white">Voice or Manual Entry</h4>
                  <p className="text-slate-400 text-sm sm:text-base mt-2 font-medium leading-relaxed">Tap the microphone to speak your land details and crop type, or type them in manually. Our system automatically understands natural agricultural terms.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 sm:gap-6 group">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center font-black shrink-0 transition-transform group-hover:scale-110 shadow-[0_0_20px_rgba(6,182,212,0.2)]">2</div>
                <div>
                  <h4 className="text-lg sm:text-xl font-bold text-white">AI Context Processing</h4>
                  <p className="text-slate-400 text-sm sm:text-base mt-2 font-medium leading-relaxed">The reasoning engine searches through the latest official PDF guidelines, validating complex eligibility rules instantly against your specific profile.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 sm:gap-6 group">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center font-black shrink-0 transition-transform group-hover:scale-110 shadow-[0_0_20px_rgba(168,85,247,0.2)]">3</div>
                <div>
                  <h4 className="text-lg sm:text-xl font-bold text-white">Instant Official Verdict</h4>
                  <p className="text-slate-400 text-sm sm:text-base mt-2 font-medium leading-relaxed">You receive a definitive Yes/No answer, complete with exact citations from the bureaucratic document and a checklist of required proofs to apply.</p>
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => { setShowGuide(false); onGetStarted(); }} 
              className="mt-8 sm:mt-10 w-full py-4 bg-brand-500 hover:bg-brand-400 text-slate-950 font-black rounded-xl shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_50px_rgba(16,185,129,0.5)] hover:-translate-y-1 transition-all text-sm sm:text-base"
            >
              Start Checking Eligibility Now
            </button>
          </div>
        </div>
      )}

      {/* Dark Agri-Tech Orbs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-brand-500/10 blur-[150px] rounded-full mix-blend-screen"></div>
        <div className="absolute top-[40%] left-[-10%] w-[30%] h-[30%] bg-cyan-500/10 blur-[120px] rounded-full mix-blend-screen"></div>
        <div className="absolute bottom-[-10%] right-[20%] w-[35%] h-[35%] bg-purple-500/10 blur-[150px] rounded-full mix-blend-screen"></div>
      </div>

      {/* Hero Section */}
      <section className="relative pt-16 sm:pt-20 pb-20 sm:pb-32 lg:pt-32 lg:pb-48 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-brand-400 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] mb-6 sm:mb-8 shadow-sm animate-fade-in-up">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
            </span>
            Next-Gen Agriculture Tech
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-white leading-[1.1] tracking-tight mb-4 sm:mb-6 animate-fade-in-up drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]" style={{ animationDelay: '0.1s' }}>
            Empowering Farmers with <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-cyan-400 to-blue-400 drop-shadow-[0_0_30px_rgba(16,185,129,0.3)]">
              AI-Driven Clarity.
            </span>
          </h1>
          
          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed font-medium animate-fade-in-up px-2" style={{ animationDelay: '0.2s' }}>
            Niti-Setu translates complex bureaucratic guidelines into instant, 
            voice-activated eligibility answers for Indian agricultural schemes.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 animate-fade-in-up px-4 sm:px-0" style={{ animationDelay: '0.3s' }}>
            <button 
              onClick={onGetStarted}
              className="w-full sm:w-auto group px-8 sm:px-10 py-4 sm:py-5 bg-gradient-to-r from-brand-500 to-brand-400 text-slate-950 rounded-full font-black text-base sm:text-lg hover:from-brand-400 hover:to-cyan-400 transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(16,185,129,0.4)] flex items-center justify-center gap-3 border border-brand-300/50"
            >
              Check My Eligibility
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={() => setShowGuide(true)} 
              className="w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-5 bg-white/5 backdrop-blur-md text-white rounded-full font-bold text-base sm:text-lg border border-white/10 hover:bg-white/10 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all"
            >
              How it Works
            </button>
          </div>

          <div className="mt-16 sm:mt-20 flex flex-col items-center gap-2 text-slate-500 animate-bounce">
            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em]">Discover Features</span>
            <ChevronDown className="w-5 h-5" />
          </div>
        </div>
      </section>

      {/* Features Grid Dark */}
      <section id="features-section" className="py-16 sm:py-24 relative z-10 scroll-mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Feature 1 */}
            <div className="group relative p-6 sm:p-8 rounded-[2.5rem] border border-white/5 bg-white/[0.03] backdrop-blur-2xl hover:bg-white/[0.06] shadow-[0_8px_30px_rgba(0,0,0,0.3)] hover:shadow-[0_20px_40px_rgba(16,185,129,0.1)] hover:-translate-y-1 sm:hover:-translate-y-2 transition-all duration-300">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-brand-500 to-brand-600 rounded-xl sm:rounded-2xl flex items-center justify-center text-slate-950 mb-4 sm:mb-6 shadow-[0_0_20px_rgba(16,185,129,0.4)] group-hover:rotate-6 group-hover:scale-110 transition-transform">
                <Mic className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight mb-3 sm:mb-4">Voice-Powered Input</h3>
              <p className="text-slate-400 leading-relaxed font-medium text-sm sm:text-base">
                No typing required. Simply speak your details in your language, 
                and our AI extracts relevant data automatically.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group relative p-6 sm:p-8 rounded-[2.5rem] border border-white/5 bg-white/[0.03] backdrop-blur-2xl hover:bg-white/[0.06] shadow-[0_8px_30px_rgba(0,0,0,0.3)] hover:shadow-[0_20px_40px_rgba(6,182,212,0.1)] hover:-translate-y-1 sm:hover:-translate-y-2 transition-all duration-300">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl sm:rounded-2xl flex items-center justify-center text-slate-950 mb-4 sm:mb-6 shadow-[0_0_20px_rgba(6,182,212,0.4)] group-hover:-rotate-6 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight mb-3 sm:mb-4">Verified Accuracy</h3>
              <p className="text-slate-400 leading-relaxed font-medium text-sm sm:text-base">
                Directly cross-references the official 50-page PDF guidelines 
                to ensure you get 100% reliable information.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group relative p-6 sm:p-8 rounded-[2.5rem] border border-white/5 bg-white/[0.03] backdrop-blur-2xl hover:bg-white/[0.06] shadow-[0_8px_30px_rgba(0,0,0,0.3)] hover:shadow-[0_20px_40px_rgba(168,85,247,0.1)] hover:-translate-y-1 sm:hover:-translate-y-2 transition-all duration-300">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-xl sm:rounded-2xl flex items-center justify-center text-slate-950 mb-4 sm:mb-6 shadow-[0_0_20px_rgba(168,85,247,0.4)] group-hover:rotate-6 group-hover:scale-110 transition-transform">
                <Zap className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight mb-3 sm:mb-4">Instant Analysis</h3>
              <p className="text-slate-400 leading-relaxed font-medium text-sm sm:text-base">
                Skip the lines and bureaucratic confusion. Get a "Yes/No" 
                answer with reasoning in under 3 seconds.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-12 sm:py-20 relative z-10 border-t border-white/5 bg-white/[0.02]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-slate-500 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] mb-6 sm:mb-10">Trusted Analytical Engines For</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
             <div className="flex flex-col items-center justify-center">
                <div className="text-lg sm:text-2xl font-black text-white tracking-tight">PM-KISAN</div>
             </div>
             <div className="flex flex-col items-center justify-center">
                <div className="text-lg sm:text-2xl font-black text-white tracking-tight">PM-KUSUM</div>
             </div>
             <div className="flex flex-col items-center justify-center">
                <div className="text-lg sm:text-xl font-black text-white tracking-tight">KMY</div>
             </div>
             <div className="flex flex-col items-center justify-center">
                <div className="text-lg sm:text-xl font-black text-white tracking-tight">FASAL BIMA</div>
             </div>
          </div>
        </div>
      </section>

      {/* CTA Section Dark */}
      <section className="py-16 sm:py-24 bg-gradient-to-br from-brand-900 to-slate-900 text-white relative z-10 overflow-hidden mt-8 sm:mt-10 rounded-t-[2rem] sm:rounded-[3rem] mx-auto max-w-[96%] xl:max-w-7xl shadow-[0_-20px_50px_rgba(16,185,129,0.15)] border border-white/10 border-b-0">
          <div className="absolute top-0 right-0 w-full sm:w-[60%] h-full bg-gradient-to-l from-brand-500/20 to-transparent blur-3xl"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 text-center">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-6 sm:mb-8 leading-tight tracking-tight drop-shadow-lg">Ready to bridge the gap <br className="hidden sm:block" />between policy and people?</h2>
            <button 
              onClick={onGetStarted}
              className="w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-5 bg-gradient-to-r from-brand-400 to-brand-500 text-slate-950 rounded-full font-black text-lg sm:text-xl hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(16,185,129,0.5)] transition-all border border-brand-300/50"
            >
              Start Consultant Tool
            </button>
          </div>
      </section>
    </div>
  );
};

export default LandingPage;
