/**
 * Tests for next command - Show next feature to work on
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock node:fs/promises
vi.mock("node:fs/promises", () => ({
  access: vi.fn(),
  mkdir: vi.fn().mockResolvedValue(undefined),
  writeFile: vi.fn().mockResolvedValue(undefined),
  readFile: vi.fn().mockRejectedValue(new Error("ENOENT")),
}));

// Mock node:child_process
vi.mock("node:child_process", () => ({
  spawnSync: vi.fn().mockReturnValue({
    status: 0,
    stdout: "abc123 Initial commit\ndef456 Second commit",
    stderr: "",
  }),
}));

// Mock dependencies
vi.mock("../../src/feature-list.js", () => ({
  loadFeatureList: vi.fn(),
  saveFeatureList: vi.fn(),
  selectNextFeature: vi.fn(),
  findFeatureById: vi.fn(),
  getFeatureStats: vi.fn(),
  getCompletionPercentage: vi.fn(),
}));

vi.mock("../../src/progress-log.js", () => ({
  getRecentEntries: vi.fn(),
}));

vi.mock("../../src/capabilities/index.js", () => ({
  detectCapabilities: vi.fn(),
}));

vi.mock("../../src/git-utils.js", () => ({
  isGitRepo: vi.fn(),
  hasUncommittedChanges: vi.fn(),
}));

vi.mock("../../src/tdd-guidance/index.js", () => ({
  generateTDDGuidance: vi.fn(),
}));

vi.mock("../../src/tdd-ai-generator.js", () => ({
  generateTDDGuidanceWithAI: vi.fn(),
}));

import { runNext } from "../../src/commands/next.js";
import {
  loadFeatureList,
  saveFeatureList,
  selectNextFeature,
  findFeatureById,
  getFeatureStats,
  getCompletionPercentage,
} from "../../src/feature-list.js";
import { getRecentEntries } from "../../src/progress-log.js";
import { detectCapabilities } from "../../src/capabilities/index.js";
import { isGitRepo, hasUncommittedChanges } from "../../src/git-utils.js";
import { generateTDDGuidance } from "../../src/tdd-guidance/index.js";
import { generateTDDGuidanceWithAI } from "../../src/tdd-ai-generator.js";

describe("Next Command", () => {
  const mockFeature = {
    id: "test.feature",
    description: "Test feature description",
    module: "test",
    priority: 1,
    status: "failing" as const,
    acceptance: ["Feature works correctly", "Error handling works"],
    dependsOn: [] as string[],
    version: 1,
    origin: "init-auto" as const,
  };

  const mockFeatureList = {
    features: [mockFeature],
    metadata: {
      projectGoal: "Test project",
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
      version: "1.0.0",
      tddMode: "recommended" as const,
    },
  };

  const mockTDDGuidance = {
    suggestedTestFiles: {
      unit: ["tests/test/feature.test.ts"],
      e2e: ["e2e/test/feature.spec.ts"],
    },
    acceptanceMapping: [
      {
        criterion: "Feature works correctly",
        unitTestCase: "should work correctly",
        e2eScenario: "user can use feature",
      },
    ],
    testCaseStubs: {
      unit: ["should work correctly", "should handle errors"],
      e2e: ["user can use feature"],
    },
  };

  let consoleLogSpy: ReturnType<typeof vi.spyOn>;
  let processExitSpy: ReturnType<typeof vi.spyOn>;
  let processCwdSpy: ReturnType<typeof vi.spyOn>;
  const tempDir = "/tmp/next-test";

  beforeEach(async () => {
    vi.clearAllMocks();

    // Mock console.log
    consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    // Mock process.exit
    processExitSpy = vi.spyOn(process, "exit").mockImplementation((() => {
      throw new Error("process.exit called");
    }) as () => never);

    // Mock process.cwd
    processCwdSpy = vi.spyOn(process, "cwd").mockReturnValue(tempDir);

    // Setup default mock implementations
    vi.mocked(isGitRepo).mockReturnValue(true);
    vi.mocked(hasUncommittedChanges).mockReturnValue(false);
    vi.mocked(loadFeatureList).mockResolvedValue(mockFeatureList);
    vi.mocked(selectNextFeature).mockReturnValue(mockFeature);
    vi.mocked(findFeatureById).mockReturnValue(mockFeature);
    vi.mocked(getFeatureStats).mockReturnValue({
      passing: 5,
      failing: 10,
      blocked: 2,
      needs_review: 1,
      deprecated: 0,
      failed: 0,
    });
    vi.mocked(getCompletionPercentage).mockReturnValue(28);
    vi.mocked(getRecentEntries).mockResolvedValue([
      { type: "STEP", timestamp: "2024-01-01T12:00:00Z", summary: "Completed feature X", feature: "test.feature" },
    ]);
    vi.mocked(detectCapabilities).mockResolvedValue({
      testCommand: "npm test",
      testFramework: "vitest",
      lintCommand: "npm run lint",
      buildCommand: "npm run build",
      typecheckCommand: "npx tsc --noEmit",
      languages: ["typescript"],
    });
    vi.mocked(generateTDDGuidance).mockReturnValue(mockTDDGuidance);
    vi.mocked(generateTDDGuidanceWithAI).mockResolvedValue(null);
    vi.mocked(saveFeatureList).mockResolvedValue(undefined);
  });

  afterEach(async () => {
    consoleLogSpy.mockRestore();
    processExitSpy.mockRestore();
    processCwdSpy.mockRestore();
  });

  describe("Feature selection", () => {
    it("should show next feature based on priority order", async () => {
      await runNext(undefined, false, false, false, false, false, false);

      expect(selectNextFeature).toHaveBeenCalled();
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("test.feature")
      );
    });

    it("should select specific feature when feature_id is provided", async () => {
      await runNext("test.feature", false, false, false, false, false, false);

      expect(findFeatureById).toHaveBeenCalledWith(mockFeatureList.features, "test.feature");
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("test.feature")
      );
    });

    it("should exit with error if specified feature not found", async () => {
      vi.mocked(findFeatureById).mockReturnValue(undefined);

      await expect(runNext("nonexistent.feature", false, false, false, false, false, false))
        .rejects.toThrow("process.exit called");

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("not found")
      );
    });

    it("should show success message when all features are passing", async () => {
      vi.mocked(selectNextFeature).mockReturnValue(null);

      await runNext(undefined, false, false, false, false, false, false);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("All features are passing")
      );
    });
  });

  describe("External memory sync", () => {
    it("should sync external memory before selecting feature", async () => {
      await runNext(undefined, false, false, false, false, false, false);

      // Should display external memory sync section
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("EXTERNAL MEMORY SYNC")
      );
    });

    it("should display current directory", async () => {
      await runNext(undefined, false, false, false, false, false, false);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("Current Directory")
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining(tempDir)
      );
    });

    it("should display recent git commits", async () => {
      await runNext(undefined, false, false, false, false, false, false);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("Recent Git Commits")
      );
    });

    it("should display recent progress entries", async () => {
      await runNext(undefined, false, false, false, false, false, false);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("Recent Progress")
      );
    });

    it("should display feature status summary", async () => {
      await runNext(undefined, false, false, false, false, false, false);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("Feature Status")
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("Passing: 5")
      );
    });
  });

  describe("TDD guidance", () => {
    it("should include TDD guidance when tddMode is recommended", async () => {
      await runNext(undefined, false, false, false, false, false, false);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("TDD GUIDANCE")
      );
    });

    it("should show enforcement warning when tddMode is strict", async () => {
      vi.mocked(loadFeatureList).mockResolvedValue({
        ...mockFeatureList,
        metadata: { ...mockFeatureList.metadata, tddMode: "strict" },
      });

      await runNext(undefined, false, false, false, false, false, false);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("TDD ENFORCEMENT ACTIVE")
      );
    });

    it("should display suggested test files", async () => {
      await runNext(undefined, false, false, false, false, false, false);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("Suggested Test Files")
      );
    });

    it("should cache TDD guidance when AI generates it", async () => {
      const aiGuidance = {
        forVersion: 1,
        generatedAt: "2024-01-01T00:00:00.000Z",
        generatedBy: "claude",
        suggestedTestFiles: mockTDDGuidance.suggestedTestFiles,
        unitTestCases: [{ name: "should work", assertions: ["expect(true).toBe(true)"] }],
        e2eScenarios: [],
      };
      vi.mocked(generateTDDGuidanceWithAI).mockResolvedValue(aiGuidance);

      await runNext(undefined, false, false, false, false, false, false);

      expect(saveFeatureList).toHaveBeenCalled();
    });
  });

  describe("JSON output support", () => {
    it("should support JSON output format with --json flag", async () => {
      await runNext(undefined, false, false, false, true, false, false);

      // Check that JSON was output
      const jsonCall = consoleLogSpy.mock.calls.find((call) => {
        try {
          JSON.parse(call[0] as string);
          return true;
        } catch {
          return false;
        }
      });

      expect(jsonCall).toBeDefined();
      const output = JSON.parse(jsonCall![0] as string);
      expect(output).toHaveProperty("feature");
      expect(output.feature.id).toBe("test.feature");
    });

    it("should include stats in JSON output", async () => {
      await runNext(undefined, false, false, false, true, false, false);

      const jsonCall = consoleLogSpy.mock.calls.find((call) => {
        try {
          JSON.parse(call[0] as string);
          return true;
        } catch {
          return false;
        }
      });

      const output = JSON.parse(jsonCall![0] as string);
      expect(output).toHaveProperty("stats");
      expect(output.stats.passing).toBe(5);
    });

    it("should include completion percentage in JSON output", async () => {
      await runNext(undefined, false, false, false, true, false, false);

      const jsonCall = consoleLogSpy.mock.calls.find((call) => {
        try {
          JSON.parse(call[0] as string);
          return true;
        } catch {
          return false;
        }
      });

      const output = JSON.parse(jsonCall![0] as string);
      expect(output).toHaveProperty("completion");
      expect(output.completion).toBe(28);
    });
  });

  describe("Quiet mode", () => {
    it("should display minimal output in quiet mode", async () => {
      await runNext(undefined, false, false, false, false, true, false);

      // Should not show external memory sync header
      const syncCall = consoleLogSpy.mock.calls.find((call) =>
        (call[0] as string).includes("EXTERNAL MEMORY SYNC")
      );
      expect(syncCall).toBeUndefined();

      // Should still show feature info
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("Feature: test.feature")
      );
    });
  });

  describe("Clean working directory check", () => {
    it("should exit if working directory has uncommitted changes", async () => {
      vi.mocked(hasUncommittedChanges).mockReturnValue(true);

      await expect(runNext(undefined, false, false, false, false, false, false))
        .rejects.toThrow("process.exit called");

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("not clean")
      );
    });

    it("should bypass clean check with --allow-dirty flag", async () => {
      vi.mocked(hasUncommittedChanges).mockReturnValue(true);

      await runNext(undefined, false, false, true, false, false, false);

      // Should not exit, should show feature
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("test.feature")
      );
    });

    it("should skip clean check if not a git repo", async () => {
      vi.mocked(isGitRepo).mockReturnValue(false);
      vi.mocked(hasUncommittedChanges).mockReturnValue(true);

      await runNext(undefined, false, false, false, false, false, false);

      // Should not exit, should show feature
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("test.feature")
      );
    });
  });

  describe("No feature list", () => {
    it("should exit with error if no feature list found", async () => {
      vi.mocked(loadFeatureList).mockResolvedValue(null);

      await expect(runNext(undefined, false, false, false, false, false, false))
        .rejects.toThrow("process.exit called");

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("No feature list found")
      );
    });

    it("should suggest running init if no feature list", async () => {
      vi.mocked(loadFeatureList).mockResolvedValue(null);

      await expect(runNext(undefined, false, false, false, false, false, false))
        .rejects.toThrow();

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("agent-foreman init")
      );
    });
  });

  describe("Feature display", () => {
    it("should display feature description", async () => {
      await runNext(undefined, false, false, false, false, false, false);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("Test feature description")
      );
    });

    it("should display acceptance criteria", async () => {
      await runNext(undefined, false, false, false, false, false, false);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("Acceptance Criteria")
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("Feature works correctly")
      );
    });

    it("should display dependencies if present", async () => {
      const featureWithDeps = {
        ...mockFeature,
        dependsOn: ["other.feature"],
      };
      vi.mocked(selectNextFeature).mockReturnValue(featureWithDeps);

      await runNext(undefined, false, false, false, false, false, false);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("Depends on")
      );
    });

    it("should display verification commands", async () => {
      await runNext(undefined, false, false, false, false, false, false);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("agent-foreman check")
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("agent-foreman done")
      );
    });
  });
});
