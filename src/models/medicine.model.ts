export interface MedicineRequest {
    language: string;
    ocrText: string;
}

export interface MedicineResponse {
    success: boolean;
    explanation: string;
    error?: string;
}