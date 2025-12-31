/**
 * Tests for init command - Initialize or upgrade the long-task harness
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock node:fs/promises at the top level for ESM compatibility
vi.mock("node:fs/promises", () => ({
  mkdir: vi.fn().mockResolvedValue(undefined),
  writeFile: vi.fn().mockResolvedValue(undefined),
  readFile: vi.fn().mockRejectedValue(new Error("ENOENT")),
  chmod: vi.fn().mockResolvedValue(undefined),
  rm: vi.fn().mockResolvedValue(undefined),
}));

// Mock dependencies
vi.mock("../../src/git-utils.js", () => ({
  isGitRepo: vi.fn(),
  gitInit: vi.fn(),
}));

vi.mock("../../src/init-helpers.js", () => ({
  detectAndAnalyzeProject: vi.fn(),
  mergeOrCreateFeatures: vi.fn(),
  generateHarnessFiles: vi.fn(),
}));

vi.mock("../../src/feature-list.js", () => ({
  featureListExists: vi.fn(),
  loadFeatureList: vi.fn(),
}));

// Mock readline for TDD mode prompt
vi.mock("node:readline", () => ({
  createInterface: vi.fn().mockReturnValue({
    question: vi.fn((_query: string, callback: (answer: string) => void) => {
      // Default: simulate timeout behavior (auto-answer with empty string -> recommended)
      setTimeout(() => callback(""), 50);
    }),
    close: vi.fn(),
  }),
}));

import { runInit } from "../../src/commands/init.js";
import { isGitRepo, gitInit } from "../../src/git-utils.js";
import { detectAndAnalyzeProject, mergeOrCreateFeatures, generateHarnessFiles } from "../../src/init-helpers.js";
import { featureListExists, loadFeatureList } from "../../src/feature-list.js";

describe("Init Command", () => {
  const mockSurvey = {
    techStack: {
      language: "TypeScript",
      framework: "Node.js",
      buildTool: "tsc",
      testFramework: "vitest",
      packageManager: "npm",
    },
    structure: {
      entryPoints: ["src/index.ts"],
      srcDirs: ["src"],
      testDirs: ["tests"],
      configFiles: ["tsconfig.json"],
    },
    modules: [{ name: "core", path: "src/core", description: "Core logic", status: "complete" }],
    features: [
      { id: "test.feature", description: "Test feature", module: "core", source: "code", confidence: 0.9 },
    ],
    completion: { overall: 65, notes: ["Good progress"] },
    commands: { install: "npm install", dev: "npm run dev", build: "npm run build", test: "npm test" },
  };

  const mockFeatureList = {
    features: [
      {
        id: "test.feature",
        description: "Test feature",
        module: "core",
        priority: 1,
        status: "failing" as const,
        acceptance: ["Feature works as expected"],
        version: 1,
        origin: "init-auto" as const,
      },
    ],
    metadata: {
      projectGoal: "Test project",
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
      version: "1.0.0",
      tddMode: "recommended" as const,
    },
  };

  let consoleLogSpy: ReturnType<typeof vi.spyOn>;
  let processExitSpy: ReturnType<typeof vi.spyOn>;
  let processCwdSpy: ReturnType<typeof vi.spyOn>;
  const tempDir = "/tmp/init-test";

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

    // Setup default mock implementations - MUST BE IN beforeEach
    vi.mocked(isGitRepo).mockReturnValue(true);
    vi.mocked(gitInit).mockReturnValue({ success: true });
    vi.mocked(featureListExists).mockResolvedValue(false);
    vi.mocked(loadFeatureList).mockResolvedValue(null);

    vi.mocked(detectAndAnalyzeProject).mockResolvedValue({
      success: true,
      survey: mockSurvey,
      agentUsed: "claude",
    });

    vi.mocked(mergeOrCreateFeatures).mockResolvedValue(mockFeatureList);
    vi.mocked(generateHarnessFiles).mockResolvedValue(undefined);
  });

  afterEach(async () => {
    consoleLogSpy.mockRestore();
    processExitSpy.mockRestore();
    processCwdSpy.mockRestore();
  });

  describe("Initialization", () => {
    it("should initialize new harness with ai/ directory structure", async () => {
      await runInit("Test project goal", "new", false);

      expect(detectAndAnalyzeProject).toHaveBeenCalledWith(tempDir, "Test project goal", false);
      expect(mergeOrCreateFeatures).toHaveBeenCalled();
      expect(generateHarnessFiles).toHaveBeenCalled();
    });

    it("should perform AI analysis to discover project features", async () => {
      await runInit("Build a test app", "new", false);

      expect(detectAndAnalyzeProject).toHaveBeenCalledWith(tempDir, "Build a test app", false);
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("AI analysis successful")
      );
    });

    it("should set project goal in metadata", async () => {
      const goal = "Build a feature-rich application";
      await runInit(goal, "new", false);

      expect(mergeOrCreateFeatures).toHaveBeenCalledWith(
        tempDir,
        mockSurvey,
        goal,
        "new",
        false,
        expect.any(String) // tddMode
      );
    });

    it("should display success message when harness is initialized", async () => {
      await runInit("Test goal", "new", false);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("Harness initialized successfully")
      );
    });
  });

  describe("Git repository handling", () => {
    it("should initialize git if not a git repository", async () => {
      vi.mocked(isGitRepo).mockReturnValue(false);
      vi.mocked(gitInit).mockReturnValue({ success: true });

      await runInit("Test goal", "new", false);

      expect(gitInit).toHaveBeenCalledWith(tempDir);
    });

    it("should not initialize git if already a git repository", async () => {
      vi.mocked(isGitRepo).mockReturnValue(true);

      await runInit("Test goal", "new", false);

      expect(gitInit).not.toHaveBeenCalled();
    });

    it("should exit with error if git initialization fails", async () => {
      vi.mocked(isGitRepo).mockReturnValue(false);
      vi.mocked(gitInit).mockReturnValue({ success: false, error: "Git init failed" });

      await expect(runInit("Test goal", "new", false)).rejects.toThrow("process.exit called");

      expect(processExitSpy).toHaveBeenCalledWith(1);
    });
  });

  describe("AI analysis", () => {
    it("should exit with error if AI analysis fails", async () => {
      vi.mocked(detectAndAnalyzeProject).mockResolvedValue({
        success: false,
        error: "No AI agents available",
      });

      await expect(runInit("Test goal", "new", false)).rejects.toThrow("process.exit called");

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("AI analysis failed")
      );
    });

    it("should show helpful message about installing AI CLI tools", async () => {
      vi.mocked(detectAndAnalyzeProject).mockResolvedValue({
        success: false,
        error: "No AI agents available",
      });

      await expect(runInit("Test goal", "new", false)).rejects.toThrow();

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("gemini, codex, or claude CLI")
      );
    });

    it("should display which agent was used for analysis", async () => {
      await runInit("Test goal", "new", false);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("agent: claude")
      );
    });
  });

  describe("Init modes", () => {
    it("should handle new mode - replace all features", async () => {
      await runInit("Test goal", "new", false);

      expect(mergeOrCreateFeatures).toHaveBeenCalledWith(
        tempDir,
        mockSurvey,
        "Test goal",
        "new",
        false,
        expect.any(String)
      );
    });

    it("should handle merge mode - merge with existing features", async () => {
      await runInit("Test goal", "merge", false);

      expect(mergeOrCreateFeatures).toHaveBeenCalledWith(
        tempDir,
        mockSurvey,
        "Test goal",
        "merge",
        false,
        expect.any(String)
      );
    });

    it("should handle scan mode - scan only, don't modify", async () => {
      await runInit("Test goal", "scan", false);

      // In scan mode, tddMode should not be prompted (undefined)
      expect(mergeOrCreateFeatures).toHaveBeenCalledWith(
        tempDir,
        mockSurvey,
        "Test goal",
        "scan",
        false,
        undefined
      );
    });
  });

  describe("Existing feature list protection", () => {
    it("should warn when feature list already exists and mode is not new", async () => {
      vi.mocked(featureListExists).mockResolvedValue(true);
      vi.mocked(loadFeatureList).mockResolvedValue(mockFeatureList);

      await runInit("Test goal", "merge", false);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("Feature list already exists")
      );
    });

    it("should skip feature generation when list exists and mode is merge", async () => {
      vi.mocked(featureListExists).mockResolvedValue(true);
      vi.mocked(loadFeatureList).mockResolvedValue(mockFeatureList);

      await runInit("Test goal", "merge", false);

      // Should load existing list instead of generating new
      expect(loadFeatureList).toHaveBeenCalledWith(tempDir);
    });

    it("should force regeneration when mode is new even if list exists", async () => {
      vi.mocked(featureListExists).mockResolvedValue(true);

      await runInit("Test goal", "new", false);

      // In new mode, mergeOrCreateFeatures should be called regardless
      expect(mergeOrCreateFeatures).toHaveBeenCalled();
    });
  });

  describe("TDD mode selection", () => {
    it("should allow TDD mode selection during initialization", async () => {
      await runInit("Test goal", "new", false);

      // TDD mode should be passed to mergeOrCreateFeatures
      expect(mergeOrCreateFeatures).toHaveBeenCalledWith(
        tempDir,
        mockSurvey,
        "Test goal",
        "new",
        false,
        expect.stringMatching(/strict|recommended|disabled/)
      );
    });

    it("should not prompt for TDD mode in scan mode", async () => {
      await runInit("Test goal", "scan", false);

      // tddMode should be undefined in scan mode
      expect(mergeOrCreateFeatures).toHaveBeenCalledWith(
        tempDir,
        mockSurvey,
        "Test goal",
        "scan",
        false,
        undefined
      );
    });

    it("should show strict TDD mode reminder when enabled", async () => {
      // Mock readline to return "y" for strict mode
      const readline = await import("node:readline");
      vi.mocked(readline.createInterface).mockReturnValue({
        question: vi.fn((_query: string, callback: (answer: string) => void) => {
          callback("y");
        }),
        close: vi.fn(),
      } as ReturnType<typeof readline.createInterface>);

      await runInit("Test goal", "new", false);

      // Verify strict mode message was shown
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("STRICT TDD MODE ENABLED")
      );
    });
  });

  describe("Verbose mode", () => {
    it("should show feature count in verbose mode", async () => {
      await runInit("Test goal", "new", true);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("Found 1 features")
      );
    });

    it("should pass verbose flag to detectAndAnalyzeProject", async () => {
      await runInit("Test goal", "new", true);

      expect(detectAndAnalyzeProject).toHaveBeenCalledWith(tempDir, "Test goal", true);
    });
  });

  describe("Harness file generation", () => {
    it("should generate harness files", async () => {
      await runInit("Test goal", "new", false);

      expect(generateHarnessFiles).toHaveBeenCalledWith(
        tempDir,
        mockSurvey,
        mockFeatureList,
        "Test goal",
        "new"
      );
    });

    it("should suggest next steps after initialization", async () => {
      await runInit("Test goal", "new", false);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("agent-foreman next")
      );
    });
  });

  describe("Upgrade existing harness", () => {
    it("should preserve existing features during upgrade", async () => {
      vi.mocked(featureListExists).mockResolvedValue(true);
      vi.mocked(loadFeatureList).mockResolvedValue({
        ...mockFeatureList,
        features: [
          ...mockFeatureList.features,
          {
            id: "existing.feature",
            description: "Existing feature",
            module: "core",
            priority: 1,
            status: "passing" as const,
            acceptance: ["Works"],
            version: 1,
            origin: "manual" as const,
          },
        ],
      });

      await runInit("Updated goal", "merge", false);

      // Should load existing list
      expect(loadFeatureList).toHaveBeenCalled();
    });
  });
});
