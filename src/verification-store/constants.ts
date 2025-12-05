/**
 * Verification store constants
 */

/** Path to verification store relative to project root */
export const VERIFICATION_STORE_DIR = "ai/verification";
export const VERIFICATION_STORE_FILE = "results.json";
export const VERIFICATION_STORE_PATH = `${VERIFICATION_STORE_DIR}/${VERIFICATION_STORE_FILE}`;
export const VERIFICATION_INDEX_FILE = "index.json";
export const VERIFICATION_INDEX_PATH = `${VERIFICATION_STORE_DIR}/${VERIFICATION_INDEX_FILE}`;

/** Current store schema version (legacy, deprecated) */
export const STORE_VERSION = "1.0.0";
/** Current index schema version (v3.0.0 adds enhanced FeatureSummary fields) */
export const INDEX_VERSION = "3.0.0";
