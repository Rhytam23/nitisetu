import React, { useState } from 'react';
import { Mail, Lock, User, Phone, ArrowRight, Github, Chrome, Loader2, AlertCircle } from 'lucide-react';

const LoginPage = ({ onLoginSuccess, onBackToLanding }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const apiUrl = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}${endpoint}` : `http://localhost:5001${endpoint}`;

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        // Save to local storage for persistent session mock
        localStorage.setItem('niti_user', JSON.stringify(data.data.user || data.data));
        onLoginSuccess();
      } else {
        setError(data.message || data.error || 'Authentication failed');
      }
    } catch (err) {
      setError('Connection to auth server failed. Ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans">
      
      {/* Background Decorative Orbs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[10%] left-[10%] w-[40%] h-[40%] bg-brand-500/10 blur-[120px] rounded-full mix-blend-screen animate-pulse"></div>
        <div className="absolute bottom-[10%] right-[10%] w-[35%] h-[35%] bg-cyan-500/10 blur-[100px] rounded-full mix-blend-screen animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="w-full max-w-md relative z-10 animate-scale-in">
        
        {/* Branding Area */}
        <div className="text-center mb-8">
           <button onClick={onBackToLanding} className="group inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-slate-400 hover:text-white transition-all mb-6">
              <span className="text-[10px] font-black uppercase tracking-widest group-hover:-translate-x-1 transition-transform">← Back</span>
           </button>
           <h1 className="text-4xl font-black text-white tracking-tight drop-shadow-md mb-2">
             Niti-Setu
           </h1>
           <p className="text-brand-400 text-[10px] font-bold uppercase tracking-[0.2em]">Bridge to Policy Clarity</p>
        </div>

        {/* Glassmorphism Card */}
        <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 sm:p-10 shadow-[0_40px_80px_rgba(0,0,0,0.6)] relative">
          
          <div className="flex bg-black/20 p-1.5 rounded-2xl mb-8 border border-white/5">
             <button 
               onClick={() => { setIsLogin(true); setError(null); }}
               className={`flex-1 py-2.5 rounded-xl text-sm font-black transition-all ${isLogin ? 'bg-brand-500 text-slate-950 shadow-lg' : 'text-slate-400 hover:text-white'}`}
             >
               Login
             </button>
             <button 
               onClick={() => { setIsLogin(false); setError(null); }}
               className={`flex-1 py-2.5 rounded-xl text-sm font-black transition-all ${!isLogin ? 'bg-brand-500 text-slate-950 shadow-lg' : 'text-slate-400 hover:text-white'}`}
             >
               Register
             </button>
          </div>

          <h2 className="text-2xl font-black text-white mb-2">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
          <p className="text-slate-400 text-sm font-medium mb-8">{isLogin ? 'Enter your credentials to continue.' : 'Sign up to start checking eligibility.'}</p>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3 animate-shake">
               <AlertCircle className="text-red-400 shrink-0 mt-0.5" size={18} />
               <p className="text-red-200/80 text-xs font-medium leading-relaxed">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-brand-400 transition-colors">
                  <User size={18} />
                </div>
                  <input 
                    type="text" 
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    autoComplete="name"
                    className="w-full pl-12 pr-4 py-4 bg-black/20 border border-white/10 rounded-2xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all text-white font-medium placeholder-slate-600" 
                    placeholder="Full Name"
                  />
              </div>
            )}

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-brand-400 transition-colors">
                <Mail size={18} />
              </div>
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
                className="w-full pl-12 pr-4 py-4 bg-black/20 border border-white/10 rounded-2xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all text-white font-medium placeholder-slate-600" 
                placeholder="Email Address"
              />
            </div>

            {!isLogin && (
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-brand-400 transition-colors">
                  <Phone size={18} />
                </div>
                <input 
                  type="tel" 
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  autoComplete="tel"
                  className="w-full pl-12 pr-4 py-4 bg-black/20 border border-white/10 rounded-2xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all text-white font-medium placeholder-slate-600" 
                  placeholder="Phone (Optional)"
                />
              </div>
            )}

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-brand-400 transition-colors">
                <Lock size={18} />
              </div>
              <input 
                type="password" 
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete={isLogin ? "current-password" : "new-password"}
                className="w-full pl-12 pr-4 py-4 bg-black/20 border border-white/10 rounded-2xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all text-white font-medium placeholder-slate-600" 
                placeholder="Password"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-brand-500 to-brand-400 hover:from-brand-400 hover:to-cyan-400 text-slate-950 font-black py-4 px-6 rounded-2xl transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:translate-y-0 mt-2"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <ArrowRight size={20} />}
              {isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          {/* Social Proofing Divider */}
          <div className="my-8 flex items-center gap-4">
             <div className="h-px flex-1 bg-white/5"></div>
             <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Quick Connect</span>
             <div className="h-px flex-1 bg-white/5"></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <button className="flex items-center justify-center gap-2 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all group">
                <Chrome size={18} className="text-slate-400 group-hover:text-white transition-colors" />
                <span className="text-xs font-bold text-slate-300">Google</span>
             </button>
             <button className="flex items-center justify-center gap-2 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all group">
                <Github size={18} className="text-slate-400 group-hover:text-white transition-colors" />
                <span className="text-xs font-bold text-slate-300">Github</span>
             </button>
          </div>
        </div>

        <p className="text-center mt-8 text-slate-500 text-xs font-medium">
           © 2026 Niti-Setu. Secure Citizen Portal.
        </p>

      </div>
    </div>
  );
};

export default LoginPage;
