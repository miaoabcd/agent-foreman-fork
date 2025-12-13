/**
 * Tests for layered check mode
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { isHighRiskChange, runLayeredCheck } from "../../src/verifier/layered-check.js";

// Mock dependencies
vi.mock("../../src/git-utils.js", () => ({
  getChangedFiles: vi.fn(),
}));

vi.mock("../../src/capabilities/index.js", () => ({
  detectCapabilities: vi.fn(),
}));

vi.mock("../../src/test-discovery.js", () => ({
  discoverTestsForFeature: vi.fn(),
}));

vi.mock("../../src/verifier/check-executor.js", () => ({
  runAutomatedChecks: vi.fn(),
}));

vi.mock("../../src/verifier/task-impact.js", () => ({
  getTaskImpact: vi.fn(),
}));

vi.mock("../../src/feature-list.js", () => ({
  loadFeatureList: vi.fn(),
}));

vi.mock("../../src/verifier/ai-analysis.js", () => ({
  analyzeWithAI: vi.fn(),
}));

describe("layered-check", () => {
  describe("isHighRiskChange", () => {
    it("should detect package.json as high risk", () => {
      expect(isHighRiskChange(["package.json"])).toBe(true);
      expect(isHighRiskChange(["src/index.ts", "package.json"])).toBe(true);
    });

    it("should detect package-lock.json as high risk", () => {
      expect(isHighRiskChange(["package-lock.json"])).toBe(true);
    });

    it("should detect pnpm-lock.yaml as high risk", () => {
      expect(isHighRiskChange(["pnpm-lock.yaml"])).toBe(true);
    });

    it("should detect yarn.lock as high risk", () => {
      expect(isHighRiskChange(["yarn.lock"])).toBe(true);
    });

    it("should detect tsconfig.json as high risk", () => {
      expect(isHighRiskChange(["tsconfig.json"])).toBe(true);
    });

    it("should detect tsconfig.build.json as high risk", () => {
      expect(isHighRiskChange(["tsconfig.build.json"])).toBe(true);
    });

    it("should detect .eslintrc files as high risk", () => {
      expect(isHighRiskChange([".eslintrc"])).toBe(true);
      expect(isHighRiskChange([".eslintrc.js"])).toBe(true);
      expect(isHighRiskChange([".eslintrc.json"])).toBe(true);
    });

    it("should detect eslint.config.js as high risk", () => {
      expect(isHighRiskChange(["eslint.config.js"])).toBe(true);
      expect(isHighRiskChange(["eslint.config.mjs"])).toBe(true);
    });

    it("should detect vite.config.ts as high risk", () => {
      expect(isHighRiskChange(["vite.config.ts"])).toBe(true);
      expect(isHighRiskChange(["vite.config.js"])).toBe(true);
    });

    it("should detect vitest.config.ts as high risk", () => {
      expect(isHighRiskChange(["vitest.config.ts"])).toBe(true);
    });

    it("should detect playwright.config.ts as high risk", () => {
      expect(isHighRiskChange(["playwright.config.ts"])).toBe(true);
    });

    it("should detect .env files as high risk", () => {
      expect(isHighRiskChange([".env"])).toBe(true);
      expect(isHighRiskChange([".env.local"])).toBe(true);
      expect(isHighRiskChange([".env.production"])).toBe(true);
    });

    it("should detect Cargo.toml as high risk", () => {
      expect(isHighRiskChange(["Cargo.toml"])).toBe(true);
    });

    it("should detect go.mod as high risk", () => {
      expect(isHighRiskChange(["go.mod"])).toBe(true);
    });

    it("should detect requirements.txt as high risk", () => {
      expect(isHighRiskChange(["requirements.txt"])).toBe(true);
    });

    it("should NOT detect regular source files as high risk", () => {
      expect(isHighRiskChange(["src/index.ts"])).toBe(false);
      expect(isHighRiskChange(["src/utils/helper.ts"])).toBe(false);
      expect(isHighRiskChange(["tests/feature.test.ts"])).toBe(false);
    });

    it("should return false for empty array", () => {
      expect(isHighRiskChange([])).toBe(false);
    });

    it("should detect high risk in mixed files", () => {
      expect(isHighRiskChange(["src/index.ts", "README.md", "tsconfig.json"])).toBe(true);
    });

    it("should detect high risk files in subdirectories", () => {
      expect(isHighRiskChange(["config/tsconfig.json"])).toBe(true);
      expect(isHighRiskChange(["apps/web/package.json"])).toBe(true);
    });
  });

  describe("runLayeredCheck", () => {
    beforeEach(() => {
      vi.resetAllMocks();
      // Suppress console output during tests
      vi.spyOn(console, "log").mockImplementation(() => {});
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("should return early when no changed files", async () => {
      const { getChangedFiles } = await import("../../src/git-utils.js");
      vi.mocked(getChangedFiles).mockReturnValue([]);

      const result = await runLayeredCheck("/test");

      expect(result.changedFiles).toEqual([]);
      expect(result.passed).toBe(true);
      expect(result.skipped).toContain("tests");
      expect(result.skipped).toContain("ai");
      expect(result.highRiskEscalation).toBe(false);
    });

    it("should detect high risk changes", async () => {
      const { getChangedFiles } = await import("../../src/git-utils.js");
      const { detectCapabilities } = await import("../../src/capabilities/index.js");
      const { discoverTestsForFeature } = await import("../../src/test-discovery.js");
      const { runAutomatedChecks } = await import("../../src/verifier/check-executor.js");
      const { getTaskImpact } = await import("../../src/verifier/task-impact.js");

      vi.mocked(getChangedFiles).mockReturnValue(["package.json", "src/index.ts"]);
      vi.mocked(detectCapabilities).mockResolvedValue({
        hasTypeScript: true,
        hasLint: true,
        hasTests: true,
        hasBuild: true,
        hasE2E: false,
        testCommand: "npm test",
        lintCommand: "npm run lint",
        typecheckCommand: "npm run typecheck",
        buildCommand: "npm run build",
      });
      vi.mocked(discoverTestsForFeature).mockResolvedValue({
        testFiles: [],
        pattern: null,
        discoveryMethod: "none",
      });
      vi.mocked(runAutomatedChecks).mockResolvedValue([
        { type: "typecheck", success: true, duration: 1000 },
        { type: "lint", success: true, duration: 500 },
      ]);
      vi.mocked(getTaskImpact).mockResolvedValue([]);

      const result = await runLayeredCheck("/test");

      expect(result.highRiskEscalation).toBe(true);
      expect(result.changedFiles).toContain("package.json");
    });

    it("should run automated checks and return results", async () => {
      const { getChangedFiles } = await import("../../src/git-utils.js");
      const { detectCapabilities } = await import("../../src/capabilities/index.js");
      const { discoverTestsForFeature } = await import("../../src/test-discovery.js");
      const { runAutomatedChecks } = await import("../../src/verifier/check-executor.js");
      const { getTaskImpact } = await import("../../src/verifier/task-impact.js");

      vi.mocked(getChangedFiles).mockReturnValue(["src/index.ts"]);
      vi.mocked(detectCapabilities).mockResolvedValue({
        hasTypeScript: true,
        hasLint: true,
        hasTests: true,
        hasBuild: true,
        hasE2E: false,
        testCommand: "npm test",
        lintCommand: "npm run lint",
        typecheckCommand: "npm run typecheck",
        buildCommand: "npm run build",
      });
      vi.mocked(discoverTestsForFeature).mockResolvedValue({
        testFiles: ["tests/index.test.ts"],
        pattern: "tests/index.test.ts",
        discoveryMethod: "pattern",
      });
      vi.mocked(runAutomatedChecks).mockResolvedValue([
        { type: "typecheck", success: true, duration: 1000 },
        { type: "lint", success: true, duration: 500 },
        { type: "test", success: true, duration: 2000 },
      ]);
      vi.mocked(getTaskImpact).mockResolvedValue([]);

      const result = await runLayeredCheck("/test");

      expect(result.passed).toBe(true);
      expect(result.checks.typecheck?.success).toBe(true);
      expect(result.checks.lint?.success).toBe(true);
      expect(result.checks.tests?.success).toBe(true);
      expect(result.highRiskEscalation).toBe(false);
    });

    it("should detect failing checks", async () => {
      const { getChangedFiles } = await import("../../src/git-utils.js");
      const { detectCapabilities } = await import("../../src/capabilities/index.js");
      const { discoverTestsForFeature } = await import("../../src/test-discovery.js");
      const { runAutomatedChecks } = await import("../../src/verifier/check-executor.js");
      const { getTaskImpact } = await import("../../src/verifier/task-impact.js");

      vi.mocked(getChangedFiles).mockReturnValue(["src/index.ts"]);
      vi.mocked(detectCapabilities).mockResolvedValue({
        hasTypeScript: true,
        hasLint: true,
        hasTests: true,
        hasBuild: false,
        hasE2E: false,
        testCommand: "npm test",
        lintCommand: "npm run lint",
        typecheckCommand: "npm run typecheck",
      });
      vi.mocked(discoverTestsForFeature).mockResolvedValue({
        testFiles: [],
        pattern: null,
        discoveryMethod: "none",
      });
      vi.mocked(runAutomatedChecks).mockResolvedValue([
        { type: "typecheck", success: false, duration: 1000, error: "Type error" },
        { type: "lint", success: true, duration: 500 },
      ]);
      vi.mocked(getTaskImpact).mockResolvedValue([]);

      const result = await runLayeredCheck("/test");

      expect(result.passed).toBe(false);
      expect(result.checks.typecheck?.success).toBe(false);
    });

    it("should include affected tasks in result", async () => {
      const { getChangedFiles } = await import("../../src/git-utils.js");
      const { detectCapabilities } = await import("../../src/capabilities/index.js");
      const { discoverTestsForFeature } = await import("../../src/test-discovery.js");
      const { runAutomatedChecks } = await import("../../src/verifier/check-executor.js");
      const { getTaskImpact } = await import("../../src/verifier/task-impact.js");

      vi.mocked(getChangedFiles).mockReturnValue(["src/auth/login.ts"]);
      vi.mocked(detectCapabilities).mockResolvedValue({
        hasTypeScript: true,
        hasLint: false,
        hasTests: false,
        hasBuild: false,
        hasE2E: false,
        typecheckCommand: "npm run typecheck",
      });
      vi.mocked(discoverTestsForFeature).mockResolvedValue({
        testFiles: [],
        pattern: null,
        discoveryMethod: "none",
      });
      vi.mocked(runAutomatedChecks).mockResolvedValue([
        { type: "typecheck", success: true, duration: 1000 },
      ]);
      vi.mocked(getTaskImpact).mockResolvedValue([
        {
          taskId: "auth.login",
          reason: "matches affectedBy pattern",
          confidence: "high",
          matchedFiles: ["src/auth/login.ts"],
        },
      ]);

      const result = await runLayeredCheck("/test");

      expect(result.affectedTasks).toHaveLength(1);
      expect(result.affectedTasks[0].taskId).toBe("auth.login");
      expect(result.affectedTasks[0].confidence).toBe("high");
    });

    it("should skip task impact when skipTaskImpact is true", async () => {
      const { getChangedFiles } = await import("../../src/git-utils.js");
      const { detectCapabilities } = await import("../../src/capabilities/index.js");
      const { discoverTestsForFeature } = await import("../../src/test-discovery.js");
      const { runAutomatedChecks } = await import("../../src/verifier/check-executor.js");
      const { getTaskImpact } = await import("../../src/verifier/task-impact.js");

      vi.mocked(getChangedFiles).mockReturnValue(["src/index.ts"]);
      vi.mocked(detectCapabilities).mockResolvedValue({
        hasTypeScript: false,
        hasLint: false,
        hasTests: false,
        hasBuild: false,
        hasE2E: false,
      });
      vi.mocked(discoverTestsForFeature).mockResolvedValue({
        testFiles: [],
        pattern: null,
        discoveryMethod: "none",
      });
      vi.mocked(runAutomatedChecks).mockResolvedValue([]);

      const result = await runLayeredCheck("/test", { skipTaskImpact: true });

      expect(getTaskImpact).not.toHaveBeenCalled();
      expect(result.affectedTasks).toEqual([]);
    });

    it("should handle TDD strict mode messaging", async () => {
      const { getChangedFiles } = await import("../../src/git-utils.js");
      const { detectCapabilities } = await import("../../src/capabilities/index.js");
      const { discoverTestsForFeature } = await import("../../src/test-discovery.js");
      const { runAutomatedChecks } = await import("../../src/verifier/check-executor.js");
      const { getTaskImpact } = await import("../../src/verifier/task-impact.js");

      vi.mocked(getChangedFiles).mockReturnValue(["src/auth/login.ts"]);
      vi.mocked(detectCapabilities).mockResolvedValue({
        hasTypeScript: true,
        hasLint: false,
        hasTests: false,
        hasBuild: false,
        hasE2E: false,
        typecheckCommand: "tsc",
      });
      vi.mocked(discoverTestsForFeature).mockResolvedValue({
        testFiles: [],
        pattern: null,
        discoveryMethod: "none",
      });
      vi.mocked(runAutomatedChecks).mockResolvedValue([
        { type: "typecheck", success: true, duration: 1000 },
      ]);
      vi.mocked(getTaskImpact).mockResolvedValue([]);

      const result = await runLayeredCheck("/test", { tddMode: "strict" });

      expect(result.passed).toBe(true);
      // TDD mode is informational, doesn't change result
    });

    it("should run AI verification when ai option is true and tasks are affected", async () => {
      const { getChangedFiles } = await import("../../src/git-utils.js");
      const { detectCapabilities } = await import("../../src/capabilities/index.js");
      const { discoverTestsForFeature } = await import("../../src/test-discovery.js");
      const { runAutomatedChecks } = await import("../../src/verifier/check-executor.js");
      const { getTaskImpact } = await import("../../src/verifier/task-impact.js");
      const { loadFeatureList } = await import("../../src/feature-list.js");
      const { analyzeWithAI } = await import("../../src/verifier/ai-analysis.js");

      vi.mocked(getChangedFiles).mockReturnValue(["src/auth/login.ts"]);
      vi.mocked(detectCapabilities).mockResolvedValue({
        hasTypeScript: true,
        hasLint: false,
        hasTests: false,
        hasBuild: false,
        hasE2E: false,
        typecheckCommand: "tsc",
      });
      vi.mocked(discoverTestsForFeature).mockResolvedValue({
        testFiles: [],
        pattern: null,
        discoveryMethod: "none",
      });
      vi.mocked(runAutomatedChecks).mockResolvedValue([
        { type: "typecheck", success: true, duration: 1000 },
      ]);
      vi.mocked(getTaskImpact).mockResolvedValue([
        {
          taskId: "auth.login",
          reason: "matches affectedBy pattern",
          confidence: "high",
          matchedFiles: ["src/auth/login.ts"],
        },
      ]);
      vi.mocked(loadFeatureList).mockResolvedValue({
        features: [
          {
            id: "auth.login",
            description: "Login feature",
            module: "auth",
            priority: 1,
            status: "failing",
            acceptance: ["User can login"],
            dependsOn: [],
            supersedes: [],
            tags: [],
            notes: "",
            version: 1,
            origin: "manual",
          },
        ],
        metadata: {
          projectGoal: "test",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          version: "1.0.0",
        },
      });
      vi.mocked(analyzeWithAI).mockResolvedValue({
        verdict: "pass",
        overallReasoning: "Implementation looks good",
        criteriaResults: [],
        confidence: "high",
      });

      const result = await runLayeredCheck("/test", { ai: true });

      expect(analyzeWithAI).toHaveBeenCalled();
      expect(result.taskVerification).toBeDefined();
      expect(result.taskVerification).toHaveLength(1);
      expect(result.taskVerification?.[0].taskId).toBe("auth.login");
      expect(result.taskVerification?.[0].verdict).toBe("pass");
    });

    it("should not run AI verification when no affected tasks", async () => {
      const { getChangedFiles } = await import("../../src/git-utils.js");
      const { detectCapabilities } = await import("../../src/capabilities/index.js");
      const { discoverTestsForFeature } = await import("../../src/test-discovery.js");
      const { runAutomatedChecks } = await import("../../src/verifier/check-executor.js");
      const { getTaskImpact } = await import("../../src/verifier/task-impact.js");
      const { analyzeWithAI } = await import("../../src/verifier/ai-analysis.js");

      vi.mocked(getChangedFiles).mockReturnValue(["src/index.ts"]);
      vi.mocked(detectCapabilities).mockResolvedValue({
        hasTypeScript: false,
        hasLint: false,
        hasTests: false,
        hasBuild: false,
        hasE2E: false,
      });
      vi.mocked(discoverTestsForFeature).mockResolvedValue({
        testFiles: [],
        pattern: null,
        discoveryMethod: "none",
      });
      vi.mocked(runAutomatedChecks).mockResolvedValue([]);
      vi.mocked(getTaskImpact).mockResolvedValue([]);

      const result = await runLayeredCheck("/test", { ai: true });

      expect(analyzeWithAI).not.toHaveBeenCalled();
      expect(result.taskVerification).toBeUndefined();
    });

    it("should pass skipBuild to runAutomatedChecks", async () => {
      const { getChangedFiles } = await import("../../src/git-utils.js");
      const { detectCapabilities } = await import("../../src/capabilities/index.js");
      const { discoverTestsForFeature } = await import("../../src/test-discovery.js");
      const { runAutomatedChecks } = await import("../../src/verifier/check-executor.js");
      const { getTaskImpact } = await import("../../src/verifier/task-impact.js");

      vi.mocked(getChangedFiles).mockReturnValue(["src/index.ts"]);
      vi.mocked(detectCapabilities).mockResolvedValue({
        hasTypeScript: true,
        hasLint: false,
        hasTests: false,
        hasBuild: true,
        hasE2E: false,
        typecheckCommand: "tsc",
        buildCommand: "npm run build",
      });
      vi.mocked(discoverTestsForFeature).mockResolvedValue({
        testFiles: [],
        pattern: null,
        discoveryMethod: "none",
      });
      vi.mocked(runAutomatedChecks).mockResolvedValue([
        { type: "typecheck", success: true, duration: 1000 },
      ]);
      vi.mocked(getTaskImpact).mockResolvedValue([]);

      await runLayeredCheck("/test");

      expect(runAutomatedChecks).toHaveBeenCalledWith(
        "/test",
        expect.anything(),
        expect.objectContaining({ skipBuild: true })
      );
    });

    it("should include duration in result", async () => {
      const { getChangedFiles } = await import("../../src/git-utils.js");
      const { detectCapabilities } = await import("../../src/capabilities/index.js");
      const { discoverTestsForFeature } = await import("../../src/test-discovery.js");
      const { runAutomatedChecks } = await import("../../src/verifier/check-executor.js");
      const { getTaskImpact } = await import("../../src/verifier/task-impact.js");

      vi.mocked(getChangedFiles).mockReturnValue(["src/index.ts"]);
      vi.mocked(detectCapabilities).mockResolvedValue({
        hasTypeScript: false,
        hasLint: false,
        hasTests: false,
        hasBuild: false,
        hasE2E: false,
      });
      vi.mocked(discoverTestsForFeature).mockResolvedValue({
        testFiles: [],
        pattern: null,
        discoveryMethod: "none",
      });
      vi.mocked(runAutomatedChecks).mockResolvedValue([]);
      vi.mocked(getTaskImpact).mockResolvedValue([]);

      const result = await runLayeredCheck("/test");

      expect(result.duration).toBeGreaterThanOrEqual(0);
    });

    it("should show verbose file list when verbose is true", async () => {
      const { getChangedFiles } = await import("../../src/git-utils.js");
      const { detectCapabilities } = await import("../../src/capabilities/index.js");
      const { discoverTestsForFeature } = await import("../../src/test-discovery.js");
      const { runAutomatedChecks } = await import("../../src/verifier/check-executor.js");
      const { getTaskImpact } = await import("../../src/verifier/task-impact.js");
      const consoleSpy = vi.spyOn(console, "log");

      vi.mocked(getChangedFiles).mockReturnValue([
        "src/a.ts",
        "src/b.ts",
        "src/c.ts",
        "src/d.ts",
        "src/e.ts",
        "src/f.ts",
      ]);
      vi.mocked(detectCapabilities).mockResolvedValue({
        hasTypeScript: false,
        hasLint: false,
        hasTests: false,
        hasBuild: false,
        hasE2E: false,
      });
      vi.mocked(discoverTestsForFeature).mockResolvedValue({
        testFiles: [],
        pattern: null,
        discoveryMethod: "none",
      });
      vi.mocked(runAutomatedChecks).mockResolvedValue([]);
      vi.mocked(getTaskImpact).mockResolvedValue([]);

      await runLayeredCheck("/test", { verbose: true });

      // Should log individual files (first 5) and "... and X more"
      const logCalls = consoleSpy.mock.calls.map((c) => c[0]);
      expect(logCalls.some((c) => typeof c === "string" && c.includes("src/a.ts"))).toBe(true);
      expect(logCalls.some((c) => typeof c === "string" && c.includes("and 1 more"))).toBe(true);
    });
  });
});
