import { normalizeMedicineName } from "./medicine-normalizer";

const STOP_WORDS = new Set([
    "tablet",
    "tablets",
    "tab",
    "tabs",
    "capsule",
    "capsules",
    "cap",
    "caps",

    "syrup",
    "injection",
    "inj",
    "drops",
    "drop",
    "cream",
    "ointment",
    "gel",

    "each",
    "contains",
    "containing",
    "composition",

    "batch",
    "batchno",
    "batchnumber",

    "mfg",
    "manufactured",
    "manufacturedby",

    "exp",
    "expiry",
    "expires",

    "mrp",
    "price",

    "of",
    "the",
    "and",
    "for",
    "with",

    "rs",
    "ip",
    "usp",
    "bp"
]);

const UNIT_WORDS = new Set([
    "mg",
    "mcg",
    "gram",
    "grams",
    "g",
    "ml",
    "l",
    "iu"
]);

const NOISE_PATTERNS = [
    /\b(?:batch\s*(?:no|number)?|b\.?no\.?)\s*[:\-]?\s*[a-z0-9\-\/]+/gi,

    /\b(?:mfg|manufactured(?:\s+date)?|manufactured\s+by)\s*[:\-]?[^\n]*/gi,

    /\b(?:exp|expiry|expires|expiry\s+date)\s*[:\-]?\s*[a-z0-9\-\/]+/gi,

    /\b(?:mrp|price)\s*[:\-]?\s*[\u20b9$]?\s*\d+(?:\.\d+)?/gi
];

function removeNoise(text: string): string {

    let cleaned = text;

    for (const pattern of NOISE_PATTERNS) {
        cleaned = cleaned.replace(pattern, " ");
    }

    return cleaned;
}

function extractTokens(text: string): string[] {

    return (
        text.match(
            /[\p{L}\p{N}]+(?:[-/][\p{L}\p{N}]+)*/gu
        ) ?? []
    );
}

function isNumber(token: string): boolean {

    return /^\d+(?:\.\d+)?$/.test(token);
}

function isUnit(token: string): boolean {

    return UNIT_WORDS.has(token);
}

function isStopWord(token: string): boolean {

    return STOP_WORDS.has(token);
}

function normalizeTokens(
    tokens: string[]
): string[] {

    return tokens
        .map(token =>
            normalizeMedicineName(token)
        )
        .filter(Boolean);
}

/**
 * Extract useful medicine phrases from one OCR line.
 *
 * We deliberately generate only:
 *
 *   word + strength
 *   word + strength + form/descriptor
 *   multi-word generic/composition
 *   standalone medicine word
 *
 * We do NOT generate every possible substring.
 */
function extractLineCandidates(
    line: string
): string[] {

    const rawTokens =
        normalizeTokens(
            extractTokens(line)
        );

    if (rawTokens.length === 0) {
        return [];
    }

    const candidates: string[] = [];

    /*
     * Remove obvious packaging words.
     */
    const tokens =
        rawTokens.filter(token =>
            !isStopWord(token)
        );

    if (tokens.length === 0) {
        return [];
    }

    /*
     * Detect a strength:
     *
     * 650 mg
     * 625 mg
     * 500 mcg
     */
    for (
        let i = 0;
        i < tokens.length;
        i++
    ) {

        const current =
            tokens[i];

        if (!isNumber(current)) {
            continue;
        }

        const next =
            tokens[i + 1];

        if (!next || !isUnit(next)) {
            continue;
        }

        /*
         * Find the medicine words immediately before
         * the strength.
         */
        const wordsBeforeStrength =
            tokens
                .slice(
                    Math.max(0, i - 3),
                    i
                )
                .filter(token =>
                    !isNumber(token) &&
                    !isUnit(token)
                );

        if (
            wordsBeforeStrength.length > 0
        ) {

            /*
             * Use up to the last 3 words before
             * the strength.
             */
            const medicineWords =
                wordsBeforeStrength.slice(-3);

            /*
             * Example:
             *
             * Dolo 650 mg
             */
            candidates.push(
                [
                    ...medicineWords,
                    current
                ].join(" ")
            );
        }
    }

    /*
     * Detect medicine + standalone strength.
     *
     * Example:
     *
     * Dolo 650
     * Augmentin 625 Duo
     */
    for (
        let i = 0;
        i < tokens.length;
        i++
    ) {

        if (!isNumber(tokens[i])) {
            continue;
        }

        const numberIndex = i;

        const before =
            tokens
                .slice(
                    Math.max(0, numberIndex - 3),
                    numberIndex
                )
                .filter(token =>
                    !isNumber(token) &&
                    !isUnit(token)
                );

        if (before.length === 0) {
            continue;
        }

        const medicineWords =
            before.slice(-3);

        /*
         * Example:
         *
         * augmentin 625
         */
        candidates.push(
            [
                ...medicineWords,
                tokens[numberIndex]
            ].join(" ")
        );

        /*
         * Optional descriptor after strength.
         *
         * Example:
         *
         * augmentin 625 duo
         */
        const after =
            tokens[numberIndex + 1];

        if (
            after &&
            !isNumber(after) &&
            !isUnit(after) &&
            !isStopWord(after) &&
            after.length >= 3
        ) {

            candidates.unshift(
                [
                    ...medicineWords,
                    tokens[numberIndex],
                    after
                ].join(" ")
            );
        }
    }

    /*
     * Extract meaningful multi-word phrases.
     *
     * Example:
     *
     * amoxicillin clavulanic acid
     *
     * We don't generate arbitrary 1-word fragments.
     */
    const meaningfulWords =
        tokens.filter(token =>
            !isNumber(token) &&
            !isUnit(token)
        );

    if (
        meaningfulWords.length >= 2
    ) {

        const phrase =
            meaningfulWords
                .slice(0, 4)
                .join(" ");

        if (
            phrase.length >= 5
        ) {
            candidates.push(phrase);
        }
    }

    /*
     * Standalone medicine candidates.
     *
     * Only use reasonably sized alphabetic words.
     */
    for (const token of meaningfulWords) {

        if (
            token.length >= 3 &&
            !isNumber(token) &&
            !isUnit(token)
        ) {

            candidates.push(token);
        }
    }

    return candidates
        .map(candidate =>
            normalizeMedicineName(candidate)
        )
        .filter(candidate => {

            if (!candidate) {
                return false;
            }

            const candidateTokens =
                candidate.split(" ");

            /*
             * Never return standalone numbers.
             */
            if (
                candidateTokens.every(
                    token => isNumber(token)
                )
            ) {
                return false;
            }

            /*
             * Never return standalone units.
             */
            if (
                candidateTokens.length === 1 &&
                isUnit(candidateTokens[0])
            ) {
                return false;
            }

            /*
             * Never return known noise.
             */
            if (
                candidateTokens.length === 1 &&
                isStopWord(candidateTokens[0])
            ) {
                return false;
            }

            return true;
        });
}

/**
 * Extract possible medicine aliases from OCR.
 *
 * This does NOT identify the medicine.
 *
 * It only produces candidates that can be checked
 * against Firestore aliases.
 */
export function extractMedicineCandidates(
    ocrText: string
): string[] {

    if (!ocrText?.trim()) {
        return [];
    }

    const cleanedText =
        removeNoise(ocrText);

    const lines =
        cleanedText
            .split(/\r?\n/)
            .map(line => line.trim())
            .filter(Boolean);

    const candidates: string[] = [];

    for (const line of lines) {

        candidates.push(
            ...extractLineCandidates(line)
        );
    }

    return Array.from(
        new Set(candidates)
    );
}