/**
 * Tests for src/roles/frontendEngineer.ts - Frontend Engineer role implementation
 * TDD: RED phase - these tests should FAIL initially
 */
import { describe, it, expect, beforeEach } from "vitest";
import {
  FrontendEngineerRole,
  FrontendAnalysisResult,
  UIUXAnalysis,
  ComponentArchitecture,
  StateManagementSpec,
  APIIntegration,
  ResponsiveDesignSpec,
  AccessibilitySpec,
} from "../../src/roles/frontendEngineer.js";

describe("FrontendEngineerRole", () => {
  let feRole: FrontendEngineerRole;
  const sampleRequirement = "Implement user authentication with login form, registration wizard, and password reset flow";

  beforeEach(() => {
    feRole = new FrontendEngineerRole();
  });

  describe("UI/UX Analysis", () => {
    it("should analyze requirement for UI/UX implications", async () => {
      const result = await feRole.analyze(sampleRequirement);

      expect(result.uiUxAnalysis).toBeDefined();
      expect(result.uiUxAnalysis.userFlows).toBeInstanceOf(Array);
      expect(result.uiUxAnalysis.userFlows.length).toBeGreaterThan(0);
    });

    it("should identify user interaction patterns", async () => {
      const result = await feRole.analyze(sampleRequirement);

      expect(result.uiUxAnalysis.interactionPatterns).toBeInstanceOf(Array);
    });

    it("should suggest UI elements for each flow", async () => {
      const result = await feRole.analyze(sampleRequirement);

      for (const flow of result.uiUxAnalysis.userFlows) {
        expect(flow).toHaveProperty("name");
        expect(flow).toHaveProperty("steps");
        expect(flow.steps).toBeInstanceOf(Array);
      }
    });

    it("should handle empty requirement gracefully", async () => {
      await expect(feRole.analyze("")).rejects.toThrow("Requirement cannot be empty");
    });
  });

  describe("Component Architecture", () => {
    it("should generate component hierarchy and structure", async () => {
      const result = await feRole.analyze(sampleRequirement);

      expect(result.componentArchitecture).toBeDefined();
      expect(result.componentArchitecture.hierarchy).toBeInstanceOf(Array);
      expect(result.componentArchitecture.hierarchy.length).toBeGreaterThan(0);
    });

    it("should define component types (page, container, presentational)", async () => {
      const result = await feRole.analyze(sampleRequirement);

      for (const component of result.componentArchitecture.hierarchy) {
        expect(component).toHaveProperty("name");
        expect(component).toHaveProperty("type");
        expect(["page", "container", "presentational", "layout", "hook"]).toContain(component.type);
      }
    });

    it("should define component props interface", async () => {
      const result = await feRole.analyze(sampleRequirement);

      for (const component of result.componentArchitecture.hierarchy) {
        expect(component).toHaveProperty("props");
        expect(component.props).toBeInstanceOf(Array);
      }
    });

    it("should identify shared components", async () => {
      const result = await feRole.analyze(sampleRequirement);

      expect(result.componentArchitecture.sharedComponents).toBeInstanceOf(Array);
    });

    it("should suggest component file structure", async () => {
      const result = await feRole.analyze(sampleRequirement);

      expect(result.componentArchitecture.fileStructure).toBeDefined();
      expect(result.componentArchitecture.fileStructure.basePath).toBeDefined();
    });
  });

  describe("State Management", () => {
    it("should define state management requirements with local vs global distinction", async () => {
      const result = await feRole.analyze(sampleRequirement);

      expect(result.stateManagement).toBeDefined();
      expect(result.stateManagement.localState).toBeInstanceOf(Array);
      expect(result.stateManagement.globalState).toBeInstanceOf(Array);
    });

    it("should identify state for each major feature", async () => {
      const result = await feRole.analyze(sampleRequirement);

      // Should have state definitions
      const hasState = result.stateManagement.localState.length > 0 ||
                       result.stateManagement.globalState.length > 0;
      expect(hasState).toBe(true);
    });

    it("should define state shape for global stores", async () => {
      const result = await feRole.analyze(sampleRequirement);

      for (const store of result.stateManagement.globalState) {
        expect(store).toHaveProperty("name");
        expect(store).toHaveProperty("shape");
        expect(store).toHaveProperty("actions");
      }
    });

    it("should suggest state management library", async () => {
      const result = await feRole.analyze(sampleRequirement);

      expect(result.stateManagement.recommendedLibrary).toBeDefined();
    });
  });

  describe("API Integration", () => {
    it("should identify API integration points and data contracts", async () => {
      const result = await feRole.analyze(sampleRequirement);

      expect(result.apiIntegration).toBeDefined();
      expect(result.apiIntegration.endpoints).toBeInstanceOf(Array);
      expect(result.apiIntegration.endpoints.length).toBeGreaterThan(0);
    });

    it("should define request/response types for each endpoint", async () => {
      const result = await feRole.analyze(sampleRequirement);

      for (const endpoint of result.apiIntegration.endpoints) {
        expect(endpoint).toHaveProperty("path");
        expect(endpoint).toHaveProperty("method");
        expect(endpoint).toHaveProperty("requestType");
        expect(endpoint).toHaveProperty("responseType");
      }
    });

    it("should identify error handling requirements", async () => {
      const result = await feRole.analyze(sampleRequirement);

      expect(result.apiIntegration.errorHandling).toBeDefined();
      expect(result.apiIntegration.errorHandling.strategies).toBeInstanceOf(Array);
    });

    it("should suggest data fetching patterns", async () => {
      const result = await feRole.analyze(sampleRequirement);

      expect(result.apiIntegration.fetchingPattern).toBeDefined();
    });
  });

  describe("Responsive Design", () => {
    it("should suggest responsive design considerations", async () => {
      const result = await feRole.analyze(sampleRequirement);

      expect(result.responsiveDesign).toBeDefined();
      expect(result.responsiveDesign.breakpoints).toBeInstanceOf(Array);
      expect(result.responsiveDesign.breakpoints.length).toBeGreaterThan(0);
    });

    it("should define layout strategies for each breakpoint", async () => {
      const result = await feRole.analyze(sampleRequirement);

      for (const breakpoint of result.responsiveDesign.breakpoints) {
        expect(breakpoint).toHaveProperty("name");
        expect(breakpoint).toHaveProperty("minWidth");
        expect(breakpoint).toHaveProperty("layoutStrategy");
      }
    });

    it("should identify mobile-specific considerations", async () => {
      const result = await feRole.analyze(sampleRequirement);

      expect(result.responsiveDesign.mobileConsiderations).toBeInstanceOf(Array);
    });
  });

  describe("Accessibility", () => {
    it("should define accessibility requirements", async () => {
      const result = await feRole.analyze(sampleRequirement);

      expect(result.accessibility).toBeDefined();
      expect(result.accessibility.wcagLevel).toMatch(/^(A|AA|AAA)$/);
    });

    it("should identify ARIA requirements", async () => {
      const result = await feRole.analyze(sampleRequirement);

      expect(result.accessibility.ariaRequirements).toBeInstanceOf(Array);
    });

    it("should define keyboard navigation requirements", async () => {
      const result = await feRole.analyze(sampleRequirement);

      expect(result.accessibility.keyboardNavigation).toBeDefined();
      expect(result.accessibility.keyboardNavigation.requirements).toBeInstanceOf(Array);
    });

    it("should identify form accessibility needs", async () => {
      const result = await feRole.analyze(sampleRequirement);

      // Since we're analyzing a form-heavy feature
      expect(result.accessibility.formAccessibility).toBeDefined();
    });
  });

  describe("Structured JSON Output", () => {
    it("should output structured JSON with complete frontend specifications", async () => {
      const result = await feRole.analyze(sampleRequirement);

      expect(result).toHaveProperty("uiUxAnalysis");
      expect(result).toHaveProperty("componentArchitecture");
      expect(result).toHaveProperty("stateManagement");
      expect(result).toHaveProperty("apiIntegration");
      expect(result).toHaveProperty("responsiveDesign");
      expect(result).toHaveProperty("accessibility");
      expect(result).toHaveProperty("metadata");
    });

    it("should include metadata", async () => {
      const result = await feRole.analyze(sampleRequirement);

      expect(result.metadata).toHaveProperty("analyzedAt");
      expect(result.metadata).toHaveProperty("version");
    });

    it("should be serializable to valid JSON", async () => {
      const result = await feRole.analyze(sampleRequirement);

      const jsonString = JSON.stringify(result);
      expect(() => JSON.parse(jsonString)).not.toThrow();
    });

    it("should support toJSON method", async () => {
      const result = await feRole.analyze(sampleRequirement);

      expect(result.toJSON).toBeInstanceOf(Function);
      const json = result.toJSON();
      expect(json).toHaveProperty("componentArchitecture");
    });
  });
});
