export type MedicineIdentificationConfidence =
    "HIGH" |
    "MEDIUM" |
    "LOW";

export interface MedicineIdentityAIResponse {

    medicineName: string;

    brandName?: string;

    genericName?: string;

    composition?: string;

    strength?: string;

    dosageForm?: string;

    manufacturer?: string;

    identificationConfidence:
        MedicineIdentificationConfidence;

    identificationReason?: string;

    primaryUse: string;

    uses: string[];

    dosage: string;

    precautions: string[];

    sideEffects: string[];

    consultDoctor: string[];

    disclaimer: string;
}