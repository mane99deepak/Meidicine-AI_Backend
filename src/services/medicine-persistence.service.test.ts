import { persistAIIdentifiedMedicine } from "./medicine-persistence.service";
import { MedicineAIResponse } from "../models/MedicineAIResponse";

console.log("====================================");
console.log("Phase 1.8C - Medicine Persistence Test");
console.log("====================================");

const medicine: MedicineAIResponse = {
    medicineName: "Dolo 650",
    brandName: "Dolo",
    genericName: "Paracetamol",
    composition: "Paracetamol",
    strength: "650 mg",
    dosageForm: "Tablet",
    manufacturer: "Micro Labs",

    identificationConfidence: "HIGH",

    identificationReason:
        "Brand and generic name clearly identified.",

    primaryUse:
        "Used to reduce fever and relieve pain.",

    uses: [
        "Fever",
        "Mild to moderate pain"
    ],

    dosage:
        "Follow doctor or package instructions.",

    precautions: [
        "Do not exceed the recommended dose."
    ],

    sideEffects: [
        "Nausea may occur."
    ],

    consultDoctor: [
        "Consult a doctor if symptoms persist."
    ],

    disclaimer:
        "For general information only."
};

console.log("Calling persistence service...");

persistAIIdentifiedMedicine(
    medicine,
    "en"
)
    .then((result) => {

        console.log("");
        console.log("Persistence result:");
        console.log(result);

        console.log("");
        console.log("====================================");
        console.log("Phase 1.8C Test Completed");
        console.log("====================================");

        process.exit(0);
    })
    .catch((error) => {

        console.error("");
        console.error("❌ Persistence test failed:");
        console.error(error);

        process.exit(1);
    });