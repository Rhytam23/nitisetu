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
        return <span className="px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800 text-[9px] font-bold uppercase">High</span>;
      case 'medium':
        return <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 text-[9px] font-bold uppercase">Medium</span>;
      case 'low':
      default:
        return <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 text-[9px] font-bold uppercase">Low</span>;
    }
  };

  return (
    <div className="relative">
      {/* Trigger Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
        title="Personalized Farmer Notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-teal-500 text-slate-950 text-[10px] font-black flex items-center justify-center border border-slate-950 shadow-sm">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notification Drawer / Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden space-y-3">
          
          {/* Panel Header */}
          <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 bg-teal-500/10 text-teal-300 border border-teal-500/20 text-[10px] font-bold rounded-full">
                  {unreadCount} Unread
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-[10px] font-bold text-teal-400 hover:underline flex items-center gap-1"
                >
                  <CheckCheck size={12} /> Mark All Read
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Filter Categories */}
          <div className="px-4 flex items-center gap-1 border-b border-slate-800/80 pb-2 text-[11px] font-semibold">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${filter === 'ALL' ? 'bg-teal-500/10 text-teal-300 border border-teal-500/20' : 'text-slate-400 hover:text-white'}`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('UNREAD')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${filter === 'UNREAD' ? 'bg-teal-500/10 text-teal-300 border border-teal-500/20' : 'text-slate-400 hover:text-white'}`}
            >
              Unread
            </button>
            <button
              onClick={() => setFilter('HIGH')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${filter === 'HIGH' ? 'bg-teal-500/10 text-teal-300 border border-teal-500/20' : 'text-slate-400 hover:text-white'}`}
            >
              High Priority
            </button>
          </div>

          {/* Notification List */}
          <div className="max-h-80 overflow-y-auto px-4 pb-4 space-y-2.5">
            {loading ? (
              <p className="text-xs text-slate-500 italic py-4 text-center">Loading notifications...</p>
            ) : filteredNotifications.length === 0 ? (
              <div className="py-6 text-center text-slate-500 text-xs space-y-1">
                <Info size={20} className="mx-auto text-slate-600" />
                <p>No notifications matching filter.</p>
              </div>
            ) : (
              filteredNotifications.map((notif) => (
                <div
                  key={notif._id}
                  className={`p-3 rounded-xl border transition-colors ${
                    notif.readAt ? 'bg-slate-950/40 border-slate-800/60 opacity-80' : 'bg-slate-950 border-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="text-xs font-bold text-white leading-tight">{notif.title}</h4>
                    {getPriorityBadge(notif.priority)}
                  </div>

                  <p className="text-[11px] text-slate-400 leading-snug mb-2">{notif.message}</p>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[10px]">
                    <span className="text-slate-500">{new Date(notif.createdAt).toLocaleDateString()}</span>

                    <div className="flex items-center gap-2">
                      {!notif.readAt && (
                        <button
                          onClick={() => handleMarkRead(notif._id)}
                          className="text-slate-400 hover:text-teal-400 font-semibold flex items-center gap-0.5"
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
                          className="text-teal-400 font-bold hover:underline flex items-center gap-0.5"
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
