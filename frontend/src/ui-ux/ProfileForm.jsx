import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, CheckCircle2, ShieldCheck, Sparkles, Target, MapPin } from 'lucide-react';
import { getLocalizedLocationName } from '../utils/locationI18n';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const ProfileForm = ({ onProfileSubmit, selectedLanguage }) => {
  const [profile, setProfile] = useState({
    name: '',
    state: 'Uttar Pradesh',
    district: 'Lucknow',
    locality: 'Malihabad',
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
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 w-full max-w-2xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <MapPin size={22} className="text-teal-400" />
            Farmer Profile Details
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm font-normal mt-0.5">
            State → District → Locality hierarchy with localized regional display
          </p>
        </div>
        
        {/* Voice Interface Button */}
        <button 
          type="button"
          onClick={toggleListening}
          className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl transition-colors border font-semibold text-xs w-full sm:w-auto ${
            isListening 
              ? 'bg-red-500/20 text-red-300 border-red-500/40' 
              : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
          }`}
        >
          {isListening ? <MicOff size={16} /> : <Mic size={16} className="text-teal-400" />}
          <span>{isListening ? 'Stop Speech Recording' : 'Voice Input Assistant'}</span>
        </button>
      </div>

      {/* Voice Listening Stream Banner */}
      {isListening && (
        <div className="bg-red-950/40 border border-red-800/40 p-4 rounded-xl space-y-1">
          <p className="text-xs font-bold uppercase tracking-wider text-red-400">Listening to Speech Transcript...</p>
          <p className="text-white text-sm font-medium italic">"{voiceText || 'State your landholding size, crop, state, and age...'}"</p>
        </div>
      )}

      {/* Voice Extraction Preview Modal / Card */}
      {extractedPreview && (
        <div className="bg-teal-950/40 border border-teal-800/40 p-4 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-teal-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles size={14} />
              Extracted Profile Parameters
            </h4>
            <span className="text-[10px] text-slate-400 font-medium">Review & Confirm</span>
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 font-normal">
            {extractedPreview.land_acres && <div><strong className="text-slate-400">Land:</strong> {extractedPreview.land_acres} Acres</div>}
            {extractedPreview.crop && <div><strong className="text-slate-400">Crop:</strong> {extractedPreview.crop}</div>}
            {extractedPreview.state && <div><strong className="text-slate-400">State:</strong> {extractedPreview.state}</div>}
            {extractedPreview.aadhaar && <div><strong className="text-slate-400">Aadhaar:</strong> XXXX-XXXX-{extractedPreview.aadhaar.slice(-4)}</div>}
          </div>

          <button
            type="button"
            onClick={confirmVoiceExtraction}
            className="w-full flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold py-2 rounded-lg text-xs transition-colors"
          >
            <CheckCircle2 size={14} />
            Apply Voice Data to Form
          </button>
        </div>
      )}

      {/* Profile Input Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Regional Location Hierarchy: State -> District -> Locality */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              State ({getLocalizedLocationName(profile.state, selectedLanguage)}) *
            </label>
            <input 
              type="text" name="state" value={profile.state} onChange={handleChange} required
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:border-teal-500 outline-none text-white text-xs"
              placeholder="e.g. Uttar Pradesh"
            />
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              District ({getLocalizedLocationName(profile.district, selectedLanguage)})
            </label>
            <input 
              type="text" name="district" value={profile.district} onChange={handleChange}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:border-teal-500 outline-none text-white text-xs"
              placeholder="e.g. Lucknow"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Locality / Block ({getLocalizedLocationName(profile.locality, selectedLanguage)})
            </label>
            <input 
              type="text" name="locality" value={profile.locality} onChange={handleChange}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:border-teal-500 outline-none text-white text-xs"
              placeholder="e.g. Malihabad"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-300">Landholding (Acres) *</label>
              <span className="text-[10px] text-slate-400 font-normal">1 Acre = 0.404 Ha</span>
            </div>
            <input 
              type="number" step="0.1" name="land_acres" value={profile.land_acres} onChange={handleChange} required
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-teal-500 outline-none text-white text-sm"
              placeholder="e.g. 2.5"
            />
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Primary Crop Type</label>
            <input 
              type="text" name="crop" value={profile.crop} onChange={handleChange}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-teal-500 outline-none text-white text-sm"
              placeholder="e.g. Wheat, Paddy, Mustard"
            />
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-300">Aadhaar (Optional)</label>
              <span className="text-[10px] text-teal-400 font-medium flex items-center gap-1">
                <ShieldCheck size={12} /> Data Minimization
              </span>
            </div>
            <input 
              type="text" name="aadhaar" value={profile.aadhaar} onChange={handleChange}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-teal-500 outline-none text-white text-sm placeholder-slate-600"
              placeholder="Optional e.g. 123456789012"
              maxLength="12"
            />
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Social Category</label>
            <select 
              name="social_category" value={profile.social_category} onChange={handleChange}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-teal-500 outline-none text-white text-sm"
            >
              <option value="General">General</option>
              <option value="OBC">OBC</option>
              <option value="SC">SC</option>
              <option value="ST">ST</option>
            </select>
          </div>
        </div>

        {/* Scheme Selection Radio Group */}
        <div className="pt-4 border-t border-slate-800 space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Target Scheme Evaluation</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
             <label className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer text-xs font-semibold transition-colors ${profile.scheme === 'Auto-Discover' ? 'bg-teal-500/10 border-teal-500 text-teal-300' : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'}`}>
               <input type="radio" name="scheme" value="Auto-Discover" checked={profile.scheme === 'Auto-Discover'} onChange={handleChange} className="text-teal-500"/>
               <span>Auto-Discover All Schemes</span>
             </label>
             <label className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer text-xs font-semibold transition-colors ${profile.scheme === 'PM-KISAN' ? 'bg-teal-500/10 border-teal-500 text-teal-300' : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'}`}>
               <input type="radio" name="scheme" value="PM-KISAN" checked={profile.scheme === 'PM-KISAN'} onChange={handleChange} className="text-teal-500"/>
               <span>PM-KISAN</span>
             </label>
             <label className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer text-xs font-semibold transition-colors ${profile.scheme === 'PM-KUSUM' ? 'bg-teal-500/10 border-teal-500 text-teal-300' : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'}`}>
               <input type="radio" name="scheme" value="PM-KUSUM" checked={profile.scheme === 'PM-KUSUM'} onChange={handleChange} className="text-teal-500"/>
               <span>PM-KUSUM</span>
             </label>
          </div>
        </div>

        <div className="pt-2">
          <button 
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold py-3.5 px-6 rounded-xl transition-colors text-sm shadow-sm"
          >
            <Target size={18} />
            Evaluate Eligibility & Policy Proof
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileForm;
