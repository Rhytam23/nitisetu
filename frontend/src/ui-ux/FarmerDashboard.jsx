import { useState, useEffect } from 'react';
import { User, ShieldCheck, FileText, Bell, CheckCircle2, AlertCircle, ArrowRight, FolderLock, Target, Clock, Sparkles } from 'lucide-react';

const FarmerDashboard = ({ user, onNavigate, onLogout }) => {
  const [vaultDocs, setVaultDocs] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const farmerId = user?.userId || user?._id || 'demo_farmer_1';

  useEffect(() => {
    fetchDashboardData();
  }, [farmerId]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      
      // Fetch Documents
      const docRes = await fetch(`${baseUrl}/api/documents/${farmerId}`);
      const docData = await docRes.json();
      if (docData.success && Array.isArray(docData.data)) {
        setVaultDocs(docData.data);
      }

      // Fetch Notifications
      const notifRes = await fetch(`${baseUrl}/api/notifications/${farmerId}`);
      const notifData = await notifRes.json();
      if (notifData.success && notifData.data) {
        setNotifications(notifData.data.notifications || []);
        setUnreadCount(notifData.data.unreadCount || 0);
      }
    } catch (e) {
        console.error('Error loading farmer dashboard data:', e);
    } finally {
      setLoading(false);
    }
  };

  const missingDocsCount = 3 - vaultDocs.length > 0 ? 3 - vaultDocs.length : 0;
  const reviewNeededDocs = vaultDocs.filter(d => d.status === 'Needs Review').length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Profile Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-lg shrink-0">
            {user?.name?.substring(0, 2).toUpperCase() || 'FM'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white tracking-tight">{user?.name || 'Farmer Account'}</h2>
              <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold rounded">
                Active Farmer
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">
              {user?.district || 'Lucknow'}, {user?.state || 'Uttar Pradesh'} • {user?.phone || 'Reg. Farmer'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            onClick={() => onNavigate('tool')}
            className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs transition-colors shadow-sm flex items-center gap-1.5"
          >
            <Target size={15} /> Evaluate Benefit Eligibility
          </button>
        </div>
      </div>

      {/* Quick Action Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => onNavigate('tool')}
          className="bg-slate-900 hover:bg-slate-800/80 p-4 rounded-xl border border-slate-800 text-left space-y-2 transition-colors group"
        >
          <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center">
            <Target size={18} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white group-hover:text-teal-300">Check Eligibility</h4>
            <p className="text-[10px] text-slate-400">Audit guidelines</p>
          </div>
        </button>

        <button
          onClick={() => onNavigate('vault')}
          className="bg-slate-900 hover:bg-slate-800/80 p-4 rounded-xl border border-slate-800 text-left space-y-2 transition-colors group"
        >
          <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center">
            <FolderLock size={18} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white group-hover:text-teal-300">Document Vault</h4>
            <p className="text-[10px] text-slate-400">{vaultDocs.length} files saved</p>
          </div>
        </button>

        <button
          onClick={() => onNavigate('vault')}
          className="bg-slate-900 hover:bg-slate-800/80 p-4 rounded-xl border border-slate-800 text-left space-y-2 transition-colors group relative"
        >
          <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center">
            <Bell size={18} />
          </div>
          {unreadCount > 0 && (
            <span className="absolute top-3 right-3 px-1.5 py-0.5 bg-teal-500 text-slate-950 font-black text-[9px] rounded-full">
              {unreadCount}
            </span>
          )}
          <div>
            <h4 className="text-xs font-bold text-white group-hover:text-teal-300">Notifications</h4>
            <p className="text-[10px] text-slate-400">{unreadCount} unread alerts</p>
          </div>
        </button>

        <button
          onClick={() => onNavigate('tool')}
          className="bg-slate-900 hover:bg-slate-800/80 p-4 rounded-xl border border-slate-800 text-left space-y-2 transition-colors group"
        >
          <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center">
            <ShieldCheck size={18} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white group-hover:text-teal-300">Policy Proof Cards</h4>
            <p className="text-[10px] text-slate-400">Verbatim citations</p>
          </div>
        </button>
      </div>

      {/* Main Status Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Document Vault Summary */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <FolderLock size={16} className="text-teal-400" />
              Document Vault Status
            </h3>
            <button onClick={() => onNavigate('vault')} className="text-xs text-teal-400 font-bold hover:underline">
              Manage Vault
            </button>
          </div>

          <div className="space-y-2.5">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium">Uploaded Credentials</span>
              <span className="font-bold text-white">{vaultDocs.length} Documents</span>
            </div>

            {missingDocsCount > 0 && (
              <div className="bg-amber-950/30 p-3 rounded-xl border border-amber-800/40 flex items-center justify-between text-xs text-amber-300">
                <span className="flex items-center gap-1.5">
                  <AlertCircle size={14} /> Missing Required Docs
                </span>
                <span className="font-bold">{missingDocsCount} Missing</span>
              </div>
            )}

            {reviewNeededDocs > 0 && (
              <div className="bg-amber-950/30 p-3 rounded-xl border border-amber-800/40 flex items-center justify-between text-xs text-amber-300">
                <span className="flex items-center gap-1.5">
                  <AlertCircle size={14} /> OCR Needs Review
                </span>
                <span className="font-bold">{reviewNeededDocs} Pending</span>
              </div>
            )}
          </div>
        </div>

        {/* Benefits & Scheme Status */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-400" />
              Core Government Benefits
            </h3>
            <button onClick={() => onNavigate('tool')} className="text-xs text-teal-400 font-bold hover:underline">
              Check Rules
            </button>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-white">PM-KISAN</h4>
                <p className="text-[10px] text-slate-400">₹6,000/yr Direct Income Support</p>
              </div>
              <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold rounded">
                Eligible
              </span>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-white">PM-KMY Pension</h4>
                <p className="text-[10px] text-slate-400">₹3,000/mo Pension for Small Farmers</p>
              </div>
              <span className="px-2 py-0.5 bg-teal-950 text-teal-300 border border-teal-800 text-[10px] font-bold rounded">
                Available
              </span>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-white">PM-KUSUM</h4>
                <p className="text-[10px] text-slate-400">60% Solar Pump Subsidy</p>
              </div>
              <span className="px-2 py-0.5 bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-bold rounded">
                Check Status
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default FarmerDashboard;
