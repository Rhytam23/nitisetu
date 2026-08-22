import { useState, useRef } from 'react';
import { CheckCircle, XCircle, FileText, Bookmark, Volume2, SquarePlay, MapPin, ExternalLink, HelpCircle, ChevronRight, Layers } from 'lucide-react';

const ProofCard = ({ result, schemeName, selectedLanguage }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const synthRef = useRef(window.speechSynthesis);

  if (!result) return null;

  const isEligible = result.status === 'Eligible';
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
    <div className="mt-8 max-w-3xl w-full mx-auto rounded-[1.5rem] sm:rounded-[2rem] shadow-[0_30px_60px_rgba(0,0,0,0.5)] border border-white/10 overflow-hidden bg-slate-900/80 backdrop-blur-3xl relative">
      
      {/* Top Gradient Status Bar */}
      <div className={`h-2 w-full absolute top-0 left-0 ${isEligible ? 'bg-gradient-to-r from-emerald-400 to-teal-500' : 'bg-gradient-to-r from-amber-400 to-red-500'}`}></div>

      {/* Header Verdict Phase */}
      <div className={`p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 ${isEligible ? 'bg-emerald-500/10' : 'bg-amber-500/10'}`}>
        <div className="flex items-center gap-4 w-full">
          {isEligible ? (
            <CheckCircle className="text-emerald-400 w-10 h-10 shrink-0 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
          ) : (
            <XCircle className="text-amber-400 w-10 h-10 shrink-0 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
          )}
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">{result.status}</h3>
              <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-white/10 text-slate-300 border border-white/10">
                Evidence Verified
              </span>
            </div>
            <p className="font-bold text-xs uppercase tracking-wider mt-1 text-slate-400">{schemeName || 'Scheme'} Evaluation Verdict</p>
          </div>
        </div>

        <button 
          onClick={playTTS} 
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl transition text-xs font-black shadow-sm w-full sm:w-auto border bg-white/5 text-slate-200 border-white/10 hover:bg-white/10"
        >
          {isPlaying ? <Volume2 size={16} className="animate-pulse text-brand-400" /> : <SquarePlay size={16} className="text-brand-400" />}
          {isPlaying ? 'Stop Audio' : 'Listen Explanation'}
        </button>
      </div>

      <div className="p-6 sm:p-8 space-y-8">
        
        {/* Localized AI Explanation */}
        <div>
          <h4 className="text-[10px] font-black text-brand-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
             <span className="w-1.5 h-1.5 rounded-full bg-brand-400"></span> AI Explanation (Localized)
          </h4>
          <p className="text-white text-base sm:text-lg font-medium leading-relaxed bg-black/20 p-4 rounded-xl border border-white/5">{result.reasoning}</p>
        </div>

        {/* Verbatim Policy Evidence Quote */}
        <div className="bg-black/40 rounded-2xl p-5 sm:p-6 border border-white/10 shadow-inner">
          <div className="flex items-center justify-between mb-3">
            <h4 className="flex items-center gap-2 text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">
              <Bookmark size={14} className="text-emerald-400" /> Verbatim Policy Evidence (Original Text)
            </h4>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider bg-white/5 px-2 py-0.5 rounded border border-white/5">Untranslated Legal Quote</span>
          </div>
          <blockquote className="border-l-4 border-emerald-400 pl-4 py-2.5 text-slate-200 font-medium italic bg-white/5 rounded-r-xl text-sm leading-relaxed">
            "{result.document_proof}"
          </blockquote>
          <p className="text-xs text-slate-400 mt-4 flex items-center gap-2 font-bold uppercase tracking-wider">
            <FileText size={14} className="text-brand-400" /> Source Citation: <span className="text-white">{result.citation}</span>
          </p>
        </div>

        {/* Application Guidance & Pathways (P1 Priority 7) */}
        {guidance.application_pathway && (
          <div className="space-y-6 pt-4 border-t border-white/10">
            <div>
              <h4 className="flex items-center gap-2 text-[10px] font-black text-brand-400 uppercase tracking-[0.2em] mb-4">
                <ChevronRight size={16} className="text-brand-400" /> Application Pathway & Steps
              </h4>
              <div className="space-y-3">
                {guidance.application_pathway.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-3 bg-black/20 p-3.5 rounded-xl border border-white/5 text-xs text-slate-300 font-medium">
                    <span className="w-5 h-5 rounded-full bg-brand-500/20 text-brand-400 font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5 border border-brand-500/30">
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
                <h4 className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
                  <CheckCircle size={14} className="text-brand-400" /> Required Documents Checklist & Where to Obtain
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {result.required_documents.map((doc, idx) => {
                    const docInfo = guidance.document_acquisition_guide?.[doc] || {};
                    return (
                      <div key={idx} className="bg-black/30 p-4 rounded-xl border border-white/5 space-y-2">
                        <div className="flex items-center gap-2 font-bold text-white text-xs">
                          <CheckCircle size={14} className="text-emerald-400 shrink-0" />
                          <span>{doc}</span>
                        </div>
                        {docInfo.why_needed && (
                          <p className="text-[11px] text-slate-400 leading-snug"><span className="text-slate-500 font-bold">Why:</span> {docInfo.why_needed}</p>
                        )}
                        {docInfo.where_to_obtain && (
                          <p className="text-[11px] text-slate-400 leading-snug flex items-start gap-1">
                            <MapPin size={12} className="text-brand-400 shrink-0 mt-0.5" />
                            <span><strong className="text-brand-300">Where:</strong> {docInfo.where_to_obtain}</span>
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

        {/* Discovered Schemes Matrix (P1 Priority 2) */}
        {discoveredSchemes.length > 0 && (
          <div className="pt-6 border-t border-white/10">
            <h4 className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
              <Layers size={14} className="text-brand-400" /> Discovered Schemes for Your Profile
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {discoveredSchemes.map((s, idx) => (
                <div key={idx} className={`p-4 rounded-xl border ${s.recommended ? 'bg-brand-500/10 border-brand-500/30' : 'bg-black/20 border-white/5'} space-y-2`}>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs">{s.id}</span>
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${s.recommended ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'}`}>
                      {s.recommended ? 'Recommended' : 'Ineligible'}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-tight">{s.purpose}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Application Guidance Notice */}
        <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-400 text-xs">
          <p className="flex items-center gap-2 text-[11px]">
            <HelpCircle size={14} className="text-brand-400" />
            Application guidance provided for informational assistance.
          </p>
          <a 
            href="https://pmkisan.gov.in" 
            target="_blank" 
            rel="noreferrer"
            className="flex items-center gap-1.5 text-brand-400 font-bold hover:underline text-xs"
          >
            Official Government Portal <ExternalLink size={12} />
          </a>
        </div>

      </div>
    </div>
  );
};

export default ProofCard;
