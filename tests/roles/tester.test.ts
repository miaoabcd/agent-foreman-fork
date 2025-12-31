/**
 * Tests for src/roles/tester.ts - Tester/QA role implementation
 */
import { describe, it, expect, beforeEach } from "vitest";
import { TesterRole, TesterAnalysisResult } from "../../src/roles/tester.js";

describe("TesterRole", () => {
  let qaRole: TesterRole;
  const sampleRequirement = "Implement user login with email validation and error handling";

  beforeEach(() => {
    qaRole = new TesterRole();
  });

  describe("Unit Test Cases", () => {
    it("should generate unit test cases from acceptance criteria", async () => {
      const result = await qaRole.analyze(sampleRequirement);

      expect(result.unitTestCases).toBeInstanceOf(Array);
      expect(result.unitTestCases.length).toBeGreaterThan(0);
      expect(result.unitTestCases[0]).toHaveProperty("description");
      expect(result.unitTestCases[0]).toHaveProperty("assertions");
    });

    it("should handle empty requirement gracefully", async () => {
      await expect(qaRole.analyze("")).rejects.toThrow("Requirement cannot be empty");
    });
  });

  describe("E2E Scenarios", () => {
    it("should design E2E test scenarios with user flows", async () => {
      const result = await qaRole.analyze(sampleRequirement);

      expect(result.e2eScenarios).toBeInstanceOf(Array);
      expect(result.e2eScenarios.length).toBeGreaterThan(0);
      expect(result.e2eScenarios[0]).toHaveProperty("name");
      expect(result.e2eScenarios[0]).toHaveProperty("steps");
    });
  });

  describe("Edge Cases", () => {
    it("should identify edge cases and error conditions", async () => {
      const result = await qaRole.analyze(sampleRequirement);

      expect(result.edgeCases).toBeInstanceOf(Array);
      expect(result.edgeCases.length).toBeGreaterThan(0);
    });
  });

  describe("Test Data", () => {
    it("should define test data requirements and fixtures", async () => {
      const result = await qaRole.analyze(sampleRequirement);

      expect(result.testDataRequirements).toBeDefined();
      expect(result.testDataRequirements.fixtures).toBeInstanceOf(Array);
    });
  });

  describe("Integration Tests", () => {
    it("should suggest integration test points", async () => {
      const result = await qaRole.analyze(sampleRequirement);

      expect(result.integrationTestPoints).toBeInstanceOf(Array);
    });
  });

  describe("Traceability", () => {
    it("should map tests to acceptance criteria for traceability", async () => {
      const result = await qaRole.analyze(sampleRequirement);

      expect(result.traceabilityMatrix).toBeInstanceOf(Array);
    });
  });

  describe("Structured Output", () => {
    it("should output structured JSON with test specifications", async () => {
      const result = await qaRole.analyze(sampleRequirement);

      expect(result).toHaveProperty("unitTestCases");
      expect(result).toHaveProperty("e2eScenarios");
      expect(result).toHaveProperty("edgeCases");
      expect(result).toHaveProperty("testDataRequirements");
      expect(result).toHaveProperty("integrationTestPoints");
      expect(result).toHaveProperty("traceabilityMatrix");
      expect(result).toHaveProperty("metadata");
    });

    it("should be serializable to valid JSON", async () => {
      const result = await qaRole.analyze(sampleRequirement);
      expect(() => JSON.stringify(result)).not.toThrow();
    });

    it("should support toJSON method", async () => {
      const result = await qaRole.analyze(sampleRequirement);
      expect(result.toJSON).toBeInstanceOf(Function);
    });
  });
});
