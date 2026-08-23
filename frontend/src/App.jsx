import { useState, useEffect } from 'react';
import { Loader2, ArrowLeft, ShieldCheck, FolderLock, Target, LogIn, LogOut, User, LayoutDashboard, Shield, Bell } from 'lucide-react';
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
    <div className="min-h-screen bg-[#F8F5EC] flex flex-col font-sans text-[#202622]">
      
      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* Top Header Navigation (Government Forest Green Header) */}
      <header className="bg-[#174A32] text-white sticky top-0 z-50 shadow-sm border-b border-[#0F3523]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setView('landing')}
              className="p-1.5 hover:bg-[#2F6B4F] rounded-lg transition-colors text-white/80 hover:text-white"
              title="Return to Home"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center font-bold text-white text-base">
              🏛️
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white font-poppins">Niti-Setu</h1>
              <p className="text-[#E9B949] text-[10px] font-semibold uppercase tracking-wider hidden sm:block">Citizen Benefits Platform</p>
            </div>
          </div>

          {/* Navigation Controls & Role Badges */}
          <div className="flex items-center gap-2 sm:gap-4">
            
            {/* View Switcher Tabs */}
            <nav className="flex bg-[#0F3523] p-1 rounded-lg border border-[#2F6B4F] text-xs font-medium">
              {user?.role === 'ADMIN' ? (
                <button
                  onClick={() => setView('admin-dashboard')}
                  className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors ${
                    view === 'admin-dashboard' ? 'bg-[#2F6B4F] text-white font-semibold' : 'text-white/80 hover:text-white'
                  }`}
                >
                  <Shield size={14} /> Overview
                </button>
              ) : (
                <button
                  onClick={() => setView('dashboard')}
                  className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors ${
                    view === 'dashboard' ? 'bg-[#2F6B4F] text-white font-semibold' : 'text-white/80 hover:text-white'
                  }`}
                >
                  <LayoutDashboard size={14} /> Dashboard
                </button>
              )}

              <button
                onClick={() => setView('tool')}
                className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors ${
                  view === 'tool' ? 'bg-[#2F6B4F] text-white font-semibold' : 'text-white/80 hover:text-white'
                }`}
              >
                <Target size={14} /> Benefits Check
              </button>
              <button
                onClick={() => setView('vault')}
                className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors ${
                  view === 'vault' ? 'bg-[#2F6B4F] text-white font-semibold' : 'text-white/80 hover:text-white'
                }`}
              >
                <FolderLock size={14} /> Documents
              </button>
            </nav>

            <NotificationCenter farmerId={farmerId} onNavigate={(route) => {
              if (route === '/vault') setView('vault');
              else setView('tool');
            }} />

            <LanguageSelector onLanguageChange={setSelectedLanguage} />

            {/* Auth Button / User Profile Control */}
            {user ? (
              <div className="flex items-center gap-2 border-l border-[#2F6B4F] pl-3">
                <div className="hidden sm:block text-right">
                  <p className="text-xs font-semibold text-white leading-tight">{user.name}</p>
                  <span className="text-[10px] text-[#E9B949] uppercase font-bold">{user.role}</span>
                </div>
                <button
                  onClick={handleLogout}
                  title="Log Out"
                  className="p-1.5 bg-[#0F3523] hover:bg-[#2F6B4F] text-white/80 hover:text-white rounded-lg border border-[#2F6B4F] transition-colors"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="px-3.5 py-1.5 bg-[#E9B949] hover:bg-[#D9A838] text-[#174A32] font-semibold rounded-lg text-xs flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <LogIn size={14} /> Sign In
              </button>
            )}

          </div>

        </div>
      </header>

      {/* Main Dashboard Views */}
      <main className="flex-grow max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 space-y-8">
        
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
            <section className="space-y-6">
              <div className="bg-white border border-[#DDE3DC] rounded-xl p-6 sm:p-8 space-y-3 text-left">
                <span className="inline-block px-2.5 py-1 bg-[#F8F5EC] text-[#2F6B4F] border border-[#DDE3DC] text-xs font-semibold rounded-md">
                  Government Scheme Verification
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-[#202622] font-poppins">Find schemes you may qualify for</h2>
                <p className="text-[#66706A] text-sm max-w-2xl font-normal">
                  Provide your location and landholding details below. The platform checks active government operational guidelines to explain your eligibility and exact next steps.
                </p>
              </div>
              
              <ProfileForm onProfileSubmit={handleProfileSubmit} selectedLanguage={selectedLanguage} />
            </section>

            {/* Loading State */}
            {loading && (
              <div className="flex flex-col items-center justify-center p-10 bg-white rounded-xl border border-[#DDE3DC] text-center space-y-4">
                <Loader2 className="w-9 h-9 text-[#174A32] animate-spin" />
                <div>
                  <h3 className="text-base font-bold text-[#202622] font-poppins">Checking Official Guidelines...</h3>
                  <p className="text-[#66706A] text-xs mt-1">Retrieving official policy evidence for your landholding profile</p>
                </div>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-[#FCECEC] border border-[#F5C6C6] p-5 rounded-xl text-[#B54747] space-y-1">
                <p className="font-bold text-xs uppercase tracking-wider">System Notice</p>
                <p className="text-sm font-normal">{error}</p>
              </div>
            )}

            {/* Result Card */}
            {(!loading && result) && (
               <section className="scroll-mt-20" id="result-section">
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
      <footer className="py-6 border-t border-[#DDE3DC] bg-white text-[#66706A] text-xs text-center mt-12">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 Niti-Setu — Citizen Benefits & Scheme Verification Platform</p>
          <p className="font-medium text-[#2F6B4F]">Official Guidelines: PM-KISAN | PM-KMY | PM-KUSUM</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
