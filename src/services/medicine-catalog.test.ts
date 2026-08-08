import {
    getMedicineByKey,
    incrementMedicineUsage,
    saveMedicine
} from "./medicine-catalog.service";

import {
    MedicineCatalogRecord
} from "../models/medicine-catalog.model";

async function runTest(): Promise<void> {

    console.log("====================================");
    console.log("Medicine Catalog Firestore Test");
    console.log("====================================");

    const testMedicine: MedicineCatalogRecord = {

        medicineKey:
            "paracetamol_650_mg_tablet",

        identity: {

            medicineName:
                "Dolo 650",

            brandName:
                "Dolo",

            genericName:
                "Paracetamol",

            composition:
                "Paracetamol",

            strength:
                "650 mg",

            dosageForm:
                "Tablet"
        },

        facts: {

            primaryUse:
                "Commonly used to reduce fever and relieve mild to moderate pain.",

            uses: [
                "Fever",
                "Mild to moderate pain"
            ],

            dosage:
                "Take only as directed by a doctor or according to the package instructions.",

            precautions: [
                "Do not take more than the recommended amount."
            ],

            sideEffects: [
                "Some people may experience nausea or stomach discomfort."
            ],

            consultDoctor: [
                "Consult a doctor if symptoms continue or become severe."
            ],

            disclaimer:
                "This information is for general education and is not a substitute for medical advice."
        },

        translations: {

            en: {

                primaryUse:
                    "Commonly used to reduce fever and relieve mild to moderate pain.",

                uses: [
                    "Fever",
                    "Mild to moderate pain"
                ],

                dosage:
                    "Take only as directed by a doctor or according to the package instructions.",

                precautions: [
                    "Do not take more than the recommended amount."
                ],

                sideEffects: [
                    "Some people may experience nausea or stomach discomfort."
                ],

                consultDoctor: [
                    "Consult a doctor if symptoms continue or become severe."
                ],

                disclaimer:
                    "This information is for general education and is not a substitute for medical advice."
            }
        },

        searchAliases: [
            "dolo 650",
            "dolo-650",
            "dolo650",
            "paracetamol 650"
        ],

        source:
            "AI",

        verified:
            false,

        usageCount:
            0,

        createdAt:
            new Date().toISOString(),

        updatedAt:
            new Date().toISOString(),

        lastUsedAt:
            new Date().toISOString()
    };

    console.log("Saving medicine...");

    await saveMedicine(testMedicine);

    console.log("✅ Medicine saved.");

    console.log("Reading medicine...");

    const medicine =
        await getMedicineByKey(
            testMedicine.medicineKey
        );

    if (!medicine) {

        throw new Error(
            "Medicine was not found after saving."
        );
    }

    console.log("✅ Medicine retrieved.");

    console.log(
        "Medicine:",
        medicine.identity.medicineName
    );

    console.log(
        "Generic:",
        medicine.identity.genericName
    );

    console.log(
        "Key:",
        medicine.medicineKey
    );

    console.log("Testing usage increment...");

    await incrementMedicineUsage(
        testMedicine.medicineKey
    );

    const updatedMedicine =
        await getMedicineByKey(
            testMedicine.medicineKey
        );

    if (!updatedMedicine) {

        throw new Error(
            "Medicine disappeared after usage update."
        );
    }

    console.log(
        "Usage count:",
        updatedMedicine.usageCount
    );

    console.log("====================================");
    console.log("✅ Firestore catalog test successful.");
    console.log("====================================");
}

runTest()
    .catch((error) => {

        console.error(
            "❌ Firestore catalog test failed:"
        );

        console.error(error);

        process.exit(1);
    });