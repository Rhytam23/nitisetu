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

    const textToSpeak = `Regarding the ${schemeName} scheme. ${result.status}. ${result.reasoning}. Please review the required documents section for next steps.`;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    
    // Set a good voice if available
    const voices = synthRef.current.getVoices();
    const indianEnglish = voices.find(v => v.lang === 'en-IN');
    if (indianEnglish) utterance.voice = indianEnglish;
    
    utterance.onend = () => setIsPlaying(false);
    
    synthRef.current.speak(utterance);
    setIsPlaying(true);
  };

  return (
    <div className="mt-8 max-w-2xl w-full mx-auto rounded-[1.5rem] sm:rounded-[2rem] shadow-[0_20px_40px_rgba(0,0,0,0.06)] border border-white/80 overflow-hidden bg-white/60 backdrop-blur-xl relative">
      
      {/* Dynamic Top Gradient Bar */}
      <div className={`h-1.5 sm:h-2 w-full absolute top-0 left-0 ${isEligible ? 'bg-gradient-to-r from-green-400 to-green-600' : 'bg-gradient-to-r from-red-400 to-red-600'}`}></div>

      {/* Header Status Phase */}
      <div className={`p-5 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 border-b border-brand-100/50 ${isEligible ? 'bg-green-50/50' : 'bg-red-50/50'}`}>
        <div className="flex items-center gap-3 sm:gap-4 w-full">
          {isEligible ? <CheckCircle className="text-green-600 w-8 h-8 sm:w-10 sm:h-10 shrink-0" /> : <XCircle className="text-red-600 w-8 h-8 sm:w-10 sm:h-10 shrink-0" />}
          <div>
            <h3 className={`text-2xl sm:text-3xl font-black tracking-tight ${isEligible ? 'text-green-900' : 'text-red-900'}`}>{result.status}</h3>
            <p className={`font-medium text-xs sm:text-sm ${isEligible ? 'text-green-700/80' : 'text-red-700/80'}`}>{schemeName} Evaluation Result</p>
          </div>
        </div>
        <button 
          onClick={playTTS} 
          className={`flex items-center justify-center gap-2 px-4 py-2 sm:py-2.5 rounded-xl transition text-xs sm:text-sm font-bold shadow-sm w-full sm:w-auto ${isEligible ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-red-100 text-red-800 hover:bg-red-200'}`}
        >
          {isPlaying ? <Volume2 size={16} className="animate-pulse sm:w-[18px] sm:h-[18px]" /> : <SquarePlay size={16} className="sm:w-[18px] sm:h-[18px]" />}
          {isPlaying ? 'Stop Audio' : 'Listen'}
        </button>
      </div>

      <div className="p-5 sm:p-8 space-y-6 sm:space-y-8">
        
        {/* Reasoning */}
        <div>
          <h4 className="text-[9px] sm:text-[10px] font-black text-brand-900/40 uppercase tracking-[0.2em] mb-2 sm:mb-3 flex items-center gap-2">
             <span className="w-1.5 h-1.5 rounded-full bg-brand-400"></span> Consultant Statement
          </h4>
          <p className="text-brand-950 text-base sm:text-xl font-medium leading-relaxed">{result.reasoning}</p>
        </div>

        {/* Evidence Card */}
        <div className="bg-brand-50/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-brand-100/50 shadow-inner">
          <h4 className="flex items-center gap-2 text-[9px] sm:text-[10px] font-black text-brand-700 uppercase tracking-[0.2em] mb-3 sm:mb-4">
            <Bookmark size={14} className="text-brand-500" /> Official Guideline Proof
          </h4>
          <blockquote className="border-l-4 border-brand-400 pl-4 sm:pl-5 py-2 text-brand-900 font-medium italic bg-white/50 backdrop-blur-sm rounded-r-lg sm:rounded-r-xl text-sm sm:text-base">
            "{result.document_proof}"
          </blockquote>
          <p className="text-[10px] sm:text-xs text-brand-900/60 mt-3 sm:mt-4 flex items-center gap-1.5 font-bold uppercase tracking-wider">
            <FileText size={12} className="sm:w-3.5 sm:h-3.5" /> Citation: {result.citation}
          </p>
        </div>

        {/* Dynamic Required Documents */}
        {result.required_documents && result.required_documents.length > 0 && (
          <div>
            <h4 className="flex items-center gap-2 text-[9px] sm:text-[10px] font-black text-brand-900/40 uppercase tracking-[0.2em] mb-3 sm:mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-400"></span> Required Documents checklist
            </h4>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
              {result.required_documents.map((doc, idx) => (
                <li key={idx} className="flex items-start gap-3 text-brand-900 bg-white/50 p-3 sm:p-4 rounded-lg sm:rounded-xl border border-brand-100/50 shadow-sm font-medium text-sm sm:text-base">
                  <CheckCircle size={16} className="text-brand-400 shrink-0 mt-0.5 sm:w-[18px] sm:h-[18px]" />
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
