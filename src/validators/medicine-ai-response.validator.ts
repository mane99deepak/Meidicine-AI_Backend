import { z } from "zod";

export const medicineAIResponseSchema = z.object({

    medicineName:
        z.string().max(200),

    brandName:
        z.string().max(200).optional(),

    genericName:
        z.string().max(200).optional(),

    composition:
        z.string().max(500).optional(),

    strength:
        z.string().max(100).optional(),

    dosageForm:
        z.string().max(100).optional(),

    manufacturer:
        z.string().max(300).optional(),

    identificationConfidence:
        z.enum([
            "HIGH",
            "MEDIUM",
            "LOW"
        ]),

    identificationReason:
        z.string().max(500).optional(),

    primaryUse:
        z.string().max(1000),

    uses:
        z.array(
            z.string().max(500)
        ).max(10),

    dosage:
        z.string().max(1000),

    precautions:
        z.array(
            z.string().max(500)
        ).max(10),

    sideEffects:
        z.array(
            z.string().max(500)
        ).max(10),

    consultDoctor:
        z.array(
            z.string().max(500)
        ).max(10),

    disclaimer:
        z.string().max(1000)

});

export type ValidatedMedicineAIResponse =
    z.infer<
        typeof medicineAIResponseSchema
    >;