import { Request, Response } from "express";
import { generateMedicineExplanation } from "../services/openai.service";
import { medicineRequestSchema } from "../validators/medicine.validator";

export const explainMedicine = async (
    req: Request,
    res: Response
) => {
    try {

        const validation = medicineRequestSchema.safeParse(req.body);

        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: validation.error.flatten()
            });
        }

        const { language, ocrText } = validation.data;

        const explanation = await generateMedicineExplanation(
            language,
            ocrText
        );

        return res.json({
            success: true,
            explanation
        });

    } catch (error: any) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
};