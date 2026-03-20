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
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 w-full max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Farmer Profile</h2>
          <p className="text-gray-500 text-sm">Fill manually or use voice to assist</p>
        </div>
        
        {/* Voice Interface Button */}
        <button 
          type="button"
          onClick={toggleListening}
          className={`flex items-center gap-2 px-4 py-3 rounded-full shadow-md transition-all ${
            isListening 
              ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
              : 'bg-brand-600 hover:bg-brand-700 text-white'
          }`}
        >
          {isListening ? <MicOff size={20} /> : <Mic size={20} />}
          <span className="font-medium">{isListening ? 'Stop Listening' : 'Voice Input'}</span>
        </button>
      </div>

      {isListening && (
        <div className="mb-6 bg-brand-50 p-4 rounded-lg border border-brand-100">
          <p className="text-sm font-medium text-brand-700 mb-1 flex items-center gap-2">
            <Volume2 size={16} className="animate-pulse" />
            Listening...
          </p>
          <p className="text-gray-700 italic">"{voiceText || 'Speak now...'}"</p>
        </div>
      )}

      {/* Manual Fallback Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
            <input 
              type="text" name="state" value={profile.state} onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
              placeholder="e.g. Uttar Pradesh"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Land Holding (Acres)</label>
            <input 
              type="number" step="0.1" name="land_acres" value={profile.land_acres} onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
              placeholder="e.g. 2.5"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Crop Type</label>
            <input 
              type="text" name="crop" value={profile.crop} onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
              placeholder="e.g. Wheat, Rice"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Social Category</label>
            <select 
              name="social_category" value={profile.social_category} onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none bg-white"
            >
              <option value="General">General</option>
              <option value="OBC">OBC</option>
              <option value="SC">SC</option>
              <option value="ST">ST</option>
            </select>
          </div>
        </div>

        <div className="pt-4 mt-2 border-t border-gray-100">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Scheme for Eligibility Check</label>
          <div className="flex gap-3">
             <label className="flex items-center gap-2 cursor-pointer p-3 border rounded-lg hover:bg-gray-50 flex-1">
               <input type="radio" name="scheme" value="PM-KISAN" checked={profile.scheme === 'PM-KISAN'} onChange={handleChange} className="text-brand-600 focus:ring-brand-500"/>
               <span className="font-medium text-gray-800">PM-KISAN</span>
             </label>
             <label className="flex items-center gap-2 cursor-pointer p-3 border rounded-lg hover:bg-gray-50 flex-1">
               <input type="radio" name="scheme" value="PM-KUSUM" checked={profile.scheme === 'PM-KUSUM'} onChange={handleChange} className="text-brand-600 focus:ring-brand-500"/>
               <span className="font-medium text-gray-800">PM-KUSUM</span>
             </label>
          </div>
        </div>

        <div className="pt-6">
          <button 
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            <Target size={20} />
            Check Eligibility
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileForm;
