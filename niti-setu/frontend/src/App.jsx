import { useState } from 'react';
import { Loader2, ArrowLeft } from 'lucide-react';
import LandingPage from './components/LandingPage';
import ProfileForm from './components/ProfileForm';
import ProofCard from './components/ProofCard';
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
      const response = await fetch('http://localhost:5000/api/check', {
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
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-brand-600 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowTool(false)}
              className="p-2 hover:bg-brand-700 rounded-full transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-2xl font-black tracking-tighter">Niti-Setu</h1>
              <p className="text-brand-100 text-xs font-bold uppercase tracking-widest hidden sm:block">Eligibility Engine</p>
            </div>
          </div>
          <div className="hidden sm:flex bg-brand-700/50 backdrop-blur-sm px-4 py-2 rounded-full border border-brand-500/50 text-[10px] font-black tracking-widest uppercase items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.8)]"></span>
            AI Consultant Active
          </div>
        </div>
      </header>

      {/* Main Content Dashboard */}
      <main className="flex-grow max-w-4xl mx-auto w-full px-6 py-12 space-y-12">
        
        <section className="animate-fade-in-up">
          <div className="text-center mb-10">
            <span className="px-3 py-1 bg-brand-100 text-brand-700 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 inline-block">Step 1: Application</span>
            <h2 className="text-4xl font-black text-gray-900 tracking-tight">Check Eligibility</h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto font-medium">
              Update your profile details below. Our AI reasoning engine will parse
              the latest government PDF guidelines in real-time.
            </p>
          </div>
          
          <ProfileForm onProfileSubmit={handleProfileSubmit} />
        </section>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center p-16 bg-white rounded-3xl shadow-2xl border border-brand-100 animate-pulse">
            <Loader2 className="w-16 h-16 text-brand-600 animate-spin mb-6" />
            <h3 className="text-2xl font-black text-gray-900 tracking-tight">Consulting AI Guidelines...</h3>
            <p className="text-gray-500 mt-2 font-medium tracking-wide">Retrieving vector embeddings & verifying policy logic</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border-2 border-red-100 p-6 rounded-2xl shadow-sm animate-shake">
            <div className="flex items-center gap-3 text-red-700 font-black mb-2 uppercase text-xs tracking-widest">
               <span className="w-2 h-2 bg-red-500 rounded-full"></span>
               System Error
            </div>
            <p className="text-red-600 font-medium leading-relaxed">{error}</p>
          </div>
        )}

        {/* Result Card */}
        {(!loading && result) && (
           <section className="scroll-mt-24 animate-scale-in" id="result-section">
             <div className="text-center mb-8">
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 inline-block">Step 2: AI Verdict</span>
             </div>
             <ProofCard result={result} schemeName={currentScheme} />
           </section>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white py-10 border-t border-gray-100 mt-20">
        <div className="max-w-4xl mx-auto px-6 text-center text-gray-400 text-xs font-bold uppercase tracking-[0.2em]">
          <p>© 2026 Niti-Setu AI Consultant • Experimental Agricultural Engine</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
