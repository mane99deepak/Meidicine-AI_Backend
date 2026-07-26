import { getOpenAIClient } from "../config/openai";
import { buildMedicinePrompt } from "../utils/promptBuilder";
import { MedicineAIResponse } from "../models/MedicineAIResponse";



export async function generateMedicineExplanation(
    language: string,
    ocrText: string
): Promise<MedicineAIResponse> {

    try {

        const prompt = buildMedicinePrompt(language, ocrText);

        const openai = getOpenAIClient();

        const response = await openai.responses.create({
            model: "gpt-5.5",
            input: prompt
        });

        const output = response.output_text;

if (!output) {
    throw new Error("OpenAI returned an empty response.");
}

return JSON.parse(output) as MedicineAIResponse;

    } catch (error: any) {

        console.error("OpenAI Error:", error);

        throw new Error(
            error?.message || "OpenAI request failed."
        );

    }

}