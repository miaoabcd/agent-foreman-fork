/**
 * Tests for src/roles/aggregator.ts - Role output aggregator
 */
import { describe, it, expect, beforeEach } from "vitest";
import { RoleAggregator, UnifiedDocument } from "../../src/roles/aggregator.js";
import { ProductManagerRole } from "../../src/roles/productManager.js";
import { FrontendEngineerRole } from "../../src/roles/frontendEngineer.js";
import { BackendEngineerRole } from "../../src/roles/backendEngineer.js";
import { TesterRole } from "../../src/roles/tester.js";

describe("RoleAggregator", () => {
  let aggregator: RoleAggregator;
  const sampleRequirement = "Implement user authentication with login and registration";

  beforeEach(() => {
    aggregator = new RoleAggregator();
  });

  describe("Output Aggregation", () => {
    it("should accept outputs from all role analyzers", async () => {
      const pm = await new ProductManagerRole().analyze(sampleRequirement);
      const fe = await new FrontendEngineerRole().analyze(sampleRequirement);
      const be = await new BackendEngineerRole().analyze(sampleRequirement);
      const qa = await new TesterRole().analyze(sampleRequirement);

      const result = await aggregator.aggregate({
        requirement: sampleRequirement,
        pmOutput: pm,
        frontendOutput: fe,
        backendOutput: be,
        qaOutput: qa,
      });

      expect(result).toBeDefined();
      expect(result.pm).toBeDefined();
      expect(result.frontend).toBeDefined();
      expect(result.backend).toBeDefined();
      expect(result.qa).toBeDefined();
    });
  });

  describe("Conflict Detection", () => {
    it("should detect and resolve conflicts between role outputs", async () => {
      const pm = await new ProductManagerRole().analyze(sampleRequirement);
      const fe = await new FrontendEngineerRole().analyze(sampleRequirement);
      const be = await new BackendEngineerRole().analyze(sampleRequirement);
      const qa = await new TesterRole().analyze(sampleRequirement);

      const result = await aggregator.aggregate({
        requirement: sampleRequirement,
        pmOutput: pm,
        frontendOutput: fe,
        backendOutput: be,
        qaOutput: qa,
      });

      expect(result.conflicts).toBeInstanceOf(Array);
    });
  });

  describe("Document Merging", () => {
    it("should merge into unified requirement document structure", async () => {
      const pm = await new ProductManagerRole().analyze(sampleRequirement);
      const fe = await new FrontendEngineerRole().analyze(sampleRequirement);
      const be = await new BackendEngineerRole().analyze(sampleRequirement);
      const qa = await new TesterRole().analyze(sampleRequirement);

      const result = await aggregator.aggregate({
        requirement: sampleRequirement,
        pmOutput: pm,
        frontendOutput: fe,
        backendOutput: be,
        qaOutput: qa,
      });

      expect(result.originalRequirement).toBe(sampleRequirement);
      expect(result.metadata).toBeDefined();
      expect(result.metadata.generatedAt).toBeDefined();
    });
  });

  describe("Traceability Matrix", () => {
    it("should generate traceability matrix linking all artifacts", async () => {
      const pm = await new ProductManagerRole().analyze(sampleRequirement);
      const fe = await new FrontendEngineerRole().analyze(sampleRequirement);
      const be = await new BackendEngineerRole().analyze(sampleRequirement);
      const qa = await new TesterRole().analyze(sampleRequirement);

      const result = await aggregator.aggregate({
        requirement: sampleRequirement,
        pmOutput: pm,
        frontendOutput: fe,
        backendOutput: be,
        qaOutput: qa,
      });

      expect(result.traceability).toBeDefined();
      expect(result.traceability.links).toBeInstanceOf(Array);
    });
  });

  describe("Output Formats", () => {
    it("should output in JSON format", async () => {
      const pm = await new ProductManagerRole().analyze(sampleRequirement);
      const fe = await new FrontendEngineerRole().analyze(sampleRequirement);
      const be = await new BackendEngineerRole().analyze(sampleRequirement);
      const qa = await new TesterRole().analyze(sampleRequirement);

      const result = await aggregator.aggregate({
        requirement: sampleRequirement,
        pmOutput: pm,
        frontendOutput: fe,
        backendOutput: be,
        qaOutput: qa,
        format: "json",
      });

      expect(() => JSON.stringify(result)).not.toThrow();
    });

    it("should output in Markdown format", async () => {
      const pm = await new ProductManagerRole().analyze(sampleRequirement);
      const fe = await new FrontendEngineerRole().analyze(sampleRequirement);
      const be = await new BackendEngineerRole().analyze(sampleRequirement);
      const qa = await new TesterRole().analyze(sampleRequirement);

      const markdown = await aggregator.toMarkdown({
        requirement: sampleRequirement,
        pmOutput: pm,
        frontendOutput: fe,
        backendOutput: be,
        qaOutput: qa,
      });

      expect(typeof markdown).toBe("string");
      expect(markdown).toContain("#");
    });
  });

  describe("Incremental Updates", () => {
    it("should support incremental updates when single role output changes", async () => {
      const pm = await new ProductManagerRole().analyze(sampleRequirement);
      const fe = await new FrontendEngineerRole().analyze(sampleRequirement);
      const be = await new BackendEngineerRole().analyze(sampleRequirement);
      const qa = await new TesterRole().analyze(sampleRequirement);

      const initial = await aggregator.aggregate({
        requirement: sampleRequirement,
        pmOutput: pm,
        frontendOutput: fe,
        backendOutput: be,
        qaOutput: qa,
      });

      // Update just PM output
      const updatedPm = await new ProductManagerRole().analyze(sampleRequirement + " with OAuth");
      const updated = await aggregator.updateRole(initial, "pm", updatedPm);

      expect(updated.pm).not.toBe(initial.pm);
      expect(updated.frontend).toBe(initial.frontend);
    });
  });
});
