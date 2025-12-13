/**
 * Tests for git operations in verification
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getGitDiffForFeature, getGitCommitHash } from "../../src/verifier/git-operations.js";

// Mock child_process exec
vi.mock("node:child_process", () => ({
  exec: vi.fn(),
}));

// Mock promisify to return our mocked exec
vi.mock("node:util", async () => {
  const actual = await vi.importActual("node:util");
  return {
    ...actual,
    promisify: vi.fn((fn) => {
      // Return a function that calls our mocked exec
      return async (...args: unknown[]) => {
        return new Promise((resolve, reject) => {
          const callback = (error: Error | null, result: { stdout: string; stderr: string }) => {
            if (error) reject(error);
            else resolve(result);
          };
          fn(...args, callback);
        });
      };
    }),
  };
});

describe("git-operations", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("getGitDiffForFeature", () => {
    it("should return diff, files, and commit hash successfully", async () => {
      const { exec } = await import("node:child_process");
      const mockExec = exec as unknown as ReturnType<typeof vi.fn>;

      let callCount = 0;
      mockExec.mockImplementation(
        (
          cmd: string,
          _opts: unknown,
          callback: (error: Error | null, result: { stdout: string; stderr: string }) => void
        ) => {
          callCount++;
          if (cmd.includes("rev-parse HEAD")) {
            callback(null, { stdout: "abc123def\n", stderr: "" });
          } else if (cmd.includes("--name-only")) {
            callback(null, { stdout: "src/index.ts\nsrc/utils.ts\n", stderr: "" });
          } else if (cmd.includes("git diff")) {
            callback(null, { stdout: "diff --git a/src/index.ts\n+new line", stderr: "" });
          }
        }
      );

      const result = await getGitDiffForFeature("/test");

      expect(result.commitHash).toBe("abc123def");
      expect(result.files).toContain("src/index.ts");
      expect(result.files).toContain("src/utils.ts");
      expect(result.diff).toContain("diff --git");
    });

    it("should handle empty diff output", async () => {
      const { exec } = await import("node:child_process");
      const mockExec = exec as unknown as ReturnType<typeof vi.fn>;

      mockExec.mockImplementation(
        (
          cmd: string,
          _opts: unknown,
          callback: (error: Error | null, result: { stdout: string; stderr: string }) => void
        ) => {
          if (cmd.includes("rev-parse HEAD")) {
            callback(null, { stdout: "abc123\n", stderr: "" });
          } else if (cmd.includes("--name-only")) {
            callback(null, { stdout: "\n", stderr: "" });
          } else {
            callback(null, { stdout: "", stderr: "" });
          }
        }
      );

      const result = await getGitDiffForFeature("/test");

      expect(result.diff).toBe("No changes detected");
      expect(result.files).toEqual([]);
    });

    it("should fallback to HEAD diff when HEAD~1 fails", async () => {
      const { exec } = await import("node:child_process");
      const mockExec = exec as unknown as ReturnType<typeof vi.fn>;

      let firstCall = true;
      mockExec.mockImplementation(
        (
          cmd: string,
          _opts: unknown,
          callback: (error: Error | null, result: { stdout: string; stderr: string }) => void
        ) => {
          if (cmd.includes("HEAD~1") && firstCall) {
            firstCall = false;
            callback(new Error("fatal: ambiguous argument 'HEAD~1'"), { stdout: "", stderr: "" });
          } else if (cmd.includes("rev-parse HEAD")) {
            callback(null, { stdout: "fallback123\n", stderr: "" });
          } else if (cmd.includes("--name-only")) {
            callback(null, { stdout: "src/file.ts\n", stderr: "" });
          } else {
            callback(null, { stdout: "fallback diff", stderr: "" });
          }
        }
      );

      const result = await getGitDiffForFeature("/test");

      expect(result.commitHash).toBe("fallback123");
      expect(result.diff).toBe("fallback diff");
    });

    it("should return error message when all git commands fail", async () => {
      const { exec } = await import("node:child_process");
      const mockExec = exec as unknown as ReturnType<typeof vi.fn>;

      mockExec.mockImplementation(
        (
          _cmd: string,
          _opts: unknown,
          callback: (error: Error | null, result: { stdout: string; stderr: string }) => void
        ) => {
          callback(new Error("git not found"), { stdout: "", stderr: "" });
        }
      );

      const result = await getGitDiffForFeature("/test");

      expect(result.diff).toBe("Unable to get git diff");
      expect(result.files).toEqual([]);
      expect(result.commitHash).toBe("unknown");
    });

    it("should deduplicate files from combined diffs", async () => {
      const { exec } = await import("node:child_process");
      const mockExec = exec as unknown as ReturnType<typeof vi.fn>;

      mockExec.mockImplementation(
        (
          cmd: string,
          _opts: unknown,
          callback: (error: Error | null, result: { stdout: string; stderr: string }) => void
        ) => {
          if (cmd.includes("rev-parse HEAD")) {
            callback(null, { stdout: "abc123\n", stderr: "" });
          } else if (cmd.includes("--name-only")) {
            // Same file appears in both HEAD~1..HEAD and HEAD diffs
            callback(null, { stdout: "src/index.ts\nsrc/index.ts\nsrc/other.ts\n", stderr: "" });
          } else {
            callback(null, { stdout: "diff content", stderr: "" });
          }
        }
      );

      const result = await getGitDiffForFeature("/test");

      // Should be deduplicated
      expect(result.files.filter((f) => f === "src/index.ts").length).toBe(1);
      expect(result.files).toContain("src/other.ts");
    });
  });

  describe("getGitCommitHash", () => {
    it("should return commit hash successfully", async () => {
      const { exec } = await import("node:child_process");
      const mockExec = exec as unknown as ReturnType<typeof vi.fn>;

      mockExec.mockImplementation(
        (
          _cmd: string,
          _opts: unknown,
          callback: (error: Error | null, result: { stdout: string; stderr: string }) => void
        ) => {
          callback(null, { stdout: "abc123def456\n", stderr: "" });
        }
      );

      const result = await getGitCommitHash("/test");

      expect(result).toBe("abc123def456");
    });

    it("should return 'unknown' when git command fails", async () => {
      const { exec } = await import("node:child_process");
      const mockExec = exec as unknown as ReturnType<typeof vi.fn>;

      mockExec.mockImplementation(
        (
          _cmd: string,
          _opts: unknown,
          callback: (error: Error | null, result: { stdout: string; stderr: string }) => void
        ) => {
          callback(new Error("not a git repository"), { stdout: "", stderr: "" });
        }
      );

      const result = await getGitCommitHash("/test");

      expect(result).toBe("unknown");
    });

    it("should trim whitespace from commit hash", async () => {
      const { exec } = await import("node:child_process");
      const mockExec = exec as unknown as ReturnType<typeof vi.fn>;

      mockExec.mockImplementation(
        (
          _cmd: string,
          _opts: unknown,
          callback: (error: Error | null, result: { stdout: string; stderr: string }) => void
        ) => {
          callback(null, { stdout: "  abc123  \n\n", stderr: "" });
        }
      );

      const result = await getGitCommitHash("/test");

      expect(result).toBe("abc123");
    });
  });
});
