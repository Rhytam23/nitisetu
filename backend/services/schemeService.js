export const SCHEME_CATALOG = [
    {
        id: "PM-KISAN",
        name: "Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)",
        purpose: "Provides direct income support of ₹6,000 per year to landholding farmer families across India.",
        target_users: "All landholding farmer families with cultivable land in all States and Union Territories.",
        benefits: "₹6,000 per year in 3 equal installments of ₹2,000 directly transferred to bank account via DBT.",
        eligibility: "Must own cultivable land registered in state land records. Excludes institutional landholders and high-income/tax-paying families.",
        required_documents: ["Aadhaar Card", "Land Jamabandi / Khasra Record", "Active Bank Account Passbook", "e-KYC Verification"],
        source_document: "PM-KISAN.pdf",
        source_date_version: "Operational Guidelines (Revised March 2020)"
    },
    {
        id: "PM-KMY",
        name: "Pradhan Mantri Kisan Maan-Dhan Yojana (PM-KMY)",
        purpose: "Voluntary pension scheme to secure old-age social security for small and marginal farmers.",
        target_users: "Small & Marginal Farmers (SMFs) aged between 18 and 40 years with cultivable land up to 2 hectares (5 acres).",
        benefits: "Assured monthly pension of ₹3,000 after attaining 60 years of age.",
        eligibility: "Farmer age must be between 18 and 40 years. Cultivable landholding must not exceed 2 hectares (5 acres).",
        required_documents: ["Aadhaar Card", "Land Jamabandi Copy", "Savings Bank Account / PM-KISAN Account details"],
        source_document: "PM-KMY - Operational Guidelines.pdf",
        source_date_version: "Operational Guidelines (2019)"
    },
    {
        id: "PM-KUSUM",
        name: "Pradhan Mantri Kisan Urja Suraksha evam Utthan Mahabhiyan (PM-KUSUM)",
        purpose: "Provides solar power pumps and grid-connected solar power plants for agricultural irrigation.",
        target_users: "Individual farmers, water user associations, cooperatives, and farmer producer organizations (FPOs).",
        benefits: "Up to 60% combined financial subsidy (30% Central + 30% State) for standalone solar irrigation pumps.",
        eligibility: "Landowners with agricultural land suitable for solar pump installation or solar plant setup.",
        required_documents: ["Aadhaar Card", "Land Ownership Proof", "Electricity Bill (if grid connected)", "Bank Account Details"],
        source_document: "PM-KUSUM.pdf",
        source_date_version: "Scheme Implementation Guidelines"
    }
];

export function getSchemeCatalog() {
    return SCHEME_CATALOG;
}

export function discoverEligibleSchemes(farmerProfile) {
    const acres = parseFloat(farmerProfile.land_acres) || 0;
    const age = parseInt(farmerProfile.age, 10) || 30;

    const recommendations = SCHEME_CATALOG.map(scheme => {
        let isMatch = true;
        let matchReason = "Profile satisfies primary scheme eligibility criteria.";

        if (scheme.id === "PM-KMY") {
            if (age < 18 || age > 40) {
                isMatch = false;
                matchReason = `Age ${age} is outside the required entry age window (18–40 years).`;
            } else if (acres > 5) {
                isMatch = false;
                matchReason = `Landholding of ${acres} acres exceeds the Small & Marginal Farmer limit of 5 acres (2 hectares).`;
            }
        } else if (scheme.id === "PM-KISAN") {
            if (acres <= 0) {
                matchReason = "Landholding details required to confirm cultivable land ownership.";
            }
        }

        return {
            ...scheme,
            recommended: isMatch,
            recommendation_reason: matchReason
        };
    });

    return recommendations;
}
