import {
    FieldValue
} from "firebase-admin/firestore";

import { db } from "../config/firebase";

import {
    MedicineCatalogRecord,
    MedicineTranslation
} from "../models/medicine-catalog.model";

import {
    normalizeMedicineName
} from "../utils/medicine-normalizer";

const MEDICINE_COLLECTION = "medicine_catalog";
const ALIAS_COLLECTION = "medicine_aliases";

export async function getMedicineByKey(
    medicineKey: string
): Promise<MedicineCatalogRecord | null> {

    const document =
        await db
            .collection(MEDICINE_COLLECTION)
            .doc(medicineKey)
            .get();

    if (!document.exists) {
        return null;
    }

    return document.data() as MedicineCatalogRecord;
}

export async function saveMedicine(
    medicine: MedicineCatalogRecord
): Promise<void> {

    await db
        .collection(MEDICINE_COLLECTION)
        .doc(medicine.medicineKey)
        .set(
            medicine,
            {
                merge: true
            }
        );
}

/**
 * Creates or updates an alias pointing to a medicine.
 *
 * Example:
 *
 * dolo 650
 *     ↓
 * paracetamol_650_mg_tablet
 */
export async function saveMedicineAlias(
    alias: string,
    medicineKey: string
): Promise<void> {

    const normalizedAlias =
        normalizeMedicineName(alias);

    if (!normalizedAlias) {
        return;
    }

    await db
        .collection(ALIAS_COLLECTION)
        .doc(normalizedAlias)
        .set(
            {
                medicineKey,
                alias: normalizedAlias,
                updatedAt: new Date().toISOString()
            },
            {
                merge: true
            }
        );
}

/**
 * Finds a medicine key using an alias.
 */
export async function getMedicineKeyByAlias(
    alias: string
): Promise<string | null> {

    const normalizedAlias =
        normalizeMedicineName(alias);

    if (!normalizedAlias) {
        return null;
    }

    const document =
        await db
            .collection(ALIAS_COLLECTION)
            .doc(normalizedAlias)
            .get();

    if (!document.exists) {
        return null;
    }

    const data =
        document.data();

    return data?.medicineKey ?? null;
}

export async function updateMedicineTranslation(
    medicineKey: string,
    languageCode: string,
    translation: MedicineTranslation
): Promise<void> {

    await db
        .collection(MEDICINE_COLLECTION)
        .doc(medicineKey)
        .set(
            {
                translations: {
                    [languageCode]: translation
                },

                updatedAt:
                    new Date().toISOString()
            },
            {
                merge: true
            }
        );
}

export async function incrementMedicineUsage(
    medicineKey: string
): Promise<void> {

    const documentRef =
        db
            .collection(MEDICINE_COLLECTION)
            .doc(medicineKey);

    await documentRef.update({

        usageCount:
            FieldValue.increment(1),

        lastUsedAt:
            new Date().toISOString(),

        updatedAt:
            new Date().toISOString()
    });
}