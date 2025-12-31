/**
 * Tests for src/roles/multiPerspective.ts - Multi-role requirement analysis
 * TDD: RED phase - these tests should FAIL initially
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  MultiRoleAnalyzer,
  RoleType,
  RoleOutput,
  PMOutput,
  FrontendOutput,
  BackendOutput,
  QAOutput,
  UnifiedRequirementDocument,
  AnalyzeOptions,
} from "../../src/roles/multiPerspective.js";

describe("MultiRoleAnalyzer", () => {
  let analyzer: MultiRoleAnalyzer;
  const sampleRequirement = "Implement user authentication with login and registration";

  beforeEach(() => {
    analyzer = new MultiRoleAnalyzer();
  });

  describe("Role Configuration", () => {
    it("should support role-based requirement analysis with configurable roles", () => {
      // Verify all supported roles are available
      expect(analyzer.supportedRoles).toContain("pm");
      expect(analyzer.supportedRoles).toContain("frontend");
      expect(analyzer.supportedRoles).toContain("backend");
      expect(analyzer.supportedRoles).toContain("qa");

      // Verify configuration accepts subset of roles
      const configured = analyzer.configure({ roles: ["pm", "frontend"] });
      expect(configured).toBeDefined();
      expect(configured.activeRoles).toEqual(["pm", "frontend"]);
    });

    it("should default to all roles when not configured", () => {
      expect(analyzer.activeRoles).toEqual(["pm", "frontend", "backend", "qa"]);
    });

    it("should reject invalid role names", () => {
      expect(() => analyzer.configure({ roles: ["invalid" as RoleType] })).toThrow();
    });
  });

  describe("Product Manager Role Output", () => {
    it("should generate PM role output with user stories, acceptance criteria, business value, and priority", async () => {
      const pmOutput = await analyzer.analyzeAsRole("pm", sampleRequirement) as PMOutput;

      // User stories in proper format
      expect(pmOutput.userStories).toBeInstanceOf(Array);
      expect(pmOutput.userStories.length).toBeGreaterThan(0);
      expect(pmOutput.userStories[0]).toHaveProperty("asA");
      expect(pmOutput.userStories[0]).toHaveProperty("iWant");
      expect(pmOutput.userStories[0]).toHaveProperty("soThat");

      // Acceptance criteria
      expect(pmOutput.acceptanceCriteria).toBeInstanceOf(Array);
      expect(pmOutput.acceptanceCriteria.length).toBeGreaterThan(0);

      // Business value and priority
      expect(pmOutput.businessValue).toBeDefined();
      expect(typeof pmOutput.businessValue).toBe("string");
      expect(pmOutput.priority).toMatch(/high|medium|low/i);

      // Stakeholders (optional but expected)
      expect(pmOutput.stakeholders).toBeInstanceOf(Array);
    });

    it("should generate user stories following the standard format", async () => {
      const pmOutput = await analyzer.analyzeAsRole("pm", sampleRequirement) as PMOutput;

      const story = pmOutput.userStories[0];
      expect(typeof story.asA).toBe("string");
      expect(typeof story.iWant).toBe("string");
      expect(typeof story.soThat).toBe("string");
      expect(story.asA.length).toBeGreaterThan(0);
    });
  });

  describe("Frontend Engineer Role Output", () => {
    it("should generate Frontend Engineer role output with UI/UX requirements, components, state, and API points", async () => {
      const frontendOutput = await analyzer.analyzeAsRole("frontend", sampleRequirement) as FrontendOutput;

      // UI/UX requirements
      expect(frontendOutput.uiRequirements).toBeInstanceOf(Array);
      expect(frontendOutput.uiRequirements.length).toBeGreaterThan(0);

      // Component structure
      expect(frontendOutput.componentStructure).toBeDefined();
      expect(frontendOutput.componentStructure.components).toBeInstanceOf(Array);

      // State management
      expect(frontendOutput.stateManagement).toHaveProperty("stores");
      expect(frontendOutput.stateManagement.stores).toBeInstanceOf(Array);

      // API integration points
      expect(frontendOutput.apiIntegrationPoints).toBeInstanceOf(Array);
      expect(frontendOutput.apiIntegrationPoints[0]).toHaveProperty("endpoint");
      expect(frontendOutput.apiIntegrationPoints[0]).toHaveProperty("method");
    });

    it("should include accessibility requirements", async () => {
      const frontendOutput = await analyzer.analyzeAsRole("frontend", sampleRequirement) as FrontendOutput;

      expect(frontendOutput.accessibilityRequirements).toBeInstanceOf(Array);
    });

    it("should suggest responsive design considerations", async () => {
      const frontendOutput = await analyzer.analyzeAsRole("frontend", sampleRequirement) as FrontendOutput;

      expect(frontendOutput.responsiveDesign).toBeDefined();
    });
  });

  describe("Backend Engineer Role Output", () => {
    it("should generate Backend Engineer role output with API design, data models, architecture, and infrastructure", async () => {
      const backendOutput = await analyzer.analyzeAsRole("backend", sampleRequirement) as BackendOutput;

      // API design
      expect(backendOutput.apiDesign).toHaveProperty("endpoints");
      expect(backendOutput.apiDesign.endpoints).toBeInstanceOf(Array);
      expect(backendOutput.apiDesign.endpoints[0]).toHaveProperty("method");
      expect(backendOutput.apiDesign.endpoints[0]).toHaveProperty("path");
      expect(backendOutput.apiDesign.endpoints[0]).toHaveProperty("requestSchema");
      expect(backendOutput.apiDesign.endpoints[0]).toHaveProperty("responseSchema");

      // Data models
      expect(backendOutput.dataModels).toBeInstanceOf(Array);
      expect(backendOutput.dataModels.length).toBeGreaterThan(0);
      expect(backendOutput.dataModels[0]).toHaveProperty("name");
      expect(backendOutput.dataModels[0]).toHaveProperty("fields");

      // Service architecture
      expect(backendOutput.serviceArchitecture).toBeDefined();
      expect(backendOutput.serviceArchitecture.pattern).toBeDefined();

      // Infrastructure requirements
      expect(backendOutput.infrastructureRequirements).toBeInstanceOf(Array);
    });

    it("should define authentication and authorization requirements", async () => {
      const backendOutput = await analyzer.analyzeAsRole("backend", sampleRequirement) as BackendOutput;

      expect(backendOutput.authRequirements).toBeDefined();
      expect(backendOutput.authRequirements.authentication).toBeDefined();
      expect(backendOutput.authRequirements.authorization).toBeDefined();
    });

    it("should suggest caching strategies", async () => {
      const backendOutput = await analyzer.analyzeAsRole("backend", sampleRequirement) as BackendOutput;

      expect(backendOutput.cachingStrategy).toBeDefined();
    });
  });

  describe("Tester/QA Role Output", () => {
    it("should generate Tester role output with unit tests, E2E scenarios, edge cases, and test data", async () => {
      const qaOutput = await analyzer.analyzeAsRole("qa", sampleRequirement) as QAOutput;

      // Unit test cases
      expect(qaOutput.unitTestCases).toBeInstanceOf(Array);
      expect(qaOutput.unitTestCases.length).toBeGreaterThan(0);
      expect(qaOutput.unitTestCases[0]).toHaveProperty("description");
      expect(qaOutput.unitTestCases[0]).toHaveProperty("assertions");

      // E2E scenarios
      expect(qaOutput.e2eScenarios).toBeInstanceOf(Array);
      expect(qaOutput.e2eScenarios.length).toBeGreaterThan(0);
      expect(qaOutput.e2eScenarios[0]).toHaveProperty("name");
      expect(qaOutput.e2eScenarios[0]).toHaveProperty("steps");

      // Edge cases
      expect(qaOutput.edgeCases).toBeInstanceOf(Array);
      expect(qaOutput.edgeCases.length).toBeGreaterThan(0);

      // Test data requirements
      expect(qaOutput.testDataRequirements).toBeDefined();
      expect(qaOutput.testDataRequirements.fixtures).toBeInstanceOf(Array);
    });

    it("should map tests to acceptance criteria for traceability", async () => {
      const qaOutput = await analyzer.analyzeAsRole("qa", sampleRequirement) as QAOutput;

      expect(qaOutput.traceabilityMatrix).toBeDefined();
      expect(qaOutput.traceabilityMatrix).toBeInstanceOf(Array);
    });

    it("should suggest integration test points", async () => {
      const qaOutput = await analyzer.analyzeAsRole("qa", sampleRequirement) as QAOutput;

      expect(qaOutput.integrationTestPoints).toBeInstanceOf(Array);
    });
  });

  describe("Output Formats", () => {
    it("should output requirements in structured JSON format", async () => {
      const result = await analyzer.analyze(sampleRequirement, { format: "json" });

      // Should be valid JSON
      expect(() => JSON.parse(JSON.stringify(result))).not.toThrow();
      expect(result).toHaveProperty("pm");
      expect(result).toHaveProperty("frontend");
      expect(result).toHaveProperty("backend");
      expect(result).toHaveProperty("qa");
    });

    it("should output requirements in Markdown format", async () => {
      const result = await analyzer.analyze(sampleRequirement, { format: "markdown" });

      expect(typeof result).toBe("string");
      expect(result).toContain("#"); // Markdown headers
      expect(result).toContain("## Product Manager");
      expect(result).toContain("## Frontend Engineer");
      expect(result).toContain("## Backend Engineer");
      expect(result).toContain("## QA/Tester");
    });

    it("should support both JSON and Markdown formats", () => {
      expect(analyzer.supportedFormats).toContain("json");
      expect(analyzer.supportedFormats).toContain("markdown");
    });
  });

  describe("Parallel Execution", () => {
    it("should support parallel execution of multiple role analyses on the same requirement", async () => {
      expect(analyzer.analyzeParallel).toBeInstanceOf(Function);

      const startTime = Date.now();
      const parallelResults = await analyzer.analyzeParallel(sampleRequirement);
      const parallelTime = Date.now() - startTime;

      // All 4 roles should return results
      expect(parallelResults).toHaveLength(4);
      expect(parallelResults.every(r => r.role && r.output)).toBe(true);

      // All results should be for the same requirement
      expect(parallelResults.every(r => r.requirement === sampleRequirement)).toBe(true);
    });

    it("should execute faster than sequential when running in parallel", async () => {
      // Mock delay to simulate AI processing time
      const mockDelay = 100;
      vi.spyOn(analyzer, "analyzeAsRole").mockImplementation(async (role, req) => {
        await new Promise(resolve => setTimeout(resolve, mockDelay));
        return { role } as unknown as RoleOutput;
      });

      const startSeq = Date.now();
      for (const role of analyzer.supportedRoles) {
        await analyzer.analyzeAsRole(role, sampleRequirement);
      }
      const sequentialTime = Date.now() - startSeq;

      vi.restoreAllMocks();
      vi.spyOn(analyzer, "analyzeAsRole").mockImplementation(async (role, req) => {
        await new Promise(resolve => setTimeout(resolve, mockDelay));
        return { role } as unknown as RoleOutput;
      });

      const startPar = Date.now();
      await analyzer.analyzeParallel(sampleRequirement);
      const parallelTime = Date.now() - startPar;

      // Parallel should be significantly faster (at least 2x for 4 roles)
      expect(parallelTime).toBeLessThan(sequentialTime);

      vi.restoreAllMocks();
    });

    it("should handle partial failures in parallel execution gracefully", async () => {
      vi.spyOn(analyzer, "analyzeAsRole").mockImplementation(async (role, req) => {
        if (role === "frontend") {
          throw new Error("Frontend analysis failed");
        }
        return { role } as unknown as RoleOutput;
      });

      const results = await analyzer.analyzeParallel(sampleRequirement, { continueOnError: true });

      // Should have 3 successful and 1 failed
      expect(results.filter(r => r.success).length).toBe(3);
      expect(results.filter(r => !r.success).length).toBe(1);
      expect(results.find(r => r.role === "frontend")?.error).toBeDefined();

      vi.restoreAllMocks();
    });
  });

  describe("Unified Document Aggregation", () => {
    it("should aggregate and merge outputs from all roles into a unified requirement document", async () => {
      const unifiedDoc = await analyzer.analyze(sampleRequirement) as UnifiedRequirementDocument;

      // All role outputs present
      expect(unifiedDoc).toHaveProperty("pm");
      expect(unifiedDoc).toHaveProperty("frontend");
      expect(unifiedDoc).toHaveProperty("backend");
      expect(unifiedDoc).toHaveProperty("qa");

      // Metadata present
      expect(unifiedDoc.metadata).toHaveProperty("generatedAt");
      expect(unifiedDoc.metadata).toHaveProperty("rolesIncluded");
      expect(unifiedDoc.metadata.rolesIncluded).toEqual(["pm", "frontend", "backend", "qa"]);

      // Summary generated
      expect(unifiedDoc.summary).toBeDefined();
      expect(typeof unifiedDoc.summary).toBe("string");
      expect(unifiedDoc.summary.length).toBeGreaterThan(0);
    });

    it("should include original requirement in unified document", async () => {
      const unifiedDoc = await analyzer.analyze(sampleRequirement) as UnifiedRequirementDocument;

      expect(unifiedDoc.originalRequirement).toBe(sampleRequirement);
    });

    it("should detect conflicts between role outputs", async () => {
      const unifiedDoc = await analyzer.analyze(sampleRequirement) as UnifiedRequirementDocument;

      // Conflicts array should exist (even if empty)
      expect(unifiedDoc.conflicts).toBeInstanceOf(Array);
    });

    it("should generate traceability links between role artifacts", async () => {
      const unifiedDoc = await analyzer.analyze(sampleRequirement) as UnifiedRequirementDocument;

      expect(unifiedDoc.traceability).toBeDefined();
      // User story -> Frontend component -> API endpoint -> Test case links
      expect(unifiedDoc.traceability.links).toBeInstanceOf(Array);
    });
  });

  describe("Error Handling", () => {
    it("should throw meaningful error when requirement is empty", async () => {
      await expect(analyzer.analyze("")).rejects.toThrow("Requirement cannot be empty");
    });

    it("should validate options before processing", () => {
      expect(() => analyzer.configure({ roles: [] })).toThrow("At least one role must be specified");
    });
  });

  describe("Integration with AI Agent", () => {
    it("should use AI agent for analysis when configured", async () => {
      const mockAgent = vi.fn().mockResolvedValue({ success: true, output: '{}' });
      analyzer.setAgentProvider(mockAgent);

      await analyzer.analyze(sampleRequirement);

      expect(mockAgent).toHaveBeenCalled();
    });

    it("should work without AI agent using rule-based fallback", async () => {
      // Don't set agent, should use fallback
      const result = await analyzer.analyze(sampleRequirement);

      expect(result).toBeDefined();
    });
  });
});
