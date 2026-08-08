import {
    getMedicineByKey,
    getMedicineKeyByAlias,
    saveMedicineAlias
} from "./medicine-catalog.service";

const TEST_MEDICINE_KEY =
    "paracetamol_650_mg_tablet";

async function runTest(): Promise<void> {

    console.log("====================================");
    console.log("Medicine Alias Test");
    console.log("====================================");

    const aliases = [
        "Dolo 650",
        "Dolo-650",
        "dolo650",
        "Paracetamol 650"
    ];

    console.log("Saving aliases...");

    for (const alias of aliases) {

        await saveMedicineAlias(
            alias,
            TEST_MEDICINE_KEY
        );

        console.log(
            `✅ Saved alias: ${alias}`
        );
    }

    console.log("");
    console.log("Testing alias lookup...");

    for (const alias of aliases) {

        const medicineKey =
            await getMedicineKeyByAlias(alias);

        console.log({
            alias,
            medicineKey
        });

        if (medicineKey !== TEST_MEDICINE_KEY) {

            throw new Error(
                `Alias lookup failed for: ${alias}`
            );
        }
    }

    console.log("");
    console.log("Testing unknown alias...");

    const unknown =
        await getMedicineKeyByAlias(
            "completely unknown medicine"
        );

    if (unknown !== null) {

        throw new Error(
            "Unknown alias should return null."
        );
    }

    console.log(
        "✅ Unknown alias correctly returned null."
    );

    console.log("");
    console.log("Testing catalog connection...");

    const medicine =
        await getMedicineByKey(
            TEST_MEDICINE_KEY
        );

    if (!medicine) {

        throw new Error(
            "Test medicine does not exist in catalog."
        );
    }

    console.log(
        `✅ Catalog medicine found: ${medicine.identity.medicineName}`
    );

    console.log("====================================");
    console.log("✅ Medicine Alias Test Successful");
    console.log("====================================");
}

runTest()
    .catch((error) => {

        console.error(
            "❌ Medicine Alias Test Failed:"
        );

        console.error(error);

        process.exit(1);
    });