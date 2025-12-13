/**
 * Tests for task impact detection
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  testPatternToSourcePath,
  getTaskImpact,
  buildFileTaskIndex,
} from "../../src/verifier/task-impact.js";
import type { Feature } from "../../src/types.js";

// Mock the feature-list module
vi.mock("../../src/feature-list.js", () => ({
  loadFeatureList: vi.fn(),
}));

describe("task-impact", () => {
  describe("testPatternToSourcePath", () => {
    it("should convert tests/ prefix to src/", () => {
      const result = testPatternToSourcePath("tests/auth/login.test.ts");
      expect(result).toBe("src/auth/login.ts");
    });

    it("should convert test/ prefix to src/", () => {
      const result = testPatternToSourcePath("test/utils/helper.test.ts");
      expect(result).toBe("src/utils/helper.ts");
    });

    it("should convert __tests__/ prefix to src/", () => {
      const result = testPatternToSourcePath("__tests__/core/feature.test.ts");
      expect(result).toBe("src/core/feature.ts");
    });

    it("should convert spec/ prefix to src/", () => {
      const result = testPatternToSourcePath("spec/module/service.spec.ts");
      expect(result).toBe("src/module/service.ts");
    });

    it("should handle .spec.ts suffix", () => {
      const result = testPatternToSourcePath("tests/auth/login.spec.ts");
      expect(result).toBe("src/auth/login.ts");
    });

    it("should handle glob patterns with .test.*", () => {
      const result = testPatternToSourcePath("tests/auth/**/*.test.*");
      expect(result).toBe("src/auth/**/*.*");
    });

    it("should handle .tsx files", () => {
      const result = testPatternToSourcePath("tests/components/Button.test.tsx");
      expect(result).toBe("src/components/Button.tsx");
    });

    it("should handle .js files", () => {
      const result = testPatternToSourcePath("tests/utils/format.test.js");
      expect(result).toBe("src/utils/format.js");
    });

    it("should handle patterns without test prefix", () => {
      const result = testPatternToSourcePath("auth/login.test.ts");
      expect(result).toBe("src/auth/login.ts");
    });

    it("should handle .spec.js suffix", () => {
      const result = testPatternToSourcePath("tests/utils/format.spec.js");
      expect(result).toBe("src/utils/format.js");
    });

    it("should handle .spec.tsx suffix", () => {
      const result = testPatternToSourcePath("tests/components/Button.spec.tsx");
      expect(result).toBe("src/components/Button.tsx");
    });

    it("should handle .spec.* glob pattern", () => {
      const result = testPatternToSourcePath("tests/auth/**/*.spec.*");
      expect(result).toBe("src/auth/**/*.*");
    });
  });

  describe("getTaskImpact", () => {
    beforeEach(() => {
      vi.resetAllMocks();
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("should return empty array when no feature list exists", async () => {
      const { loadFeatureList } = await import("../../src/feature-list.js");
      vi.mocked(loadFeatureList).mockResolvedValue(null);

      const result = await getTaskImpact("/test", ["src/auth/login.ts"]);
      expect(result).toEqual([]);
    });

    it("should return empty array when feature list is empty", async () => {
      const { loadFeatureList } = await import("../../src/feature-list.js");
      vi.mocked(loadFeatureList).mockResolvedValue({
        features: [],
        metadata: {
          projectGoal: "test",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          version: "1.0.0",
        },
      });

      const result = await getTaskImpact("/test", ["src/auth/login.ts"]);
      expect(result).toEqual([]);
    });

    it("should skip passing tasks", async () => {
      const { loadFeatureList } = await import("../../src/feature-list.js");
      vi.mocked(loadFeatureList).mockResolvedValue({
        features: [
          {
            id: "auth.login",
            description: "Login feature",
            module: "auth",
            priority: 1,
            status: "passing",
            acceptance: [],
            dependsOn: [],
            supersedes: [],
            tags: [],
            notes: "",
            version: 1,
            origin: "manual",
            affectedBy: ["src/auth/**/*"],
          } as Feature,
        ],
        metadata: {
          projectGoal: "test",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          version: "1.0.0",
        },
      });

      const result = await getTaskImpact("/test", ["src/auth/login.ts"]);
      expect(result).toEqual([]);
    });

    it("should skip deprecated tasks", async () => {
      const { loadFeatureList } = await import("../../src/feature-list.js");
      vi.mocked(loadFeatureList).mockResolvedValue({
        features: [
          {
            id: "auth.login",
            description: "Login feature",
            module: "auth",
            priority: 1,
            status: "deprecated",
            acceptance: [],
            dependsOn: [],
            supersedes: [],
            tags: [],
            notes: "",
            version: 1,
            origin: "manual",
            affectedBy: ["src/auth/**/*"],
          } as Feature,
        ],
        metadata: {
          projectGoal: "test",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          version: "1.0.0",
        },
      });

      const result = await getTaskImpact("/test", ["src/auth/login.ts"]);
      expect(result).toEqual([]);
    });

    it("should match tasks using affectedBy patterns (high confidence)", async () => {
      const { loadFeatureList } = await import("../../src/feature-list.js");
      vi.mocked(loadFeatureList).mockResolvedValue({
        features: [
          {
            id: "auth.login",
            description: "Login feature",
            module: "auth",
            priority: 1,
            status: "failing",
            acceptance: [],
            dependsOn: [],
            supersedes: [],
            tags: [],
            notes: "",
            version: 1,
            origin: "manual",
            affectedBy: ["src/auth/**/*"],
          } as Feature,
        ],
        metadata: {
          projectGoal: "test",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          version: "1.0.0",
        },
      });

      const result = await getTaskImpact("/test", ["src/auth/login.ts"]);
      expect(result).toHaveLength(1);
      expect(result[0].taskId).toBe("auth.login");
      expect(result[0].confidence).toBe("high");
      expect(result[0].reason).toContain("affectedBy");
      expect(result[0].matchedFiles).toContain("src/auth/login.ts");
    });

    it("should match tasks using test patterns (medium confidence)", async () => {
      const { loadFeatureList } = await import("../../src/feature-list.js");
      vi.mocked(loadFeatureList).mockResolvedValue({
        features: [
          {
            id: "auth.login",
            description: "Login feature",
            module: "auth",
            priority: 1,
            status: "failing",
            acceptance: [],
            dependsOn: [],
            supersedes: [],
            tags: [],
            notes: "",
            version: 1,
            origin: "manual",
            testRequirements: {
              unit: {
                required: false,
                pattern: "tests/auth/**/*.test.ts",
              },
            },
          } as Feature,
        ],
        metadata: {
          projectGoal: "test",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          version: "1.0.0",
        },
      });

      const result = await getTaskImpact("/test", ["src/auth/login.ts"]);
      expect(result).toHaveLength(1);
      expect(result[0].taskId).toBe("auth.login");
      expect(result[0].confidence).toBe("medium");
      expect(result[0].reason).toContain("test pattern");
    });

    it("should match tasks using module name (low confidence)", async () => {
      const { loadFeatureList } = await import("../../src/feature-list.js");
      vi.mocked(loadFeatureList).mockResolvedValue({
        features: [
          {
            id: "auth.login",
            description: "Login feature",
            module: "auth",
            priority: 1,
            status: "failing",
            acceptance: [],
            dependsOn: [],
            supersedes: [],
            tags: [],
            notes: "",
            version: 1,
            origin: "manual",
          } as Feature,
        ],
        metadata: {
          projectGoal: "test",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          version: "1.0.0",
        },
      });

      const result = await getTaskImpact("/test", ["src/auth/login.ts"]);
      expect(result).toHaveLength(1);
      expect(result[0].taskId).toBe("auth.login");
      expect(result[0].confidence).toBe("low");
      expect(result[0].reason).toContain("module");
    });

    it("should sort results by confidence (high → medium → low)", async () => {
      const { loadFeatureList } = await import("../../src/feature-list.js");
      vi.mocked(loadFeatureList).mockResolvedValue({
        features: [
          {
            id: "low.feature",
            description: "Low confidence feature",
            module: "auth",
            priority: 1,
            status: "failing",
            acceptance: [],
            dependsOn: [],
            supersedes: [],
            tags: [],
            notes: "",
            version: 1,
            origin: "manual",
          } as Feature,
          {
            id: "high.feature",
            description: "High confidence feature",
            module: "other",
            priority: 1,
            status: "failing",
            acceptance: [],
            dependsOn: [],
            supersedes: [],
            tags: [],
            notes: "",
            version: 1,
            origin: "manual",
            affectedBy: ["src/auth/**/*"],
          } as Feature,
          {
            id: "medium.feature",
            description: "Medium confidence feature",
            module: "other",
            priority: 1,
            status: "failing",
            acceptance: [],
            dependsOn: [],
            supersedes: [],
            tags: [],
            notes: "",
            version: 1,
            origin: "manual",
            testRequirements: {
              unit: {
                required: false,
                pattern: "tests/utils/**/*.test.ts",
              },
            },
          } as Feature,
        ],
        metadata: {
          projectGoal: "test",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          version: "1.0.0",
        },
      });

      const result = await getTaskImpact("/test", ["src/auth/login.ts", "src/utils/helper.ts"]);
      expect(result.length).toBeGreaterThanOrEqual(2);
      // First should be high confidence
      expect(result[0].confidence).toBe("high");
    });

    it("should not duplicate tasks when matched by multiple strategies", async () => {
      const { loadFeatureList } = await import("../../src/feature-list.js");
      vi.mocked(loadFeatureList).mockResolvedValue({
        features: [
          {
            id: "auth.login",
            description: "Login feature",
            module: "auth",
            priority: 1,
            status: "failing",
            acceptance: [],
            dependsOn: [],
            supersedes: [],
            tags: [],
            notes: "",
            version: 1,
            origin: "manual",
            affectedBy: ["src/auth/**/*"],
            testRequirements: {
              unit: {
                required: false,
                pattern: "tests/auth/**/*.test.ts",
              },
            },
          } as Feature,
        ],
        metadata: {
          projectGoal: "test",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          version: "1.0.0",
        },
      });

      const result = await getTaskImpact("/test", ["src/auth/login.ts"]);
      expect(result).toHaveLength(1);
      // Should use highest confidence match (affectedBy)
      expect(result[0].confidence).toBe("high");
    });

    it("should handle needs_review status tasks", async () => {
      const { loadFeatureList } = await import("../../src/feature-list.js");
      vi.mocked(loadFeatureList).mockResolvedValue({
        features: [
          {
            id: "auth.login",
            description: "Login feature",
            module: "auth",
            priority: 1,
            status: "needs_review",
            acceptance: [],
            dependsOn: [],
            supersedes: [],
            tags: [],
            notes: "",
            version: 1,
            origin: "manual",
            affectedBy: ["src/auth/**/*"],
          } as Feature,
        ],
        metadata: {
          projectGoal: "test",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          version: "1.0.0",
        },
      });

      const result = await getTaskImpact("/test", ["src/auth/login.ts"]);
      expect(result).toHaveLength(1);
      expect(result[0].taskId).toBe("auth.login");
    });
  });

  describe("buildFileTaskIndex", () => {
    it("should build index from affectedBy patterns", () => {
      const tasks: Feature[] = [
        {
          id: "auth.login",
          description: "Login feature",
          module: "auth",
          priority: 1,
          status: "failing",
          acceptance: [],
          dependsOn: [],
          supersedes: [],
          tags: [],
          notes: "",
          version: 1,
          origin: "manual",
          affectedBy: ["src/auth/**/*"],
        },
      ];

      const index = buildFileTaskIndex(tasks);
      expect(index.has("src/auth/**/*")).toBe(true);
      expect(index.get("src/auth/**/*")?.has("auth.login")).toBe(true);
    });

    it("should build index from test patterns", () => {
      const tasks: Feature[] = [
        {
          id: "auth.login",
          description: "Login feature",
          module: "auth",
          priority: 1,
          status: "failing",
          acceptance: [],
          dependsOn: [],
          supersedes: [],
          tags: [],
          notes: "",
          version: 1,
          origin: "manual",
          testRequirements: {
            unit: {
              required: false,
              pattern: "tests/auth/**/*.test.ts",
            },
          },
        },
      ];

      const index = buildFileTaskIndex(tasks);
      expect(index.has("src/auth/**/*.ts")).toBe(true);
      expect(index.get("src/auth/**/*.ts")?.has("auth.login")).toBe(true);
    });

    it("should build index from module names", () => {
      const tasks: Feature[] = [
        {
          id: "auth.login",
          description: "Login feature",
          module: "auth",
          priority: 1,
          status: "failing",
          acceptance: [],
          dependsOn: [],
          supersedes: [],
          tags: [],
          notes: "",
          version: 1,
          origin: "manual",
        },
      ];

      const index = buildFileTaskIndex(tasks);
      expect(index.has("**/auth/**/*")).toBe(true);
      expect(index.get("**/auth/**/*")?.has("auth.login")).toBe(true);
    });

    it("should handle multiple tasks with same pattern", () => {
      const tasks: Feature[] = [
        {
          id: "auth.login",
          description: "Login feature",
          module: "auth",
          priority: 1,
          status: "failing",
          acceptance: [],
          dependsOn: [],
          supersedes: [],
          tags: [],
          notes: "",
          version: 1,
          origin: "manual",
          affectedBy: ["src/auth/**/*"],
        },
        {
          id: "auth.logout",
          description: "Logout feature",
          module: "auth",
          priority: 2,
          status: "failing",
          acceptance: [],
          dependsOn: [],
          supersedes: [],
          tags: [],
          notes: "",
          version: 1,
          origin: "manual",
          affectedBy: ["src/auth/**/*"],
        },
      ];

      const index = buildFileTaskIndex(tasks);
      expect(index.get("src/auth/**/*")?.size).toBe(2);
      expect(index.get("src/auth/**/*")?.has("auth.login")).toBe(true);
      expect(index.get("src/auth/**/*")?.has("auth.logout")).toBe(true);
    });

    it("should return empty map for empty tasks array", () => {
      const index = buildFileTaskIndex([]);
      expect(index.size).toBe(0);
    });

    it("should collect all patterns from a task", () => {
      const tasks: Feature[] = [
        {
          id: "auth.login",
          description: "Login feature",
          module: "auth",
          priority: 1,
          status: "failing",
          acceptance: [],
          dependsOn: [],
          supersedes: [],
          tags: [],
          notes: "",
          version: 1,
          origin: "manual",
          affectedBy: ["src/auth/**/*", "src/utils/session.ts"],
          testRequirements: {
            unit: {
              required: false,
              pattern: "tests/auth/**/*.test.ts",
            },
          },
        },
      ];

      const index = buildFileTaskIndex(tasks);
      // Should have: 2 affectedBy + 1 testPattern + 1 module = 4 patterns
      expect(index.size).toBe(4);
      expect(index.has("src/auth/**/*")).toBe(true);
      expect(index.has("src/utils/session.ts")).toBe(true);
      expect(index.has("src/auth/**/*.ts")).toBe(true);
      expect(index.has("**/auth/**/*")).toBe(true);
    });
  });
});
