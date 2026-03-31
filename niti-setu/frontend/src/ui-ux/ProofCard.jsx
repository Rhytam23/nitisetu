import { useState, useRef } from 'react';
import { CheckCircle, XCircle, FileText, Bookmark, Volume2, SquarePlay } from 'lucide-react';

const ProofCard = ({ result, schemeName }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const synthRef = useRef(window.speechSynthesis);

  if (!result) return null;

  const isEligible = result.status === 'Eligible';

  const playTTS = () => {
    if (synthRef.current.speaking) {
      synthRef.current.cancel();
      setIsPlaying(false);
      return;
    }

    const textToSpeak = `${result.status}. ${result.reasoning}.`;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    
    // Set a good voice if available
    const voices = synthRef.current.getVoices();
    
    // Attempt to find a voice matching the selected language
    const langVoiceMap = {
      'en': 'en-IN',
      'hi': 'hi-IN',
      'mr': 'mr-IN',
      'ta': 'ta-IN',
      'te': 'te-IN',
      'bn': 'bn-IN',
      'gu': 'gu-IN',
      'kn': 'kn-IN',
      'ml': 'ml-IN',
      'pa': 'pa-IN',
      'sa': 'sa-IN',
      'as': 'as-IN',
      'mai': 'mai-IN',
      'sat': 'sat-IN',
      'doi': 'doi-IN',
      'mni': 'mni-IN',
      'brx': 'brx-IN',
      'kok': 'kok-IN',
      'ks': 'ks-IN',
      'ne': 'ne-IN',
      'sd': 'sd-IN'
    };
    
    const targetLang = langVoiceMap[selectedLanguage] || 'en-IN';
    const localizedVoice = voices.find(v => v.lang.startsWith(targetLang) || v.lang.includes(selectedLanguage));
    
    if (localizedVoice) {
      utterance.voice = localizedVoice;
    } else {
      // Fallback to first available voice for that language if any
      const fallbackVoice = voices.find(v => v.lang.includes(selectedLanguage));
      if (fallbackVoice) utterance.voice = fallbackVoice;
    }
    
    utterance.onend = () => setIsPlaying(false);
    
    synthRef.current.speak(utterance);
    setIsPlaying(true);
  };

  return (
    <div className="mt-8 max-w-2xl w-full mx-auto rounded-[1.5rem] sm:rounded-[2rem] shadow-[0_30px_60px_rgba(0,0,0,0.5)] border border-white/10 overflow-hidden bg-white/5 backdrop-blur-3xl relative">
      
      {/* Dynamic Top Gradient Bar */}
      <div className={`h-1.5 sm:h-2 w-full absolute top-0 left-0 ${isEligible ? 'bg-gradient-to-r from-emerald-400 to-emerald-600' : 'bg-gradient-to-r from-red-400 to-red-600'}`}></div>

      {/* Header Status Phase */}
      <div className={`p-5 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 border-b border-white/5 ${isEligible ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
        <div className="flex items-center gap-3 sm:gap-4 w-full">
          {isEligible ? <CheckCircle className="text-emerald-400 w-8 h-8 sm:w-10 sm:h-10 shrink-0 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]" /> : <XCircle className="text-red-500 w-8 h-8 sm:w-10 sm:h-10 shrink-0 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]" />}
          <div>
            <h3 className={`text-2xl sm:text-3xl font-black tracking-tight drop-shadow-[0_0_10px_currentColor] ${isEligible ? 'text-white' : 'text-white'}`}>{result.status}</h3>
            <p className={`font-bold text-xs sm:text-sm uppercase tracking-wider mt-1 ${isEligible ? 'text-emerald-400' : 'text-red-400'}`}>{schemeName} Evaluation Result</p>
          </div>
        </div>
        <button 
          onClick={playTTS} 
          className={`flex items-center justify-center gap-2 px-4 py-2 sm:py-2.5 rounded-xl transition text-xs sm:text-sm font-black shadow-sm w-full sm:w-auto border ${isEligible ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20 hover:bg-emerald-500/30' : 'bg-red-500/10 text-red-300 border-red-500/20 hover:bg-red-500/30'}`}
        >
          {isPlaying ? <Volume2 size={16} className="animate-pulse sm:w-[18px] sm:h-[18px]" /> : <SquarePlay size={16} className="sm:w-[18px] sm:h-[18px]" />}
          {isPlaying ? 'Stop Audio' : 'Listen'}
        </button>
      </div>

      <div className="p-5 sm:p-8 space-y-6 sm:space-y-8">
        
        {/* Reasoning */}
        <div>
          <h4 className="text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 sm:mb-3 flex items-center gap-2">
             <span className="w-1.5 h-1.5 rounded-full bg-brand-500"></span> Consultant Statement
          </h4>
          <p className="text-slate-200 text-base sm:text-xl font-medium leading-relaxed">{result.reasoning}</p>
        </div>

        {/* Evidence Card */}
        <div className="bg-black/30 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/5 shadow-inner">
          <h4 className="flex items-center gap-2 text-[9px] sm:text-[10px] font-black text-brand-400 uppercase tracking-[0.2em] mb-3 sm:mb-4">
            <Bookmark size={14} className="text-brand-500" /> Official Guideline Proof
          </h4>
          <blockquote className="border-l-4 border-brand-500 pl-4 sm:pl-5 py-2 text-slate-300 font-medium italic bg-white/5 backdrop-blur-sm rounded-r-lg sm:rounded-r-xl text-sm sm:text-base">
            "{result.document_proof}"
          </blockquote>
          <p className="text-[10px] sm:text-xs text-slate-500 mt-3 sm:mt-4 flex items-center gap-1.5 font-bold uppercase tracking-wider">
            <FileText size={12} className="sm:w-3.5 sm:h-3.5" /> Citation: {result.citation}
          </p>
        </div>

        {/* Dynamic Required Documents */}
        {result.required_documents && result.required_documents.length > 0 && (
          <div>
            <h4 className="flex items-center gap-2 text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 sm:mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse"></span> Required Documents checklist
            </h4>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
              {result.required_documents.map((doc, idx) => (
                <li key={idx} className="flex items-start gap-3 text-slate-300 bg-black/20 p-3 sm:p-4 rounded-lg sm:rounded-xl border border-white/5 shadow-sm font-medium text-sm sm:text-base hover:bg-white/5 transition-colors">
                  <CheckCircle size={16} className="text-emerald-400 shrink-0 mt-0.5 sm:w-[18px] sm:h-[18px]" />
                  <span>{doc}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

      </div>
    </div>
  );
};

export default ProofCard;
