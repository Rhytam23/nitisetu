import { useState, useRef, useEffect } from 'react';
import { CheckCircle, XCircle, FileText, Bookmark, Volume2, SquarePlay, MapPin, ExternalLink, HelpCircle, ChevronRight, Layers, ShieldCheck, Upload } from 'lucide-react';

const ProofCard = ({ result, schemeName, selectedLanguage, farmerId = 'demo_farmer_1', onNavigateToVault }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [vaultDocs, setVaultDocs] = useState([]);
  const synthRef = useRef(window.speechSynthesis);

  useEffect(() => {
    fetchVaultDocuments();
  }, [farmerId]);

  const fetchVaultDocuments = async () => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      const res = await fetch(`${baseUrl}/api/documents/${farmerId}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setVaultDocs(data.data);
      }
    } catch (e) {
      console.error('Error checking vault:', e);
    }
  };

  if (!result) return null;

  const isEligible = result.status === 'Eligible' || result.status === 'पात्र';
  const guidance = result.application_guidance || {};
  const discoveredSchemes = result.discovered_schemes || [];

  const availableDocTypes = new Set(vaultDocs.map(d => d.documentType));

  const playTTS = () => {
    if (synthRef.current.speaking) {
      synthRef.current.cancel();
      setIsPlaying(false);
      return;
    }

    const textToSpeak = `${result.status}. ${result.reasoning}.`;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    
    const voices = synthRef.current.getVoices();
    const langVoiceMap = {
      'en': 'en-IN', 'hi': 'hi-IN', 'mr': 'mr-IN', 'ta': 'ta-IN',
      'te': 'te-IN', 'bn': 'bn-IN', 'gu': 'gu-IN', 'kn': 'kn-IN',
      'ml': 'ml-IN', 'pa': 'pa-IN', 'sa': 'sa-IN'
    };
    
    const targetLang = langVoiceMap[selectedLanguage] || 'en-IN';
    const localizedVoice = voices.find(v => v.lang.startsWith(targetLang) || v.lang.includes(selectedLanguage));
    
    if (localizedVoice) utterance.voice = localizedVoice;
    
    utterance.onend = () => setIsPlaying(false);
    synthRef.current.speak(utterance);
    setIsPlaying(true);
  };

  const isDocumentInVault = (docName) => {
    if (docName.toLowerCase().includes('aadhaar') && availableDocTypes.has('Aadhaar')) return true;
    if ((docName.toLowerCase().includes('land') || docName.toLowerCase().includes('jamabandi')) && availableDocTypes.has('Land Ownership Record (Jamabandi)')) return true;
    if (docName.toLowerCase().includes('bank') && availableDocTypes.has('Bank Passbook')) return true;
    return false;
  };

  return (
    <div className="mt-8 max-w-4xl w-full mx-auto rounded-xl border border-[#DDE3DC] bg-white overflow-hidden shadow-xs font-sans">
      
      {/* Header Verdict Phase */}
      <div className={`p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b ${isEligible ? 'bg-[#E8F5EC] border-[#C6E7D2]' : 'bg-[#FFF5D9] border-[#F6E3B5]'}`}>
        <div className="flex items-center gap-3.5">
          {isEligible ? (
            <CheckCircle className="text-[#287A4D] w-8 h-8 shrink-0" />
          ) : (
            <XCircle className="text-[#B7791F] w-8 h-8 shrink-0" />
          )}
          <div>
            <div className="flex items-center gap-2">
              <h3 className={`text-2xl font-bold font-poppins ${isEligible ? 'text-[#287A4D]' : 'text-[#B7791F]'}`}>
                {isEligible ? 'Likely Eligible' : 'Needs Verification'}
              </h3>
              <span className="text-[11px] font-semibold tracking-wider uppercase px-2.5 py-0.5 rounded bg-white text-[#202622] border border-[#DDE3DC]">
                Policy Verified
              </span>
            </div>
            <p className="text-xs text-[#66706A] font-medium mt-0.5">{schemeName || 'Scheme'} Eligibility Assessment Verdict</p>
          </div>
        </div>

        <button 
          onClick={playTTS} 
          className="flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold border bg-white text-[#2F6B4F] border-[#2F6B4F] hover:bg-[#F8F5EC] transition-colors w-full sm:w-auto"
        >
          {isPlaying ? <Volume2 size={15} className="animate-pulse text-[#174A32]" /> : <SquarePlay size={15} className="text-[#174A32]" />}
          {isPlaying ? 'Stop Audio' : 'Listen Audio Explanation'}
        </button>
      </div>

      <div className="p-6 sm:p-8 space-y-7">
        
        {/* Why You're Eligible / Explanation */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-[#2F6B4F] uppercase tracking-wider font-poppins">
            Eligibility Explanation
          </h4>
          <p className="text-[#202622] text-sm leading-relaxed bg-[#F8F5EC] p-4 rounded-lg border border-[#DDE3DC]">
            {result.reasoning}
          </p>
        </div>

        {/* Verbatim Policy Evidence Quote */}
        <div className="bg-[#F8F5EC] rounded-lg p-5 border border-[#DDE3DC] space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="flex items-center gap-2 text-xs font-bold text-[#174A32] uppercase tracking-wider font-poppins">
              <Bookmark size={15} className="text-[#174A32]" /> Official Policy Evidence (Original Text)
            </h4>
            <span className="text-[10px] font-semibold text-[#66706A] bg-white px-2 py-0.5 rounded border border-[#DDE3DC]">
              Untranslated Legal Quote
            </span>
          </div>
          <blockquote className="border-l-3 border-[#174A32] pl-4 py-2 text-[#202622] font-normal italic text-sm leading-relaxed">
            "{result.document_proof}"
          </blockquote>
          <p className="text-xs text-[#66706A] flex items-center gap-1.5 font-medium pt-1">
            <FileText size={14} className="text-[#174A32]" /> Source Citation: <strong className="text-[#202622] font-semibold">{result.citation}</strong>
          </p>
        </div>

        {/* Application Guidance & Pathways */}
        {guidance.application_pathway && (
          <div className="space-y-5 pt-4 border-t border-[#DDE3DC]">
            <div>
              <h4 className="flex items-center gap-1.5 text-xs font-bold text-[#2F6B4F] uppercase tracking-wider mb-3 font-poppins">
                <ChevronRight size={16} className="text-[#2F6B4F]" /> Official Application Steps
              </h4>
              <div className="space-y-2">
                {guidance.application_pathway.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-3 bg-[#F8F5EC] p-3 rounded-lg border border-[#DDE3DC] text-xs text-[#202622]">
                    <span className="w-5 h-5 rounded bg-[#174A32] text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Required Documents Checklist with Document Vault Connection */}
            {result.required_documents && result.required_documents.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="flex items-center gap-1.5 text-xs font-bold text-[#202622] uppercase tracking-wider font-poppins">
                    <CheckCircle size={15} className="text-[#2F6B4F]" /> Required Documents Checklist
                  </h4>
                  <span className="text-[11px] text-[#2F6B4F] font-semibold flex items-center gap-1">
                    <ShieldCheck size={13} /> Document Locker Sync
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {result.required_documents.map((doc, idx) => {
                    const docInfo = guidance.document_acquisition_guide?.[doc] || {};
                    const inVault = isDocumentInVault(doc);
                    return (
                      <div key={idx} className="bg-[#F8F5EC] p-3.5 rounded-lg border border-[#DDE3DC] space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 font-semibold text-[#202622] text-xs">
                            <CheckCircle size={14} className="text-[#287A4D] shrink-0" />
                            <span>{doc}</span>
                          </div>
                          
                          {inVault ? (
                            <span className="px-2 py-0.5 rounded bg-[#E8F5EC] text-[#287A4D] border border-[#C6E7D2] text-[10px] font-semibold">
                              Available in Locker
                            </span>
                          ) : (
                            <button
                              onClick={onNavigateToVault}
                              className="px-2 py-0.5 rounded bg-[#FFF5D9] hover:bg-[#F6E3B5] text-[#B7791F] border border-[#F6E3B5] text-[10px] font-semibold flex items-center gap-1"
                            >
                              <Upload size={10} /> Upload
                            </button>
                          )}
                        </div>

                        {docInfo.why_needed && (
                          <p className="text-[11px] text-[#66706A] leading-snug"><strong className="text-[#202622]">Why:</strong> {docInfo.why_needed}</p>
                        )}
                        {docInfo.where_to_obtain && (
                          <p className="text-[11px] text-[#66706A] leading-snug flex items-start gap-1">
                            <MapPin size={12} className="text-[#2F6B4F] shrink-0 mt-0.5" />
                            <span><strong className="text-[#202622]">Where:</strong> {docInfo.where_to_obtain}</span>
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Discovered Schemes Matrix */}
        {discoveredSchemes.length > 0 && (
          <div className="pt-5 border-t border-[#DDE3DC] space-y-3">
            <h4 className="flex items-center gap-1.5 text-xs font-bold text-[#202622] uppercase tracking-wider font-poppins">
              <Layers size={15} className="text-[#2F6B4F]" /> Discovered Schemes for Your Profile
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {discoveredSchemes.map((s, idx) => (
                <div key={idx} className="p-3.5 rounded-lg border bg-[#F8F5EC] border-[#DDE3DC] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#202622] text-xs">{s.id}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${s.recommended ? 'bg-[#E8F5EC] text-[#287A4D] border border-[#C6E7D2]' : 'bg-white text-[#66706A] border border-[#DDE3DC]'}`}>
                      {s.recommended ? 'Likely Eligible' : 'Needs Verification'}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#66706A] leading-tight">{s.purpose}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Guidance Footer Notice */}
        <div className="pt-4 border-t border-[#DDE3DC] flex flex-col sm:flex-row items-center justify-between gap-3 text-[#66706A] text-xs">
          <p className="flex items-center gap-1.5 text-[11px]">
            <HelpCircle size={13} className="text-[#2F6B4F]" />
            Application guidance provided for informational assistance.
          </p>
          <a 
            href="https://pmkisan.gov.in" 
            target="_blank" 
            rel="noreferrer"
            className="flex items-center gap-1 text-[#2F6B4F] font-semibold hover:underline text-xs"
          >
            Official Government Portal <ExternalLink size={12} />
          </a>
        </div>

      </div>
    </div>
  );
};

export default ProofCard;
