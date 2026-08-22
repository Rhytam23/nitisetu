export function getApplicationGuidance(schemeId, status) {
    const documentGuideMap = {
        "Aadhaar Card": {
            why_needed: "Used for direct benefit transfer (DBT) identity verification and e-KYC authentication.",
            where_to_obtain: "Nearest UIDAI Aadhaar Seva Kendra, CSC Centre, or online at myaadhaar.uidai.gov.in"
        },
        "Land Record (Jamabandi)": {
            why_needed: "Proves legal land ownership and cultivable land area registered in state revenue records.",
            where_to_obtain: "State Tehsil / Revenue Office or State Land Records Portal (e.g., Bhulekh UP, Mahabhulekh)"
        },
        "Bank Passbook": {
            why_needed: "Ensures direct transfer of financial benefits into Aadhaar-linked bank account.",
            where_to_obtain: "Any Commercial, Regional Rural, or Co-operative Bank where you hold an active account"
        },
        "Copy of Electricity Bill": {
            why_needed: "Required for grid-connected solar pump subsidy applications under PM-KUSUM Component C.",
            where_to_obtain: "State Electricity Distribution Company (DISCOM) office or monthly bill portal"
        }
    };

    const pathwayMap = {
        "PM-KISAN": [
            "Step 1: Visit official PM-KISAN portal (pmkisan.gov.in) or nearest Common Service Centre (CSC).",
            "Step 2: Submit Aadhaar number, land landholding details (Khasra/Khatauni), and bank account numbers.",
            "Step 3: Complete e-KYC via OTP authentication or biometric scanner at CSC.",
            "Step 4: Application is verified by District Agriculture Nodal Officer for installment release."
        ],
        "PM-KMY": [
            "Step 1: Visit nearest Common Service Centre (CSC) with Aadhaar card and bank passbook.",
            "Step 2: Enroll in PM-KMY pension subscription (monthly auto-debit set up via bank account).",
            "Step 3: Receive Kisan Pension Card and unique Pension Account Number (PAN)."
        ],
        "PM-KUSUM": [
            "Step 1: Apply through State Renewable Energy Development Agency (REDA) official portal.",
            "Step 2: Choose preferred solar pump capacity and manufacturer from empanelled vendors.",
            "Step 3: Pay farmer share (up to 40% after 60% combined Central & State subsidy).",
            "Step 4: Vendor installs solar pump on site, followed by physical inspection by State Nodal Officer."
        ]
    };

    return {
        document_acquisition_guide: documentGuideMap,
        application_pathway: pathwayMap[schemeId] || pathwayMap["PM-KISAN"],
        official_portal_note: "Application guidance provided for informational assistance. Final applications must be submitted on official state/central government portals."
    };
}
