/**
 * Tests for analyze command - AI-powered project analysis
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as path from "node:path";

// Mock fs at the top level for ESM compatibility
vi.mock("node:fs/promises", () => ({
  mkdir: vi.fn().mockResolvedValue(undefined),
  writeFile: vi.fn().mockResolvedValue(undefined),
  rm: vi.fn().mockResolvedValue(undefined),
}));

// Mock the dependencies
vi.mock("../../src/ai-scanner.js", () => ({
  aiScanProject: vi.fn(),
  aiResultToSurvey: vi.fn(),
  generateAISurveyMarkdown: vi.fn(),
}));

vi.mock("../../src/agents.js", () => ({
  printAgentStatus: vi.fn(),
  getAgentPriorityString: vi.fn().mockReturnValue("claude > codex > gemini"),
}));

vi.mock("../../src/project-scanner.js", () => ({
  scanDirectoryStructure: vi.fn(),
}));

import * as fs from "node:fs/promises";
import { runAnalyze } from "../../src/commands/analyze.js";
import { aiScanProject, aiResultToSurvey, generateAISurveyMarkdown } from "../../src/ai-scanner.js";
import { scanDirectoryStructure } from "../../src/project-scanner.js";

describe("Analyze Command", () => {
  const mockAiResult = {
    success: true,
    agentUsed: "claude",
    techStack: {
      language: "TypeScript",
      framework: "Node.js",
      buildTool: "tsc",
      testFramework: "vitest",
      packageManager: "pnpm",
    },
    modules: [{ name: "core", path: "src/core", description: "Core logic", status: "complete" }],
    features: [{ id: "test.feature", description: "Test feature", module: "core", source: "code", confidence: 0.9 }],
    completion: { overall: 65, notes: ["Good progress"] },
    summary: "A test project",
    recommendations: ["Add more tests"],
  };

  const mockStructure = {
    entryPoints: ["src/index.ts"],
    srcDirs: ["src"],
    testDirs: ["tests"],
    configFiles: ["tsconfig.json"],
  };

  const mockSurvey = {
    techStack: mockAiResult.techStack,
    structure: mockStructure,
    modules: mockAiResult.modules,
    features: mockAiResult.features,
    completion: mockAiResult.completion,
    commands: { install: "pnpm install", dev: "pnpm dev", build: "pnpm build", test: "pnpm test" },
  };

  const mockMarkdown = "# Project Survey (AI-Enhanced)\n\nTest content";

  let consoleLogSpy: ReturnType<typeof vi.spyOn>;
  let processExitSpy: ReturnType<typeof vi.spyOn>;
  let processCwdSpy: ReturnType<typeof vi.spyOn>;
  const tempDir = "/tmp/analyze-test";

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
    vi.mocked(aiScanProject).mockResolvedValue(mockAiResult);
    vi.mocked(scanDirectoryStructure).mockResolvedValue(mockStructure);
    vi.mocked(aiResultToSurvey).mockReturnValue(mockSurvey);
    vi.mocked(generateAISurveyMarkdown).mockReturnValue(mockMarkdown);
  });

  afterEach(async () => {
    consoleLogSpy.mockRestore();
    processExitSpy.mockRestore();
    processCwdSpy.mockRestore();
  });

  describe("AI-powered analysis", () => {
    it("should generate AI-powered project analysis report", async () => {
      await runAnalyze("docs/ARCHITECTURE.md", false);

      expect(aiScanProject).toHaveBeenCalledWith(tempDir, { verbose: false });
      expect(scanDirectoryStructure).toHaveBeenCalledWith(tempDir);
      expect(aiResultToSurvey).toHaveBeenCalledWith(mockAiResult, mockStructure);
      expect(generateAISurveyMarkdown).toHaveBeenCalledWith(mockSurvey, mockAiResult);
    });

    it("should output analysis to specified path", async () => {
      await runAnalyze("docs/ARCHITECTURE.md", false);

      expect(fs.mkdir).toHaveBeenCalledWith(path.join(tempDir, "docs"), { recursive: true });
      expect(fs.writeFile).toHaveBeenCalledWith(
        path.join(tempDir, "docs/ARCHITECTURE.md"),
        mockMarkdown
      );
    });

    it("should include project structure in analysis", async () => {
      await runAnalyze("docs/ARCHITECTURE.md", false);

      expect(scanDirectoryStructure).toHaveBeenCalled();
      expect(aiResultToSurvey).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          entryPoints: expect.any(Array),
          srcDirs: expect.any(Array),
          testDirs: expect.any(Array),
        })
      );
    });

    it("should display tech stack information", async () => {
      await runAnalyze("docs/ARCHITECTURE.md", false);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("TypeScript/Node.js")
      );
    });

    it("should display module count", async () => {
      await runAnalyze("docs/ARCHITECTURE.md", false);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("Modules: 1")
      );
    });

    it("should display feature count", async () => {
      await runAnalyze("docs/ARCHITECTURE.md", false);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("Features: 1")
      );
    });

    it("should display completion percentage", async () => {
      await runAnalyze("docs/ARCHITECTURE.md", false);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("Completion: 65%")
      );
    });

    it("should display AI summary when available", async () => {
      await runAnalyze("docs/ARCHITECTURE.md", false);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("Summary:")
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("A test project")
      );
    });

    it("should display recommendations when available", async () => {
      await runAnalyze("docs/ARCHITECTURE.md", false);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("Recommendations:")
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("Add more tests")
      );
    });
  });

  describe("Verbose mode", () => {
    it("should print agent status in verbose mode", async () => {
      const { printAgentStatus } = await import("../../src/agents.js");

      await runAnalyze("docs/ARCHITECTURE.md", true);

      expect(printAgentStatus).toHaveBeenCalled();
    });

    it("should pass verbose flag to aiScanProject", async () => {
      await runAnalyze("docs/ARCHITECTURE.md", true);

      expect(aiScanProject).toHaveBeenCalledWith(tempDir, { verbose: true });
    });
  });

  describe("Error handling", () => {
    it("should handle missing AI provider gracefully", async () => {
      vi.mocked(aiScanProject).mockResolvedValue({
        success: false,
        error: "No AI agents available. Install gemini, codex, or claude CLI.",
      });

      await expect(runAnalyze("docs/ARCHITECTURE.md", false)).rejects.toThrow("process.exit called");

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("AI analysis failed")
      );
    });

    it("should exit with code 1 on AI failure", async () => {
      vi.mocked(aiScanProject).mockResolvedValue({
        success: false,
        error: "AI error",
      });

      await expect(runAnalyze("docs/ARCHITECTURE.md", false)).rejects.toThrow();

      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it("should show helpful message about installing AI CLI tools", async () => {
      vi.mocked(aiScanProject).mockResolvedValue({
        success: false,
        error: "No AI agents available",
      });

      await expect(runAnalyze("docs/ARCHITECTURE.md", false)).rejects.toThrow();

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("gemini, codex, or claude CLI")
      );
    });
  });

  describe("Output path handling", () => {
    it("should create parent directories if they don't exist", async () => {
      await runAnalyze("deep/nested/path/ARCHITECTURE.md", false);

      expect(fs.mkdir).toHaveBeenCalledWith(
        path.join(tempDir, "deep/nested/path"),
        { recursive: true }
      );
    });

    it("should handle root-level output path", async () => {
      await runAnalyze("ARCHITECTURE.md", false);

      expect(fs.mkdir).toHaveBeenCalledWith(tempDir, { recursive: true });
    });
  });

  describe("Agent reporting", () => {
    it("should display which agent was used", async () => {
      await runAnalyze("docs/ARCHITECTURE.md", false);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("agent: claude")
      );
    });

    it("should display agent priority string", async () => {
      await runAnalyze("docs/ARCHITECTURE.md", false);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("claude > codex > gemini")
      );
    });
  });
});
