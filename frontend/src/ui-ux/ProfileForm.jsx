import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, CheckCircle2, ShieldCheck, Target, MapPin, User, Sprout, Layers } from 'lucide-react';
import { getLocalizedLocationName } from '../utils/locationI18n';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const ProfileForm = ({ onProfileSubmit, selectedLanguage }) => {
  const [profile, setProfile] = useState({
    name: 'Ramesh Kumar',
    state: 'Uttar Pradesh',
    district: 'Lucknow',
    locality: 'Malihabad',
    aadhaar: '',
    land_acres: '2.5',
    crop: 'Wheat',
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
    <div className="bg-white border border-[#DDE3DC] rounded-xl p-6 sm:p-8 w-full max-w-3xl mx-auto space-y-6 shadow-xs font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DDE3DC] pb-5">
        <div>
          <h2 className="text-xl font-bold text-[#202622] font-poppins flex items-center gap-2">
            <User size={20} className="text-[#174A32]" />
            Government Scheme Application Form
          </h2>
          <p className="text-[#66706A] text-xs font-normal mt-0.5">
            Fill in your location and agricultural parameters to verify scheme eligibility
          </p>
        </div>
        
        {/* Voice Interface Button */}
        <button 
          type="button"
          onClick={toggleListening}
          className={`flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg transition-colors border font-semibold text-xs w-full sm:w-auto ${
            isListening 
              ? 'bg-[#FCECEC] text-[#B54747] border-[#F5C6C6]' 
              : 'bg-[#F8F5EC] text-[#2F6B4F] border-[#DDE3DC] hover:bg-[#EAE5D8]'
          }`}
        >
          {isListening ? <MicOff size={15} /> : <Mic size={15} className="text-[#174A32]" />}
          <span>{isListening ? 'Stop Speech Recording' : 'Voice Input Assistant'}</span>
        </button>
      </div>

      {/* Voice Listening Stream Banner */}
      {isListening && (
        <div className="bg-[#FCECEC] border border-[#F5C6C6] p-4 rounded-lg space-y-1">
          <p className="text-xs font-bold uppercase tracking-wider text-[#B54747]">Recording Voice Transcript...</p>
          <p className="text-[#202622] text-sm font-medium italic">"{voiceText || 'State your landholding size, crop, state, and age...'}"</p>
        </div>
      )}

      {/* Voice Extraction Preview Card */}
      {extractedPreview && (
        <div className="bg-[#E8F5EC] border border-[#C6E7D2] p-4 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-[#287A4D] uppercase tracking-wider">
              Extracted Parameters
            </h4>
            <span className="text-[11px] text-[#66706A]">Review & Confirm</span>
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-xs text-[#202622]">
            {extractedPreview.land_acres && <div><strong className="text-[#66706A]">Land:</strong> {extractedPreview.land_acres} Acres</div>}
            {extractedPreview.crop && <div><strong className="text-[#66706A]">Crop:</strong> {extractedPreview.crop}</div>}
            {extractedPreview.state && <div><strong className="text-[#66706A]">State:</strong> {extractedPreview.state}</div>}
            {extractedPreview.aadhaar && <div><strong className="text-[#66706A]">Aadhaar:</strong> XXXX-XXXX-{extractedPreview.aadhaar.slice(-4)}</div>}
          </div>

          <button
            type="button"
            onClick={confirmVoiceExtraction}
            className="w-full flex items-center justify-center gap-1.5 bg-[#174A32] hover:bg-[#2F6B4F] text-white font-semibold py-2 rounded-md text-xs transition-colors"
          >
            <CheckCircle2 size={14} />
            Apply Voice Data to Form
          </button>
        </div>
      )}

      {/* Profile Input Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* SECTION 1: Personal Information */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-[#2F6B4F] uppercase tracking-wider border-b border-[#DDE3DC] pb-1.5 flex items-center gap-1.5">
            <User size={14} /> Personal Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#202622] mb-1">Full Name *</label>
              <input 
                type="text" name="name" value={profile.name} onChange={handleChange} required
                className="w-full input-govt"
                placeholder="Ramesh Kumar"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-[#202622]">Aadhaar Number (Optional)</label>
                <span className="text-[10px] text-[#2F6B4F] font-semibold flex items-center gap-1">
                  <ShieldCheck size={11} /> Data Minimization
                </span>
              </div>
              <input 
                type="text" name="aadhaar" value={profile.aadhaar} onChange={handleChange}
                className="w-full input-govt"
                placeholder="Optional e.g. 123456789012"
                maxLength="12"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: Location Hierarchy */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-[#2F6B4F] uppercase tracking-wider border-b border-[#DDE3DC] pb-1.5 flex items-center gap-1.5">
            <MapPin size={14} /> Location Hierarchy
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#202622] mb-1">
                State ({getLocalizedLocationName(profile.state, selectedLanguage)}) *
              </label>
              <input 
                type="text" name="state" value={profile.state} onChange={handleChange} required
                className="w-full input-govt"
                placeholder="e.g. Uttar Pradesh"
              />
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-[#202622] mb-1">
                District ({getLocalizedLocationName(profile.district, selectedLanguage)})
              </label>
              <input 
                type="text" name="district" value={profile.district} onChange={handleChange}
                className="w-full input-govt"
                placeholder="e.g. Lucknow"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#202622] mb-1">
                Locality / Block ({getLocalizedLocationName(profile.locality, selectedLanguage)})
              </label>
              <input 
                type="text" name="locality" value={profile.locality} onChange={handleChange}
                className="w-full input-govt"
                placeholder="e.g. Malihabad"
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: Agricultural Information */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-[#2F6B4F] uppercase tracking-wider border-b border-[#DDE3DC] pb-1.5 flex items-center gap-1.5">
            <Sprout size={14} /> Agricultural Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-[#202622]">Landholding (Acres) *</label>
                <span className="text-[10px] text-[#66706A]">1 Acre = 0.404 Ha</span>
              </div>
              <input 
                type="number" step="0.1" name="land_acres" value={profile.land_acres} onChange={handleChange} required
                className="w-full input-govt"
                placeholder="e.g. 2.5"
              />
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-[#202622] mb-1">Primary Crop Type</label>
              <input 
                type="text" name="crop" value={profile.crop} onChange={handleChange}
                className="w-full input-govt"
                placeholder="e.g. Wheat, Paddy, Mustard"
              />
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-[#202622] mb-1">Social Category</label>
              <select 
                name="social_category" value={profile.social_category} onChange={handleChange}
                className="w-full input-govt"
              >
                <option value="General">General</option>
                <option value="OBC">OBC</option>
                <option value="SC">SC</option>
                <option value="ST">ST</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 4: Target Scheme Selection */}
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-bold text-[#2F6B4F] uppercase tracking-wider border-b border-[#DDE3DC] pb-1.5 flex items-center gap-1.5">
            <Layers size={14} /> Target Scheme Selection
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
             <label className={`flex items-center gap-2.5 p-3 rounded-lg border cursor-pointer text-xs font-semibold transition-colors ${profile.scheme === 'Auto-Discover' ? 'bg-[#E8F5EC] border-[#2F6B4F] text-[#174A32]' : 'bg-white border-[#DDE3DC] text-[#202622] hover:border-[#2F6B4F]'}`}>
               <input type="radio" name="scheme" value="Auto-Discover" checked={profile.scheme === 'Auto-Discover'} onChange={handleChange} className="accent-[#174A32]"/>
               <span>Auto-Discover All Schemes</span>
             </label>
             <label className={`flex items-center gap-2.5 p-3 rounded-lg border cursor-pointer text-xs font-semibold transition-colors ${profile.scheme === 'PM-KISAN' ? 'bg-[#E8F5EC] border-[#2F6B4F] text-[#174A32]' : 'bg-white border-[#DDE3DC] text-[#202622] hover:border-[#2F6B4F]'}`}>
               <input type="radio" name="scheme" value="PM-KISAN" checked={profile.scheme === 'PM-KISAN'} onChange={handleChange} className="accent-[#174A32]"/>
               <span>PM-KISAN</span>
             </label>
             <label className={`flex items-center gap-2.5 p-3 rounded-lg border cursor-pointer text-xs font-semibold transition-colors ${profile.scheme === 'PM-KUSUM' ? 'bg-[#E8F5EC] border-[#2F6B4F] text-[#174A32]' : 'bg-white border-[#DDE3DC] text-[#202622] hover:border-[#2F6B4F]'}`}>
               <input type="radio" name="scheme" value="PM-KUSUM" checked={profile.scheme === 'PM-KUSUM'} onChange={handleChange} className="accent-[#174A32]"/>
               <span>PM-KUSUM</span>
             </label>
          </div>
        </div>

        <div className="pt-2">
          <button 
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-[#174A32] hover:bg-[#2F6B4F] text-white font-semibold py-3 px-6 rounded-lg transition-colors text-sm shadow-xs"
          >
            <Target size={17} />
            Check Eligibility & Retrieve Policy Proof
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileForm;
