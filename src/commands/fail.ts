/**
 * Fail command - Mark a feature as failed and continue to next
 *
 * Used when verification fails or implementation cannot be completed.
 * This enables the loop workflow to continue without stopping.
 */

import chalk from "chalk";

import {
  loadFeatureList,
  saveFeatureList,
  findFeatureById,
  updateFeatureStatus,
  selectNextFeature,
  getFeatureStats,
  getCompletionPercentage,
} from "../feature-list.js";
import {
  appendProgressLog,
  createVerifyEntry,
} from "../progress-log.js";

/**
 * Run the fail command
 * @param featureId - Feature ID to mark as failed
 * @param reason - Reason for failure
 * @param loopMode - Whether to show loop continuation guidance
 */
export async function runFail(
  featureId: string,
  reason?: string,
  loopMode: boolean = true
): Promise<void> {
  const cwd = process.cwd();

  const featureList = await loadFeatureList(cwd);
  if (!featureList) {
    console.log(chalk.red("✗ No feature list found. Run 'agent-foreman init' first."));
    process.exit(1);
  }

  const feature = findFeatureById(featureList.features, featureId);
  if (!feature) {
    console.log(chalk.red(`✗ Feature '${featureId}' not found.`));
    process.exit(1);
  }

  // Check if already failed
  if (feature.status === "failed") {
    console.log(chalk.yellow(`⚠ Feature '${featureId}' is already marked as failed.`));
    const next = selectNextFeature(featureList.features);
    if (next) {
      console.log(chalk.gray(`\n  Next up: ${next.id}`));
    }
    return;
  }

  // Build notes with reason
  const timestamp = new Date().toISOString();
  const failureNote = reason
    ? `[${timestamp.split("T")[0]}] Failed: ${reason}`
    : `[${timestamp.split("T")[0]}] Marked as failed`;

  const updatedNotes = feature.notes
    ? `${feature.notes}\n${failureNote}`
    : failureNote;

  // Update status to failed
  featureList.features = updateFeatureStatus(
    featureList.features,
    featureId,
    "failed",
    updatedNotes
  );

  // Save
  await saveFeatureList(cwd, featureList);

  // Log to progress
  await appendProgressLog(
    cwd,
    createVerifyEntry(
      featureId,
      "fail",
      reason || "Marked as failed"
    )
  );

  console.log(chalk.red(`\n✗ Marked '${featureId}' as failed`));
  if (reason) {
    console.log(chalk.gray(`  Reason: ${reason}`));
  }

  // Show next feature
  const next = selectNextFeature(featureList.features);

  if (next) {
    console.log(chalk.gray(`\n  Next up: ${next.id}`));

    // Loop mode: Output explicit continuation guidance
    if (loopMode) {
      const stats = getFeatureStats(featureList.features);
      const completed = stats.passing;
      const failed = stats.failed;
      const percent = getCompletionPercentage(featureList.features);

      console.log(chalk.bold.cyan("\n══════════════════════════════════════════════════════════════"));
      console.log(chalk.bold.cyan("                   CONTINUE TO NEXT FEATURE"));
      console.log(chalk.bold.cyan("══════════════════════════════════════════════════════════════\n"));

      console.log(chalk.white(`   Failed: ${featureId}`));
      console.log(chalk.white(`   Status: ${completed} passing, ${failed} failed, ${stats.failing} pending`));
      console.log(chalk.white(`   Progress: ${percent}%`));

      console.log(chalk.bold.yellow("\n   NEXT STEPS:"));
      console.log(chalk.gray("   1. agent-foreman next"));
      console.log(chalk.gray("   2. Implement feature"));
      console.log(chalk.gray("   3. agent-foreman check <feature_id>"));
      console.log(chalk.gray("   4. agent-foreman done <feature_id>"));

      console.log(chalk.bold.green("\n   ➤ Continue NOW. Do NOT stop."));
      console.log(chalk.bold.cyan("══════════════════════════════════════════════════════════════\n"));
    }
  } else {
    // All features processed
    const stats = getFeatureStats(featureList.features);

    console.log(chalk.bold.blue("\n══════════════════════════════════════════════════════════════"));
    console.log(chalk.bold.blue("                   ALL FEATURES PROCESSED"));
    console.log(chalk.bold.blue("══════════════════════════════════════════════════════════════\n"));

    console.log(chalk.bold("   Summary:"));
    console.log(chalk.green(`   ✓ Passing: ${stats.passing}`));
    console.log(chalk.red(`   ✗ Failed: ${stats.failed}`));
    if (stats.blocked > 0) {
      console.log(chalk.yellow(`   ○ Blocked: ${stats.blocked}`));
    }

    console.log(chalk.gray("\n   Run 'agent-foreman status' for details."));
    console.log(chalk.bold.blue("══════════════════════════════════════════════════════════════\n"));
  }
}
