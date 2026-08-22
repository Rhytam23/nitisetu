import { useState, useRef } from 'react';
import { CheckCircle, XCircle, FileText, Bookmark, Volume2, SquarePlay, MapPin, ExternalLink, HelpCircle, ChevronRight, Layers } from 'lucide-react';

const ProofCard = ({ result, schemeName, selectedLanguage }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const synthRef = useRef(window.speechSynthesis);

  if (!result) return null;

  const isEligible = result.status === 'Eligible' || result.status === 'पात्र';
  const guidance = result.application_guidance || {};
  const discoveredSchemes = result.discovered_schemes || [];

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

  return (
    <div className="mt-8 max-w-3xl w-full mx-auto rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden shadow-lg">
      
      {/* Header Verdict Phase */}
      <div className={`p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b ${isEligible ? 'bg-emerald-950/30 border-emerald-800/40' : 'bg-amber-950/30 border-amber-800/40'}`}>
        <div className="flex items-center gap-3.5">
          {isEligible ? (
            <CheckCircle className="text-emerald-400 w-9 h-9 shrink-0" />
          ) : (
            <XCircle className="text-amber-400 w-9 h-9 shrink-0" />
          )}
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-2xl font-bold text-white tracking-tight">{result.status}</h3>
              <span className="text-[10px] font-semibold tracking-wider uppercase px-2.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                Policy Verified
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium mt-0.5">{schemeName || 'Scheme'} Eligibility Assessment Verdict</p>
          </div>
        </div>

        <button 
          onClick={playTTS} 
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700 transition-colors w-full sm:w-auto"
        >
          {isPlaying ? <Volume2 size={15} className="animate-pulse text-teal-400" /> : <SquarePlay size={15} className="text-teal-400" />}
          {isPlaying ? 'Stop Audio' : 'Listen Audio Explanation'}
        </button>
      </div>

      <div className="p-6 sm:p-8 space-y-7">
        
        {/* Localized AI Explanation */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span> AI Explanation (Localized)
          </h4>
          <p className="text-white text-base font-normal leading-relaxed bg-slate-950 p-4 rounded-xl border border-slate-800/80">
            {result.reasoning}
          </p>
        </div>

        {/* Verbatim Policy Evidence Quote */}
        <div className="bg-slate-950 rounded-xl p-5 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
              <Bookmark size={14} className="text-emerald-400" /> Verbatim Policy Evidence (Original Text)
            </h4>
            <span className="text-[10px] font-medium text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
              Untranslated Legal Quote
            </span>
          </div>
          <blockquote className="border-l-2 border-emerald-500 pl-4 py-2 text-slate-200 font-normal italic text-sm leading-relaxed">
            "{result.document_proof}"
          </blockquote>
          <p className="text-xs text-slate-400 flex items-center gap-1.5 font-medium pt-1">
            <FileText size={14} className="text-teal-400" /> Source Citation: <strong className="text-slate-200 font-semibold">{result.citation}</strong>
          </p>
        </div>

        {/* Application Guidance & Pathways */}
        {guidance.application_pathway && (
          <div className="space-y-5 pt-4 border-t border-slate-800">
            <div>
              <h4 className="flex items-center gap-1.5 text-xs font-bold text-teal-400 uppercase tracking-wider mb-3">
                <ChevronRight size={16} className="text-teal-400" /> Official Application Steps
              </h4>
              <div className="space-y-2">
                {guidance.application_pathway.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-3 bg-slate-950 p-3 rounded-lg border border-slate-800/80 text-xs text-slate-300 font-normal">
                    <span className="w-5 h-5 rounded bg-teal-500/20 text-teal-300 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5 border border-teal-500/30">
                      {idx + 1}
                    </span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Required Documents Checklist with How to Obtain */}
            {result.required_documents && result.required_documents.length > 0 && (
              <div>
                <h4 className="flex items-center gap-1.5 text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                  <CheckCircle size={14} className="text-teal-400" /> Required Documents Checklist & Where to Obtain
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {result.required_documents.map((doc, idx) => {
                    const docInfo = guidance.document_acquisition_guide?.[doc] || {};
                    return (
                      <div key={idx} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 space-y-1.5">
                        <div className="flex items-center gap-2 font-semibold text-white text-xs">
                          <CheckCircle size={14} className="text-emerald-400 shrink-0" />
                          <span>{doc}</span>
                        </div>
                        {docInfo.why_needed && (
                          <p className="text-[11px] text-slate-400 leading-snug"><strong className="text-slate-500">Why:</strong> {docInfo.why_needed}</p>
                        )}
                        {docInfo.where_to_obtain && (
                          <p className="text-[11px] text-slate-400 leading-snug flex items-start gap-1">
                            <MapPin size={12} className="text-teal-400 shrink-0 mt-0.5" />
                            <span><strong className="text-teal-300">Where:</strong> {docInfo.where_to_obtain}</span>
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
          <div className="pt-5 border-t border-slate-800 space-y-3">
            <h4 className="flex items-center gap-1.5 text-xs font-bold text-slate-300 uppercase tracking-wider">
              <Layers size={14} className="text-teal-400" /> Discovered Schemes for Your Profile
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {discoveredSchemes.map((s, idx) => (
                <div key={idx} className={`p-3.5 rounded-xl border ${s.recommended ? 'bg-teal-950/20 border-teal-800/40' : 'bg-slate-950 border-slate-800'} space-y-1.5`}>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs">{s.id}</span>
                    <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${s.recommended ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-slate-800 text-slate-400'}`}>
                      {s.recommended ? 'Recommended' : 'Ineligible'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-tight">{s.purpose}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Guidance Footer Notice */}
        <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-400 text-xs">
          <p className="flex items-center gap-1.5 text-[11px]">
            <HelpCircle size={13} className="text-teal-400" />
            Application guidance provided for informational assistance.
          </p>
          <a 
            href="https://pmkisan.gov.in" 
            target="_blank" 
            rel="noreferrer"
            className="flex items-center gap-1 text-teal-400 font-semibold hover:underline text-xs"
          >
            Official Government Portal <ExternalLink size={12} />
          </a>
        </div>

      </div>
    </div>
  );
};

export default ProofCard;
