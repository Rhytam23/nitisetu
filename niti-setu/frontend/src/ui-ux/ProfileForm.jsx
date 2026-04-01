import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Send, Loader2, Volume2, Target } from 'lucide-react';

// Try to grab standard SpeechRecognition interface
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
    scheme: 'PM-KISAN'
  });

  const [isListening, setIsListening] = useState(false);
  const [voiceText, setVoiceText] = useState('');
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (SpeechRecognition) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      
      // Map short codes to full BCP-47 tags
      const langMap = {
        'en': 'en-IN',
        'hi': 'hi-IN',
        'bn': 'bn-IN',
        'te': 'te-IN',
        'mr': 'mr-IN',
        'ta': 'ta-IN',
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
      recognition.lang = langMap[selectedLanguage] || 'en-IN';

      recognition.onresult = (event) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          currentTranscript += transcript;
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
      
      // Auto-extract entities from voiceText here using simple regex or a small NLP function
      extractEntitiesFromSpeech(voiceText);
      
    } else {
      setVoiceText('');
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const extractEntitiesFromSpeech = (text) => {
    const newProfile = { ...profile };
    const lowerText = text.toLowerCase();
    
    // Improved land holding extraction (supports acres, hectares, decimals)
    const landMatch = text.match(/([\d.]+)\s*(acres?|hectares?|ha|acre)/i);
    if (landMatch) {
      let value = parseFloat(landMatch[1]);
      const unit = landMatch[2].toLowerCase();
      if (unit.startsWith('h')) {
        // Convert hectare to acre (approx 2.47)
        value = (value * 2.471).toFixed(2);
      }
      newProfile.land_acres = value.toString();
    }

    // Aadhaar extraction (12 digits, potentially with spaces)
    const aadhaarMatch = text.match(/\b\d{4}\s*\d{4}\s*\d{4}\b/);
    if (aadhaarMatch) {
      newProfile.aadhaar = aadhaarMatch[0].replace(/\s/g, '');
    }

    // District extraction (common trigger words)
    const districtMatch = text.match(/(?:district|dist|place|location|living in)\s*([a-z\s]+)/i);
    if (districtMatch && districtMatch[1]) {
      const dist = districtMatch[1].trim().split(' ')[0]; // Take the first word
      newProfile.district = dist.charAt(0).toUpperCase() + dist.slice(1);
    }

    // Improved crop extraction
    const crops = ['wheat', 'rice', 'cotton', 'millet', 'sugarcane', 'maize', 'paddy', 'mustard'];
    for (const crop of crops) {
      if (lowerText.includes(crop)) {
        newProfile.crop = crop.charAt(0).toUpperCase() + crop.slice(1);
        break;
      }
    }

    // Improved social category extraction
    if (lowerText.includes('general') || lowerText.includes('unreserved')) newProfile.social_category = 'General';
    else if (lowerText.includes('sc') || lowerText.includes('scheduled caste')) newProfile.social_category = 'SC';
    else if (lowerText.includes('st') || lowerText.includes('scheduled tribe')) newProfile.social_category = 'ST';
    else if (lowerText.includes('obc') || lowerText.includes('other backward class')) newProfile.social_category = 'OBC';

    // State extraction (rudimentary list)
    const states = ['Uttar Pradesh', 'Maharashtra', 'Madhya Pradesh', 'Bihar', 'Rajasthan', 'Karnataka', 'Tamil Nadu', 'Gujarat', 'Punjab', 'Haryana'];
    for (const state of states) {
      if (lowerText.includes(state.toLowerCase())) {
        newProfile.state = state;
        break;
      }
    }
    
    setProfile(newProfile);
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
    <div className="bg-white/5 backdrop-blur-3xl rounded-[1.5rem] sm:rounded-[2rem] shadow-[0_30px_60px_rgba(0,0,0,0.5)] border border-white/10 p-5 sm:p-8 w-full max-w-2xl mx-auto relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-brand-500/20 blur-3xl sm:blur-[60px] rounded-full pointer-events-none"></div>
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8 relative z-10">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow-sm">Farmer Profile</h2>
          <p className="text-slate-400 font-medium text-sm sm:text-base">Fill manually or use voice to assist</p>
        </div>
        
        {/* Voice Interface Button */}
        <button 
          type="button"
          onClick={toggleListening}
          className={`flex items-center justify-center gap-2 px-5 py-3 sm:py-3 rounded-full shadow-lg transition-all border w-full sm:w-auto ${
            isListening 
              ? 'bg-red-500 hover:bg-red-600 text-white border-red-400 animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.5)]' 
              : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)]'
          }`}
        >
          {isListening ? <MicOff size={18} className="sm:w-5 sm:h-5" /> : <Mic size={18} className={`sm:w-5 sm:h-5 ${isListening ? '' : 'text-brand-400'}`} />}
          <span className="font-bold text-xs sm:text-sm tracking-wide">{isListening ? 'Stop Listening' : 'Voice Input'}</span>
        </button>
      </div>

      {isListening && (
        <div className="mb-6 sm:mb-8 bg-red-500/10 backdrop-blur-md p-4 sm:p-5 rounded-xl sm:rounded-2xl border border-red-500/20 shadow-inner">
          <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-red-400 mb-2 flex items-center gap-2">
            <Volume2 size={14} className="animate-pulse" />
            Listening Stream
          </p>
          <p className="text-white font-medium italic text-base sm:text-lg">"{voiceText || 'Speak now...'}"</p>
        </div>
      )}

      {/* Manual Fallback Form */}
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div className="group">
            <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">State</label>
              <input 
                type="text" name="state" value={profile.state} onChange={handleChange}
                autoComplete="address-level1"
                className="w-full px-4 sm:px-5 py-3 sm:py-4 bg-black/20 backdrop-blur-sm border border-white/10 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all shadow-sm group-hover:bg-white/5 text-white font-medium text-sm sm:text-base placeholder-slate-600"
                placeholder="e.g. Uttar Pradesh"
              />
          </div>
          <div className="group">
            <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">District</label>
              <input 
                type="text" name="district" value={profile.district} onChange={handleChange}
                autoComplete="address-level2"
                className="w-full px-4 sm:px-5 py-3 sm:py-4 bg-black/20 backdrop-blur-sm border border-white/10 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all shadow-sm group-hover:bg-white/5 text-white font-medium text-sm sm:text-base placeholder-slate-600"
                placeholder="e.g. Varanasi"
              />
          </div>
          <div className="group">
            <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Land Holding (Acres)</label>
            <input 
              type="number" step="0.1" name="land_acres" value={profile.land_acres} onChange={handleChange}
              className="w-full px-4 sm:px-5 py-3 sm:py-4 bg-black/20 backdrop-blur-sm border border-white/10 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all shadow-sm group-hover:bg-white/5 text-white font-medium text-sm sm:text-base placeholder-slate-600"
              placeholder="e.g. 2.5"
            />
          </div>
          <div className="group">
            <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Crop Type</label>
            <input 
              type="text" name="crop" value={profile.crop} onChange={handleChange}
              className="w-full px-4 sm:px-5 py-3 sm:py-4 bg-black/20 backdrop-blur-sm border border-white/10 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all shadow-sm group-hover:bg-white/5 text-white font-medium text-sm sm:text-base placeholder-slate-600"
              placeholder="e.g. Wheat, Rice"
            />
          </div>
          <div className="group">
            <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Aadhaar (12 digits)</label>
            <input 
              type="text" name="aadhaar" value={profile.aadhaar} onChange={handleChange}
              className="w-full px-4 sm:px-5 py-3 sm:py-4 bg-black/20 backdrop-blur-sm border border-white/10 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all shadow-sm group-hover:bg-white/5 text-white font-medium text-sm sm:text-base placeholder-slate-600"
              placeholder="e.g. 123456789012"
              maxLength="12"
            />
          </div>
          <div className="group">
            <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Social Category</label>
            <div className="relative">
              <select 
                name="social_category" value={profile.social_category} onChange={handleChange}
                className="w-full px-4 sm:px-5 py-3 sm:py-4 bg-black/20 backdrop-blur-sm border border-white/10 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all shadow-sm group-hover:bg-white/5 text-white font-medium text-sm sm:text-base appearance-none"
              >
                <option value="General" className="bg-slate-900 text-white">General</option>
                <option value="OBC" className="bg-slate-900 text-white">OBC</option>
                <option value="SC" className="bg-slate-900 text-white">SC</option>
                <option value="ST" className="bg-slate-900 text-white">ST</option>
              </select>
              <div className="absolute right-4 sm:right-5 top-1/2 -translate-y-1/2 pointer-events-none text-brand-400">
                <Target size={16} />
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 sm:pt-6 mt-2 sm:mt-4 border-t border-white/5">
          <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-400 mb-3 sm:mb-4">Select Scheme for Eligibility Check</label>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
             <label className={`flex items-center gap-3 cursor-pointer p-3 sm:p-4 border rounded-xl sm:rounded-2xl flex-1 transition-all ${profile.scheme === 'PM-KISAN' ? 'bg-brand-500/20 border-brand-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'bg-black/20 border-white/10 hover:bg-white/5'}`}>
               <input type="radio" name="scheme" value="PM-KISAN" checked={profile.scheme === 'PM-KISAN'} onChange={handleChange} className="w-5 h-5 text-brand-500 focus:ring-brand-500 bg-black/20 border-white/10"/>
               <span className="font-bold text-white text-sm sm:text-base">PM-KISAN</span>
             </label>
             <label className={`flex items-center gap-3 cursor-pointer p-3 sm:p-4 border rounded-xl sm:rounded-2xl flex-1 transition-all ${profile.scheme === 'PM-KUSUM' ? 'bg-brand-500/20 border-brand-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'bg-black/20 border-white/10 hover:bg-white/5'}`}>
               <input type="radio" name="scheme" value="PM-KUSUM" checked={profile.scheme === 'PM-KUSUM'} onChange={handleChange} className="w-5 h-5 text-brand-500 focus:ring-brand-500 bg-black/20 border-white/10"/>
               <span className="font-bold text-white text-sm sm:text-base">PM-KUSUM</span>
             </label>
          </div>
        </div>

        <div className="pt-6 sm:pt-8">
          <button 
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand-500 to-brand-400 hover:from-brand-400 hover:to-cyan-400 text-slate-950 font-black py-3 sm:py-4 px-6 rounded-xl sm:rounded-2xl transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_50px_rgba(16,185,129,0.5)] hover:-translate-y-1 text-sm sm:text-base"
          >
            <Target size={20} className="sm:w-[22px] sm:h-[22px]" />
            Check Eligibility Now
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileForm;
