import { getOpenAIClient } from "../config/openai";
import { buildMedicinePrompt } from "../utils/promptBuilder";
import { MedicineAIResponse } from "../models/MedicineAIResponse";
import {
    medicineAIResponseSchema
} from "../validators/medicine-ai-response.validator";

export async function generateMedicineExplanation(
    language: string,
    ocrText: string
): Promise<MedicineAIResponse> {

    try {

        const prompt =
            buildMedicinePrompt(
                language,
                ocrText
            );

        const openai =
            getOpenAIClient();

        const response =
            await openai.responses.create({

                model: "gpt-5.5",

                input: prompt
            });

        const output =
            response.output_text;

        if (!output) {

            throw new Error(
                "OpenAI returned an empty response."
            );
        }

        let parsed: unknown;

        try {

            parsed =
                JSON.parse(output);

        } catch {

            console.error(
                "OpenAI returned invalid JSON:",
                output
            );

            throw new Error(
                "OpenAI returned invalid JSON."
            );
        }

        const validation =
            medicineAIResponseSchema.safeParse(
                parsed
            );

        if (!validation.success) {

            console.error(
                "Invalid MedicineAI response:",
                validation.error.flatten()
            );

            throw new Error(
                "OpenAI returned an invalid medicine response."
            );
        }

        return validation.data as MedicineAIResponse;

    } catch (error: any) {

        console.error(
            "OpenAI Error:",
            error
        );

        throw new Error(
            error?.message ||
            "OpenAI request failed."
        );
    }
}