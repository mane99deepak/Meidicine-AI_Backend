import { MedicineAIResponse } from "../models/MedicineAIResponse";

export interface NormalizedMedicineIdentity {
    medicineName: string;
    identitySource: "genericName" | "composition" | "brandName" | "medicineName";
    normalizedName: string;
    strength?: string;
    dosageForm?: string;
    medicineKey: string;
}

export function normalizeMedicineName(
    medicineName: string
): string {
    return medicineName
        .toLowerCase()
        .trim()
        .replace(/[^\p{L}\p{N}\s]/gu, " ")
        .replace(/\s+/g, " ")
        .trim();
}

export function normalizeStrength(
    strength?: string
): string | undefined {

    if (!strength) {
        return undefined;
    }

    const normalized = strength
        .toLowerCase()
        .trim()
        .replace(/\s+/g, " ");

    const match = normalized.match(
        /^(\d+(?:\.\d+)?)\s*(mg|mcg|g|ml|%|iu|units?)$/
    );

    if (!match) {
        return normalized;
    }

    const value = match[1];

    let unit = match[2];

    if (unit === "units") {
        unit = "unit";
    }

    return `${value} ${unit}`;
}

export function normalizeDosageForm(
    dosageForm?: string
): string | undefined {

    if (!dosageForm) {
        return undefined;
    }

    const normalized = dosageForm
        .toLowerCase()
        .trim()
        .replace(/\s+/g, " ");

    const forms: Record<string, string> = {
        tablets: "tablet",
        tab: "tablet",
        tabs: "tablet",

        capsules: "capsule",
        cap: "capsule",
        caps: "capsule",

        syrups: "syrup",

        injections: "injection",
        inj: "injection",

        drops: "drop",

        creams: "cream",

        ointments: "ointment",

        gels: "gel"
    };

    return forms[normalized] ?? normalized;
}

function createKeyPart(
    value: string
): string {

    return normalizeMedicineName(value)
        .replace(/\s+/g, "_");
}

/**
 * Creates a canonical medicine identity.
 *
 * Priority:
 *
 * genericName
 *     ↓
 * composition
 *     ↓
 * brandName
 *     ↓
 * medicineName
 */
export function normalizeMedicineIdentity(
    medicine: MedicineAIResponse
): NormalizedMedicineIdentity {

    let identitySource:
        | "genericName"
        | "composition"
        | "brandName"
        | "medicineName";

    let identityName: string;

    if (medicine.genericName?.trim()) {

        identitySource = "genericName";
        identityName = medicine.genericName;

    } else if (medicine.composition?.trim()) {

        identitySource = "composition";
        identityName = medicine.composition;

    } else if (medicine.brandName?.trim()) {

        identitySource = "brandName";
        identityName = medicine.brandName;

    } else {

        identitySource = "medicineName";
        identityName = medicine.medicineName;
    }

    const normalizedName =
        normalizeMedicineName(identityName);

    const strength =
        normalizeStrength(medicine.strength);

    const dosageForm =
        normalizeDosageForm(medicine.dosageForm);

    const keyParts = [
        createKeyPart(normalizedName),
        strength ? createKeyPart(strength) : undefined,
        dosageForm ? createKeyPart(dosageForm) : undefined
    ].filter(Boolean);

    const medicineKey =
        keyParts.join("_");

    return {
        medicineName: medicine.medicineName,
        identitySource,
        normalizedName,
        strength,
        dosageForm,
        medicineKey
    };
}