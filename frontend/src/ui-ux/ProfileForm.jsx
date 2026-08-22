import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Send, Loader2, Volume2, Target, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const ProfileForm = ({ onProfileSubmit, selectedLanguage }) => {
  const [profile, setProfile] = useState({
    name: '',
    state: '',
    district: '',
    aadhaar: '',
    land_acres: '',
    crop: '',
    social_category: 'General',
    scheme: 'Auto-Discover'
  });

  const [isListening, setIsListening] = useState(false);
  const [voiceText, setVoiceText] = useState('');
  const [extractedPreview, setExtractedPreview] = useState(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (SpeechRecognition) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      
      const langMap = {
        'en': 'en-IN', 'hi': 'hi-IN', 'bn': 'bn-IN', 'te': 'te-IN',
        'mr': 'mr-IN', 'ta': 'ta-IN', 'gu': 'gu-IN', 'kn': 'kn-IN',
        'ml': 'ml-IN', 'pa': 'pa-IN', 'sa': 'sa-IN'
      };
      recognition.lang = langMap[selectedLanguage] || 'en-IN';

      recognition.onresult = (event) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setVoiceText(currentTranscript);
      };

      recognition.onerror = (event) => {
        console.error("Speech Recognition Error", event.error);
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [selectedLanguage]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      
      if (voiceText.trim()) {
        const extracted = parseSpeechEntities(voiceText);
        setExtractedPreview(extracted);
      }
    } else {
      setVoiceText('');
      setExtractedPreview(null);
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const parseSpeechEntities = (text) => {
    const extracted = {};
    const lowerText = text.toLowerCase();
    
    // Land holding extraction (acres / hectares)
    const landMatch = text.match(/([\d.]+)\s*(acres?|hectares?|ha|acre)/i);
    if (landMatch) {
      let value = parseFloat(landMatch[1]);
      if (landMatch[2].toLowerCase().startsWith('h')) value = (value * 2.471).toFixed(2);
      extracted.land_acres = value.toString();
    }

    // Aadhaar extraction
    const aadhaarMatch = text.match(/\b\d{4}\s*\d{4}\s*\d{4}\b/);
    if (aadhaarMatch) {
      extracted.aadhaar = aadhaarMatch[0].replace(/\s/g, '');
    }

    // Crop extraction
    const crops = ['wheat', 'rice', 'cotton', 'millet', 'sugarcane', 'maize', 'paddy', 'mustard'];
    for (const crop of crops) {
      if (lowerText.includes(crop)) {
        extracted.crop = crop.charAt(0).toUpperCase() + crop.slice(1);
        break;
      }
    }

    // State extraction
    const states = ['Uttar Pradesh', 'Maharashtra', 'Madhya Pradesh', 'Bihar', 'Rajasthan', 'Karnataka', 'Tamil Nadu', 'Gujarat', 'Punjab', 'Haryana'];
    for (const state of states) {
      if (lowerText.includes(state.toLowerCase())) {
        extracted.state = state;
        break;
      }
    }

    return extracted;
  };

  const confirmVoiceExtraction = () => {
    if (extractedPreview) {
      setProfile(prev => ({ ...prev, ...extractedPreview }));
      setExtractedPreview(null);
      setVoiceText('');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onProfileSubmit(profile);
  };

  return (
    <div className="bg-slate-900/80 backdrop-blur-3xl rounded-[1.5rem] sm:rounded-[2rem] shadow-[0_30px_60px_rgba(0,0,0,0.5)] border border-white/10 p-5 sm:p-8 w-full max-w-2xl mx-auto relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-brand-500/20 blur-3xl sm:blur-[60px] rounded-full pointer-events-none"></div>
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8 relative z-10">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow-sm flex items-center gap-3">
            Farmer Profile
            <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 bg-brand-500/10 text-brand-400 border border-brand-500/20 rounded-full">
              Sector 4.0
            </span>
          </h2>
          <p className="text-slate-400 font-medium text-sm sm:text-base">Fill manually or use smart voice assistance</p>
        </div>
        
        {/* Voice Interface Button */}
        <button 
          type="button"
          onClick={toggleListening}
          className={`flex items-center justify-center gap-2 px-5 py-3 rounded-full shadow-lg transition-all border w-full sm:w-auto ${
            isListening 
              ? 'bg-red-500 hover:bg-red-600 text-white border-red-400 animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.5)]' 
              : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)]'
          }`}
        >
          {isListening ? <MicOff size={18} /> : <Mic size={18} className="text-brand-400" />}
          <span className="font-bold text-xs sm:text-sm tracking-wide">{isListening ? 'Stop Listening' : 'Voice Input'}</span>
        </button>
      </div>

      {/* Voice Listening Stream Banner */}
      {isListening && (
        <div className="mb-6 bg-red-500/10 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-red-500/20 shadow-inner">
          <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-red-400 mb-2 flex items-center gap-2">
            <Volume2 size={14} className="animate-pulse" />
            Live Voice Stream
          </p>
          <p className="text-white font-medium italic text-base sm:text-lg">"{voiceText || 'Speak your land size, state, crop...'}"</p>
        </div>
      )}

      {/* Voice Extraction Preview Modal / Card */}
      {extractedPreview && (
        <div className="mb-6 bg-brand-500/10 backdrop-blur-md p-5 rounded-2xl border border-brand-500/30 shadow-xl animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-black text-brand-300 flex items-center gap-2 uppercase tracking-wider">
              <Sparkles size={16} />
              Extracted Entities Preview
            </h4>
            <span className="text-[10px] text-slate-400 font-bold uppercase">Review Before Applying</span>
          </div>
          
          <div className="grid grid-cols-2 gap-3 text-xs text-slate-300 font-medium mb-4">
            {extractedPreview.land_acres && <div><span className="text-slate-500">Land:</span> {extractedPreview.land_acres} Acres</div>}
            {extractedPreview.crop && <div><span className="text-slate-500">Crop:</span> {extractedPreview.crop}</div>}
            {extractedPreview.state && <div><span className="text-slate-500">State:</span> {extractedPreview.state}</div>}
            {extractedPreview.aadhaar && <div><span className="text-slate-500">Aadhaar:</span> XXXX-XXXX-{extractedPreview.aadhaar.slice(-4)}</div>}
          </div>

          <button
            type="button"
            onClick={confirmVoiceExtraction}
            className="w-full flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all"
          >
            <CheckCircle2 size={16} />
            Confirm & Auto-fill Form
          </button>
        </div>
      )}

      {/* Profile Form */}
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div className="group">
            <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">State *</label>
            <input 
              type="text" name="state" value={profile.state} onChange={handleChange} required
              className="w-full px-4 sm:px-5 py-3 sm:py-4 bg-black/30 border border-white/10 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-white font-medium text-sm placeholder-slate-600"
              placeholder="e.g. Uttar Pradesh"
            />
          </div>
          <div className="group">
            <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">District</label>
            <input 
              type="text" name="district" value={profile.district} onChange={handleChange}
              className="w-full px-4 sm:px-5 py-3 sm:py-4 bg-black/30 border border-white/10 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-white font-medium text-sm placeholder-slate-600"
              placeholder="e.g. Varanasi"
            />
          </div>
          <div className="group">
            <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Land Holding (Acres) *</label>
            <input 
              type="number" step="0.1" name="land_acres" value={profile.land_acres} onChange={handleChange} required
              className="w-full px-4 sm:px-5 py-3 sm:py-4 bg-black/30 border border-white/10 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-white font-medium text-sm placeholder-slate-600"
              placeholder="e.g. 2.5"
            />
          </div>
          <div className="group">
            <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Crop Type</label>
            <input 
              type="text" name="crop" value={profile.crop} onChange={handleChange}
              className="w-full px-4 sm:px-5 py-3 sm:py-4 bg-black/30 border border-white/10 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-white font-medium text-sm placeholder-slate-600"
              placeholder="e.g. Wheat, Rice"
            />
          </div>
          <div className="group">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-400">Aadhaar Number (Optional)</label>
              <span className="text-[9px] text-emerald-400 font-bold flex items-center gap-1">
                <ShieldCheck size={12} /> Privacy Protected
              </span>
            </div>
            <input 
              type="text" name="aadhaar" value={profile.aadhaar} onChange={handleChange}
              className="w-full px-4 sm:px-5 py-3 sm:py-4 bg-black/30 border border-white/10 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-white font-medium text-sm placeholder-slate-600"
              placeholder="e.g. 123456789012"
              maxLength="12"
            />
          </div>
          <div className="group">
            <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Social Category</label>
            <select 
              name="social_category" value={profile.social_category} onChange={handleChange}
              className="w-full px-4 sm:px-5 py-3 sm:py-4 bg-black/30 border border-white/10 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-white font-medium text-sm"
            >
              <option value="General" className="bg-slate-900">General</option>
              <option value="OBC" className="bg-slate-900">OBC</option>
              <option value="SC" className="bg-slate-900">SC</option>
              <option value="ST" className="bg-slate-900">ST</option>
            </select>
          </div>
        </div>

        {/* Scheme Selection & Auto-Discovery Toggle */}
        <div className="pt-4 sm:pt-6 mt-2 border-t border-white/5">
          <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Scheme Discovery & Evaluation</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
             <label className={`flex items-center gap-3 cursor-pointer p-3 sm:p-4 border rounded-xl transition-all ${profile.scheme === 'Auto-Discover' ? 'bg-brand-500/20 border-brand-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'bg-black/20 border-white/10 hover:bg-white/5'}`}>
               <input type="radio" name="scheme" value="Auto-Discover" checked={profile.scheme === 'Auto-Discover'} onChange={handleChange} className="w-4 h-4 text-brand-500"/>
               <span className="font-bold text-white text-xs sm:text-sm">Auto-Discover All</span>
             </label>
             <label className={`flex items-center gap-3 cursor-pointer p-3 sm:p-4 border rounded-xl transition-all ${profile.scheme === 'PM-KISAN' ? 'bg-brand-500/20 border-brand-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'bg-black/20 border-white/10 hover:bg-white/5'}`}>
               <input type="radio" name="scheme" value="PM-KISAN" checked={profile.scheme === 'PM-KISAN'} onChange={handleChange} className="w-4 h-4 text-brand-500"/>
               <span className="font-bold text-white text-xs sm:text-sm">PM-KISAN</span>
             </label>
             <label className={`flex items-center gap-3 cursor-pointer p-3 sm:p-4 border rounded-xl transition-all ${profile.scheme === 'PM-KUSUM' ? 'bg-brand-500/20 border-brand-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'bg-black/20 border-white/10 hover:bg-white/5'}`}>
               <input type="radio" name="scheme" value="PM-KUSUM" checked={profile.scheme === 'PM-KUSUM'} onChange={handleChange} className="w-4 h-4 text-brand-500"/>
               <span className="font-bold text-white text-xs sm:text-sm">PM-KUSUM</span>
             </label>
          </div>
        </div>

        <div className="pt-6">
          <button 
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand-500 to-brand-400 hover:from-brand-400 hover:to-cyan-400 text-slate-950 font-black py-4 px-6 rounded-xl transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_50px_rgba(16,185,129,0.5)] hover:-translate-y-1 text-sm sm:text-base uppercase tracking-wider"
          >
            <Target size={20} />
            Evaluate Eligibility & Proof
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileForm;
