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
      const response = await fetch('https://nitisetu-production.up.railway.app/api/check', {
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
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans selection:bg-brand-200 selection:text-brand-900 relative">
      {/* Subtle Background Glows */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-brand-200/20 blur-[120px] rounded-full mix-blend-multiply"></div>
        <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] bg-brand-100/30 blur-[100px] rounded-full mix-blend-multiply"></div>
      </div>

      {/* Header */}
      <header className="bg-white/60 backdrop-blur-xl text-brand-950 border-b border-brand-100/50 shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <button 
              onClick={() => setShowTool(false)}
              className="p-1.5 sm:p-2 hover:bg-brand-50 rounded-full transition-colors text-brand-700"
            >
              <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-brand-950">Niti-Setu</h1>
              <p className="text-brand-600 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] hidden sm:block">Eligibility Engine</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageSelector />
            <div className="hidden sm:flex bg-brand-50/80 backdrop-blur-md px-4 py-2 rounded-full border border-brand-200/50 text-[10px] font-black tracking-widest uppercase items-center gap-2 text-brand-800 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse shadow-[0_0_8px_rgba(20,184,166,0.6)]"></span>
              AI Consultant Active
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Dashboard */}
      <main className="flex-grow max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12 space-y-8 sm:space-y-12 relative z-10">
        
        <section className="animate-fade-in-up">
          <div className="text-center mb-8 sm:mb-10">
            <span className="px-3 py-1 bg-brand-50 text-brand-700 border border-brand-100/50 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest mb-3 sm:mb-4 inline-block shadow-sm">Step 1: Application</span>
            <h2 className="text-3xl sm:text-4xl font-black text-brand-950 tracking-tight">Check Eligibility</h2>
            <p className="text-gray-500 mt-2 sm:mt-3 max-w-xl mx-auto font-medium text-sm sm:text-base">
              Update your profile details below. Our AI reasoning engine will parse
              the latest government PDF guidelines in real-time.
            </p>
          </div>
          
          <ProfileForm onProfileSubmit={handleProfileSubmit} />
        </section>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center p-8 sm:p-16 bg-white/70 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/80 animate-pulse text-center">
            <Loader2 className="w-12 h-12 sm:w-16 sm:h-16 text-brand-500 animate-spin mb-4 sm:mb-6" />
            <h3 className="text-xl sm:text-2xl font-black text-brand-900 tracking-tight">Consulting AI Guidelines...</h3>
            <p className="text-brand-600/70 mt-2 font-medium tracking-wide text-sm sm:text-base">Retrieving vector embeddings & verifying policy logic</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50/80 backdrop-blur-md border border-red-200/50 p-5 sm:p-6 rounded-2xl shadow-sm animate-shake">
            <div className="flex items-center gap-3 text-red-700 font-black mb-2 uppercase text-[10px] sm:text-xs tracking-widest">
               <span className="w-2 h-2 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.6)]"></span>
               System Error
            </div>
            <p className="text-red-700 font-medium leading-relaxed text-sm sm:text-base">{error}</p>
          </div>
        )}

        {/* Result Card */}
        {(!loading && result) && (
           <section className="scroll-mt-20 sm:scroll-mt-24 animate-scale-in" id="result-section">
             <div className="text-center mb-6 sm:mb-8">
                <span className="px-3 py-1 bg-green-50 text-green-700 border border-green-100/50 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest mb-3 sm:mb-4 inline-block shadow-sm">Step 2: AI Verdict</span>
             </div>
             <ProofCard result={result} schemeName={currentScheme} />
           </section>
        )}
      </main>

      {/* Footer */}
      <footer className="py-8 sm:py-10 border-t border-brand-100/50 mt-12 sm:mt-20 relative z-10 px-4">
        <div className="max-w-4xl mx-auto text-center text-brand-900/40 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em]">
          <p>© 2026 Niti-Setu AI Consultant • Experimental Agricultural Engine</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
