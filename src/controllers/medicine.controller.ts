import { Request, Response } from "express";

import {
    generateMedicineExplanation
} from "../services/openai.service";

import {
    medicineRequestSchema
} from "../validators/medicine.validator";

import {
    extractMedicineCandidates
} from "../utils/medicine-candidate-extractor";

import {
    getMedicineByKey,
    getMedicineKeyByAlias,
    incrementMedicineUsage
} from "../services/medicine-catalog.service";

import {
    MedicineAIResponse
} from "../models/MedicineAIResponse";

import {
    MedicineCatalogRecord,
    MedicineTranslation
} from "../models/medicine-catalog.model";


/**
 * Converts common language representations
 * into the language codes used by the catalog.
 *
 * Examples:
 *
 * en       -> en
 * English  -> en
 *
 * hi       -> hi
 * Hindi    -> hi
 *
 * mr       -> mr
 * Marathi  -> mr
 */
function normalizeLanguageCode(
    language: string
): string {

    const normalized =
        language
            .trim()
            .toLowerCase();

    switch (normalized) {

        case "en":
        case "english":
            return "en";

        case "hi":
        case "hindi":
            return "hi";

        case "mr":
        case "marathi":
            return "mr";

        default:
            return normalized;
    }
}


/**
 * Converts a Firestore translation + medicine identity
 * into the response format already expected by Android.
 */
function buildCachedResponse(
    medicine: MedicineCatalogRecord,
    translation: MedicineTranslation
): MedicineAIResponse {

    return {
    medicineName:
        medicine.identity.medicineName,

    brandName:
        medicine.identity.brandName,

    genericName:
        medicine.identity.genericName,

    composition:
        medicine.identity.composition,

    strength:
        medicine.identity.strength,

    dosageForm:
        medicine.identity.dosageForm,

    manufacturer:
        medicine.identity.manufacturer,

    identificationConfidence:
        "HIGH",

    identificationReason:
        "Medicine identity was matched against the verified Firestore medicine catalog.",

    primaryUse:
        translation.primaryUse,

    uses:
        translation.uses,

    dosage:
        translation.dosage,

    precautions:
        translation.precautions,

    sideEffects:
        translation.sideEffects,

    consultDoctor:
        translation.consultDoctor,

    disclaimer:
        translation.disclaimer
};
}


/**
 * Finds an already-known medicine in Firestore
 * using OCR-generated candidates.
 *
 * Returns the first medicine for which:
 *
 * 1. An alias exists
 * 2. The catalog record exists
 * 3. The requested language translation exists
 */
async function findCachedMedicine(
    ocrText: string,
    languageCode: string
): Promise<MedicineAIResponse | null> {

    const candidates =
        extractMedicineCandidates(ocrText);

    console.log(
        "Medicine candidates:",
        candidates
    );

    for (const candidate of candidates) {

        const medicineKey =
            await getMedicineKeyByAlias(
                candidate
            );

        if (!medicineKey) {
            continue;
        }

        console.log(
            `Alias match: "${candidate}" -> ${medicineKey}`
        );

        const medicine =
            await getMedicineByKey(
                medicineKey
            );

        if (!medicine) {

            console.warn(
                `Alias exists but catalog record is missing: ${medicineKey}`
            );

            continue;
        }

        const translation =
            medicine.translations?.[
                languageCode
            ];

        if (!translation) {

            console.log(
                `Medicine found but translation "${languageCode}" is missing.`
            );

            continue;
        }

        await incrementMedicineUsage(
            medicineKey
        );

        console.log(
            `✅ Returning cached medicine: ${medicineKey}`
        );

        return buildCachedResponse(
            medicine,
            translation
        );
    }

    return null;
}


/**
 * POST /api/v1/medicine/explain-medicine
 */
export const explainMedicine = async (
    req: Request,
    res: Response
) => {

    try {

        const validation =
            medicineRequestSchema.safeParse(
                req.body
            );

        if (!validation.success) {

            return res.status(400).json({

                success: false,

                message:
                    validation.error.flatten()
            });
        }

        const {
            language,
            ocrText
        } = validation.data;

        const languageCode =
            normalizeLanguageCode(
                language
            );

        console.log(
            "===================================="
        );

        console.log(
            "Medicine request received"
        );

        console.log(
            "Language:",
            languageCode
        );

        console.log(
            "OCR length:",
            ocrText.length
        );

        /*
         * ------------------------------------------------
         * STEP 1
         * Try Firestore catalog first.
         * ------------------------------------------------
         */

        const cachedMedicine =
            await findCachedMedicine(
                ocrText,
                languageCode
            );

        if (cachedMedicine) {

            console.log(
                "✅ CACHE HIT - OpenAI not called"
            );

            console.log(
                "===================================="
            );

            return res.json({

                success: true,

                explanation:
                    cachedMedicine,

                source: "catalog"
            });
        }

        /*
         * ------------------------------------------------
         * STEP 2
         * Medicine was not available in the requested
         * language/catalog.
         *
         * Use the existing OpenAI flow.
         * ------------------------------------------------
         */

        console.log(
            "❌ CACHE MISS - Calling OpenAI"
        );

        const explanation =
            await generateMedicineExplanation(
                language,
                ocrText
            );

        console.log(
            "✅ OpenAI explanation generated"
        );

        console.log(
            "===================================="
        );

        return res.json({

            success: true,

            explanation,

            source: "openai"
        });

    } catch (error: any) {

        console.error(
            "Medicine explanation error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                error?.message ||
                "Medicine explanation failed."
        });
    }
};