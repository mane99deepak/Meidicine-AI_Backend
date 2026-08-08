import {
    extractMedicineCandidates
} from "./medicine-candidate-extractor";

const testCases = [

    {
        name: "Dolo 650",
        ocr: `
            DOLO 650 TABLETS
            Each tablet contains Paracetamol IP 650 mg
            Batch No ABC123
            Mfg 01/2026
            Exp 12/2028
            Manufactured by ABC Pharma
        `
    },

    {
        name: "Augmentin",
        ocr: `
            AUGMENTIN 625 DUO TABLETS
            Amoxicillin and Clavulanic Acid
            Batch No XYZ456
            MRP Rs 125
        `
    },

    {
        name: "Simple medicine",
        ocr: `
            PARACETAMOL 500 MG TABLET
        `
    }

];

console.log("====================================");
console.log("Medicine Candidate Extraction Test");
console.log("====================================");

for (const testCase of testCases) {

    const candidates =
        extractMedicineCandidates(
            testCase.ocr
        );

    console.log("");
    console.log(`Test: ${testCase.name}`);

    console.log(
        candidates
    );
}

console.log("");
console.log("====================================");
console.log("Candidate extraction completed.");
console.log("====================================");