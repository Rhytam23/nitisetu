import { useState, useEffect } from 'react';
import { Upload, FileText, Trash2, Download, ShieldCheck, CheckCircle2, AlertCircle, Plus, Edit3, Check, Eye } from 'lucide-react';

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
        setSuccess('Document uploaded & parsed via Cloud Vision OCR.');
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

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Verified':
      case 'Available':
        return <span className="px-2 py-0.5 rounded bg-[#E8F5EC] text-[#287A4D] border border-[#C6E7D2] text-[10px] font-semibold">Available</span>;
      case 'Processed':
        return <span className="px-2 py-0.5 rounded bg-[#E8F5EC] text-[#287A4D] border border-[#C6E7D2] text-[10px] font-semibold">Processed</span>;
      case 'Needs Review':
        return <span className="px-2 py-0.5 rounded bg-[#FFF5D9] text-[#B7791F] border border-[#F6E3B5] text-[10px] font-semibold">Needs Review</span>;
      case 'Expired':
        return <span className="px-2 py-0.5 rounded bg-[#FCECEC] text-[#B54747] border border-[#F5C6C6] text-[10px] font-semibold">Expired</span>;
      default:
        return <span className="px-2 py-0.5 rounded bg-[#F8F5EC] text-[#66706A] border border-[#DDE3DC] text-[10px] font-semibold">Processed</span>;
    }
  };

  return (
    <div className="bg-white border border-[#DDE3DC] rounded-xl p-6 sm:p-8 max-w-4xl mx-auto space-y-6 shadow-xs font-sans">
      
      {/* Vault Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DDE3DC] pb-5">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#202622] font-poppins flex items-center gap-2">
            <ShieldCheck className="text-[#174A32]" size={22} />
            Secure Digital Document Locker
          </h2>
          <p className="text-[#66706A] text-xs sm:text-sm font-normal mt-0.5">
            Store, verify, and manage your agricultural and identity credentials securely
          </p>
        </div>

        <button
          onClick={() => setShowUploadForm(!showUploadForm)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-[#174A32] hover:bg-[#2F6B4F] text-white font-semibold rounded-lg text-xs transition-colors shadow-xs"
        >
          <Plus size={15} />
          {showUploadForm ? 'Cancel Upload' : 'Upload Document'}
        </button>
      </div>

      {/* Profile Mismatch Prompt */}
      {mismatchDoc && (
        <div className="bg-[#FFF5D9] border border-[#F6E3B5] p-4 rounded-lg space-y-3 text-xs">
          <div className="flex items-start gap-2 text-[#B7791F] font-semibold">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Profile Land Mismatch Notice</p>
              <p className="font-normal text-[#202622] mt-0.5">
                Your uploaded <strong className="text-[#202622]">{mismatchDoc.documentType}</strong> indicates <strong className="text-[#B7791F]">{mismatchDoc.docLand} acres</strong>, but your profile currently states <strong className="text-[#202622]">{mismatchDoc.profileLand} acres</strong>.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => {
                if (onUpdateProfile) onUpdateProfile({ land_acres: mismatchDoc.docLand });
                setMismatchDoc(null);
              }}
              className="px-3 py-1.5 bg-[#174A32] hover:bg-[#2F6B4F] text-white font-semibold rounded-md text-xs transition-colors"
            >
              Update Profile to {mismatchDoc.docLand} Acres
            </button>
            <button
              onClick={() => setMismatchDoc(null)}
              className="px-3 py-1.5 bg-white hover:bg-[#F8F5EC] text-[#66706A] border border-[#DDE3DC] rounded-md text-xs font-semibold"
            >
              Keep Existing ({mismatchDoc.profileLand} Acres)
            </button>
          </div>
        </div>
      )}

      {/* Security Banner */}
      <div className="bg-[#F8F5EC] p-3.5 rounded-lg border border-[#DDE3DC] flex items-center gap-3 text-xs text-[#66706A]">
        <ShieldCheck className="text-[#174A32] shrink-0" size={17} />
        <span>Scanned documents are parsed via Cloud Vision OCR. Extracted parameters require farmer confirmation before saving.</span>
      </div>

      {/* Upload Form */}
      {showUploadForm && (
        <form onSubmit={handleUploadSubmit} className="bg-[#F8F5EC] border border-[#DDE3DC] p-5 rounded-lg space-y-4">
          <h3 className="text-xs font-bold text-[#202622] uppercase tracking-wider font-poppins">Upload Document File</h3>

          {error && <p className="text-xs text-[#B54747] font-semibold">{error}</p>}
          {success && <p className="text-xs text-[#287A4D] font-semibold">{success}</p>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#202622] mb-1">Document Type *</label>
              <select
                value={formData.documentType}
                onChange={(e) => setFormData(prev => ({ ...prev, documentType: e.target.value }))}
                className="w-full input-govt"
              >
                {DOCUMENT_TYPES.map((type, idx) => (
                  <option key={idx} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#202622] mb-1">Expiry Date (Optional)</label>
              <input
                type="date"
                value={formData.expiryDate}
                onChange={(e) => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
                className="w-full input-govt"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#202622] mb-1">Select File (PDF, JPG, PNG ≤ 5MB) *</label>
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.webp"
              onChange={handleFileChange}
              required
              className="w-full input-govt file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[#174A32] file:text-white hover:file:bg-[#2F6B4F]"
            />
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="w-full py-2.5 bg-[#174A32] hover:bg-[#2F6B4F] text-white font-semibold rounded-lg text-xs uppercase tracking-wider transition-colors disabled:opacity-50"
          >
            {uploading ? 'Processing Document with OCR...' : 'Upload & Extract Document Information'}
          </button>
        </form>
      )}

      {/* Document List Rows */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-[#66706A] uppercase tracking-wider font-poppins">Locker Documents ({documents.length})</h3>

        {loading ? (
          <p className="text-xs text-[#66706A] italic">Loading document locker...</p>
        ) : documents.length === 0 ? (
          <div className="bg-[#F8F5EC] p-6 rounded-lg border border-[#DDE3DC] text-center space-y-2">
            <FileText size={22} className="text-[#66706A] mx-auto" />
            <p className="text-xs text-[#202622] font-semibold">No documents stored in locker.</p>
            <p className="text-[11px] text-[#66706A]">Upload your Aadhaar or Jamabandi land record for scheme verification.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {documents.map((doc) => (
              <div key={doc._id} className="bg-white border border-[#DDE3DC] rounded-lg p-4 space-y-3 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DDE3DC] pb-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-md bg-[#E8F5EC] text-[#174A32] border border-[#C6E7D2] flex items-center justify-center shrink-0 mt-0.5">
                      <FileText size={16} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-[#202622] font-poppins">{doc.documentType}</h4>
                        {getStatusBadge(doc.status)}
                      </div>
                      <p className="text-xs text-[#66706A] mt-0.5 font-mono">{doc.originalFilename}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <a
                      href={`${import.meta.env.VITE_API_URL || ''}/api/documents/file/${doc._id}/download`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-[#F8F5EC] hover:bg-[#EAE5D8] text-[#2F6B4F] rounded-md border border-[#DDE3DC] transition-colors text-xs font-semibold flex items-center gap-1"
                    >
                      <Download size={13} /> Download
                    </a>
                    <button
                      onClick={() => handleDelete(doc._id)}
                      className="p-1.5 bg-[#FCECEC] hover:bg-[#F5C6C6] text-[#B54747] rounded-md border border-[#F5C6C6] transition-colors text-xs"
                      title="Delete document"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Practical OCR Extracted Information Row */}
                {doc.extractedFields && (
                  <div className="bg-[#F8F5EC] p-3 rounded-lg border border-[#DDE3DC] space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#202622]">Extracted Information</span>
                      {doc.farmerConfirmed ? (
                        <span className="px-2 py-0.5 bg-[#E8F5EC] text-[#287A4D] border border-[#C6E7D2] text-[10px] font-semibold rounded flex items-center gap-1">
                          <Check size={10} /> Confirmed
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-[#FFF5D9] text-[#B7791F] border border-[#F6E3B5] text-[10px] font-semibold rounded">
                          Review Needed
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[#202622]">
                      {doc.extractedFields.landAcres !== null && doc.extractedFields.landAcres !== undefined && (
                        <div><span className="text-[#66706A] block text-[10px]">Land Area</span>{doc.extractedFields.landAcres} Acres</div>
                      )}
                      {doc.extractedFields.khasraNumber && (
                        <div><span className="text-[#66706A] block text-[10px]">Khasra/Survey No</span>{doc.extractedFields.khasraNumber}</div>
                      )}
                      {doc.extractedFields.ownerName && (
                        <div><span className="text-[#66706A] block text-[10px]">Owner Name</span>{doc.extractedFields.ownerName}</div>
                      )}
                      {doc.extractedFields.aadhaarMasked && (
                        <div><span className="text-[#66706A] block text-[10px]">Aadhaar No</span>{doc.extractedFields.aadhaarMasked}</div>
                      )}
                    </div>

                    {!doc.farmerConfirmed && (
                      <div className="pt-2 border-t border-[#DDE3DC] flex items-center justify-between">
                        <span className="text-[10px] text-[#66706A]">Check extracted parameters for accuracy.</span>
                        <button
                          onClick={() => handleConfirmDoc(doc._id, doc.extractedFields)}
                          className="px-3 py-1 bg-[#174A32] hover:bg-[#2F6B4F] text-white font-semibold rounded-md text-xs transition-colors flex items-center gap-1"
                        >
                          <Check size={11} /> Confirm Details
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
