export interface MedicineIdentity {
    medicineName: string;
    brandName?: string;
    genericName?: string;
    composition?: string;
    strength?: string;
    dosageForm?: string;
    manufacturer?: string;
}

export interface MedicineFacts {
    primaryUse: string;
    uses: string[];
    dosage: string;
    precautions: string[];
    sideEffects: string[];
    consultDoctor: string[];
    disclaimer: string;
}

export interface MedicineTranslation {
    primaryUse: string;
    uses: string[];
    dosage: string;
    precautions: string[];
    sideEffects: string[];
    consultDoctor: string[];
    disclaimer: string;
}

export interface MedicineCatalogRecord {
    medicineKey: string;

    identity: MedicineIdentity;

    facts: MedicineFacts;

    translations: {
        [languageCode: string]: MedicineTranslation;
    };

    searchAliases: string[];

    source: "AI" | "ADMIN" | "MEDICAL_REVIEW";

    verified: boolean;

    usageCount: number;

    createdAt: string;

    updatedAt: string;

    lastUsedAt: string;
}