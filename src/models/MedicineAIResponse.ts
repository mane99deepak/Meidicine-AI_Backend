export interface MedicineAIResponse {
    medicineName: string;
    uses: string[];
    dosage: string;
    precautions: string[];
    sideEffects: string[];
    consultDoctor: string[];
    disclaimer: string;
}