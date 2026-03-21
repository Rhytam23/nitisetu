import React, { useEffect, useState } from 'react';
import { Globe } from 'lucide-react';

const languages = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'Hindi (हिंदी)' },
  { code: 'bn', label: 'Bengali (বাংলা)' },
  { code: 'te', label: 'Telugu (తెలుగు)' },
  { code: 'mr', label: 'Marathi (मराठी)' },
  { code: 'ta', label: 'Tamil (தமிழ்)' },
  { code: 'ur', label: 'Urdu (اردو)' },
  { code: 'gu', label: 'Gujarati (ગુજરાતી)' },
  { code: 'kn', label: 'Kannada (ಕನ್ನಡ)' },
  { code: 'or', label: 'Odia (ଓଡ଼ିଆ)' },
  { code: 'ml', label: 'Malayalam (മലയാളം)' },
  { code: 'pa', label: 'Punjabi (ਪੰਜਾਬੀ)' }
];

const LanguageSelector = () => {
  const [currentLang, setCurrentLang] = useState('en');

  useEffect(() => {
    // Read the current language from the googtrans cookie to persist state across reloads
    const match = document.cookie.match(/googtrans=\/en\/([a-z-]{2,5})/i);
    if (match && match[1]) {
      setCurrentLang(match[1]);
    }
  }, []);

  const handleLanguageChange = (e) => {
    const selectedLang = e.target.value;
    setCurrentLang(selectedLang);
    
    // Programmatically trigger the hidden Google Translate dropdown
    // This translates the page instantly IN PLACE without needing a reload or loading screen!
    const gtSelect = document.querySelector('.goog-te-combo');
    if (gtSelect) {
      gtSelect.value = selectedLang;
      gtSelect.dispatchEvent(new Event('change'));
    } else {
      // Fallback if the Google script hasn't fully loaded the combo box yet
      const cookieValue = `/en/${selectedLang}`;
      document.cookie = `googtrans=${cookieValue}; path=/;`;
      window.location.reload();
    }
  };

  return (
    <div className="relative inline-flex items-center gap-1.5 sm:gap-2 bg-white/5 backdrop-blur-md px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-white/10 shadow-[0_0_15px_rgba(0,0,0,0.5)] transition-all hover:bg-white/10 cursor-pointer group">
      <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-brand-400 group-hover:text-cyan-400 transition-colors" />
      <select
        value={currentLang}
        onChange={handleLanguageChange}
        className="appearance-none bg-transparent border-none text-xs sm:text-sm font-black text-white focus:outline-none cursor-pointer pr-4 sm:pr-5 uppercase tracking-widest translate-y-[1px]"
        style={{
          WebkitAppearance: 'none',
          MozAppearance: 'none'
        }}
      >
        {languages.map(lang => (
          <option key={lang.code} value={lang.code} className="text-white bg-slate-900 border-b border-white/10 uppercase tracking-widest font-bold">
            {lang.label}
          </option>
        ))}
      </select>
      
      {/* Custom Dropdown Arrow */}
      <div className="pointer-events-none absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 text-brand-500 group-hover:translate-y-[-30%] transition-transform">
        <svg fill="currentColor" viewBox="0 0 20 20" className="w-3 h-3 sm:w-4 sm:h-4"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
      </div>
      
      {/* Required anchor for Google Translate Script */}
      <div id="google_translate_element" className="hidden"></div>
    </div>
  );
};

export default LanguageSelector;
