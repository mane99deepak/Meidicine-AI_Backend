import {
    normalizeMedicineIdentity
} from "./medicine-normalizer";

import {
    MedicineAIResponse
} from "../models/MedicineAIResponse";

const testCases: MedicineAIResponse[] = [

    {
        medicineName: "Dolo 650",
        brandName: "Dolo",
        genericName: "Paracetamol",
        composition: "Paracetamol",
        strength: "650mg",
        dosageForm: "Tablet",
        primaryUse: "",
        uses: [],
        dosage: "",
        precautions: [],
        sideEffects: [],
        consultDoctor: [],
        disclaimer: ""
    },

    {
        medicineName: "Dolo-650",
        brandName: "Dolo",
        genericName: "Paracetamol",
        composition: "Paracetamol",
        strength: "650 mg",
        dosageForm: "tablets",
        primaryUse: "",
        uses: [],
        dosage: "",
        precautions: [],
        sideEffects: [],
        consultDoctor: [],
        disclaimer: ""
    },

    {
        medicineName: "Paracetamol 650",
        brandName: "",
        genericName: "Paracetamol",
        composition: "Paracetamol",
        strength: "650MG",
        dosageForm: "tab",
        primaryUse: "",
        uses: [],
        dosage: "",
        precautions: [],
        sideEffects: [],
        consultDoctor: [],
        disclaimer: ""
    }
];

console.log("====================================");
console.log("Medicine Identity Test");
console.log("====================================");

for (const medicine of testCases) {

    const result =
        normalizeMedicineIdentity(medicine);

    console.log({
        medicineName: medicine.medicineName,
        identitySource: result.identitySource,
        normalizedName: result.normalizedName,
        strength: result.strength,
        dosageForm: result.dosageForm,
        medicineKey: result.medicineKey
    });
}