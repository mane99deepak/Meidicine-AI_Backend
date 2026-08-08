import { MedicineAIResponse } from "../models/MedicineAIResponse";
import {
    MedicineCatalogRecord,
    MedicineIdentity,
    MedicineFacts,
    MedicineTranslation
} from "../models/medicine-catalog.model";

import {
    buildMedicineIdentity
} from "./medicine-identity.service";

import {
    saveMedicine,
    saveMedicineAlias
} from "./medicine-catalog.service";

function createMedicineIdentity(
    medicine: MedicineAIResponse
): MedicineIdentity {

    return {
        medicineName: medicine.medicineName,
        brandName: medicine.brandName,
        genericName: medicine.genericName,
        composition: medicine.composition,
        strength: medicine.strength,
        dosageForm: medicine.dosageForm,
        manufacturer: medicine.manufacturer
    };
}

function createMedicineFacts(
    medicine: MedicineAIResponse
): MedicineFacts {

    return {
        primaryUse: medicine.primaryUse,
        uses: medicine.uses,
        dosage: medicine.dosage,
        precautions: medicine.precautions,
        sideEffects: medicine.sideEffects,
        consultDoctor: medicine.consultDoctor,
        disclaimer: medicine.disclaimer
    };
}

function createTranslation(
    medicine: MedicineAIResponse
): MedicineTranslation {

    return {
        primaryUse: medicine.primaryUse,
        uses: medicine.uses,
        dosage: medicine.dosage,
        precautions: medicine.precautions,
        sideEffects: medicine.sideEffects,
        consultDoctor: medicine.consultDoctor,
        disclaimer: medicine.disclaimer
    };
}

/**
 * Persists an AI-identified medicine into the
 * Firestore medicine catalog.
 *
 * IMPORTANT:
 * This function does not persist LOW-confidence
 * medicine identities.
 */
export async function persistAIIdentifiedMedicine(
    medicine: MedicineAIResponse,
    languageCode: string
): Promise<{
    medicineKey: string;
    persisted: boolean;
}> {

    const identity =
        buildMedicineIdentity(medicine);

    console.log(
        "Normalized medicine identity:",
        identity
    );

    if (!identity.canPersist) {

        console.log(
            "⚠️ Medicine identity is not safe to persist."
        );

        return {
            medicineKey:
                identity.medicineKey,

            persisted: false
        };
    }

    const now =
        new Date().toISOString();

    const catalogRecord:
        MedicineCatalogRecord = {

        medicineKey:
            identity.medicineKey,

        identity:
            createMedicineIdentity(
                medicine
            ),

        facts:
            createMedicineFacts(
                medicine
            ),

        translations: {
            [languageCode]:
                createTranslation(
                    medicine
                )
        },

        searchAliases:
            buildAliases(medicine),

        source: "AI",

        verified: false,

        usageCount: 1,

        createdAt: now,

        updatedAt: now,

        lastUsedAt: now
    };

    await saveMedicine(
        catalogRecord
    );

    const aliases =
        buildAliases(medicine);

    for (
        const alias of aliases
    ) {

        await saveMedicineAlias(
            alias,
            identity.medicineKey
        );
    }

    console.log(
        `✅ Medicine persisted: ${identity.medicineKey}`
    );

    console.log(
        "Saved aliases:",
        aliases
    );

    return {
        medicineKey:
            identity.medicineKey,

        persisted: true
    };
}

/**
 * Builds aliases from the AI identity.
 *
 * We intentionally save only meaningful
 * identity names, not arbitrary OCR words.
 */
function buildAliases(
    medicine: MedicineAIResponse
): string[] {

    const aliases = new Set<string>();

    const add = (
        value?: string
    ) => {

        if (
            value &&
            value.trim()
        ) {
            aliases.add(
                value.trim()
            );
        }
    };

    add(medicine.medicineName);
    add(medicine.brandName);
    add(medicine.genericName);

    /*
     * Brand + strength is particularly useful
     * for medicines such as Dolo 650.
     */
    if (
        medicine.brandName &&
        medicine.strength
    ) {

        add(
            `${medicine.brandName} ${medicine.strength}`
        );
    }

    if (
        medicine.medicineName &&
        medicine.strength &&
        !medicine.medicineName
            .toLowerCase()
            .includes(
                medicine.strength
                    .toLowerCase()
            )
    ) {

        add(
            `${medicine.medicineName} ${medicine.strength}`
        );
    }

    return Array.from(aliases);
}