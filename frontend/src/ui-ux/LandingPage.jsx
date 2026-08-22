import React, { useState, useEffect } from 'react';
import { ShieldCheck, Mic, Zap, ArrowRight, ChevronDown, X, Star, Globe, Cpu, User } from 'lucide-react';

const LandingPage = ({ onGetStarted }) => {
  const [showGuide, setShowGuide] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: <Mic className="w-6 h-6" />,
      title: "Voice Intelligence",
      desc: "Speak naturally in your local dialect. Our AI extracts land and crop data with zero typing required.",
      color: "from-brand-500 to-brand-600",
      shadow: "shadow-brand-500/20"
    },
    {
      icon: <ShieldCheck className="w-6 h-6" />,
      title: "Policy Verification",
      desc: "Automated cross-referencing against 50+ pages of the latest official PDF guidelines for 100% accuracy.",
      color: "from-cyan-400 to-blue-500",
      shadow: "shadow-cyan-400/20"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Instant Verdict",
      desc: "Skip the bureaucratic queues. Receive a definitive 'Yes/No' answer with exact citations in under 3 seconds.",
      color: "from-purple-500 to-indigo-600",
      shadow: "shadow-purple-500/20"
    }
  ];

  return (
    <div className="min-h-screen bg-[#06080B] text-slate-200 font-sans selection:bg-brand-500/30 selection:text-white relative overflow-x-hidden">
      
      {/* Floating Glass Navigation */}
      <nav className={`fixed top-0 left-0 w-full z-[100] transition-all duration-500 ${scrolled ? 'py-2 sm:py-3' : 'py-4 sm:py-6'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className={`flex items-center justify-between p-1.5 sm:p-2 pl-4 sm:pl-6 pr-1.5 sm:pr-2 rounded-full border transition-all duration-500 ${scrolled ? 'glass-header shadow-2xl border-white/10' : 'bg-transparent border-transparent'}`}>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-brand-500 flex items-center justify-center shadow-[0_0_15px_rgba(20,184,166,0.4)]">
                <Globe className="text-slate-950 w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <span className="text-lg sm:text-xl font-black text-white tracking-tighter">Niti-Setu</span>
            </div>
            
            <div className="hidden md:flex items-center gap-8 px-6">
              <a href="#features" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-brand-400 transition-colors">Features</a>
              <a href="#schemes" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-brand-400 transition-colors">Schemes</a>
              <a href="#" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-brand-400 transition-colors">Documentation</a>
            </div>

            <div className="flex md:hidden">
              <button 
                onClick={onGetStarted}
                className="flex items-center gap-1.5 px-4 py-2 bg-brand-500 text-slate-950 rounded-full text-[10px] font-black uppercase tracking-widest transition-all shadow-lg"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Reveal Section */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        {/* Background Visual Asset */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/landing_hero_agri_tech_new.png" 
            alt="Futuristic Agricultural Visualization" 
            className="w-full h-full object-cover opacity-30 mix-blend-lighten scale-110 animate-pulse relative"
            style={{ animationDuration: '8s' }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#06080B] via-transparent to-[#06080B]"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#06080B] via-[#06080B]/20 to-transparent"></div>
        </div>

        <div className="content-container px-4 sm:px-6 relative z-10 w-full">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] mb-6 sm:mb-8 animate-fade-in-up">
              <Star className="w-3 h-3 fill-brand-400" />
              Revolutionizing Indian Agricultural Policy
            </div>
            
            <h1 className="text-[--text-fluid-hero] font-black text-white leading-[0.9] tracking-tighter mb-6 sm:mb-8 animate-reveal" style={{ animationDelay: '0.1s' }}>
              Clarity is <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-emerald-400 to-cyan-500 drop-shadow-[0_0_30px_rgba(20,184,166,0.3)]">
                The New Bridge.
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl lg:text-2xl text-slate-400 mb-10 sm:mb-12 leading-relaxed font-medium max-w-2xl animate-reveal" style={{ animationDelay: '0.2s' }}>
              The nation's first AI-powered consultant that translates bureaucratic 
              legalese into instant, voice-activated eligibility for every farmer.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-6 animate-reveal" style={{ animationDelay: '0.3s' }}>
              <button 
                onClick={onGetStarted}
                className="w-full sm:w-auto group px-10 py-5 bg-brand-500 text-slate-950 rounded-full font-black text-lg hover:bg-brand-400 transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(20,184,166,0.4)] flex items-center justify-center gap-3"
              >
                Start Free Consultation
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={() => setShowGuide(true)} 
                className="w-full sm:w-auto px-10 py-5 bg-white/5 backdrop-blur-md text-white rounded-full font-bold text-lg border border-white/10 hover:bg-white/10 transition-all flex items-center justify-center gap-3"
              >
                <Cpu size={20} className="text-slate-400" />
                How Engine Works
              </button>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 opacity-50 animate-bounce">
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">Explore Engine Features</span>
          <ChevronDown size={20} />
        </div>
      </section>

      {/* Feature Grid Overhaul */}
      <section id="features" className="py-32 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-20 animate-fade-in-up">
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-500 mb-4">Precision Engineering</h2>
            <h3 className="text-4xl sm:text-5xl font-black text-white tracking-tight">Built for Resilience.</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <div key={i} className={`glass-card p-10 rounded-[3rem] group hover:bg-white/[0.06] transition-all duration-500 hover:-translate-y-2 animate-reveal`} style={{ animationDelay: `${i * 0.15}s` }}>
                <div className={`w-16 h-16 bg-gradient-to-br ${f.color} rounded-2xl flex items-center justify-center text-slate-950 mb-8 ${f.shadow} shadow-lg transition-transform group-hover:scale-110 group-hover:rotate-6`}>
                  {f.icon}
                </div>
                <h4 className="text-2xl font-black text-white mb-4">{f.title}</h4>
                <p className="text-slate-400 font-medium leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Global Trust Marquee */}
      <section id="schemes" className="py-24 border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
           <p className="text-center text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] mb-12">Empowering National Policy Integration</p>
           <div className="flex flex-wrap justify-center items-center gap-x-16 gap-y-10 opacity-30 hover:opacity-70 transition-opacity duration-700 grayscale hover:grayscale-0">
             {['PM-KISAN', 'PM-KUSUM', 'PM-KMY', 'FASAL BIMA', 'SOLAR MISSION', 'SOIL HEALTH'].map((s, i) => (
               <div key={i} className="text-2xl sm:text-3xl font-black text-white tracking-tighter italic">{s}</div>
             ))}
           </div>
        </div>
      </section>

      {/* Guide Modal Overhaul */}
      {showGuide && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-3xl animate-fade-in">
          <div className="bg-[#0D1117] border border-white/10 p-8 sm:p-12 rounded-[3.5rem] shadow-[0_0_100px_rgba(20,184,166,0.15)] max-w-3xl w-full relative overflow-hidden">
             {/* Modal Background Glow */}
             <div className="absolute -top-20 -right-20 w-64 h-64 bg-brand-500/10 blur-[80px] rounded-full"></div>
             
             <button onClick={() => setShowGuide(false)} className="absolute top-8 right-8 p-3 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-full transition-colors border border-white/5">
                <X size={24} />
             </button>

             <h3 className="text-3xl sm:text-4xl font-black text-white mb-10 tracking-tight">The Reasoning Engine</h3>
             
             <div className="space-y-10">
               {[
                 { step: 1, title: "Contextual Extraction", body: "Our LLM engine parses audio transcripts instantly, mapping regional dialects to structured agricultural metadata.", color: "text-brand-400" },
                 { step: 2, title: "Policy Vector Search", body: "We cross-verify your profile against thousand-node vector embeddings of official government PDF document caches.", color: "text-cyan-400" },
                 { step: 3, title: "Official Certification", body: "The system outputs a detailed 'Proof Card', citing identical clauses from government orders for legal clarity.", color: "text-emerald-400" }
               ].map((item, idx) => (
                 <div key={idx} className="flex gap-8 group">
                   <div className={`w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-xl shrink-0 transition-all ${item.color} group-hover:scale-110 shadow-lg`}>
                     {item.step}
                   </div>
                   <div>
                     <h4 className="text-xl font-bold text-white mb-2">{item.title}</h4>
                     <p className="text-slate-400 font-medium leading-relaxed">{item.body}</p>
                   </div>
                 </div>
               ))}
             </div>
             
             <button 
               onClick={() => { setShowGuide(false); onGetStarted(); }} 
               className="mt-12 w-full py-5 bg-brand-500 hover:bg-brand-400 text-slate-950 font-black rounded-2xl shadow-xl transition-all hover:-translate-y-1"
             >
               Start Your Consultation
             </button>
          </div>
        </div>
      )}

      {/* High-End CTA Footer */}
      <footer className="py-24 bg-gradient-to-t from-black to-[#06080B] border-t border-white/5 relative overflow-hidden">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
            <div className="flex flex-col items-center text-center">
               <h2 className="text-4xl sm:text-6xl font-black text-white mb-8 tracking-tighter">Your bridge to a <br />Better Future.</h2>
               <button 
                 onClick={onGetStarted}
                 className="px-12 py-5 bg-white text-slate-950 rounded-full font-black text-xl hover:scale-105 transition-all shadow-[0_0_50px_rgba(255,255,255,0.2)]"
               >
                 Get Started Today
               </button>
            </div>

            <div className="mt-24 pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 opacity-40">
               <div className="flex items-center gap-2">
                 <div className="w-5 h-5 rounded bg-white flex items-center justify-center"><Star className="w-3 h-3 fill-slate-950" /></div>
                 <span className="text-[10px] font-black uppercase tracking-[0.2em]">Niti-Setu Platform</span>
               </div>
               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-center">Empowering 100M+ Citizens through Generative Policy Advice</p>
               <div className="text-[10px] font-black uppercase tracking-[0.2em]">© 2026 Legal-Agri Tech</div>
            </div>
         </div>
      </footer>
    </div>
  );
};

export default LandingPage;
