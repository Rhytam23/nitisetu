import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Send, Loader2, Volume2, Target } from 'lucide-react';

const ProfileForm = ({ onProfileSubmit }) => {
  const [profile, setProfile] = useState({
    name: '',
    state: '',
    district: '',
    land_acres: '',
    crop: '',
    social_category: 'General',
    scheme: 'PM-KISAN'
  });

  const [isListening, setIsListening] = useState(false);
  const [voiceText, setVoiceText] = useState('');
  
  // Try to grab standard SpeechRecognition interface
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-IN'; // Can be expanded for Hindi 'hi-IN'

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
  }, [SpeechRecognition]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      
      // Auto-extract entities from voiceText here using simple regex or a small NLP function
      // For MVP, we simply store it to be passed along, or mock-parse:
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
    const landMatch = text.match(/([\d.]+)\s*(acres?|hectares?|ha|aycre)/i);
    if (landMatch) {
      let value = parseFloat(landMatch[1]);
      const unit = landMatch[2].toLowerCase();
      if (unit.startsWith('h')) {
        // Convert hectare to acre (approx 2.47)
        value = (value * 2.471).toFixed(2);
      }
      newProfile.land_acres = value.toString();
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
    <div className="bg-white/60 backdrop-blur-2xl rounded-[1.5rem] sm:rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/80 p-5 sm:p-8 w-full max-w-2xl mx-auto relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-brand-200/20 blur-2xl sm:blur-3xl rounded-full pointer-events-none"></div>
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8 relative z-10">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-brand-950 tracking-tight">Farmer Profile</h2>
          <p className="text-brand-900/60 font-medium text-sm sm:text-base">Fill manually or use voice to assist</p>
        </div>
        
        {/* Voice Interface Button */}
        <button 
          type="button"
          onClick={toggleListening}
          className={`flex items-center justify-center gap-2 px-5 py-3 sm:py-3 rounded-full shadow-lg transition-all border w-full sm:w-auto ${
            isListening 
              ? 'bg-red-500 hover:bg-red-600 text-white border-red-400 animate-pulse shadow-red-500/30' 
              : 'bg-white text-brand-700 border-white hover:bg-brand-50 shadow-brand-500/10'
          }`}
        >
          {isListening ? <MicOff size={18} className="sm:w-5 sm:h-5" /> : <Mic size={18} className={`sm:w-5 sm:h-5 ${isListening ? '' : 'text-brand-500'}`} />}
          <span className="font-bold text-xs sm:text-sm tracking-wide">{isListening ? 'Stop Listening' : 'Voice Input'}</span>
        </button>
      </div>

      {isListening && (
        <div className="mb-6 sm:mb-8 bg-brand-50/80 backdrop-blur-md p-4 sm:p-5 rounded-xl sm:rounded-2xl border border-brand-100/50 shadow-inner">
          <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-brand-600 mb-2 flex items-center gap-2">
            <Volume2 size={14} className="animate-pulse" />
            Listening Stream
          </p>
          <p className="text-brand-950 font-medium italic text-base sm:text-lg">"{voiceText || 'Speak now...'}"</p>
        </div>
      )}

      {/* Manual Fallback Form */}
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div className="group">
            <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-widest text-brand-900/60 mb-2">State</label>
            <input 
              type="text" name="state" value={profile.state} onChange={handleChange}
              className="w-full px-4 sm:px-5 py-3 sm:py-4 bg-white/50 backdrop-blur-sm border border-brand-100/50 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-brand-400 focus:border-brand-400 outline-none transition-all shadow-sm group-hover:bg-white text-brand-950 font-medium text-sm sm:text-base"
              placeholder="e.g. Uttar Pradesh"
            />
          </div>
          <div className="group">
            <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-widest text-brand-900/60 mb-2">Land Holding (Acres)</label>
            <input 
              type="number" step="0.1" name="land_acres" value={profile.land_acres} onChange={handleChange}
              className="w-full px-4 sm:px-5 py-3 sm:py-4 bg-white/50 backdrop-blur-sm border border-brand-100/50 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-brand-400 focus:border-brand-400 outline-none transition-all shadow-sm group-hover:bg-white text-brand-950 font-medium text-sm sm:text-base"
              placeholder="e.g. 2.5"
            />
          </div>
          <div className="group">
            <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-widest text-brand-900/60 mb-2">Crop Type</label>
            <input 
              type="text" name="crop" value={profile.crop} onChange={handleChange}
              className="w-full px-4 sm:px-5 py-3 sm:py-4 bg-white/50 backdrop-blur-sm border border-brand-100/50 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-brand-400 focus:border-brand-400 outline-none transition-all shadow-sm group-hover:bg-white text-brand-950 font-medium text-sm sm:text-base"
              placeholder="e.g. Wheat, Rice"
            />
          </div>
          <div className="group">
            <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-widest text-brand-900/60 mb-2">Social Category</label>
            <div className="relative">
              <select 
                name="social_category" value={profile.social_category} onChange={handleChange}
                className="w-full px-4 sm:px-5 py-3 sm:py-4 bg-white/50 backdrop-blur-sm border border-brand-100/50 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-brand-400 focus:border-brand-400 outline-none transition-all shadow-sm group-hover:bg-white text-brand-950 font-medium text-sm sm:text-base appearance-none"
              >
                <option value="General">General</option>
                <option value="OBC">OBC</option>
                <option value="SC">SC</option>
                <option value="ST">ST</option>
              </select>
              <div className="absolute right-4 sm:right-5 top-1/2 -translate-y-1/2 pointer-events-none text-brand-500">
                <Target size={16} />
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 sm:pt-6 mt-2 sm:mt-4 border-t border-brand-100/50">
          <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-widest text-brand-900/60 mb-3 sm:mb-4">Select Scheme for Eligibility Check</label>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
             <label className={`flex items-center gap-3 cursor-pointer p-3 sm:p-4 border rounded-xl sm:rounded-2xl flex-1 transition-all ${profile.scheme === 'PM-KISAN' ? 'bg-brand-50 border-brand-400 shadow-sm' : 'bg-white/50 border-brand-100/50 hover:bg-white'}`}>
               <input type="radio" name="scheme" value="PM-KISAN" checked={profile.scheme === 'PM-KISAN'} onChange={handleChange} className="w-5 h-5 text-brand-600 focus:ring-brand-500"/>
               <span className="font-bold text-brand-950 text-sm sm:text-base">PM-KISAN</span>
             </label>
             <label className={`flex items-center gap-3 cursor-pointer p-3 sm:p-4 border rounded-xl sm:rounded-2xl flex-1 transition-all ${profile.scheme === 'PM-KUSUM' ? 'bg-brand-50 border-brand-400 shadow-sm' : 'bg-white/50 border-brand-100/50 hover:bg-white'}`}>
               <input type="radio" name="scheme" value="PM-KUSUM" checked={profile.scheme === 'PM-KUSUM'} onChange={handleChange} className="w-5 h-5 text-brand-600 focus:ring-brand-500"/>
               <span className="font-bold text-brand-950 text-sm sm:text-base">PM-KUSUM</span>
             </label>
          </div>
        </div>

        <div className="pt-6 sm:pt-8">
          <button 
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-500 text-white font-black py-3 sm:py-4 px-6 rounded-xl sm:rounded-2xl transition-all shadow-[0_8px_20px_rgba(13,148,136,0.3)] hover:shadow-[0_12px_25px_rgba(13,148,136,0.4)] hover:-translate-y-1 text-sm sm:text-base"
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
