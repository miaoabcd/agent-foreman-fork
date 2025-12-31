/**
 * Multi-role analysis integration for init command
 * Adds --roles flag support to analyze requirements from multiple perspectives
 */

import { ProductManagerRole } from "../roles/productManager.js";
import { FrontendEngineerRole } from "../roles/frontendEngineer.js";
import { BackendEngineerRole } from "../roles/backendEngineer.js";
import { TesterRole } from "../roles/tester.js";
import { RoleAggregator, UnifiedDocument } from "../roles/aggregator.js";
import type { PMAnalysisResult } from "../roles/productManager.js";
import type { FrontendAnalysisResult } from "../roles/frontendEngineer.js";
import type { BackendAnalysisResult } from "../roles/backendEngineer.js";
import type { TesterAnalysisResult } from "../roles/tester.js";

// ============================================================================
// Type Definitions
// ============================================================================

export type RoleType = "pm" | "frontend" | "backend" | "qa";

export interface RoleAnalysisOptions {
  requirement: string;
  roles: RoleType[];
  outputDir: string;
  parallel?: boolean;
}

export interface RoleOutputs {
  pm?: PMAnalysisResult;
  frontend?: FrontendAnalysisResult;
  backend?: BackendAnalysisResult;
  qa?: TesterAnalysisResult;
}

export interface MultiRoleResult {
  success: boolean;
  outputs: RoleOutputs;
  unifiedDocument?: UnifiedDocument;
  error?: string;
}

// ============================================================================
// Role Parsing
// ============================================================================

const VALID_ROLES: RoleType[] = ["pm", "frontend", "backend", "qa"];

/**
 * Parse --roles option value into array of role types
 * @param rolesOption - The value passed to --roles flag (e.g., "all", "pm,frontend")
 * @returns Array of role types to run
 */
export function parseRolesOption(rolesOption: string): RoleType[] {
  if (!rolesOption || rolesOption === "all") {
    return [...VALID_ROLES];
  }

  const requested = rolesOption
    .split(",")
    .map(r => r.trim().toLowerCase() as RoleType)
    .filter(r => VALID_ROLES.includes(r));

  return requested.length > 0 ? requested : [...VALID_ROLES];
}

// ============================================================================
// Multi-Role Analysis
// ============================================================================

/**
 * Run multi-role analysis on a requirement
 */
export async function runMultiRoleAnalysis(options: RoleAnalysisOptions): Promise<MultiRoleResult> {
  const { requirement, roles, parallel = true } = options;

  if (!requirement || requirement.trim() === "") {
    return {
      success: false,
      outputs: {},
      error: "Requirement cannot be empty",
    };
  }

  const outputs: RoleOutputs = {};

  try {
    if (parallel) {
      // Run all roles in parallel
      const promises: Promise<void>[] = [];

      if (roles.includes("pm")) {
        promises.push(
          new ProductManagerRole().analyze(requirement).then(result => {
            outputs.pm = result;
          })
        );
      }

      if (roles.includes("frontend")) {
        promises.push(
          new FrontendEngineerRole().analyze(requirement).then(result => {
            outputs.frontend = result;
          })
        );
      }

      if (roles.includes("backend")) {
        promises.push(
          new BackendEngineerRole().analyze(requirement).then(result => {
            outputs.backend = result;
          })
        );
      }

      if (roles.includes("qa")) {
        promises.push(
          new TesterRole().analyze(requirement).then(result => {
            outputs.qa = result;
          })
        );
      }

      await Promise.all(promises);
    } else {
      // Run sequentially
      if (roles.includes("pm")) {
        outputs.pm = await new ProductManagerRole().analyze(requirement);
      }
      if (roles.includes("frontend")) {
        outputs.frontend = await new FrontendEngineerRole().analyze(requirement);
      }
      if (roles.includes("backend")) {
        outputs.backend = await new BackendEngineerRole().analyze(requirement);
      }
      if (roles.includes("qa")) {
        outputs.qa = await new TesterRole().analyze(requirement);
      }
    }

    // Aggregate if all roles are present
    let unifiedDocument: UnifiedDocument | undefined;
    if (outputs.pm && outputs.frontend && outputs.backend && outputs.qa) {
      const aggregator = new RoleAggregator();
      unifiedDocument = await aggregator.aggregate({
        requirement,
        pmOutput: outputs.pm,
        frontendOutput: outputs.frontend,
        backendOutput: outputs.backend,
        qaOutput: outputs.qa,
      });
    }

    return {
      success: true,
      outputs,
      unifiedDocument,
    };
  } catch (error) {
    return {
      success: false,
      outputs,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Display progress during multi-role analysis
 */
export function displayRoleProgress(role: RoleType, status: "started" | "completed" | "failed"): void {
  const roleNames: Record<RoleType, string> = {
    pm: "Product Manager",
    frontend: "Frontend Engineer",
    backend: "Backend Engineer",
    qa: "QA/Tester",
  };

  const name = roleNames[role];

  switch (status) {
    case "started":
      console.log(`  ⏳ Analyzing as ${name}...`);
      break;
    case "completed":
      console.log(`  ✓ ${name} analysis complete`);
      break;
    case "failed":
      console.log(`  ✗ ${name} analysis failed`);
      break;
  }
}
