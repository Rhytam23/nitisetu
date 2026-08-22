export function evaluateFallbackEligibility(farmerProfile, scheme, targetLanguage = 'English') {
    const localizedFallbacks = {
        'Hindi': {
            'Eligible': 'पात्र',
            'Not Eligible': 'अपात्र',
            'PM-KISAN': 'वर्तमान दिशा-निर्देशों के आधार पर, सभी भूमिधारक किसान PM-KISAN लाभों के लिए पात्र हैं, जो विशिष्ट अपवर्जन मानदंडों (जैसे आयकर भुगतान) के अधीन हैं।',
            'PM-KMY': 'आप वृद्धावस्था के बाद 3,000 रुपये की सुनिश्चित मासिक पेंशन के लिए पात्र हैं।',
            'PM-KMY_AgeErr': `आयु ${farmerProfile.age || 30} वर्ष 18-40 वर्ष की प्रवेश समूह सीमा से बाहर है।`,
            'PM-KMY_LandErr': 'भूमि जोत 2 हेक्टेयर से अधिक है।',
            'PM-KUSUM': 'आप स्टैंडअलोन सौर पंप स्थापना के लिए 60% तक संयुक्त सब्सिडी (30% केंद्र + 30% राज्य) के लिए पात्र हैं।'
        }
    };

    const isHindi = targetLanguage === 'Hindi';
    const fallbacks = localizedFallbacks[targetLanguage] || {};
    const acres = parseFloat(farmerProfile.land_acres) || 0;
    const age = parseInt(farmerProfile.age, 10) || 30;

    let status = "Not Eligible";
    let reasoning = "";
    let proof = "";
    let cite = "";
    let docs = ["Aadhaar Card", "Land Record (Jamabandi)", "Bank Passbook"];

    if (scheme === "PM-KISAN") {
        status = isHindi ? fallbacks['Eligible'] : "Eligible";
        reasoning = isHindi ? fallbacks['PM-KISAN'] : "Based on current guidelines, all landholding farmers are eligible for PM-KISAN benefits, subject to specific exclusion criteria (like paying income tax).";
        proof = "\"With a view to provide income support to all landholding farmers’ families in the country, having cultivable land, the Central Government has implemented a Central Sector Scheme, namely, 'Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)'\"";
        cite = "PM-KISAN OPERATIONAL GUIDELINES";
    } else if (scheme === "PM-KMY") {
        const isAgeEligible = age >= 18 && age <= 40;
        const isLandEligible = acres <= 5;
        const isEligible = isLandEligible && isAgeEligible;

        status = isEligible 
            ? (isHindi ? fallbacks['Eligible'] : "Eligible") 
            : (isHindi ? fallbacks['Not Eligible'] : "Not Eligible");

        reasoning = isEligible 
            ? (isHindi ? fallbacks['PM-KMY'] : "You are eligible for an assured monthly pension of Rs. 3,000 after age 60.")
            : !isAgeEligible 
                ? (isHindi ? fallbacks['PM-KMY_AgeErr'] : `Age ${age} is outside the 18-40 entry group limit.`) 
                : (isHindi ? fallbacks['PM-KMY_LandErr'] : "Land holding exceeds 2 hectares (5 acres).");

        proof = "\"All Small and Marginal Farmers (SMFs) in all States and Union Territories of the country, who are of the age of 18 years and above and upto the age of 40 years... are eligible\"";
        cite = "PM-KMY OPERATIONAL GUIDELINES";
    } else if (scheme === "PM-KUSUM") {
        status = isHindi ? fallbacks['Eligible'] : "Eligible";
        reasoning = isHindi ? fallbacks['PM-KUSUM'] : "You qualify for up to 60% combined subsidy (30% Central + 30% State) for a standalone solar pump installation.";
        proof = "\"The Central Government will provide financial assistance of 30%... The State Government will provide a subsidy of atleast 30%; and the remaining up to 40% is to be provided by bank loan/farmer.\"";
        cite = "PM-KUSUM Guidelines";
        docs.push("Copy of Electricity Bill (if applicable)", "Solar Pump Preference Form");
    } else {
        status = "Pending Review";
        reasoning = `The scheme "${scheme || 'Selected Scheme'}" guidelines require manual verification by an agricultural officer.`;
        proof = `"Eligibility guidelines for ${scheme || 'the requested scheme'} must be reviewed against local state department rules."`;
        cite = "GENERAL AGRICULTURAL GUIDELINES";
    }

    return {
        status,
        reasoning,
        document_proof: proof,
        citation: cite,
        required_documents: docs
    };
}
