/**
 * Tests for gitignore generator module
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";

import {
  CONFIG_TO_TEMPLATE,
  LANGUAGE_TO_TEMPLATE,
  MINIMAL_GITIGNORE,
  detectTemplatesFromConfigFiles,
  detectTemplatesFromLanguages,
  getTemplate,
  generateGitignoreContent,
  generateGitignore,
  ensureMinimalGitignore,
  ensureComprehensiveGitignore,
} from "../../src/gitignore/generator.js";

import {
  getBundledTemplate,
  BUNDLED_TEMPLATES,
  isBundledTemplate,
} from "../../src/gitignore/bundled-templates.js";

// ============================================================================
// Test Setup
// ============================================================================

let tempDir: string;

function createTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "gitignore-test-"));
}

function cleanup(dir: string): void {
  try {
    fs.rmSync(dir, { recursive: true, force: true });
  } catch {
    // Ignore cleanup errors
  }
}

// ============================================================================
// CONFIG_TO_TEMPLATE Mapping Tests
// ============================================================================

describe("CONFIG_TO_TEMPLATE mapping", () => {
  it("should map package.json to Node template", () => {
    expect(CONFIG_TO_TEMPLATE["package.json"]).toBe("Node");
  });

  it("should map next.config.js to Nextjs template", () => {
    expect(CONFIG_TO_TEMPLATE["next.config.js"]).toBe("Nextjs");
  });

  it("should map next.config.ts to Nextjs template", () => {
    expect(CONFIG_TO_TEMPLATE["next.config.ts"]).toBe("Nextjs");
  });

  it("should map go.mod to Go template", () => {
    expect(CONFIG_TO_TEMPLATE["go.mod"]).toBe("Go");
  });

  it("should map Cargo.toml to Rust template", () => {
    expect(CONFIG_TO_TEMPLATE["Cargo.toml"]).toBe("Rust");
  });

  it("should map pyproject.toml to Python template", () => {
    expect(CONFIG_TO_TEMPLATE["pyproject.toml"]).toBe("Python");
  });

  it("should map requirements.txt to Python template", () => {
    expect(CONFIG_TO_TEMPLATE["requirements.txt"]).toBe("Python");
  });

  it("should map pom.xml to Java template", () => {
    expect(CONFIG_TO_TEMPLATE["pom.xml"]).toBe("Java");
  });

  it("should map build.gradle to Java template", () => {
    expect(CONFIG_TO_TEMPLATE["build.gradle"]).toBe("Java");
  });
});

// ============================================================================
// LANGUAGE_TO_TEMPLATE Mapping Tests
// ============================================================================

describe("LANGUAGE_TO_TEMPLATE mapping", () => {
  it("should map typescript to Node template", () => {
    expect(LANGUAGE_TO_TEMPLATE["typescript"]).toBe("Node");
  });

  it("should map javascript to Node template", () => {
    expect(LANGUAGE_TO_TEMPLATE["javascript"]).toBe("Node");
  });

  it("should map python to Python template", () => {
    expect(LANGUAGE_TO_TEMPLATE["python"]).toBe("Python");
  });

  it("should map go to Go template", () => {
    expect(LANGUAGE_TO_TEMPLATE["go"]).toBe("Go");
  });

  it("should map rust to Rust template", () => {
    expect(LANGUAGE_TO_TEMPLATE["rust"]).toBe("Rust");
  });

  it("should map java to Java template", () => {
    expect(LANGUAGE_TO_TEMPLATE["java"]).toBe("Java");
  });

  it("should map nextjs to Nextjs template", () => {
    expect(LANGUAGE_TO_TEMPLATE["nextjs"]).toBe("Nextjs");
  });
});

// ============================================================================
// Template Detection Tests
// ============================================================================

describe("detectTemplatesFromConfigFiles", () => {
  it("should detect Node template from package.json", () => {
    const templates = detectTemplatesFromConfigFiles(["package.json"]);
    expect(templates).toContain("Node");
  });

  it("should detect Nextjs template from next.config.js", () => {
    const templates = detectTemplatesFromConfigFiles(["next.config.js"]);
    expect(templates).toContain("Nextjs");
  });

  it("should detect multiple templates from multiple config files", () => {
    const templates = detectTemplatesFromConfigFiles([
      "package.json",
      "requirements.txt",
      "go.mod",
    ]);
    expect(templates).toContain("Node");
    expect(templates).toContain("Python");
    expect(templates).toContain("Go");
  });

  it("should return empty array for unknown config files", () => {
    const templates = detectTemplatesFromConfigFiles(["unknown.config"]);
    expect(templates).toHaveLength(0);
  });

  it("should handle full paths and extract basename", () => {
    const templates = detectTemplatesFromConfigFiles(["/some/path/to/package.json"]);
    expect(templates).toContain("Node");
  });
});

describe("detectTemplatesFromLanguages", () => {
  it("should detect Node template from typescript", () => {
    const templates = detectTemplatesFromLanguages(["typescript"]);
    expect(templates).toContain("Node");
  });

  it("should detect Python template from python", () => {
    const templates = detectTemplatesFromLanguages(["python"]);
    expect(templates).toContain("Python");
  });

  it("should detect multiple templates from multiple languages", () => {
    const templates = detectTemplatesFromLanguages(["typescript", "python", "go"]);
    expect(templates).toContain("Node");
    expect(templates).toContain("Python");
    expect(templates).toContain("Go");
  });

  it("should handle case-insensitive language names", () => {
    const templates = detectTemplatesFromLanguages(["TypeScript", "PYTHON"]);
    expect(templates).toContain("Node");
    expect(templates).toContain("Python");
  });

  it("should return empty array for unknown languages", () => {
    const templates = detectTemplatesFromLanguages(["unknownlang"]);
    expect(templates).toHaveLength(0);
  });
});

// ============================================================================
// Bundled Templates Tests
// ============================================================================

describe("bundled templates", () => {
  it("should have all 6 bundled templates available", () => {
    expect(BUNDLED_TEMPLATES).toHaveLength(6);
    expect(BUNDLED_TEMPLATES).toContain("Node");
    expect(BUNDLED_TEMPLATES).toContain("Python");
    expect(BUNDLED_TEMPLATES).toContain("Go");
    expect(BUNDLED_TEMPLATES).toContain("Rust");
    expect(BUNDLED_TEMPLATES).toContain("Java");
    expect(BUNDLED_TEMPLATES).toContain("Nextjs");
  });

  it("should identify bundled templates correctly", () => {
    expect(isBundledTemplate("Node")).toBe(true);
    expect(isBundledTemplate("Python")).toBe(true);
    expect(isBundledTemplate("UnknownTemplate")).toBe(false);
  });

  it("should return Node template content with node_modules pattern", () => {
    const content = getBundledTemplate("Node");
    expect(content).not.toBeNull();
    expect(content).toContain("node_modules");
  });

  it("should return Python template content with __pycache__ pattern", () => {
    const content = getBundledTemplate("Python");
    expect(content).not.toBeNull();
    expect(content).toContain("__pycache__");
  });

  it("should return Go template content with *.exe pattern", () => {
    const content = getBundledTemplate("Go");
    expect(content).not.toBeNull();
    expect(content).toContain("*.exe");
  });

  it("should return Rust template content with target pattern", () => {
    const content = getBundledTemplate("Rust");
    expect(content).not.toBeNull();
    expect(content).toContain("target");
  });

  it("should return Java template content with *.class pattern", () => {
    const content = getBundledTemplate("Java");
    expect(content).not.toBeNull();
    expect(content).toContain("*.class");
  });

  it("should return Nextjs template content with .next pattern", () => {
    const content = getBundledTemplate("Nextjs");
    expect(content).not.toBeNull();
    expect(content).toContain(".next");
  });

  it("should return null for non-existent bundled template", () => {
    const content = getBundledTemplate("NonExistent");
    expect(content).toBeNull();
  });
});

// ============================================================================
// getTemplate Tests
// ============================================================================

describe("getTemplate", () => {
  it("should return bundled template for bundled template names", async () => {
    const content = await getTemplate("Node", { bundledOnly: true });
    expect(content).not.toBeNull();
    expect(content).toContain("node_modules");
  });

  it("should return null for unknown templates in bundledOnly mode", async () => {
    const content = await getTemplate("UnknownTemplate", { bundledOnly: true });
    expect(content).toBeNull();
  });
});

// ============================================================================
// Content Generation Tests
// ============================================================================

describe("generateGitignoreContent", () => {
  it("should include agent-foreman patterns at the start", async () => {
    const content = await generateGitignoreContent(["Node"], { bundledOnly: true });
    expect(content).toContain("# === agent-foreman ===");
    expect(content).toContain("ai/capabilities.json");
  });

  it("should include section headers for templates", async () => {
    const content = await generateGitignoreContent(["Node"], { bundledOnly: true });
    expect(content).toContain("# === Node.js ===");
  });

  it("should combine multiple templates", async () => {
    const content = await generateGitignoreContent(["Node", "Python"], { bundledOnly: true });
    expect(content).toContain("# === Node.js ===");
    expect(content).toContain("# === Python ===");
    expect(content).toContain("node_modules");
    expect(content).toContain("__pycache__");
  });

  it("should include custom patterns when provided", async () => {
    const content = await generateGitignoreContent(["Node"], {
      bundledOnly: true,
      customPatterns: ["my-custom-pattern/", "*.custom"],
    });
    expect(content).toContain("# === Custom ===");
    expect(content).toContain("my-custom-pattern/");
    expect(content).toContain("*.custom");
  });
});

describe("generateGitignore", () => {
  it("should generate gitignore from config files", async () => {
    const content = await generateGitignore(
      ["package.json"],
      [],
      { bundledOnly: true }
    );
    expect(content).toContain("node_modules");
  });

  it("should generate gitignore from languages", async () => {
    const content = await generateGitignore(
      [],
      ["python"],
      { bundledOnly: true }
    );
    expect(content).toContain("__pycache__");
  });

  it("should prioritize config files over languages", async () => {
    const content = await generateGitignore(
      ["next.config.js"],
      ["typescript"],
      { bundledOnly: true }
    );
    // Should include Nextjs template
    expect(content).toContain("# === Next.js ===");
  });

  it("should default to Node template when nothing detected", async () => {
    const content = await generateGitignore([], [], { bundledOnly: true });
    expect(content).toContain("node_modules");
  });
});

// ============================================================================
// MINIMAL_GITIGNORE Tests
// ============================================================================

describe("MINIMAL_GITIGNORE", () => {
  it("should contain essential .env pattern", () => {
    expect(MINIMAL_GITIGNORE).toContain(".env");
  });

  it("should contain node_modules pattern", () => {
    expect(MINIMAL_GITIGNORE).toContain("node_modules/");
  });

  it("should contain dist pattern", () => {
    expect(MINIMAL_GITIGNORE).toContain("dist/");
  });

  it("should contain .DS_Store pattern", () => {
    expect(MINIMAL_GITIGNORE).toContain(".DS_Store");
  });

  it("should contain .next pattern", () => {
    expect(MINIMAL_GITIGNORE).toContain(".next/");
  });

  it("should contain __pycache__ pattern", () => {
    expect(MINIMAL_GITIGNORE).toContain("__pycache__/");
  });
});

// ============================================================================
// ensureMinimalGitignore Tests
// ============================================================================

describe("ensureMinimalGitignore", () => {
  beforeEach(() => {
    tempDir = createTempDir();
  });

  afterEach(() => {
    cleanup(tempDir);
  });

  it("should create .gitignore when none exists", () => {
    const result = ensureMinimalGitignore(tempDir);

    expect(result.success).toBe(true);
    expect(result.action).toBe("created");

    const gitignorePath = path.join(tempDir, ".gitignore");
    expect(fs.existsSync(gitignorePath)).toBe(true);

    const content = fs.readFileSync(gitignorePath, "utf-8");
    expect(content).toContain("node_modules/");
    expect(content).toContain(".env");
  });

  it("should skip when .gitignore already exists", () => {
    const gitignorePath = path.join(tempDir, ".gitignore");
    fs.writeFileSync(gitignorePath, "# existing content\n");

    const result = ensureMinimalGitignore(tempDir);

    expect(result.success).toBe(true);
    expect(result.action).toBe("skipped");

    const content = fs.readFileSync(gitignorePath, "utf-8");
    expect(content).toBe("# existing content\n");
  });

  it("should return GitignoreResult with correct action", () => {
    const result = ensureMinimalGitignore(tempDir);

    expect(result).toHaveProperty("success");
    expect(result).toHaveProperty("action");
    expect(result).toHaveProperty("reason");
    expect(["created", "skipped", "error"]).toContain(result.action);
  });
});

// ============================================================================
// ensureComprehensiveGitignore Tests
// ============================================================================

describe("ensureComprehensiveGitignore", () => {
  beforeEach(() => {
    tempDir = createTempDir();
  });

  afterEach(() => {
    cleanup(tempDir);
  });

  it("should create .gitignore when none exists", async () => {
    const result = await ensureComprehensiveGitignore(
      tempDir,
      ["package.json"],
      ["typescript"],
      { bundledOnly: true }
    );

    expect(result.success).toBe(true);
    expect(result.action).toBe("created");

    const gitignorePath = path.join(tempDir, ".gitignore");
    expect(fs.existsSync(gitignorePath)).toBe(true);

    const content = fs.readFileSync(gitignorePath, "utf-8");
    expect(content).toContain("node_modules");
    expect(content).toContain("ai/capabilities.json");
  });

  it("should return templates used in result", async () => {
    const result = await ensureComprehensiveGitignore(
      tempDir,
      ["package.json"],
      ["typescript"],
      { bundledOnly: true }
    );

    expect(result.templates).toBeDefined();
    expect(result.templates).toContain("Node");
  });

  it("should not overwrite existing .gitignore content", async () => {
    const gitignorePath = path.join(tempDir, ".gitignore");
    const originalContent = "# My custom gitignore\nmy-custom-pattern/\n";
    fs.writeFileSync(gitignorePath, originalContent);

    await ensureComprehensiveGitignore(
      tempDir,
      ["package.json"],
      ["typescript"],
      { bundledOnly: true }
    );

    const content = fs.readFileSync(gitignorePath, "utf-8");
    expect(content).toContain("# My custom gitignore");
    expect(content).toContain("my-custom-pattern/");
  });

  it("should auto-append missing essential patterns in merge mode", async () => {
    const gitignorePath = path.join(tempDir, ".gitignore");
    fs.writeFileSync(gitignorePath, "# Existing\n.DS_Store\n");

    const result = await ensureComprehensiveGitignore(
      tempDir,
      ["package.json"],
      ["typescript"],
      { bundledOnly: true }
    );

    expect(result.action).toBe("updated");

    const content = fs.readFileSync(gitignorePath, "utf-8");
    expect(content).toContain("# Existing");
    expect(content).toContain("node_modules/");
  });

  it("should skip update when all essential patterns present", async () => {
    const gitignorePath = path.join(tempDir, ".gitignore");
    fs.writeFileSync(
      gitignorePath,
      `# Complete gitignore
node_modules/
.env
.env.local
ai/capabilities.json
`
    );

    const result = await ensureComprehensiveGitignore(
      tempDir,
      ["package.json"],
      ["typescript"],
      { bundledOnly: true }
    );

    expect(result.action).toBe("skipped");
    expect(result.reason).toContain("already has essential patterns");
  });

  it("should handle multiple templates for polyglot projects", async () => {
    const result = await ensureComprehensiveGitignore(
      tempDir,
      ["package.json", "requirements.txt"],
      ["typescript", "python"],
      { bundledOnly: true }
    );

    expect(result.success).toBe(true);

    const gitignorePath = path.join(tempDir, ".gitignore");
    const content = fs.readFileSync(gitignorePath, "utf-8");

    expect(content).toContain("node_modules");
    expect(content).toContain("__pycache__");
  });
});
