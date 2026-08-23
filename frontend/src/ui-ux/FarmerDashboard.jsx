import { useState, useEffect } from 'react';
import { User, ShieldCheck, FileText, Bell, CheckCircle2, AlertCircle, ArrowRight, FolderLock, Target, Clock, Upload, ChevronRight } from 'lucide-react';

const FarmerDashboard = ({ user, onNavigate, onLogout }) => {
  const [vaultDocs, setVaultDocs] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const farmerId = user?.userId || user?._id || 'demo_farmer_1';
  const farmerName = user?.name || 'Ramesh Kumar';

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

  const hasLandRecord = vaultDocs.some(d => d.documentType?.includes('Land') || d.documentType?.includes('Jamabandi'));
  const reviewNeededDocs = vaultDocs.filter(d => d.status === 'Needs Review');

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-sans">
      
      {/* Welcome Greeting Header */}
      <div className="bg-white border border-[#DDE3DC] rounded-xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#202622] font-poppins">
            Good morning, {farmerName}
          </h2>
          <p className="text-sm text-[#66706A] mt-1 font-medium">
            Location: {user?.district || 'Lucknow'}, {user?.state || 'Uttar Pradesh'} • Registered Benefits Workspace
          </p>
        </div>

        <button
          onClick={() => onNavigate('tool')}
          className="px-4 py-2.5 bg-[#174A32] hover:bg-[#2F6B4F] text-white font-semibold rounded-lg text-xs transition-colors flex items-center gap-1.5 self-start sm:self-center shrink-0"
        >
          <Target size={15} /> Check Scheme Eligibility
        </button>
      </div>

      {/* SECTION 1: "Here's what needs your attention." (Primary Action Hero Card) */}
      <div className="bg-[#FFF5D9] border border-[#F6E3B5] rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2 text-[#B7791F] font-semibold text-xs uppercase tracking-wider">
          <AlertCircle size={16} /> Important Action Required
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-[#202622] font-poppins">
              {!hasLandRecord ? 'Land Record Required for Full Verification' : reviewNeededDocs.length > 0 ? 'Document Extraction Needs Your Confirmation' : 'Verification Complete — Ready for Scheme Benefits'}
            </h3>
            <p className="text-xs text-[#66706A]">
              {!hasLandRecord ? 'Upload your Jamabandi/Khasra land record to enable automatic 60% solar pump subsidy evaluation.' : reviewNeededDocs.length > 0 ? `${reviewNeededDocs.length} document needs your review in the locker to confirm extracted parameters.` : 'All your credentials are active. You can re-check scheme updates anytime.'}
            </p>
          </div>

          <button
            onClick={() => onNavigate('vault')}
            className="px-4 py-2.5 bg-[#174A32] hover:bg-[#2F6B4F] text-white font-semibold rounded-lg text-xs flex items-center gap-2 shrink-0"
          >
            {!hasLandRecord ? <><Upload size={14} /> Upload Land Record</> : <><FolderLock size={14} /> Open Document Locker</>}
          </button>
        </div>
      </div>

      {/* Main 3 Workspaces: Benefits, Documents, Notifications */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* YOUR BENEFITS */}
        <div className="bg-white border border-[#DDE3DC] rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#DDE3DC] pb-3">
            <h3 className="font-bold text-[#202622] text-sm flex items-center gap-2 font-poppins">
              <CheckCircle2 size={16} className="text-[#287A4D]" />
              Your Benefits
            </h3>
            <button onClick={() => onNavigate('tool')} className="text-xs text-[#2F6B4F] font-semibold hover:underline">
              View All
            </button>
          </div>

          <div className="space-y-3">
            <div className="p-3 bg-[#F8F5EC] border border-[#DDE3DC] rounded-lg space-y-1">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs text-[#202622]">PM-KISAN</h4>
                <span className="px-2 py-0.5 bg-[#E8F5EC] text-[#287A4D] border border-[#C6E7D2] text-[10px] font-semibold rounded">
                  Likely Eligible
                </span>
              </div>
              <p className="text-[11px] text-[#66706A]">₹6,000/year Direct Income Support</p>
            </div>

            <div className="p-3 bg-[#F8F5EC] border border-[#DDE3DC] rounded-lg space-y-1">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs text-[#202622]">PM-KMY Pension</h4>
                <span className="px-2 py-0.5 bg-[#FFF5D9] text-[#B7791F] border border-[#F6E3B5] text-[10px] font-semibold rounded">
                  Needs Verification
                </span>
              </div>
              <p className="text-[11px] text-[#66706A]">₹3,000/month Old Age Pension</p>
            </div>

            <div className="p-3 bg-[#F8F5EC] border border-[#DDE3DC] rounded-lg space-y-1">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs text-[#202622]">PM-KUSUM Solar</h4>
                <span className="px-2 py-0.5 bg-[#FFF5D9] text-[#B7791F] border border-[#F6E3B5] text-[10px] font-semibold rounded">
                  Land Record Required
                </span>
              </div>
              <p className="text-[11px] text-[#66706A]">60% Agricultural Solar Pump Subsidy</p>
            </div>
          </div>
        </div>

        {/* YOUR DOCUMENTS */}
        <div className="bg-white border border-[#DDE3DC] rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#DDE3DC] pb-3">
            <h3 className="font-bold text-[#202622] text-sm flex items-center gap-2 font-poppins">
              <FolderLock size={16} className="text-[#2F6B4F]" />
              Your Documents
            </h3>
            <button onClick={() => onNavigate('vault')} className="text-xs text-[#2F6B4F] font-semibold hover:underline">
              Manage Locker
            </button>
          </div>

          <div className="space-y-3 text-xs">
            {vaultDocs.length > 0 ? (
              vaultDocs.map((doc, idx) => (
                <div key={doc._id || idx} className="p-3 bg-[#F8F5EC] border border-[#DDE3DC] rounded-lg flex items-center justify-between">
                  <div className="truncate max-w-[150px]">
                    <h4 className="font-semibold text-[#202622] truncate">{doc.documentType || doc.originalFilename}</h4>
                    <p className="text-[10px] text-[#66706A]">{doc.ocrEngineUsed ? 'OCR Processed' : 'Uploaded'}</p>
                  </div>
                  <span className={`px-2 py-0.5 text-[10px] font-semibold rounded ${doc.status === 'Verified' ? 'bg-[#E8F5EC] text-[#287A4D]' : 'bg-[#FFF5D9] text-[#B7791F]'}`}>
                    {doc.status || 'Available'}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-4 text-center bg-[#F8F5EC] border border-[#DDE3DC] rounded-lg text-xs text-[#66706A]">
                No documents uploaded yet.
              </div>
            )}

            <button
              onClick={() => onNavigate('vault')}
              className="w-full py-2 bg-[#F8F5EC] hover:bg-[#EAE5D8] border border-[#DDE3DC] text-[#2F6B4F] font-semibold rounded-lg text-xs flex items-center justify-center gap-1 transition-colors"
            >
              <Upload size={13} /> Add New Document
            </button>
          </div>
        </div>

        {/* NOTIFICATIONS */}
        <div className="bg-white border border-[#DDE3DC] rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#DDE3DC] pb-3">
            <h3 className="font-bold text-[#202622] text-sm flex items-center gap-2 font-poppins">
              <Bell size={16} className="text-[#2F6B4F]" />
              Notifications
            </h3>
            <span className="text-[11px] font-semibold px-2 py-0.5 bg-[#F8F5EC] text-[#2F6B4F] border border-[#DDE3DC] rounded">
              {unreadCount} Unread
            </span>
          </div>

          <div className="space-y-3 text-xs">
            {notifications.length > 0 ? (
              notifications.slice(0, 3).map((notif, idx) => (
                <div key={notif._id || idx} className="p-3 bg-[#F8F5EC] border border-[#DDE3DC] rounded-lg space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-[#202622]">{notif.title}</h4>
                  </div>
                  <p className="text-[11px] text-[#66706A]">{notif.message}</p>
                </div>
              ))
            ) : (
              <div className="p-3 bg-[#F8F5EC] border border-[#DDE3DC] rounded-lg space-y-1">
                <h4 className="font-semibold text-[#202622]">Service Alert</h4>
                <p className="text-[11px] text-[#66706A]">Keep your profile up to date to receive matching benefit notifications.</p>
              </div>
            )}

            <button
              onClick={() => onNavigate('vault')}
              className="w-full py-2 bg-[#F8F5EC] hover:bg-[#EAE5D8] border border-[#DDE3DC] text-[#2F6B4F] font-semibold rounded-lg text-xs flex items-center justify-center gap-1 transition-colors"
            >
              View Notification Center <ChevronRight size={13} />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};

export default FarmerDashboard;
