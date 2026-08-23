import { useState, useEffect } from 'react';
import { Loader2, ArrowLeft, ShieldCheck, FolderLock, Target, LogIn, LogOut, User, LayoutDashboard, Shield } from 'lucide-react';
import LandingPage from './ui-ux/LandingPage';
import ProfileForm from './ui-ux/ProfileForm';
import ProofCard from './ui-ux/ProofCard';
import DocumentVault from './ui-ux/DocumentVault';
import NotificationCenter from './ui-ux/NotificationCenter';
import FarmerDashboard from './ui-ux/FarmerDashboard';
import AdminDashboard from './ui-ux/AdminDashboard';
import AuthModal from './ui-ux/AuthModal';
import LanguageSelector from './ui-ux/LanguageSelector';
import './index.css';

function App() {
  const [view, setView] = useState('landing'); // 'landing', 'dashboard', 'tool', 'vault', 'admin-dashboard'
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [currentScheme, setCurrentScheme] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  
  // User Authentication State
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    // Restore session if token in localStorage
    const savedToken = localStorage.getItem('nitisetu_token');
    const savedUser = localStorage.getItem('nitisetu_user');
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (e) {}
    }
  }, []);

  const handleAuthSuccess = (userData, tokenData) => {
    setUser(userData);
    setToken(tokenData);
    localStorage.setItem('nitisetu_token', tokenData);
    localStorage.setItem('nitisetu_user', JSON.stringify(userData));

    if (userData.role === 'ADMIN') {
      setView('admin-dashboard');
    } else {
      setView('dashboard');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('nitisetu_token');
    localStorage.removeItem('nitisetu_user');
    setView('landing');
  };

  const farmerId = user?.userId || user?._id || 'demo_farmer_1';

  const [farmerProfile, setFarmerProfile] = useState({
    state: 'Uttar Pradesh',
    land_acres: '2.5',
    crop: 'Wheat',
    age: '30'
  });

  const handleProfileSubmit = async (profileData) => {
    setLoading(true);
    setError(null);
    setResult(null);
    setCurrentScheme(profileData.scheme);
    setFarmerProfile(profileData);

    const payload = { ...profileData, preferred_language: selectedLanguage, _id: farmerId };

    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      const apiUrl = `${baseUrl}/api/check`;
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      
      if (data.success) {
        setResult(data.data);

        // Auto-generate notifications for profile
        try {
          await fetch(`${baseUrl}/api/notifications/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ _id: farmerId, ...profileData })
          });
        } catch (e) {
          console.error('Notification trigger error:', e);
        }

        // Scroll to results
        setTimeout(() => {
          document.getElementById('result-section')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        throw new Error(data.error || 'Failed to check eligibility');
      }
    } catch (err) {
      console.error(err);
      setError("Unable to connect to the Niti-Setu Policy Verification Engine. Ensure the server is online.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfileFromOCR = (updatedFields) => {
    setFarmerProfile(prev => ({ ...prev, ...updatedFields }));
  };

  if (view === 'landing') {
    return <LandingPage onGetStarted={() => setView(user ? 'dashboard' : 'tool')} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans selection:bg-teal-500/30 selection:text-teal-200 relative text-slate-200">
      
      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* Top Header Navigation */}
      <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setView('landing')}
              className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <img src="/logo.jpg" alt="Niti-Setu Logo" className="w-8 h-8 rounded-lg object-cover border border-slate-700" />
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">Niti-Setu</h1>
              <p className="text-teal-400 text-[10px] font-semibold uppercase tracking-wider hidden sm:block">Government Scheme Access</p>
            </div>
          </div>

          {/* Navigation Controls & Role Badges */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* View Switcher Tabs */}
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
              {user?.role === 'ADMIN' ? (
                <button
                  onClick={() => setView('admin-dashboard')}
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                    view === 'admin-dashboard' ? 'bg-teal-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Shield size={14} /> Admin
                </button>
              ) : (
                <button
                  onClick={() => setView('dashboard')}
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                    view === 'dashboard' ? 'bg-teal-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <LayoutDashboard size={14} /> Dashboard
                </button>
              )}

              <button
                onClick={() => setView('tool')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                  view === 'tool' ? 'bg-teal-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Target size={14} /> Evaluation
              </button>
              <button
                onClick={() => setView('vault')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                  view === 'vault' ? 'bg-teal-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                <FolderLock size={14} /> Vault
              </button>
            </div>

            <NotificationCenter farmerId={farmerId} onNavigate={(route) => {
              if (route === '/vault') setView('vault');
              else setView('tool');
            }} />

            <LanguageSelector onLanguageChange={setSelectedLanguage} />

            {/* Auth Button / User Profile Control */}
            {user ? (
              <div className="flex items-center gap-2 border-l border-slate-800 pl-2">
                <div className="hidden sm:block text-right">
                  <p className="text-xs font-bold text-white leading-tight">{user.name}</p>
                  <span className="text-[9px] text-teal-400 uppercase font-semibold">{user.role}</span>
                </div>
                <button
                  onClick={handleLogout}
                  title="Log Out"
                  className="p-2 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-red-400 rounded-xl border border-slate-800 transition-colors"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="px-3 py-1.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <LogIn size={14} /> Sign In
              </button>
            )}

          </div>

        </div>
      </header>

      {/* Main Dashboard Views */}
      <main className="flex-grow max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 space-y-8 relative z-10">
        
        {view === 'admin-dashboard' ? (
          <AdminDashboard user={user} token={token} />
        ) : view === 'dashboard' ? (
          <FarmerDashboard user={user} onNavigate={setView} onLogout={handleLogout} />
        ) : view === 'vault' ? (
          <DocumentVault 
            farmerId={farmerId} 
            selectedLanguage={selectedLanguage} 
            currentProfile={farmerProfile}
            onUpdateProfile={handleUpdateProfileFromOCR}
          />
        ) : (
          <>
            <section>
              <div className="text-center mb-8">
                <span className="px-3 py-1 bg-teal-500/10 text-teal-300 border border-teal-500/20 rounded-full text-xs font-semibold uppercase tracking-wider mb-3 inline-block">
                  Step 1: Farmer Parameters
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Evaluate Scheme Eligibility</h2>
                <p className="text-slate-400 mt-2 max-w-xl mx-auto font-normal text-sm">
                  Provide your landholding parameters below. The system evaluates your details against active government operational guidelines in real-time.
                </p>
              </div>
              
              <ProfileForm onProfileSubmit={handleProfileSubmit} selectedLanguage={selectedLanguage} />
            </section>

            {/* Loading State */}
            {loading && (
              <div className="flex flex-col items-center justify-center p-10 bg-slate-900 rounded-2xl border border-slate-800 text-center space-y-4">
                <Loader2 className="w-10 h-10 text-teal-400 animate-spin" />
                <div>
                  <h3 className="text-lg font-bold text-white">Searching Government Policy Knowledge Base...</h3>
                  <p className="text-slate-400 text-xs font-normal mt-1">Retrieving vector embeddings from MongoDB Atlas and verifying legal guidelines</p>
                </div>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-red-950/40 border border-red-800/60 p-5 rounded-2xl">
                <div className="flex items-center gap-2 text-red-400 font-bold mb-1 text-xs uppercase tracking-wider">
                   <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                   System Notice
                </div>
                <p className="text-red-200 text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Result Card */}
            {(!loading && result) && (
               <section className="scroll-mt-20" id="result-section">
                  <div className="text-center mb-6">
                    <span className="px-3 py-1 bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 rounded-full text-xs font-semibold uppercase tracking-wider mb-2 inline-block">
                      Step 2: Verification Verdict
                    </span>
                 </div>
                 <ProofCard 
                   result={result} 
                   schemeName={currentScheme} 
                   selectedLanguage={selectedLanguage} 
                   farmerId={farmerId}
                   onNavigateToVault={() => setView('vault')}
                 />
               </section>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-slate-800 mt-12 bg-slate-900/60 text-slate-500 text-xs text-center">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 Niti-Setu Scheme Access Portal</p>
          <p className="text-slate-400 font-medium">Official Policy Guidelines: PM-KISAN | PM-KMY | PM-KUSUM</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
