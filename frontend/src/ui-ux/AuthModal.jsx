import { useState } from 'react';
import { User, Lock, Phone, MapPin, Shield, X, ArrowRight, UserPlus, LogIn } from 'lucide-react';

const AuthModal = ({ isOpen, onClose, onAuthSuccess }) => {
  const [mode, setMode] = useState('login'); // 'login', 'register', 'admin'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    state: 'Uttar Pradesh',
    district: 'Lucknow'
  });

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
    let endpoint = `${baseUrl}/api/auth/login`;
    let payload = {};

    if (mode === 'register') {
      endpoint = `${baseUrl}/api/auth/register`;
      payload = {
        name: formData.name,
        phone: formData.phone,
        password: formData.password,
        state: formData.state,
        district: formData.district
      };
    } else if (mode === 'admin') {
      endpoint = `${baseUrl}/api/auth/admin-login`;
      payload = {
        email: formData.email || formData.phone,
        password: formData.password
      };
    } else {
      payload = {
        identifier: formData.phone,
        password: formData.password
      };
    }

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (data.success && data.data) {
        if (onAuthSuccess) {
          onAuthSuccess(data.data.user, data.data.token);
        }
        onClose();
      } else {
        throw new Error(data.error || data.message || 'Authentication failed');
      }
    } catch (err) {
      setError(err.message || 'Failed to authenticate');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden relative">
        
        {/* Header */}
        <div className="p-6 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo.jpg" alt="Niti-Setu Logo" className="w-6 h-6 rounded object-cover border border-slate-700" />
            <h3 className="font-bold text-white text-base">
              {mode === 'register' ? 'Farmer Registration' : mode === 'admin' ? 'Admin Portal Sign-In' : 'Farmer Sign-In'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="p-4 bg-slate-950/50 border-b border-slate-800/80 flex items-center justify-around text-xs font-semibold">
          <button
            onClick={() => { setMode('login'); setError(null); }}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
              mode === 'login' ? 'bg-teal-500/10 text-teal-300 border border-teal-500/20' : 'text-slate-400 hover:text-white'
            }`}
          >
            <LogIn size={14} /> Farmer Login
          </button>
          <button
            onClick={() => { setMode('register'); setError(null); }}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
              mode === 'register' ? 'bg-teal-500/10 text-teal-300 border border-teal-500/20' : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserPlus size={14} /> Register
          </button>
          <button
            onClick={() => { setMode('admin'); setError(null); }}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
              mode === 'admin' ? 'bg-teal-500/10 text-teal-300 border border-teal-500/20' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Shield size={14} /> Admin
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-950/40 border border-red-800/60 rounded-xl text-xs text-red-300 font-medium">
              {error}
            </div>
          )}

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name *</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-3 text-slate-500" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
                />
              </div>
            </div>
          )}

          {mode !== 'admin' ? (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number *</label>
              <div className="relative">
                <Phone size={16} className="absolute left-3 top-3 text-slate-500" />
                <input
                  type="tel"
                  required
                  placeholder="e.g. 9876543210"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Admin Email *</label>
              <div className="relative">
                <Shield size={16} className="absolute left-3 top-3 text-slate-500" />
                <input
                  type="email"
                  required
                  placeholder="admin@nitisetu.gov.in"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Password *</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-3 text-slate-500" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
              />
            </div>
          </div>

          {mode === 'register' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">State</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">District</label>
                <input
                  type="text"
                  value={formData.district}
                  onChange={(e) => setFormData(prev => ({ ...prev, district: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs uppercase tracking-wider transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
          >
            {loading ? 'Authenticating...' : mode === 'register' ? 'Register Account' : 'Sign In'}
            <ArrowRight size={14} />
          </button>

          {/* Quick 1-Click Demo Login Buttons */}
          <div className="pt-4 border-t border-slate-800 space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-teal-400 text-center">⚡ Instant 1-Click Demo Login</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  const demoFarmer = {
                    _id: 'demo_farmer_1',
                    userId: 'demo_farmer_1',
                    name: 'Ramesh Kumar',
                    phone: '9876543210',
                    state: 'Uttar Pradesh',
                    district: 'Lucknow',
                    role: 'FARMER'
                  };
                  const demoToken = 'demo_farmer_token_9876543210';
                  onAuthSuccess(demoFarmer, demoToken);
                  onClose();
                }}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                🌾 Demo Farmer
              </button>

              <button
                type="button"
                onClick={() => {
                  const demoAdmin = {
                    _id: 'demo_admin_1',
                    userId: 'demo_admin_1',
                    name: 'Niti-Setu Officer',
                    email: 'admin@nitisetu.gov.in',
                    role: 'ADMIN'
                  };
                  const demoToken = 'demo_admin_token_2026';
                  onAuthSuccess(demoAdmin, demoToken);
                  onClose();
                }}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                🛡️ Demo Admin
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthModal;
