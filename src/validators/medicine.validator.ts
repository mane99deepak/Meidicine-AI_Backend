import { z } from "zod";

export const medicineRequestSchema = z.object({
    language: z.string().min(2).max(30),
    ocrText: z.string().min(3).max(5000)
});

export type MedicineRequest =
    z.infer<typeof medicineRequestSchema>;