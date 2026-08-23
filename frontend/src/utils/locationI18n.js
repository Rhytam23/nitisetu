export const LOCATION_CANONICAL_MAP = {
  'Uttar Pradesh': {
    hi: 'उत्तर प्रदेश',
    mr: 'उत्तर प्रदेश',
    ta: 'உத்தரப் பிரதேசம்',
    districts: {
      'Lucknow': { hi: 'लखनऊ', mr: 'लखनऊ', ta: 'லக்னோ', localities: { 'Malihabad': { hi: 'मलीहाबाद' }, 'Bakshi Ka Talab': { hi: 'बख्शी का तालाब' }, 'Sarojini Nagar': { hi: 'सरोजिनी नगर' } } },
      'Varanasi': { hi: 'वाराणसी', mr: 'वाराणसी', ta: 'வாரணாசி', localities: { 'Pindra': { hi: 'पिंडरा' }, 'Sadr': { hi: 'सदर' } } },
      'Gorakhpur': { hi: 'गोरखपुर', mr: 'गोरखपुर', ta: 'கோரக்பூர்', localities: { 'Bansgaon': { hi: 'बांसगांव' }, 'Chauri Chaura': { hi: 'चौरी चौरा' } } }
    }
  },
  'Maharashtra': {
    hi: 'महाराष्ट्र',
    mr: 'महाराष्ट्र',
    ta: 'மகாராஷ்டிரா',
    districts: {
      'Nashik': { hi: 'नासिक', mr: 'नाशिक', ta: 'நாசிக்', localities: { 'Niphad': { mr: 'निफाड' }, 'Malegaon': { mr: 'मालेगाव' } } },
      'Pune': { hi: 'पुणे', mr: 'पुणे', ta: 'புனே', localities: { 'Baramati': { mr: 'बारामती' }, 'Haveli': { mr: 'हवेली' } } }
    }
  },
  'Madhya Pradesh': {
    hi: 'मध्य प्रदेश',
    mr: 'मध्य प्रदेश',
    districts: {
      'Indore': { hi: 'इंदौर', mr: 'इंदूर', localities: { 'Sanwer': { hi: 'सांवेर' }, 'Depalpur': { hi: 'देपालपुर' } } },
      'Bhopal': { hi: 'भोपाल', mr: 'भोपाळ', localities: { 'Huzur': { hi: 'हुजूर' }, 'Berasia': { hi: 'बेरसिया' } } }
    }
  }
};

export function getLocalizedLocationName(canonicalName, language = 'en') {
  if (!canonicalName || language === 'en') return canonicalName;

  for (const stateKey in LOCATION_CANONICAL_MAP) {
    const stateObj = LOCATION_CANONICAL_MAP[stateKey];
    if (stateKey.toLowerCase() === canonicalName.toLowerCase()) {
      return stateObj[language] || canonicalName;
    }

    if (stateObj.districts) {
      for (const distKey in stateObj.districts) {
        const distObj = stateObj.districts[distKey];
        if (distKey.toLowerCase() === canonicalName.toLowerCase()) {
          return distObj[language] || canonicalName;
        }

        if (distObj.localities) {
          for (const locKey in distObj.localities) {
            const locObj = distObj.localities[locKey];
            if (locKey.toLowerCase() === canonicalName.toLowerCase()) {
              return locObj[language] || canonicalName;
            }
          }
        }
      }
    }
  }

  return canonicalName;
}
