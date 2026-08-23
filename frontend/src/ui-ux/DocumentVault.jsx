import { useState, useEffect } from 'react';
import { Upload, FileText, Trash2, Download, ShieldCheck, CheckCircle2, AlertCircle, Sparkles, Plus, Edit3, Check } from 'lucide-react';

const DOCUMENT_TYPES = [
  'Aadhaar',
  'Land Ownership Record (Jamabandi)',
  'Land Lease Document',
  'Bank Passbook',
  'Crop Certificate',
  'Income Certificate',
  'Caste Certificate',
  'Domicile Certificate',
  'Electricity Bill',
  'Other'
];

const DocumentVault = ({ farmerId = 'demo_farmer_1', selectedLanguage, currentProfile, onUpdateProfile }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [editingDocId, setEditingDocId] = useState(null);
  const [editFields, setEditFields] = useState({});
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [mismatchDoc, setMismatchDoc] = useState(null);

  const [formData, setFormData] = useState({
    documentType: 'Land Ownership Record (Jamabandi)',
    file: null,
    expiryDate: ''
  });

  useEffect(() => {
    fetchDocuments();
  }, [farmerId]);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      const res = await fetch(`${baseUrl}/api/documents/${farmerId}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setDocuments(data.data);
        checkProfileMismatches(data.data);
      }
    } catch (err) {
      console.error('Error fetching documents:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkProfileMismatches = (docs) => {
    if (!currentProfile) return;
    for (const doc of docs) {
      if (doc.extractedFields && doc.extractedFields.landAcres !== null && doc.extractedFields.landAcres !== undefined) {
        const docLand = Number(doc.extractedFields.landAcres);
        const profileLand = Number(currentProfile.land_acres || 0);
        if (Math.abs(docLand - profileLand) > 0.1) {
          setMismatchDoc({
            documentType: doc.documentType,
            docLand,
            profileLand
          });
          break;
        }
      }
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('File size exceeds the 5MB limit.');
        return;
      }
      setError(null);
      setFormData(prev => ({ ...prev, file }));
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!formData.file) {
      setError('Please select a file to upload.');
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(null);

    const body = new FormData();
    body.append('farmerId', farmerId);
    body.append('documentType', formData.documentType);
    body.append('file', formData.file);
    if (formData.expiryDate) body.append('expiryDate', formData.expiryDate);

    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      const res = await fetch(`${baseUrl}/api/documents/upload`, {
        method: 'POST',
        body
      });
      const data = await res.json();

      if (data.success) {
        setSuccess('Document uploaded & Cloud Vision OCR extracted.');
        setShowUploadForm(false);
        setFormData({ documentType: 'Land Ownership Record (Jamabandi)', file: null, expiryDate: '' });
        fetchDocuments();
      } else {
        throw new Error(data.error || 'Upload failed');
      }
    } catch (err) {
      setError(err.message || 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleConfirmDoc = async (docId, customFields = null) => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      const res = await fetch(`${baseUrl}/api/documents/${docId}/confirm`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farmerId,
          updatedFields: customFields || editFields
        })
      });
      const data = await res.json();
      if (data.success) {
        setEditingDocId(null);
        setSuccess('OCR parameters confirmed by farmer.');
        fetchDocuments();
      }
    } catch (err) {
      console.error('Confirmation error:', err);
    }
  };

  const handleDelete = async (docId) => {
    if (!confirm('Are you sure you want to delete this document from your vault?')) return;
    try {
      const baseUrl = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${baseUrl}/api/documents/${docId}?farmerId=${farmerId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        fetchDocuments();
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const getStatusBadge = (status, confidence) => {
    switch (status) {
      case 'Verified':
        return <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold">Verified</span>;
      case 'Processed':
        return (
          <span className="px-2 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-800 text-[10px] font-bold flex items-center gap-1">
            <Sparkles size={10} /> Processed ({Math.round((confidence || 0.85) * 100)}%)
          </span>
        );
      case 'Needs Review':
        return <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 text-[10px] font-bold">Needs Review</span>;
      case 'Uploaded':
      default:
        return <span className="px-2 py-0.5 rounded bg-slate-800 text-teal-300 border border-slate-700 text-[10px] font-bold">Uploaded</span>;
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 max-w-4xl mx-auto space-y-6">
      
      {/* Vault Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <ShieldCheck className="text-teal-400" size={24} />
            Farmer Document Vault & Genuine OCR Pipeline
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm font-normal mt-0.5">
            Google Cloud Vision OCR API, Gemini entity extraction, and farmer confirmation
          </p>
        </div>

        <button
          onClick={() => setShowUploadForm(!showUploadForm)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs transition-colors shadow-sm"
        >
          <Plus size={16} />
          {showUploadForm ? 'Cancel Upload' : 'Upload New Document'}
        </button>
      </div>

      {/* Profile Mismatch Prompt */}
      {mismatchDoc && (
        <div className="bg-amber-950/40 border border-amber-800/60 p-4 rounded-xl space-y-3">
          <div className="flex items-start gap-2 text-amber-300 font-bold text-xs">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <div>
              <p>Profile Land Mismatch Detected</p>
              <p className="font-normal text-slate-300 text-xs mt-0.5">
                Your uploaded <strong className="text-white">{mismatchDoc.documentType}</strong> shows <strong className="text-amber-300">{mismatchDoc.docLand} acres</strong>, but your profile currently states <strong className="text-slate-200">{mismatchDoc.profileLand} acres</strong>.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => {
                if (onUpdateProfile) onUpdateProfile({ land_acres: mismatchDoc.docLand });
                setMismatchDoc(null);
              }}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs transition-colors"
            >
              Update Profile to {mismatchDoc.docLand} Acres
            </button>
            <button
              onClick={() => setMismatchDoc(null)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold"
            >
              Keep Existing ({mismatchDoc.profileLand} Acres)
            </button>
          </div>
        </div>
      )}

      {/* Security Banner */}
      <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center gap-3 text-xs text-slate-300">
        <ShieldCheck className="text-teal-400 shrink-0" size={18} />
        <span>Scanned images and PDFs are parsed via Google Cloud Vision OCR. Extracted parameters require explicit farmer confirmation before saving.</span>
      </div>

      {/* Upload Form */}
      {showUploadForm && (
        <form onSubmit={handleUploadSubmit} className="bg-slate-950 border border-slate-800 p-5 rounded-xl space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Upload Scanned Document / Image</h3>

          {error && <p className="text-xs text-red-400 font-semibold">{error}</p>}
          {success && <p className="text-xs text-emerald-400 font-semibold">{success}</p>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Document Type *</label>
              <select
                value={formData.documentType}
                onChange={(e) => setFormData(prev => ({ ...prev, documentType: e.target.value }))}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs"
              >
                {DOCUMENT_TYPES.map((type, idx) => (
                  <option key={idx} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Expiry Date (Optional)</label>
              <input
                type="date"
                value={formData.expiryDate}
                onChange={(e) => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">File Payload (PDF, JPG, PNG, WEBP ≤ 5MB) *</label>
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.webp"
              onChange={handleFileChange}
              required
              className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-teal-500 file:text-slate-950 hover:file:bg-teal-400"
            />
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="w-full py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs uppercase tracking-wider transition-colors disabled:opacity-50"
          >
            {uploading ? 'Executing Cloud Vision OCR & Gemini Extraction...' : 'Upload & Process with Cloud Vision OCR'}
          </button>
        </form>
      )}

      {/* Document List */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Your Vault Documents ({documents.length})</h3>

        {loading ? (
          <p className="text-xs text-slate-500 italic">Loading vault documents...</p>
        ) : documents.length === 0 ? (
          <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 text-center space-y-2">
            <FileText size={24} className="text-slate-600 mx-auto" />
            <p className="text-xs text-slate-400 font-medium">No documents uploaded yet.</p>
            <p className="text-[11px] text-slate-500">Upload a scanned Jamabandi image or PDF for Cloud Vision OCR extraction.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {documents.map((doc) => (
              <div key={doc._id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center justify-center shrink-0 mt-0.5">
                      <FileText size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white">{doc.documentType}</h4>
                        {getStatusBadge(doc.status, doc.classificationConfidence)}
                        <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                          {doc.ocrEngineUsed || 'Google-Cloud-Vision-OCR'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">{doc.originalFilename}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <a
                      href={`${import.meta.env.VITE_API_URL || ''}/api/documents/file/${doc._id}/download`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg border border-slate-800 transition-colors text-xs flex items-center gap-1 font-semibold"
                    >
                      <Download size={14} /> Download
                    </a>
                    <button
                      onClick={() => handleDelete(doc._id)}
                      className="p-2 bg-red-950/40 hover:bg-red-900/40 text-red-400 rounded-lg border border-red-800/40 transition-colors text-xs"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Extracted Fields & Confirmation Box */}
                {doc.extractedFields && (
                  <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider flex items-center gap-1">
                        <Sparkles size={12} /> Extracted Parameters
                      </span>
                      {doc.farmerConfirmed ? (
                        <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800 text-[9px] font-bold rounded flex items-center gap-1">
                          <Check size={10} /> Confirmed by Farmer
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-amber-950 text-amber-300 border border-amber-800 text-[9px] font-bold rounded">
                          Confirmation Required
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-slate-300">
                      {doc.extractedFields.landAcres !== null && doc.extractedFields.landAcres !== undefined && (
                        <div><strong className="text-slate-400">Land Area:</strong> {doc.extractedFields.landAcres} Acres</div>
                      )}
                      {doc.extractedFields.khasraNumber && (
                        <div><strong className="text-slate-400">Khasra No:</strong> {doc.extractedFields.khasraNumber}</div>
                      )}
                      {doc.extractedFields.ownerName && (
                        <div><strong className="text-slate-400">Owner:</strong> {doc.extractedFields.ownerName}</div>
                      )}
                      {doc.extractedFields.aadhaarMasked && (
                        <div><strong className="text-slate-400">Aadhaar:</strong> {doc.extractedFields.aadhaarMasked}</div>
                      )}
                      {doc.extractedFields.bankName && (
                        <div><strong className="text-slate-400">Bank:</strong> {doc.extractedFields.bankName}</div>
                      )}
                    </div>

                    {!doc.farmerConfirmed && (
                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                        <p className="text-[10px] text-slate-400">Please review detected parameters before confirming.</p>
                        <button
                          onClick={() => handleConfirmDoc(doc._id, doc.extractedFields)}
                          className="px-3 py-1.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-lg text-xs transition-colors flex items-center gap-1"
                        >
                          <Check size={12} /> Confirm & Save Details
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentVault;
