import { useState, useEffect } from 'react';
import { Bell, Check, CheckCheck, X, AlertCircle, ArrowRight, ShieldCheck, FileText, Target, Info } from 'lucide-react';

const NotificationCenter = ({ farmerId = 'demo_farmer_1', onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, [farmerId]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      const res = await fetch(`${baseUrl}/api/notifications/${farmerId}`);
      const data = await res.json();

      if (data.success && data.data) {
        setNotifications(data.data.notifications || []);
        setUnreadCount(data.data.unreadCount || 0);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (notifId) => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      await fetch(`${baseUrl}/api/notifications/${notifId}/read`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ farmerId })
      });
      fetchNotifications();
    } catch (err) {
      console.error('Error marking read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || '';
      await fetch(`${baseUrl}/api/notifications/read-all`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ farmerId })
      });
      fetchNotifications();
    } catch (err) {
      console.error('Error marking all read:', err);
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'UNREAD') return !n.readAt;
    if (filter === 'HIGH') return n.priority === 'high';
    if (filter === 'DOCUMENTS') return n.type.includes('DOCUMENT');
    return true;
  });

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'high':
        return <span className="px-2 py-0.5 rounded bg-[#FCECEC] text-[#B54747] border border-[#F5C6C6] text-[9px] font-bold uppercase">High</span>;
      case 'medium':
        return <span className="px-2 py-0.5 rounded bg-[#FFF5D9] text-[#B7791F] border border-[#F6E3B5] text-[9px] font-bold uppercase">Medium</span>;
      case 'low':
      default:
        return <span className="px-2 py-0.5 rounded bg-[#F8F5EC] text-[#66706A] border border-[#DDE3DC] text-[9px] font-bold uppercase">Low</span>;
    }
  };

  return (
    <div className="relative">
      {/* Trigger Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg bg-[#0F3523] border border-[#2F6B4F] text-white/90 hover:text-white transition-colors"
        title="Personalized Notifications"
      >
        <Bell size={17} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#E9B949] text-[#174A32] text-[10px] font-bold flex items-center justify-center border border-[#174A32] shadow-xs">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notification Drawer / Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-[#DDE3DC] rounded-xl shadow-lg z-50 overflow-hidden space-y-3 font-sans">
          
          {/* Panel Header */}
          <div className="p-4 bg-[#F8F5EC] border-b border-[#DDE3DC] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-[#202622] text-sm font-poppins">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 bg-[#E8F5EC] text-[#287A4D] border border-[#C6E7D2] text-[10px] font-semibold rounded-full">
                  {unreadCount} Unread
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-[10px] font-semibold text-[#2F6B4F] hover:underline flex items-center gap-1"
                >
                  <CheckCheck size={12} /> Mark All Read
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-[#66706A] hover:text-[#202622] rounded hover:bg-[#DDE3DC]/40 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Filter Categories */}
          <div className="px-4 flex items-center gap-1 border-b border-[#DDE3DC] pb-2 text-[11px] font-semibold">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-2.5 py-1 rounded-md transition-colors ${filter === 'ALL' ? 'bg-[#174A32] text-white' : 'text-[#66706A] hover:text-[#202622]'}`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('UNREAD')}
              className={`px-2.5 py-1 rounded-md transition-colors ${filter === 'UNREAD' ? 'bg-[#174A32] text-white' : 'text-[#66706A] hover:text-[#202622]'}`}
            >
              Unread
            </button>
            <button
              onClick={() => setFilter('HIGH')}
              className={`px-2.5 py-1 rounded-md transition-colors ${filter === 'HIGH' ? 'bg-[#174A32] text-white' : 'text-[#66706A] hover:text-[#202622]'}`}
            >
              High Priority
            </button>
          </div>

          {/* Notification List */}
          <div className="max-h-80 overflow-y-auto px-4 pb-4 space-y-2">
            {loading ? (
              <p className="text-xs text-[#66706A] italic py-4 text-center">Loading notifications...</p>
            ) : filteredNotifications.length === 0 ? (
              <div className="py-6 text-center text-[#66706A] text-xs space-y-1">
                <Info size={20} className="mx-auto text-[#66706A]" />
                <p>No notifications matching filter.</p>
              </div>
            ) : (
              filteredNotifications.map((notif) => (
                <div
                  key={notif._id}
                  className={`p-3 rounded-lg border transition-colors ${
                    notif.readAt ? 'bg-[#F8F5EC]/60 border-[#DDE3DC] opacity-75' : 'bg-[#F8F5EC] border-[#DDE3DC]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="text-xs font-bold text-[#202622] leading-tight font-poppins">{notif.title}</h4>
                    {getPriorityBadge(notif.priority)}
                  </div>

                  <p className="text-[11px] text-[#66706A] leading-snug mb-2">{notif.message}</p>

                  <div className="flex items-center justify-between pt-1 border-t border-[#DDE3DC] text-[10px]">
                    <span className="text-[#66706A]">{new Date(notif.createdAt).toLocaleDateString()}</span>

                    <div className="flex items-center gap-2">
                      {!notif.readAt && (
                        <button
                          onClick={() => handleMarkRead(notif._id)}
                          className="text-[#2F6B4F] hover:underline font-semibold flex items-center gap-0.5"
                        >
                          <Check size={12} /> Read
                        </button>
                      )}
                      {notif.action?.actionLabel && (
                        <button
                          onClick={() => {
                            if (onNavigate) onNavigate(notif.action.targetRoute || '/vault');
                            setIsOpen(false);
                          }}
                          className="text-[#174A32] font-bold hover:underline flex items-center gap-0.5"
                        >
                          {notif.action.actionLabel} <ArrowRight size={10} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
