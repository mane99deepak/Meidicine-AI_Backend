import { buildMedicineIdentity } from "./medicine-identity.service";

import { MedicineAIResponse } from "../models/MedicineAIResponse";

console.log("====================================");
console.log("Phase 1.8B - Medicine Identity Service Test");
console.log("====================================");

const dolo: MedicineAIResponse = {
    medicineName: "Dolo 650",
    brandName: "Dolo",
    genericName: "Paracetamol",
    composition: "Paracetamol",
    strength: "650 mg",
    dosageForm: "Tablet",
    manufacturer: "Micro Labs",

    identificationConfidence: "HIGH",
    identificationReason: "Brand and generic name clearly identified.",

    primaryUse: "Used to reduce fever and relieve pain.",
    uses: ["Fever", "Mild to moderate pain"],
    dosage: "Follow doctor or package instructions.",
    precautions: ["Do not exceed the recommended dose."],
    sideEffects: ["Nausea may occur in some people."],
    consultDoctor: ["Consult a doctor if symptoms persist."],
    disclaimer: "For general information only."
};

console.log("");
console.log("TEST 1 - Dolo 650");
console.log("");

const result1 = buildMedicineIdentity(dolo);

console.log(result1);

console.log("");
console.log("------------------------------------");
console.log("");

const doloVariant: MedicineAIResponse = {
    medicineName: "Dolo-650",
    brandName: "Dolo",
    genericName: "Paracetamol",
    composition: "Paracetamol",
    strength: "650MG",
    dosageForm: "Tablets",
    manufacturer: "Micro Labs",

    identificationConfidence: "HIGH",
    identificationReason: "Same medicine with different formatting.",

    primaryUse: "Used to reduce fever and relieve pain.",
    uses: ["Fever"],
    dosage: "Follow doctor or package instructions.",
    precautions: [],
    sideEffects: [],
    consultDoctor: [],
    disclaimer: "For general information only."
};

console.log("TEST 2 - Dolo-650");

const result2 = buildMedicineIdentity(doloVariant);

console.log(result2);

console.log("");
console.log("------------------------------------");
console.log("");

const unknownMedicine: MedicineAIResponse = {
    medicineName: "Unknown Medicine",
    brandName: "",
    genericName: "",
    composition: "",
    strength: "",
    dosageForm: "",
    manufacturer: "",

    identificationConfidence: "LOW",
    identificationReason: "OCR information is insufficient.",

    primaryUse: "",
    uses: [],
    dosage: "",
    precautions: [],
    sideEffects: [],
    consultDoctor: [],
    disclaimer: ""
};

console.log("TEST 3 - Low Confidence Medicine");

const result3 = buildMedicineIdentity(unknownMedicine);

console.log(result3);

console.log("");
console.log("====================================");
console.log("Phase 1.8B Test Completed");
console.log("====================================");