/**
 * Tests for status command - Show current harness status
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock dependencies
vi.mock("../../src/feature-list.js", () => ({
  loadFeatureList: vi.fn(),
  selectNextFeature: vi.fn(),
  getFeatureStats: vi.fn(),
  getCompletionPercentage: vi.fn(),
}));

vi.mock("../../src/progress-log.js", () => ({
  getRecentEntries: vi.fn(),
}));

import { runStatus } from "../../src/commands/status.js";
import {
  loadFeatureList,
  selectNextFeature,
  getFeatureStats,
  getCompletionPercentage,
} from "../../src/feature-list.js";
import { getRecentEntries } from "../../src/progress-log.js";

describe("Status Command", () => {
  const mockFeature = {
    id: "test.feature",
    description: "Test feature description",
    module: "test",
    priority: 1,
    status: "failing" as const,
    acceptance: ["Feature works correctly"],
    dependsOn: [] as string[],
    version: 1,
    origin: "init-auto" as const,
  };

  const mockFeatureList = {
    features: [mockFeature],
    metadata: {
      projectGoal: "Build a test application",
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-15T12:00:00.000Z",
      version: "1.0.0",
      tddMode: "recommended" as const,
    },
  };

  const mockStats = {
    passing: 5,
    failing: 10,
    blocked: 2,
    needs_review: 1,
    deprecated: 0,
    failed: 3,
  };

  const mockRecentEntries = [
    { type: "STEP", timestamp: "2024-01-15T10:00:00Z", summary: "Completed auth.login", feature: "auth.login" },
    { type: "STEP", timestamp: "2024-01-14T15:00:00Z", summary: "Completed setup", feature: "setup" },
    { type: "INIT", timestamp: "2024-01-14T09:00:00Z", summary: "Initialized project", feature: "" },
  ];

  let consoleLogSpy: ReturnType<typeof vi.spyOn>;
  let processCwdSpy: ReturnType<typeof vi.spyOn>;
  const tempDir = "/tmp/status-test";

  beforeEach(async () => {
    vi.clearAllMocks();

    // Mock console.log
    consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    // Mock process.cwd
    processCwdSpy = vi.spyOn(process, "cwd").mockReturnValue(tempDir);

    // Setup default mock implementations
    vi.mocked(loadFeatureList).mockResolvedValue(mockFeatureList);
    vi.mocked(selectNextFeature).mockReturnValue(mockFeature);
    vi.mocked(getFeatureStats).mockReturnValue(mockStats);
    vi.mocked(getCompletionPercentage).mockReturnValue(25);
    vi.mocked(getRecentEntries).mockResolvedValue(mockRecentEntries);
  });

  afterEach(async () => {
    consoleLogSpy.mockRestore();
    processCwdSpy.mockRestore();
  });

  describe("Feature statistics", () => {
    it("should display feature statistics (passing, failing, blocked counts)", async () => {
      await runStatus(false, false);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("Passing: 5")
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("Failing: 10")
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("Blocked: 2")
      );
    });

    it("should display needs review count", async () => {
      await runStatus(false, false);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("Needs Review: 1")
      );
    });

    it("should display failed count", async () => {
      await runStatus(false, false);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("Failed: 3")
      );
    });

    it("should display deprecated count", async () => {
      await runStatus(false, false);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("Deprecated: 0")
      );
    });
  });

  describe("Progress bar", () => {
    it("should render progress bar showing completion percentage", async () => {
      await runStatus(false, false);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("Completion:")
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("25%")
      );
    });

    it("should display progress bar with filled and empty sections", async () => {
      await runStatus(false, false);

      // Should have a call containing the progress bar structure
      const progressCall = consoleLogSpy.mock.calls.find((call) =>
        (call[0] as string).includes("Completion:")
      );
      expect(progressCall).toBeDefined();
    });
  });

  describe("Recent activity", () => {
    it("should show recent activity from progress log", async () => {
      await runStatus(false, false);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("Recent Activity")
      );
    });

    it("should display activity entries with type and summary", async () => {
      await runStatus(false, false);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("[STEP]")
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("Completed auth.login")
      );
    });

    it("should display INIT type entries", async () => {
      await runStatus(false, false);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("[INIT]")
      );
    });
  });

  describe("Project goal", () => {
    it("should display project goal", async () => {
      await runStatus(false, false);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("Build a test application")
      );
    });

    it("should display last updated timestamp", async () => {
      await runStatus(false, false);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("Last updated:")
      );
    });
  });

  describe("Next feature", () => {
    it("should display current working feature if one is in progress", async () => {
      await runStatus(false, false);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("Next Up")
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("test.feature")
      );
    });

    it("should not show next feature section if no features pending", async () => {
      vi.mocked(selectNextFeature).mockReturnValue(null);

      await runStatus(false, false);

      const nextUpCall = consoleLogSpy.mock.calls.find((call) =>
        (call[0] as string).includes("Next Up")
      );
      expect(nextUpCall).toBeUndefined();
    });
  });

  describe("No feature list", () => {
    it("should handle empty feature list gracefully", async () => {
      vi.mocked(loadFeatureList).mockResolvedValue(null);

      await runStatus(false, false);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("No feature list found")
      );
    });

    it("should suggest running init if no feature list", async () => {
      vi.mocked(loadFeatureList).mockResolvedValue(null);

      await runStatus(false, false);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("agent-foreman init")
      );
    });
  });

  describe("JSON output mode", () => {
    it("should output valid JSON when --json flag is set", async () => {
      await runStatus(true, false);

      const jsonCall = consoleLogSpy.mock.calls.find((call) => {
        try {
          JSON.parse(call[0] as string);
          return true;
        } catch {
          return false;
        }
      });

      expect(jsonCall).toBeDefined();
    });

    it("should include stats in JSON output", async () => {
      await runStatus(true, false);

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
      expect(output.stats.failing).toBe(10);
    });

    it("should include completion in JSON output", async () => {
      await runStatus(true, false);

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
      expect(output.completion).toBe(25);
    });

    it("should include recent activity in JSON output", async () => {
      await runStatus(true, false);

      const jsonCall = consoleLogSpy.mock.calls.find((call) => {
        try {
          JSON.parse(call[0] as string);
          return true;
        } catch {
          return false;
        }
      });

      const output = JSON.parse(jsonCall![0] as string);
      expect(output).toHaveProperty("recentActivity");
      expect(output.recentActivity).toHaveLength(3);
    });

    it("should include next feature in JSON output", async () => {
      await runStatus(true, false);

      const jsonCall = consoleLogSpy.mock.calls.find((call) => {
        try {
          JSON.parse(call[0] as string);
          return true;
        } catch {
          return false;
        }
      });

      const output = JSON.parse(jsonCall![0] as string);
      expect(output).toHaveProperty("nextFeature");
      expect(output.nextFeature.id).toBe("test.feature");
    });

    it("should return error in JSON when no feature list", async () => {
      vi.mocked(loadFeatureList).mockResolvedValue(null);

      await runStatus(true, false);

      const jsonCall = consoleLogSpy.mock.calls.find((call) => {
        try {
          JSON.parse(call[0] as string);
          return true;
        } catch {
          return false;
        }
      });

      const output = JSON.parse(jsonCall![0] as string);
      expect(output).toHaveProperty("error");
      expect(output.error).toContain("No feature list");
    });
  });

  describe("Quiet mode", () => {
    it("should display minimal output in quiet mode", async () => {
      await runStatus(false, true);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("25% complete")
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("5/")
      );
    });

    it("should show next feature ID in quiet mode", async () => {
      await runStatus(false, true);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("Next: test.feature")
      );
    });

    it("should not show progress bar in quiet mode", async () => {
      await runStatus(false, true);

      const progressBarCall = consoleLogSpy.mock.calls.find((call) =>
        (call[0] as string).includes("█")
      );
      expect(progressBarCall).toBeUndefined();
    });

    it("should not show recent activity in quiet mode", async () => {
      await runStatus(false, true);

      const activityCall = consoleLogSpy.mock.calls.find((call) =>
        (call[0] as string).includes("Recent Activity")
      );
      expect(activityCall).toBeUndefined();
    });
  });
});
