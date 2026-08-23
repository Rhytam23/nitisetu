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
  { code: 'pa', label: 'Punjabi (ਪੰਜਾਬੀ)' },
  { code: 'sa', label: 'Sanskrit (संस्कृतम्)' },
  { code: 'as', label: 'Assamese (অসমীয়া)' },
  { code: 'mai', label: 'Maithili (मैथिली)' },
  { code: 'sat', label: 'Santali (संताली)' },
  { code: 'doi', label: 'Dogri (डोगरी)' },
  { code: 'mni', label: 'Manipuri (মৈতৈলোন্)' },
  { code: 'brx', label: 'Bodo (बड़ो)' },
  { code: 'kok', label: 'Konkani (कोंकणी)' },
  { code: 'ks', label: 'Kashmiri (کٲشُر)' },
  { code: 'ne', label: 'Nepali (नेपाली)' },
  { code: 'sd', label: 'Sindhi (सिंधी)' }
];

const LanguageSelector = ({ onLanguageChange }) => {
  const [currentLang, setCurrentLang] = useState('en');

  useEffect(() => {
    // Read the current language from the googtrans cookie to persist state across reloads
    const match = document.cookie.match(/googtrans=\/en\/([a-z-]{2,5})/i);
    const initialLang = (match && match[1]) ? match[1] : 'en';
    setCurrentLang(initialLang);
    if (onLanguageChange) onLanguageChange(initialLang);
  }, []);

  const handleLanguageChange = (e) => {
    const selectedLang = e.target.value;
    setCurrentLang(selectedLang);
    if (onLanguageChange) onLanguageChange(selectedLang);
    
    // Programmatically trigger the hidden Google Translate dropdown
    const gtSelect = document.querySelector('.goog-te-combo');
    if (gtSelect) {
      gtSelect.value = selectedLang;
      gtSelect.dispatchEvent(new Event('change'));
    } else {
      const cookieValue = `/en/${selectedLang}`;
      document.cookie = `googtrans=${cookieValue}; path=/;`;
      window.location.reload();
    }
  };

  return (
    <div className="relative inline-flex items-center gap-1.5 sm:gap-2 bg-[#0F3523] px-2.5 sm:px-3.5 py-1.5 rounded-lg border border-[#2F6B4F] shadow-xs cursor-pointer group font-sans">
      <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#E9B949]" />
      <select
        value={currentLang}
        onChange={handleLanguageChange}
        className="appearance-none bg-transparent border-none text-xs font-semibold text-white focus:outline-none cursor-pointer pr-4 uppercase tracking-wider"
        style={{
          WebkitAppearance: 'none',
          MozAppearance: 'none'
        }}
      >
        {languages.map(lang => (
          <option key={lang.code} value={lang.code} className="text-[#202622] bg-white text-xs font-semibold">
            {lang.label}
          </option>
        ))}
      </select>
      
      {/* Custom Dropdown Arrow */}
      <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[#E9B949]">
        <svg fill="currentColor" viewBox="0 0 20 20" className="w-3 h-3"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
      </div>
      
      {/* Required anchor for Google Translate Script */}
      <div id="google_translate_element" className="hidden"></div>
    </div>
  );
};

export default LanguageSelector;
