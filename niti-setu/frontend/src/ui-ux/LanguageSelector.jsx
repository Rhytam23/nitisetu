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

  const [isTranslating, setIsTranslating] = useState(false);

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
    setIsTranslating(true); // Trigger the elegant loading screen
    
    // Google Translate uses cookies formatted exactly like: /en/hi (source/target)
    if (selectedLang === 'en') {
      // Clear cookie to revert to native English
      document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=' + window.location.hostname + '; path=/;';
    } else {
      // Set rigorous cookie for auto-translation on next reload
      const cookieValue = `/en/${selectedLang}`;
      document.cookie = `googtrans=${cookieValue}; path=/;`;
      if (window.location.hostname !== 'localhost') {
        document.cookie = `googtrans=${cookieValue}; domain=.${window.location.hostname}; path=/;`;
      }
    }
    
    // Wait precisely 2 seconds for a premium UX feel before reloading
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  };

  return (
    <>
      {/* 2-Second Translation Interstitial Overlay */}
      {isTranslating && (
        <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-white/80 backdrop-blur-xl animate-fade-in transition-all duration-300">
          <div className="w-16 h-16 sm:w-20 sm:h-20 border-4 border-brand-200 border-t-brand-500 rounded-full animate-spin mb-6 sm:mb-8 shadow-[0_0_30px_rgba(20,184,166,0.3)]"></div>
          <h2 className="text-2xl sm:text-3xl font-black text-brand-950 tracking-tight mb-2">Switching Language Region...</h2>
          <p className="text-brand-600 font-bold uppercase tracking-[0.2em] text-[10px] sm:text-xs">Applying Cultural Localization Matrix</p>
        </div>
      )}

    <div className="relative inline-flex items-center gap-1.5 sm:gap-2 bg-white/70 backdrop-blur-md px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-brand-200/50 shadow-sm transition-all hover:shadow-md cursor-pointer group">
      <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-brand-600 group-hover:text-brand-800 transition-colors" />
      <select
        value={currentLang}
        onChange={handleLanguageChange}
        className="appearance-none bg-transparent border-none text-xs sm:text-sm font-black text-brand-900 focus:outline-none cursor-pointer pr-4 sm:pr-5 uppercase tracking-widest translate-y-[1px]"
        style={{
          WebkitAppearance: 'none',
          MozAppearance: 'none'
        }}
      >
        {languages.map(lang => (
          <option key={lang.code} value={lang.code} className="text-gray-900 bg-white shadow-lg border-b border-gray-100 uppercase tracking-widest font-bold">
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
    </>
  );
};

export default LanguageSelector;
