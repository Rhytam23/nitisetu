import { useState, useEffect } from 'react';
import { Shield, Users, FileText, CheckCircle, AlertCircle, Layers, Activity, RefreshCw, Search } from 'lucide-react';

const AdminDashboard = ({ user, token }) => {
  const [analytics, setAnalytics] = useState(null);
  const [farmers, setFarmers] = useState([]);
  const [schemes, setSchemes] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      const headers = { 'Authorization': `Bearer ${token}` };

      // Analytics
      const resA = await fetch(`${baseUrl}/api/admin/analytics`, { headers });
      const dataA = await resA.json();
      if (dataA.success) setAnalytics(dataA.data);

      // Farmers
      const resF = await fetch(`${baseUrl}/api/admin/farmers`, { headers });
      const dataF = await resF.json();
      if (dataF.success) setFarmers(dataF.data || []);

      // Schemes
      const resS = await fetch(`${baseUrl}/api/admin/schemes`, { headers });
      const dataS = await resS.json();
      if (dataS.success) setSchemes(dataS.data || []);

      // Documents Queue
      const resD = await fetch(`${baseUrl}/api/admin/documents`, { headers });
      const dataD = await resD.json();
      if (dataD.success) setDocuments(dataD.data || []);

      // Audit Logs
      const resL = await fetch(`${baseUrl}/api/admin/audit-logs`, { headers });
      const dataL = await resL.json();
      if (dataL.success) setAuditLogs(dataL.data || []);

    } catch (e) {
      console.error('Error fetching admin dashboard data:', e);
    } finally {
      setLoading(false);
    }
  };

  const filteredFarmers = farmers.filter(f => 
    f.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.state?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.district?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-sans">
      
      {/* Government Console Banner */}
      <div className="bg-white border border-[#DDE3DC] rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#E8F5EC] text-[#174A32] border border-[#C6E7D2] flex items-center justify-center font-bold">
            <Shield size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-[#202622] font-poppins">Government Operational Console</h2>
              <span className="px-2 py-0.5 bg-[#E8F5EC] text-[#287A4D] border border-[#C6E7D2] text-[10px] font-semibold rounded">
                Role: ADMIN
              </span>
            </div>
            <p className="text-xs text-[#66706A] mt-0.5 font-medium">Platform Management, OCR Review & Policy Retrieval Audit</p>
          </div>
        </div>

        <button
          onClick={fetchAdminData}
          className="px-3.5 py-2 bg-[#F8F5EC] hover:bg-[#EAE5D8] text-[#2F6B4F] border border-[#DDE3DC] rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-center"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin text-[#174A32]' : ''} /> Refresh Data
        </button>
      </div>

      {/* Moderate Statistics Panel */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-[#DDE3DC] p-4 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-[#66706A] text-xs font-semibold">
            <span>Registered Farmers</span>
            <Users size={16} className="text-[#174A32]" />
          </div>
          <p className="text-2xl font-bold text-[#202622] font-poppins">{analytics?.totalFarmers ?? 0}</p>
          <p className="text-[10px] text-[#66706A]">Active platform accounts</p>
        </div>

        <div className="bg-white border border-[#DDE3DC] p-4 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-[#66706A] text-xs font-semibold">
            <span>Locker Documents</span>
            <FileText size={16} className="text-[#174A32]" />
          </div>
          <p className="text-2xl font-bold text-[#202622] font-poppins">{analytics?.totalDocuments ?? 0}</p>
          <p className="text-[10px] text-[#66706A]">{analytics?.documentsProcessed ?? 0} Processed via OCR</p>
        </div>

        <div className="bg-white border border-[#DDE3DC] p-4 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-[#66706A] text-xs font-semibold">
            <span>OCR Review Queue</span>
            <AlertCircle size={16} className="text-[#B7791F]" />
          </div>
          <p className="text-2xl font-bold text-[#B7791F] font-poppins">{analytics?.documentsNeedingReview ?? 0}</p>
          <p className="text-[10px] text-[#66706A]">Pending review items</p>
        </div>

        <div className="bg-white border border-[#DDE3DC] p-4 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-[#66706A] text-xs font-semibold">
            <span>Policy Vector Chunks</span>
            <Layers size={16} className="text-[#174A32]" />
          </div>
          <p className="text-2xl font-bold text-[#202622] font-poppins">207</p>
          <p className="text-[10px] text-[#66706A]">MongoDB Atlas Index</p>
        </div>
      </div>

      {/* Main Console Navigation Tabs & Table */}
      <div className="bg-white border border-[#DDE3DC] rounded-xl p-5 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DDE3DC] pb-3">
          <div className="flex flex-wrap text-xs font-semibold gap-1.5">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 rounded-md transition-colors ${activeTab === 'overview' ? 'bg-[#174A32] text-white' : 'text-[#66706A] hover:text-[#202622]'}`}
            >
              Farmers ({farmers.length})
            </button>
            <button
              onClick={() => setActiveTab('schemes')}
              className={`px-3 py-1.5 rounded-md transition-colors ${activeTab === 'schemes' ? 'bg-[#174A32] text-white' : 'text-[#66706A] hover:text-[#202622]'}`}
            >
              Schemes ({schemes.length})
            </button>
            <button
              onClick={() => setActiveTab('queue')}
              className={`px-3 py-1.5 rounded-md transition-colors ${activeTab === 'queue' ? 'bg-[#174A32] text-white' : 'text-[#66706A] hover:text-[#202622]'}`}
            >
              OCR Review ({documents.length})
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`px-3 py-1.5 rounded-md transition-colors ${activeTab === 'audit' ? 'bg-[#174A32] text-white' : 'text-[#66706A] hover:text-[#202622]'}`}
            >
              Audit Logs ({auditLogs.length})
            </button>
          </div>

          {activeTab === 'overview' && (
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-2.5 text-[#66706A]" />
              <input
                type="text"
                placeholder="Search farmers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-[#F8F5EC] border border-[#DDE3DC] rounded-md text-xs text-[#202622]"
              />
            </div>
          )}
        </div>

        {/* Tab 1: Farmers List Table */}
        {activeTab === 'overview' && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#2F6B4F] uppercase tracking-wider font-poppins">Registered Platform Farmers</h4>
            {filteredFarmers.length === 0 ? (
              <p className="text-xs text-[#66706A] italic">No registered farmers found.</p>
            ) : (
              <div className="overflow-x-auto border border-[#DDE3DC] rounded-lg">
                <table className="w-full text-xs text-left text-[#202622]">
                  <thead className="bg-[#F8F5EC] text-[#66706A] uppercase text-[10px] font-bold border-b border-[#DDE3DC]">
                    <tr>
                      <th className="p-3">Farmer Name</th>
                      <th className="p-3">Phone (Masked PII)</th>
                      <th className="p-3">State</th>
                      <th className="p-3">District</th>
                      <th className="p-3">Registered Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DDE3DC]">
                    {filteredFarmers.map(f => (
                      <tr key={f._id} className="hover:bg-[#F8F5EC]/50">
                        <td className="p-3 font-semibold text-[#202622]">{f.name}</td>
                        <td className="p-3 font-mono text-[#66706A]">{f.phoneMasked}</td>
                        <td className="p-3">{f.state}</td>
                        <td className="p-3">{f.district}</td>
                        <td className="p-3 text-[#66706A]">{new Date(f.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Scheme Guidelines Status */}
        {activeTab === 'schemes' && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#2F6B4F] uppercase tracking-wider font-poppins">Operational Guidelines & Vector Index Status</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {schemes.map(s => (
                <div key={s.id} className="bg-[#F8F5EC] p-4 rounded-lg border border-[#DDE3DC] space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#202622] font-poppins">{s.id}</span>
                    <span className="px-2 py-0.5 bg-[#E8F5EC] text-[#287A4D] border border-[#C6E7D2] text-[10px] font-semibold rounded">
                      {s.status}
                    </span>
                  </div>
                  <p className="text-[#66706A] text-[11px]">{s.name}</p>
                  <div className="pt-2 border-t border-[#DDE3DC] text-[10px] text-[#66706A] flex items-center justify-between font-mono">
                    <span>File: {s.sourceDocument}</span>
                    <span>Chunks: {s.indexedChunks}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Document Review Queue */}
        {activeTab === 'queue' && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#2F6B4F] uppercase tracking-wider font-poppins">Document Review Queue</h4>
            {documents.length === 0 ? (
              <p className="text-xs text-[#66706A] italic">No documents in queue.</p>
            ) : (
              <div className="space-y-2">
                {documents.map(d => (
                  <div key={d._id} className="bg-[#F8F5EC] p-3 rounded-lg border border-[#DDE3DC] flex items-center justify-between text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#202622] font-poppins">{d.documentType}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${d.status === 'Needs Review' ? 'bg-[#FFF5D9] text-[#B7791F] border border-[#F6E3B5]' : 'bg-[#E8F5EC] text-[#287A4D] border border-[#C6E7D2]'}`}>
                          {d.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#66706A] mt-0.5">Filename: {d.originalFilename} • Engine: {d.ocrEngineUsed || 'Cloud Vision'}</p>
                    </div>
                    <div className="text-right text-[10px] text-[#66706A] font-mono">
                      <span>Conf: {Math.round((d.classificationConfidence || 0.85) * 100)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Audit Logs */}
        {activeTab === 'audit' && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#2F6B4F] uppercase tracking-wider font-poppins">System Action Audit Log</h4>
            {auditLogs.length === 0 ? (
              <p className="text-xs text-[#66706A] italic">No actions logged yet.</p>
            ) : (
              <div className="space-y-2">
                {auditLogs.map(l => (
                  <div key={l._id} className="bg-[#F8F5EC] p-3 rounded-lg border border-[#DDE3DC] flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-[#174A32]">{l.action}</span>
                      <p className="text-[11px] text-[#202622] mt-0.5">{l.details || l.target}</p>
                    </div>
                    <div className="text-right text-[10px] text-[#66706A]">
                      <span>{new Date(l.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;
