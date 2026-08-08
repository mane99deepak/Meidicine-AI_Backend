export interface MedicineAIResponse {
    medicineName: string;

    brandName?: string;

    genericName?: string;

    composition?: string;

    strength?: string;

    dosageForm?: string;

    primaryUse: string;

    uses: string[];

    dosage: string;

    precautions: string[];

    sideEffects: string[];

    consultDoctor: string[];

    disclaimer: string;
}