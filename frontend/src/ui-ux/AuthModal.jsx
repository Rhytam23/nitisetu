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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#202622]/60 backdrop-blur-xs font-sans">
      <div className="bg-white border border-[#DDE3DC] w-full max-w-md rounded-xl shadow-lg overflow-hidden relative">
        
        {/* Header */}
        <div className="p-5 bg-[#174A32] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-white/10 flex items-center justify-center font-bold text-white text-xs">
              🏛️
            </div>
            <h3 className="font-bold text-white text-sm font-poppins">
              {mode === 'register' ? 'Farmer Registration' : mode === 'admin' ? 'Admin Portal Sign-In' : 'Farmer Sign-In'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-white/80 hover:text-white rounded-md hover:bg-[#2F6B4F] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="p-3 bg-[#F8F5EC] border-b border-[#DDE3DC] flex items-center justify-around text-xs font-semibold">
          <button
            onClick={() => { setMode('login'); setError(null); }}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors ${
              mode === 'login' ? 'bg-[#174A32] text-white' : 'text-[#66706A] hover:text-[#202622]'
            }`}
          >
            <LogIn size={14} /> Farmer Login
          </button>
          <button
            onClick={() => { setMode('register'); setError(null); }}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors ${
              mode === 'register' ? 'bg-[#174A32] text-white' : 'text-[#66706A] hover:text-[#202622]'
            }`}
          >
            <UserPlus size={14} /> Register
          </button>
          <button
            onClick={() => { setMode('admin'); setError(null); }}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors ${
              mode === 'admin' ? 'bg-[#174A32] text-white' : 'text-[#66706A] hover:text-[#202622]'
            }`}
          >
            <Shield size={14} /> Admin
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-[#FCECEC] border border-[#F5C6C6] rounded-lg text-xs text-[#B54747] font-semibold">
              {error}
            </div>
          )}

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-[#202622] mb-1">Full Name *</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-3 text-[#66706A]" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full pl-9 input-govt"
                />
              </div>
            </div>
          )}

          {mode !== 'admin' ? (
            <div>
              <label className="block text-xs font-semibold text-[#202622] mb-1">Phone Number *</label>
              <div className="relative">
                <Phone size={16} className="absolute left-3 top-3 text-[#66706A]" />
                <input
                  type="tel"
                  required
                  placeholder="e.g. 9876543210"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full pl-9 input-govt"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-[#202622] mb-1">Admin Email *</label>
              <div className="relative">
                <Shield size={16} className="absolute left-3 top-3 text-[#66706A]" />
                <input
                  type="email"
                  required
                  placeholder="admin@nitisetu.gov.in"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full pl-9 input-govt"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#202622] mb-1">Password *</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-3 text-[#66706A]" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                className="w-full pl-9 input-govt"
              />
            </div>
          </div>

          {mode === 'register' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#202622] mb-1">State</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                  className="w-full input-govt"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#202622] mb-1">District</label>
                <input
                  type="text"
                  value={formData.district}
                  onChange={(e) => setFormData(prev => ({ ...prev, district: e.target.value }))}
                  className="w-full input-govt"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#174A32] hover:bg-[#2F6B4F] text-white font-semibold rounded-lg text-xs uppercase tracking-wider transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
          >
            {loading ? 'Authenticating...' : mode === 'register' ? 'Register Account' : 'Sign In'}
            <ArrowRight size={14} />
          </button>

          {/* Quick 1-Click Demo Login Buttons */}
          <div className="pt-4 border-t border-[#DDE3DC] space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#2F6B4F] text-center">⚡ Instant 1-Click Demo Login</p>
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
                className="px-3 py-2 bg-[#F8F5EC] hover:bg-[#EAE5D8] text-[#202622] border border-[#DDE3DC] rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
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
                className="px-3 py-2 bg-[#F8F5EC] hover:bg-[#EAE5D8] text-[#174A32] border border-[#DDE3DC] rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
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
