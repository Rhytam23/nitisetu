import React, { useState } from 'react';
import { ShieldCheck, Mic, FileSearch, Zap, ArrowRight, ChevronDown, X } from 'lucide-react';

const LandingPage = ({ onGetStarted }) => {
  const [showGuide, setShowGuide] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-brand-950 font-sans selection:bg-brand-200 selection:text-brand-900 relative overflow-hidden">
      
      {/* Guide Modal Phase */}
      {showGuide && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-brand-950/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white/80 backdrop-blur-2xl border border-white p-6 sm:p-10 rounded-[2rem] shadow-2xl max-w-2xl w-full relative">
            <button onClick={() => setShowGuide(false)} className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 bg-brand-50 hover:bg-brand-100 text-brand-900 rounded-full transition-colors">
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <h3 className="text-2xl sm:text-3xl font-black text-brand-950 mb-6 sm:mb-8 tracking-tight">How Niti-Setu Works</h3>
            
            <div className="space-y-6 sm:space-y-8">
              <div className="flex items-start gap-4 sm:gap-6 group">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center font-black shrink-0 transition-transform group-hover:scale-110 shadow-inner">1</div>
                <div>
                  <h4 className="text-lg sm:text-xl font-bold text-brand-900">Voice or Manual Entry</h4>
                  <p className="text-brand-700/80 text-sm sm:text-base mt-2 font-medium leading-relaxed">Tap the microphone to speak your land details and crop type, or type them in manually. Our system automatically understands natural agricultural terms.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 sm:gap-6 group">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center font-black shrink-0 transition-transform group-hover:scale-110 shadow-inner">2</div>
                <div>
                  <h4 className="text-lg sm:text-xl font-bold text-brand-900">AI Context Processing</h4>
                  <p className="text-brand-700/80 text-sm sm:text-base mt-2 font-medium leading-relaxed">The reasoning engine searches through the latest official PDF guidelines, validating complex eligibility rules instantly against your specific profile.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 sm:gap-6 group">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center font-black shrink-0 transition-transform group-hover:scale-110 shadow-inner">3</div>
                <div>
                  <h4 className="text-lg sm:text-xl font-bold text-brand-900">Instant Official Verdict</h4>
                  <p className="text-brand-700/80 text-sm sm:text-base mt-2 font-medium leading-relaxed">You receive a definitive Yes/No answer, complete with exact citations from the bureaucratic document and a checklist of required proofs to apply.</p>
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => { setShowGuide(false); onGetStarted(); }} 
              className="mt-8 sm:mt-10 w-full py-4 bg-brand-600 hover:bg-brand-500 text-white font-black rounded-xl shadow-lg hover:-translate-y-1 transition-all text-sm sm:text-base"
            >
              Start Checking Eligibility Now
            </button>
          </div>
        </div>
      )}

      {/* Background Orbs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-brand-200/30 blur-[120px] rounded-full mix-blend-multiply"></div>
        <div className="absolute top-[40%] left-[-10%] w-[30%] h-[30%] bg-brand-300/20 blur-[100px] rounded-full mix-blend-multiply"></div>
      </div>

      {/* Hero Section */}
      <section className="relative pt-16 sm:pt-20 pb-20 sm:pb-32 lg:pt-32 lg:pb-48 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50/80 backdrop-blur-md border border-brand-200/50 text-brand-800 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] mb-6 sm:mb-8 shadow-sm animate-fade-in-up">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500 shadow-[0_0_8px_rgba(20,184,166,0.8)]"></span>
            </span>
            Next-Gen Agriculture Tech
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-brand-950 leading-[1.1] tracking-tight mb-4 sm:mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            Empowering Farmers with <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-brand-800 break-words">
              AI-Driven Clarity.
            </span>
          </h1>
          
          <p className="text-lg sm:text-xl text-brand-900/60 max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed font-medium animate-fade-in-up px-2" style={{ animationDelay: '0.2s' }}>
            Niti-Setu translates complex bureaucratic guidelines into instant, 
            voice-activated eligibility answers for Indian agricultural schemes.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 animate-fade-in-up px-4 sm:px-0" style={{ animationDelay: '0.3s' }}>
            <button 
              onClick={onGetStarted}
              className="w-full sm:w-auto group px-6 sm:px-8 py-4 sm:py-4 bg-brand-900 text-white rounded-full font-bold text-base sm:text-lg hover:bg-brand-800 transition-all hover:scale-105 active:scale-95 shadow-[0_10px_40px_rgba(15,118,110,0.3)] flex items-center justify-center gap-2 border border-brand-700/50"
            >
              Check My Eligibility
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={() => setShowGuide(true)} 
              className="w-full sm:w-auto px-6 sm:px-8 py-4 sm:py-4 bg-white/70 backdrop-blur-md text-brand-900 rounded-full font-bold text-base sm:text-lg border border-brand-200/50 hover:bg-white hover:shadow-lg transition-all shadow-sm"
            >
              How it Works
            </button>
          </div>

          <div className="mt-16 sm:mt-20 flex flex-col items-center gap-2 text-brand-900/40 animate-bounce">
            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em]">Discover Features</span>
            <ChevronDown className="w-5 h-5" />
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features-section" className="py-16 sm:py-24 relative z-10 scroll-mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Feature 1 */}
            <div className="group relative p-6 sm:p-8 rounded-[2rem] border border-white/80 bg-white/40 backdrop-blur-xl hover:bg-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1 sm:hover:-translate-y-2 transition-all duration-300">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-brand-400 to-brand-600 rounded-xl sm:rounded-2xl flex items-center justify-center text-white mb-4 sm:mb-6 shadow-lg shadow-brand-500/30 group-hover:rotate-6 group-hover:scale-110 transition-transform">
                <Mic className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-brand-950 tracking-tight mb-3 sm:mb-4">Voice-Powered Input</h3>
              <p className="text-brand-900/60 leading-relaxed font-medium text-sm sm:text-base">
                No typing required. Simply speak your details in your language, 
                and our AI extracts relevant data automatically.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group relative p-6 sm:p-8 rounded-[2rem] border border-white/80 bg-white/40 backdrop-blur-xl hover:bg-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1 sm:hover:-translate-y-2 transition-all duration-300">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-brand-400 to-brand-600 rounded-xl sm:rounded-2xl flex items-center justify-center text-white mb-4 sm:mb-6 shadow-lg shadow-brand-500/30 group-hover:-rotate-6 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-brand-950 tracking-tight mb-3 sm:mb-4">Verified Accuracy</h3>
              <p className="text-brand-900/60 leading-relaxed font-medium text-sm sm:text-base">
                Directly cross-references the official 50-page PDF guidelines 
                to ensure you get 100% reliable information.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group relative p-6 sm:p-8 rounded-[2rem] border border-white/80 bg-white/40 backdrop-blur-xl hover:bg-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1 sm:hover:-translate-y-2 transition-all duration-300">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-brand-400 to-brand-600 rounded-xl sm:rounded-2xl flex items-center justify-center text-white mb-4 sm:mb-6 shadow-lg shadow-brand-500/30 group-hover:rotate-6 group-hover:scale-110 transition-transform">
                <Zap className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-brand-950 tracking-tight mb-3 sm:mb-4">Instant Analysis</h3>
              <p className="text-brand-900/60 leading-relaxed font-medium text-sm sm:text-base">
                Skip the lines and bureaucratic confusion. Get a "Yes/No" 
                answer with reasoning in under 3 seconds.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-12 sm:py-20 relative z-10 border-t border-brand-100/50 bg-white/10 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-brand-900/40 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] mb-6 sm:mb-10">Trusted Analytical Engines For</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
             <div className="flex flex-col items-center justify-center">
                <div className="text-lg sm:text-2xl font-black text-brand-900 tracking-tight">PM-KISAN</div>
             </div>
             <div className="flex flex-col items-center justify-center">
                <div className="text-lg sm:text-2xl font-black text-brand-900 tracking-tight">PM-KUSUM</div>
             </div>
             <div className="flex flex-col items-center justify-center">
                <div className="text-lg sm:text-xl font-black text-brand-900 tracking-tight">KMY</div>
             </div>
             <div className="flex flex-col items-center justify-center">
                <div className="text-lg sm:text-xl font-black text-brand-900 tracking-tight">FASAL BIMA</div>
             </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 bg-brand-950 text-white relative z-10 overflow-hidden mt-8 sm:mt-10 rounded-t-[2rem] sm:rounded-[3rem] mx-auto max-w-[96%] xl:max-w-7xl shadow-[0_-20px_50px_rgba(4,47,46,0.5)]">
          <div className="absolute top-0 right-0 w-full sm:w-[60%] h-full bg-gradient-to-l from-brand-800 to-transparent opacity-30 sm:opacity-50 blur-2xl sm:blur-3xl"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 text-center">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-6 sm:mb-8 leading-tight tracking-tight">Ready to bridge the gap <br className="hidden sm:block" />between policy and people?</h2>
            <button 
              onClick={onGetStarted}
              className="w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-5 bg-gradient-to-r from-brand-400 to-brand-500 text-brand-950 rounded-full font-black text-lg sm:text-xl hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(45,212,191,0.4)] transition-all border border-brand-300/50"
            >
              Launch Consultant Tool
            </button>
          </div>
      </section>
    </div>
  );
};

export default LandingPage;
