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
    <div className={`mt-8 rounded-xl shadow-lg border-2 overflow-hidden ${isEligible ? 'border-green-500' : 'border-red-500'}`}>
      
      {/* Header Status Phase */}
      <div className={`p-6 text-white flex justify-between items-center ${isEligible ? 'bg-green-600' : 'bg-red-600'}`}>
        <div className="flex items-center gap-3">
          {isEligible ? <CheckCircle size={32} /> : <XCircle size={32} />}
          <div>
            <h3 className="text-2xl font-bold">{result.status}</h3>
            <p className="text-green-50 opacity-90">{schemeName} Evaluation Result</p>
          </div>
        </div>
        <button 
          onClick={playTTS} 
          className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-3 py-2 rounded-lg backdrop-blur-sm transition text-white text-sm"
        >
          {isPlaying ? <Volume2 size={18} className="animate-pulse" /> : <SquarePlay size={18} />}
          {isPlaying ? 'Stop Audio' : 'Listen'}
        </button>
      </div>

      <div className="bg-white p-6 space-y-6">
        
        {/* Reasoning */}
        <div>
          <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Consultant Statement</h4>
          <p className="text-gray-800 text-lg">{result.reasoning}</p>
        </div>

        {/* Evidence Card */}
        <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
          <h4 className="flex items-center gap-2 text-sm font-bold text-brand-700 uppercase tracking-wider mb-3">
            <Bookmark size={16} /> Official Guideline Proof
          </h4>
          <blockquote className="border-l-4 border-brand-400 pl-4 py-1 italic text-gray-700 bg-white rounded-r-md">
            "{result.document_proof}"
          </blockquote>
          <p className="text-sm text-gray-500 mt-3 flex items-center gap-1 font-medium">
            <FileText size={14} /> Citation: {result.citation}
          </p>
        </div>

        {/* Dynamic Required Documents */}
        {result.required_documents && result.required_documents.length > 0 && (
          <div>
            <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Required Documents checklist</h4>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {result.required_documents.map((doc, idx) => (
                <li key={idx} className="flex items-start gap-2 text-gray-700 bg-gray-50 p-2 rounded border border-gray-100">
                  <span className="text-brand-500 mt-0.5">•</span>
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
