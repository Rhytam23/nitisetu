import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import ProfileForm from './components/ProfileForm';
import ProofCard from './components/ProofCard';
import './index.css';

function App() {
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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-brand-600 text-white shadow-md">
        <div className="max-w-4xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Niti-Setu</h1>
            <p className="text-brand-100 mt-1 font-medium">Voice-Based Scheme Eligibility Engine</p>
          </div>
          <div className="hidden sm:block bg-brand-700 px-4 py-2 rounded-lg border border-brand-500 text-sm font-bold shadow-inner flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            AI Consultant Online
          </div>
        </div>
      </header>

      {/* Main Content Dashboard */}
      <main className="flex-grow max-w-4xl mx-auto w-full px-6 py-10 space-y-10">
        
        <section>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Check Your Eligibility Instantly</h2>
            <p className="text-gray-600 mt-2 max-w-xl mx-auto">
              Our AI reads through 50-page bureaucratic PDFs in seconds. 
              Tell us about yourself using your voice or fill out the form below.
            </p>
          </div>
          
          <ProfileForm onProfileSubmit={handleProfileSubmit} />
        </section>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl shadow border border-brand-100">
            <Loader2 className="w-12 h-12 text-brand-600 animate-spin mb-4" />
            <h3 className="text-xl font-bold text-gray-800">Consulting Scheme Guidelines...</h3>
            <p className="text-gray-500 mt-2">Searching vector database & reasoning with LLM</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}

        {/* Result Card */}
        {(!loading && result) && (
           <section className="scroll-mt-6" id="result-section">
             <ProofCard result={result} schemeName={currentScheme} />
           </section>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 py-6 border-t border-gray-200 mt-auto">
        <div className="max-w-4xl mx-auto px-6 text-center text-gray-500 text-sm">
          <p>Niti-Setu Consultant Demo • Powered by LangChain, Google Gemini API, and MongoDB Atlas Vector Search</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
