import { useState } from 'react';
import { Loader2, ArrowLeft } from 'lucide-react';
import LandingPage from './ui-ux/LandingPage';
import ProfileForm from './ui-ux/ProfileForm';
import ProofCard from './ui-ux/ProofCard';
import LanguageSelector from './ui-ux/LanguageSelector';
import './index.css';

function App() {
  const [showTool, setShowTool] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [currentScheme, setCurrentScheme] = useState('');

  const handleProfileSubmit = async (profileData) => {
    setLoading(true);
    setError(null);
    setResult(null);
    setCurrentScheme(profileData.scheme);

    try {
      const apiUrl = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api/check` : 'http://localhost:5000/api/check';
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      const data = await response.json();
      
      if (data.success) {
        setResult(data.data);
        // Scroll to results
        setTimeout(() => {
          document.getElementById('result-section')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        throw new Error(data.error || 'Failed to check eligibility');
      }
    } catch (err) {
      console.error(err);
      setError("Unable to connect to the Niti-Setu AI Consultant Engine. Ensure the backend server is running and the API key is valid.");
    } finally {
      setLoading(false);
    }
  };

  if (!showTool) {
    return <LandingPage onGetStarted={() => setShowTool(true)} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans selection:bg-brand-500/30 selection:text-brand-200 relative text-slate-200">
      {/* Subtle Glowing Background Orbs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-brand-500/10 blur-[120px] rounded-full mix-blend-screen"></div>
        <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] bg-cyan-500/10 blur-[100px] rounded-full mix-blend-screen"></div>
      </div>

      {/* Header */}
      <header className="bg-slate-900/60 backdrop-blur-xl border-b border-white/5 shadow-lg sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <button 
              onClick={() => setShowTool(false)}
              className="p-1.5 sm:p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white"
            >
              <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]">Niti-Setu</h1>
              <p className="text-brand-400 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] hidden sm:block">Eligibility Engine</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageSelector />
            <div className="hidden sm:flex bg-white/5 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-[10px] font-black tracking-widest uppercase items-center gap-2 text-brand-400 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
              <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
              AI Consultant Active
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Dashboard */}
      <main className="flex-grow max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12 space-y-8 sm:space-y-12 relative z-10">
        
        <section className="animate-fade-in-up">
          <div className="text-center mb-8 sm:mb-10">
            <span className="px-3 py-1 bg-brand-500/10 text-brand-400 border border-brand-500/20 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest mb-3 sm:mb-4 inline-block shadow-[0_0_15px_rgba(16,185,129,0.15)]">Step 1: Application</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight drop-shadow-sm">Check Eligibility</h2>
            <p className="text-slate-400 mt-2 sm:mt-3 max-w-xl mx-auto font-medium text-sm sm:text-base">
              Update your profile details below. Our AI reasoning engine will parse
              the latest government PDF guidelines in real-time.
            </p>
          </div>
          
          <ProfileForm onProfileSubmit={handleProfileSubmit} />
        </section>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center p-8 sm:p-16 bg-white/5 backdrop-blur-xl rounded-[2rem] shadow-[0_20px_40px_rgba(0,0,0,0.4)] border border-white/10 animate-pulse text-center">
            <Loader2 className="w-12 h-12 sm:w-16 sm:h-16 text-brand-400 animate-spin mb-4 sm:mb-6 drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]" />
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">Consulting AI Guidelines...</h3>
            <p className="text-slate-400 mt-2 font-medium tracking-wide text-sm sm:text-base">Retrieving vector embeddings & verifying policy logic</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-500/10 backdrop-blur-md border border-red-500/20 p-5 sm:p-6 rounded-[2rem] shadow-xl animate-shake">
            <div className="flex items-center gap-3 text-red-400 font-black mb-2 uppercase text-[10px] sm:text-xs tracking-widest">
               <span className="w-2 h-2 bg-red-400 rounded-full shadow-[0_0_10px_rgba(248,113,113,0.8)]"></span>
               System Error
            </div>
            <p className="text-red-200/80 font-medium leading-relaxed text-sm sm:text-base">{error}</p>
          </div>
        )}

        {/* Result Card */}
        {(!loading && result) && (
           <section className="scroll-mt-20 sm:scroll-mt-24 animate-scale-in" id="result-section">
              <div className="text-center mb-6 sm:mb-8">
                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest mb-3 sm:mb-4 inline-block shadow-[0_0_15px_rgba(16,185,129,0.15)]">Step 2: AI Verdict</span>
             </div>
             <ProofCard result={result} schemeName={currentScheme} />
           </section>
        )}
      </main>

      {/* Premium Dark Footer */}
      <footer className="py-12 sm:py-16 border-t border-white/5 mt-12 sm:mt-20 bg-slate-900/40 backdrop-blur-3xl relative z-10 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12 mb-12 sm:mb-16">
            
            {/* Brand Column */}
            <div className="md:col-span-2 space-y-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]">Niti-Setu</h2>
                <p className="text-brand-400 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em]">Eligibility Engine</p>
              </div>
              <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-sm">
                Empowering Indian farmers by translating complex bureaucratic scheme guidelines into instant, accessible, and voice-activated clarity.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-white font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-slate-400 font-medium">
                <li><a href="#" className="hover:text-brand-400 transition-colors">How it Works</a></li>
                <li><a href="#" className="hover:text-brand-400 transition-colors">Supported Schemes</a></li>
                <li><a href="#" className="hover:text-brand-400 transition-colors">Data Privacy</a></li>
                <li><a href="#" className="hover:text-brand-400 transition-colors">Help Center</a></li>
              </ul>
            </div>

            {/* Legal / Contact */}
            <div>
              <h4 className="text-white font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-400 font-medium">
                <li><a href="#" className="hover:text-brand-400 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-brand-400 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-brand-400 transition-colors">Official Portal</a></li>
              </ul>
            </div>
            
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-slate-500 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em]">
            <p>© 2026 Niti-Setu AI Consultant</p>
            <p className="text-brand-500/50">Experimental Agricultural Engine</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
