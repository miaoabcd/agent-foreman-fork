/**
 * Result persistence operations - save, load, and query verification results
 */

import * as fs from "node:fs/promises";
import * as path from "node:path";
import type {
  VerificationResult,
  VerificationMetadata,
  FeatureSummary,
} from "../verifier/verification-types.js";
import { VERIFICATION_STORE_DIR, VERIFICATION_STORE_PATH } from "./constants.js";
import {
  ensureVerificationDir,
  loadVerificationStore,
} from "./legacy-store.js";
import {
  createEmptyIndex,
  loadVerificationIndex,
  saveIndex,
  ensureFeatureDir,
  formatRunNumber,
  toMetadata,
  updateFeatureSummary,
  getNextRunNumber,
} from "./index-operations.js";
import { generateVerificationReport } from "../verifier/report.js";

/**
 * Save a verification result to the store
 * Creates per-feature subdirectory with JSON metadata and MD report
 */
export async function saveVerificationResult(
  cwd: string,
  result: VerificationResult
): Promise<void> {
  // Get next run number
  const runNumber = await getNextRunNumber(cwd, result.featureId);
  const runStr = formatRunNumber(runNumber);

  // Ensure feature directory exists
  const featureDir = await ensureFeatureDir(cwd, result.featureId);

  // Write metadata JSON (compact)
  const metadata = toMetadata(result, runNumber);
  const jsonPath = path.join(featureDir, `${runStr}.json`);
  await fs.writeFile(jsonPath, JSON.stringify(metadata, null, 2), "utf-8");

  // Write markdown report (detailed)
  const report = generateVerificationReport(result, runNumber);
  const mdPath = path.join(featureDir, `${runStr}.md`);
  await fs.writeFile(mdPath, report, "utf-8");

  // Update index
  let index = await loadVerificationIndex(cwd);
  if (!index) {
    index = createEmptyIndex();
  }
  updateFeatureSummary(index, result, runNumber);
  await saveIndex(cwd, index);

  // Note: Legacy results.json is no longer written (removed in v3.0.0)
  // Individual JSON files now store full data
}

/**
 * Get the last verification result for a feature
 * Reads from individual JSON files (full data since v3.0.0)
 * Falls back to legacy store for old data only
 */
export async function getLastVerification(
  cwd: string,
  featureId: string
): Promise<VerificationResult | null> {
  // Try new index structure first
  const index = await loadVerificationIndex(cwd);
  if (index && index.features[featureId]) {
    const summary = index.features[featureId];
    const runStr = formatRunNumber(summary.latestRun);
    const jsonPath = path.join(
      cwd,
      VERIFICATION_STORE_DIR,
      featureId,
      `${runStr}.json`
    );

    try {
      const content = await fs.readFile(jsonPath, "utf-8");
      const metadata = JSON.parse(content) as VerificationMetadata;

      // Individual JSON files now store full data (v3.0.0+)
      return {
        featureId: metadata.featureId,
        timestamp: metadata.timestamp,
        commitHash: metadata.commitHash,
        changedFiles: metadata.changedFiles,
        diffSummary: metadata.diffSummary,
        automatedChecks: metadata.automatedChecks.map((c) => ({
          type: c.type,
          success: c.success,
          duration: c.duration,
          errorCount: c.errorCount,
          output: c.output,
        })),
        criteriaResults: metadata.criteriaResults.map((c) => ({
          criterion: c.criterion,
          index: c.index,
          satisfied: c.satisfied,
          confidence: c.confidence,
          reasoning: c.reasoning || "",
          evidence: c.evidence,
        })),
        verdict: metadata.verdict,
        verifiedBy: metadata.verifiedBy,
        overallReasoning: metadata.overallReasoning || "",
        suggestions: metadata.suggestions,
        codeQualityNotes: metadata.codeQualityNotes,
        relatedFilesAnalyzed: metadata.relatedFilesAnalyzed,
      };
    } catch {
      // Fall back to legacy store for old data
    }
  }

  // Fall back to legacy store (for data created before v3.0.0)
  const store = await loadVerificationStore(cwd);
  if (!store) {
    return null;
  }
  return store.results[featureId] || null;
}

/**
 * Get all verification runs for a feature (history)
 */
export async function getVerificationHistory(
  cwd: string,
  featureId: string
): Promise<VerificationMetadata[]> {
  const featureDir = path.join(cwd, VERIFICATION_STORE_DIR, featureId);
  const results: VerificationMetadata[] = [];

  try {
    const files = await fs.readdir(featureDir);
    const jsonFiles = files.filter((f) => f.endsWith(".json")).sort();

    for (const file of jsonFiles) {
      try {
        const content = await fs.readFile(path.join(featureDir, file), "utf-8");
        const metadata = JSON.parse(content) as VerificationMetadata;
        results.push(metadata);
      } catch {
        // Skip invalid files
      }
    }
  } catch {
    // Directory doesn't exist - no history
  }

  return results;
}

/**
 * Clear a verification result from the store
 * Removes from index but preserves history in feature subdirectory
 */
export async function clearVerificationResult(
  cwd: string,
  featureId: string
): Promise<void> {
  // Clear from index
  const index = await loadVerificationIndex(cwd);
  if (index && index.features[featureId]) {
    delete index.features[featureId];
    index.updatedAt = new Date().toISOString();
    await saveIndex(cwd, index);
  }

  // Note: We don't delete the feature subdirectory to preserve history
  // Legacy results.json is no longer maintained (v3.0.0)
}

/**
 * Get all verification results (aggregated from individual files)
 * Uses index to find features, then loads each result
 */
export async function getAllVerificationResults(
  cwd: string
): Promise<Record<string, VerificationResult>> {
  const results: Record<string, VerificationResult> = {};

  // Get list of features from index
  const index = await loadVerificationIndex(cwd);
  if (!index || Object.keys(index.features).length === 0) {
    // Fall back to legacy store for old data
    const store = await loadVerificationStore(cwd);
    return store?.results || {};
  }

  // Load each feature's latest result
  for (const featureId of Object.keys(index.features)) {
    const result = await getLastVerification(cwd, featureId);
    if (result) {
      results[featureId] = result;
    }
  }

  return results;
}

/**
 * Check if a feature has been verified
 */
export async function hasVerification(
  cwd: string,
  featureId: string
): Promise<boolean> {
  // Check index first
  const index = await loadVerificationIndex(cwd);
  if (index && index.features[featureId]) {
    return true;
  }

  // Fall back to legacy
  const result = await getLastVerification(cwd, featureId);
  return result !== null;
}

/**
 * Get verification summary statistics
 */
export async function getVerificationStats(cwd: string): Promise<{
  total: number;
  passing: number;
  failing: number;
  needsReview: number;
}> {
  // Try index first
  const index = await loadVerificationIndex(cwd);
  if (index && Object.keys(index.features).length > 0) {
    const summaries = Object.values(index.features);
    return {
      total: summaries.length,
      passing: summaries.filter((s) => s.latestVerdict === "pass").length,
      failing: summaries.filter((s) => s.latestVerdict === "fail").length,
      needsReview: summaries.filter((s) => s.latestVerdict === "needs_review").length,
    };
  }

  // Fall back to legacy
  const results = await getAllVerificationResults(cwd);
  const values = Object.values(results);

  return {
    total: values.length,
    passing: values.filter((r) => r.verdict === "pass").length,
    failing: values.filter((r) => r.verdict === "fail").length,
    needsReview: values.filter((r) => r.verdict === "needs_review").length,
  };
}

/**
 * Get feature summary from index
 */
export async function getFeatureSummary(
  cwd: string,
  featureId: string
): Promise<FeatureSummary | null> {
  const index = await loadVerificationIndex(cwd);
  if (!index) {
    return null;
  }
  return index.features[featureId] || null;
}
