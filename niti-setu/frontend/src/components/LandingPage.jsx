import React from 'react';
import { ShieldCheck, Mic, FileSearch, Zap, ArrowRight, ChevronDown } from 'lucide-react';

const LandingPage = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-brand-100 italic">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32 lg:pt-32 lg:pb-48 bg-gradient-to-b from-brand-50 via-white to-white">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none overflow-hidden opacity-20">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-400 blur-[120px] rounded-full"></div>
            <div className="absolute bottom-[20%] right-[-5%] w-[30%] h-[30%] bg-brand-300 blur-[100px] rounded-full"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-100 text-brand-700 text-xs font-bold uppercase tracking-wider mb-8 animate-fade-in">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
            </span>
            Next-Gen Agriculture Tech
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-black text-gray-900 leading-tight tracking-tighter mb-6">
            Empowering Farmers with <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-brand-800">
              AI-Driven Clarity.
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
            Niti-Setu translates complex bureaucratic guidelines into instant, 
            voice-activated eligibility answers for Indian agricultural schemes.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={onGetStarted}
              className="group px-8 py-4 bg-gray-900 text-white rounded-full font-bold text-lg hover:bg-gray-800 transition-all hover:scale-105 active:scale-95 shadow-xl flex items-center gap-2"
            >
              Check My Eligibility
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="px-8 py-4 bg-white text-gray-700 rounded-full font-bold text-lg border border-gray-200 hover:bg-gray-50 transition-all shadow-sm">
              How it Works
            </button>
          </div>

          <div className="mt-16 flex flex-col items-center gap-2 text-gray-400 animate-bounce">
            <span className="text-xs font-bold uppercase tracking-widest">Discover Features</span>
            <ChevronDown className="w-5 h-5" />
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Feature 1 */}
            <div className="group relative p-8 rounded-3xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
              <div className="w-14 h-14 bg-brand-600 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg group-hover:rotate-6 transition-transform">
                <Mic className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Voice-Powered Input</h3>
              <p className="text-gray-600 leading-relaxed">
                No typing required. Simply speak your details in your language, 
                and our AI extracts relevant data automatically.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group relative p-8 rounded-3xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
              <div className="w-14 h-14 bg-brand-600 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg group-hover:rotate-6 transition-transform">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Verified Accuracy</h3>
              <p className="text-gray-600 leading-relaxed">
                Directly cross-references the official 50-page PDF guidelines 
                to ensure you get 100% reliable information.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group relative p-8 rounded-3xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
              <div className="w-14 h-14 bg-brand-600 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg group-hover:rotate-6 transition-transform">
                <Zap className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Instant Analysis</h3>
              <p className="text-gray-600 leading-relaxed">
                Skip the lines and bureaucratic confusion. Get a "Yes/No" 
                answer with reasoning in under 3 seconds.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 bg-gray-50 border-y border-gray-100">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-8 text-gray-800 italic">Built for the Modern Farmer</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 opacity-40 grayscale group-hover:grayscale-0 transition-all">
             <div className="flex flex-col items-center">
                <div className="text-2xl font-black">PM-KISAN</div>
             </div>
             <div className="flex flex-col items-center">
                <div className="text-2xl font-black">PM-KUSUM</div>
             </div>
             <div className="flex flex-col items-center">
                <div className="text-2xl font-black">KMY</div>
             </div>
             <div className="flex flex-col items-center">
                <div className="text-2xl font-black">FASAL BIMA</div>
             </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-brand-900 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-[50%] h-full bg-brand-800 skew-x-[-12deg] translate-x-[20%]"></div>
          <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
            <h2 className="text-4xl lg:text-5xl font-black mb-8 leading-tight">Ready to bridge the gap <br />between policy and people?</h2>
            <button 
              onClick={onGetStarted}
              className="px-10 py-5 bg-white text-brand-900 rounded-full font-black text-xl hover:bg-brand-50 transition-all hover:scale-105 active:scale-95 shadow-2x-l"
            >
              Launch Consultant Tool
            </button>
          </div>
      </section>
    </div>
  );
};

export default LandingPage;
