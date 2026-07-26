import { Request, Response } from "express";
import { generateMedicineExplanation } from "../services/openai.service";

export const explainMedicine = async (
    req: Request,
    res: Response
) => {

    try {

        const { language, ocrText } = req.body;

        if (!language || !ocrText) {

            return res.status(400).json({
                success: false,
                message: "language and ocrText are required."
            });

        }

        const explanation =
            await generateMedicineExplanation(
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