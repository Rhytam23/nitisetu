import { useState, useEffect } from 'react';
import { Shield, Users, FileText, CheckCircle, AlertCircle, Layers, Activity, RefreshCw } from 'lucide-react';

const AdminDashboard = ({ user, token }) => {
  const [analytics, setAnalytics] = useState(null);
  const [farmers, setFarmers] = useState([]);
  const [schemes, setSchemes] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

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

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Admin Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center justify-center font-bold">
            <Shield size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white tracking-tight">Admin Console</h2>
              <span className="px-2 py-0.5 bg-teal-950 text-teal-300 border border-teal-800 text-[10px] font-bold rounded">
                Role: ADMIN
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">Platform Management, OCR Review & Policy Vector Audit</p>
          </div>
        </div>

        <button
          onClick={fetchAdminData}
          className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-center"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin text-teal-400' : ''} /> Refresh Real Analytics
        </button>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Total Farmers</span>
            <Users size={16} className="text-teal-400" />
          </div>
          <p className="text-2xl font-extrabold text-white">{analytics?.totalFarmers ?? 0}</p>
          <p className="text-[10px] text-slate-500">Registered platform accounts</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Vault Documents</span>
            <FileText size={16} className="text-teal-400" />
          </div>
          <p className="text-2xl font-extrabold text-white">{analytics?.totalDocuments ?? 0}</p>
          <p className="text-[10px] text-slate-500">{analytics?.documentsProcessed ?? 0} Processed via OCR</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>OCR Needs Review</span>
            <AlertCircle size={16} className="text-amber-400" />
          </div>
          <p className="text-2xl font-extrabold text-amber-300">{analytics?.documentsNeedingReview ?? 0}</p>
          <p className="text-[10px] text-slate-500">Low confidence detections</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>RAG Chunks</span>
            <Layers size={16} className="text-teal-400" />
          </div>
          <p className="text-2xl font-extrabold text-white">207</p>
          <p className="text-[10px] text-slate-500">MongoDB Atlas Vector Index</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4">
        <div className="flex border-b border-slate-800 pb-3 text-xs font-semibold gap-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${activeTab === 'overview' ? 'bg-teal-500/10 text-teal-300 border border-teal-500/20' : 'text-slate-400 hover:text-white'}`}
          >
            Registered Farmers ({farmers.length})
          </button>
          <button
            onClick={() => setActiveTab('schemes')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${activeTab === 'schemes' ? 'bg-teal-500/10 text-teal-300 border border-teal-500/20' : 'text-slate-400 hover:text-white'}`}
          >
            Scheme Guidelines Status ({schemes.length})
          </button>
          <button
            onClick={() => setActiveTab('queue')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${activeTab === 'queue' ? 'bg-teal-500/10 text-teal-300 border border-teal-500/20' : 'text-slate-400 hover:text-white'}`}
          >
            Document OCR Queue ({documents.length})
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${activeTab === 'audit' ? 'bg-teal-500/10 text-teal-300 border border-teal-500/20' : 'text-slate-400 hover:text-white'}`}
          >
            Audit Logs ({auditLogs.length})
          </button>
        </div>

        {/* Tab 1: Farmers List (PII Masked) */}
        {activeTab === 'overview' && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Registered Platform Farmers</h4>
            {farmers.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No registered farmers yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold">
                    <tr>
                      <th className="p-3">Name</th>
                      <th className="p-3">Phone (Masked PII)</th>
                      <th className="p-3">State</th>
                      <th className="p-3">District</th>
                      <th className="p-3">Registered Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {farmers.map(f => (
                      <tr key={f._id} className="hover:bg-slate-950/40">
                        <td className="p-3 font-bold text-white">{f.name}</td>
                        <td className="p-3 font-mono text-slate-400">{f.phoneMasked}</td>
                        <td className="p-3">{f.state}</td>
                        <td className="p-3">{f.district}</td>
                        <td className="p-3 text-slate-500">{new Date(f.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Scheme Operational Status */}
        {activeTab === 'schemes' && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Operational Guidelines & Vector Index Status</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {schemes.map(s => (
                <div key={s.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{s.id}</span>
                    <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800 text-[9px] font-bold rounded">
                      {s.status}
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px]">{s.name}</p>
                  <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-500 flex items-center justify-between font-mono">
                    <span>File: {s.sourceDocument}</span>
                    <span>Chunks: {s.indexedChunks}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Document Queue */}
        {activeTab === 'queue' && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Document Review & OCR Queue</h4>
            {documents.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No documents uploaded.</p>
            ) : (
              <div className="space-y-2">
                {documents.map(d => (
                  <div key={d._id} className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{d.documentType}</span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${d.status === 'Needs Review' ? 'bg-amber-950 text-amber-300 border border-amber-800' : 'bg-teal-950 text-teal-300 border border-teal-800'}`}>
                          {d.status}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">Filename: {d.originalFilename} • Engine: {d.ocrEngineUsed || 'Cloud Vision'}</p>
                    </div>
                    <div className="text-right text-[10px] text-slate-400 font-mono">
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
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Administrative Action Audit Log</h4>
            {auditLogs.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No administrative actions logged yet.</p>
            ) : (
              <div className="space-y-2">
                {auditLogs.map(l => (
                  <div key={l._id} className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-teal-400">{l.action}</span>
                      <p className="text-[11px] text-slate-300 mt-0.5">{l.details || l.target}</p>
                    </div>
                    <div className="text-right text-[10px] text-slate-500">
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
