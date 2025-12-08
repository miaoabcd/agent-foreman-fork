/**
 * Tests for gitignore module index (re-exports)
 * Ensures all exports are properly available through the main module
 */
import { describe, it, expect } from "vitest";

// Import all exports from the index module
import * as gitignore from "../../src/gitignore/index.js";

// ============================================================================
// Module Export Tests
// ============================================================================

describe("gitignore module exports", () => {
  describe("bundled templates exports", () => {
    it("should export BUNDLED_TEMPLATES constant", () => {
      expect(gitignore.BUNDLED_TEMPLATES).toBeDefined();
      expect(Array.isArray(gitignore.BUNDLED_TEMPLATES)).toBe(true);
      expect(gitignore.BUNDLED_TEMPLATES).toContain("Node");
      expect(gitignore.BUNDLED_TEMPLATES).toContain("Python");
    });

    it("should export isBundledTemplate function", () => {
      expect(typeof gitignore.isBundledTemplate).toBe("function");
      expect(gitignore.isBundledTemplate("Node")).toBe(true);
      expect(gitignore.isBundledTemplate("Unknown")).toBe(false);
    });

    it("should export getBundledTemplate function", () => {
      expect(typeof gitignore.getBundledTemplate).toBe("function");
      const template = gitignore.getBundledTemplate("Node");
      expect(template).toContain("node_modules");
    });

    it("should export getBundledTemplateAsync function", async () => {
      expect(typeof gitignore.getBundledTemplateAsync).toBe("function");
      const template = await gitignore.getBundledTemplateAsync("Node");
      expect(template).toContain("node_modules");
    });

    it("should export getAllBundledTemplates function", () => {
      expect(typeof gitignore.getAllBundledTemplates).toBe("function");
      const templates = gitignore.getAllBundledTemplates();
      expect(templates instanceof Map).toBe(true);
      expect(templates.has("Node")).toBe(true);
    });

    it("should export verifyBundledTemplates function", () => {
      expect(typeof gitignore.verifyBundledTemplates).toBe("function");
      const result = gitignore.verifyBundledTemplates();
      expect(result).toHaveProperty("available");
      expect(result).toHaveProperty("missing");
      expect(Array.isArray(result.available)).toBe(true);
    });
  });

  describe("github API exports", () => {
    it("should export getCacheDir function", () => {
      expect(typeof gitignore.getCacheDir).toBe("function");
      const dir = gitignore.getCacheDir();
      expect(typeof dir).toBe("string");
      expect(dir).toContain("gitignore-cache");
    });

    it("should export fetchGitignoreTemplate function", () => {
      expect(typeof gitignore.fetchGitignoreTemplate).toBe("function");
    });

    it("should export listGitignoreTemplates function", () => {
      expect(typeof gitignore.listGitignoreTemplates).toBe("function");
    });

    it("should export clearCache function", () => {
      expect(typeof gitignore.clearCache).toBe("function");
    });

    it("should export getCacheTTL function", () => {
      expect(typeof gitignore.getCacheTTL).toBe("function");
      const ttl = gitignore.getCacheTTL();
      expect(typeof ttl).toBe("number");
      expect(ttl).toBeGreaterThan(0);
    });
  });

  describe("generator exports", () => {
    it("should export CONFIG_TO_TEMPLATE constant", () => {
      expect(gitignore.CONFIG_TO_TEMPLATE).toBeDefined();
      expect(typeof gitignore.CONFIG_TO_TEMPLATE).toBe("object");
      expect(gitignore.CONFIG_TO_TEMPLATE["package.json"]).toBe("Node");
    });

    it("should export LANGUAGE_TO_TEMPLATE constant", () => {
      expect(gitignore.LANGUAGE_TO_TEMPLATE).toBeDefined();
      expect(typeof gitignore.LANGUAGE_TO_TEMPLATE).toBe("object");
      expect(gitignore.LANGUAGE_TO_TEMPLATE["typescript"]).toBe("Node");
    });

    it("should export MINIMAL_GITIGNORE constant", () => {
      expect(gitignore.MINIMAL_GITIGNORE).toBeDefined();
      expect(typeof gitignore.MINIMAL_GITIGNORE).toBe("string");
      expect(gitignore.MINIMAL_GITIGNORE).toContain("node_modules");
    });

    it("should export getTemplate function", () => {
      expect(typeof gitignore.getTemplate).toBe("function");
    });

    it("should export detectTemplatesFromConfigFiles function", () => {
      expect(typeof gitignore.detectTemplatesFromConfigFiles).toBe("function");
      const templates = gitignore.detectTemplatesFromConfigFiles(["package.json"]);
      expect(templates).toContain("Node");
    });

    it("should export detectTemplatesFromLanguages function", () => {
      expect(typeof gitignore.detectTemplatesFromLanguages).toBe("function");
      const templates = gitignore.detectTemplatesFromLanguages(["typescript"]);
      expect(templates).toContain("Node");
    });

    it("should export generateGitignoreContent function", () => {
      expect(typeof gitignore.generateGitignoreContent).toBe("function");
    });

    it("should export generateGitignore function", () => {
      expect(typeof gitignore.generateGitignore).toBe("function");
    });

    it("should export ensureMinimalGitignore function", () => {
      expect(typeof gitignore.ensureMinimalGitignore).toBe("function");
    });

    it("should export ensureComprehensiveGitignore function", () => {
      expect(typeof gitignore.ensureComprehensiveGitignore).toBe("function");
    });
  });
});

// ============================================================================
// Type Export Tests
// ============================================================================

describe("type exports", () => {
  it("should allow using BundledTemplateName type", () => {
    // TypeScript type check - if this compiles, the type is exported
    const name: gitignore.BundledTemplateName = "Node";
    expect(gitignore.isBundledTemplate(name)).toBe(true);
  });

  it("should allow using FetchResult type implicitly", async () => {
    // FetchResult is used as return type of fetchGitignoreTemplate
    const result = await gitignore.fetchGitignoreTemplate("Node");
    expect(result).toHaveProperty("source");
    expect(result).toHaveProperty("fromCache");
    expect(result).toHaveProperty("fallback");
  });

  it("should allow using GitignoreResult type implicitly", () => {
    // GitignoreResult is used as return type of ensureMinimalGitignore
    // We test that the function signature works correctly
    expect(typeof gitignore.ensureMinimalGitignore).toBe("function");
  });

  it("should allow using GeneratorOptions type implicitly", async () => {
    // GeneratorOptions is used in generateGitignoreContent
    const content = await gitignore.generateGitignoreContent(["Node"], {
      bundledOnly: true,
      customPatterns: ["*.test"],
    });
    expect(content).toContain("node_modules");
    expect(content).toContain("*.test");
  });
});

// ============================================================================
// Integration Tests
// ============================================================================

describe("integration through index", () => {
  it("should work end-to-end for bundled template workflow", async () => {
    // 1. Check if template is bundled
    expect(gitignore.isBundledTemplate("Node")).toBe(true);

    // 2. Get the template
    const template = gitignore.getBundledTemplate("Node");
    expect(template).not.toBeNull();

    // 3. Generate gitignore content
    const content = await gitignore.generateGitignore(
      ["package.json"],
      ["typescript"],
      { bundledOnly: true }
    );
    expect(content).toContain("node_modules");
  });

  it("should work end-to-end for detection workflow", async () => {
    // 1. Detect from config files
    const fromConfigs = gitignore.detectTemplatesFromConfigFiles([
      "package.json",
      "requirements.txt",
    ]);
    expect(fromConfigs).toContain("Node");
    expect(fromConfigs).toContain("Python");

    // 2. Detect from languages
    const fromLanguages = gitignore.detectTemplatesFromLanguages([
      "typescript",
      "python",
    ]);
    expect(fromLanguages).toContain("Node");
    expect(fromLanguages).toContain("Python");

    // 3. Generate combined content
    const content = await gitignore.generateGitignoreContent(
      [...new Set([...fromConfigs, ...fromLanguages])],
      { bundledOnly: true }
    );
    expect(content).toContain("node_modules");
    expect(content).toContain("__pycache__");
  });
});
