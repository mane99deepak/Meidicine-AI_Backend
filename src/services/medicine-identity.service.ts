import {
    MedicineAIResponse
} from "../models/MedicineAIResponse";

import {
    NormalizedMedicineIdentity,
    normalizeMedicineIdentity
} from "../utils/medicine-normalizer";


export interface MedicineIdentityResult
    extends NormalizedMedicineIdentity {

    identificationConfidence:
        MedicineAIResponse[
            "identificationConfidence"
        ];

    identificationReason?: string;

    canPersist: boolean;

}


/**
 * Converts a validated AI medicine response into
 * a canonical medicine identity.
 *
 * This function does NOT write to Firestore.
 *
 * It only:
 *
 * 1. Normalizes medicine identity
 * 2. Generates medicineKey
 * 3. Determines whether the identity is safe
 *    enough for the persistence phase
 */
export function buildMedicineIdentity(
    medicine: MedicineAIResponse
): MedicineIdentityResult {

    const normalized =
        normalizeMedicineIdentity(
            medicine
        );

    const canPersist =
        shouldPersistMedicine(
            medicine,
            normalized
        );

    return {

        ...normalized,

        identificationConfidence:
            medicine.identificationConfidence,

        identificationReason:
            medicine.identificationReason,

        canPersist
    };
}


/**
 * Determines whether an AI-identified medicine
 * has enough identity information to eventually
 * be persisted in Firestore.
 *
 * IMPORTANT:
 *
 * This does NOT mean the medicine is medically
 * verified.
 *
 * It only means we have enough identity information
 * to create a deterministic catalog record.
 */
function shouldPersistMedicine(
    medicine: MedicineAIResponse,
    normalized: NormalizedMedicineIdentity
): boolean {

    /*
     * Never automatically persist LOW-confidence
     * AI identification.
     */
    if (
        medicine.identificationConfidence ===
        "LOW"
    ) {
        return false;
    }

    /*
     * A canonical medicine name is mandatory.
     */
    if (
        !normalized.normalizedName
    ) {
        return false;
    }

    /*
     * A medicine key must exist.
     */
    if (
        !normalized.medicineKey
    ) {
        return false;
    }

    /*
     * Require at least one useful identity field
     * beyond the generic normalized name.
     *
     * This helps prevent random OCR text from
     * becoming a catalog record.
     */
    const hasIdentityEvidence =
        Boolean(
            medicine.genericName?.trim() ||
            medicine.composition?.trim() ||
            medicine.brandName?.trim() ||
            medicine.medicineName?.trim()
        );

    if (!hasIdentityEvidence) {
        return false;
    }

    return true;
}