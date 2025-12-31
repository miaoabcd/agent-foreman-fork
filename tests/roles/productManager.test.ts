/**
 * Tests for src/roles/productManager.ts - Product Manager role implementation
 * TDD: RED phase - these tests should FAIL initially
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  ProductManagerRole,
  PMAnalysisResult,
  UserStory,
  BusinessValue,
  PriorityAssessment,
  Stakeholder,
  Dependency,
} from "../../src/roles/productManager.js";

describe("ProductManagerRole", () => {
  let pmRole: ProductManagerRole;
  const sampleRequirement = "Implement user authentication with login, registration, and password reset functionality";

  beforeEach(() => {
    pmRole = new ProductManagerRole();
  });

  describe("Requirement Parsing", () => {
    it("should parse input requirement description", async () => {
      const result = await pmRole.analyze(sampleRequirement);

      expect(result.parsedRequirement).toBeDefined();
      expect(result.parsedRequirement.raw).toBe(sampleRequirement);
      expect(result.parsedRequirement.keywords).toBeInstanceOf(Array);
      expect(result.parsedRequirement.keywords.length).toBeGreaterThan(0);
    });

    it("should extract key entities from requirement", async () => {
      const result = await pmRole.analyze(sampleRequirement);

      expect(result.parsedRequirement.entities).toBeInstanceOf(Array);
      // Should identify "user", "authentication", "login", "registration", "password reset"
      expect(result.parsedRequirement.entities.some(e =>
        e.toLowerCase().includes("user") || e.toLowerCase().includes("authentication")
      )).toBe(true);
    });

    it("should identify action verbs in requirement", async () => {
      const result = await pmRole.analyze(sampleRequirement);

      expect(result.parsedRequirement.actions).toBeInstanceOf(Array);
      expect(result.parsedRequirement.actions.some(a =>
        ["implement", "login", "register", "reset"].includes(a.toLowerCase())
      )).toBe(true);
    });

    it("should handle empty requirement gracefully", async () => {
      await expect(pmRole.analyze("")).rejects.toThrow("Requirement cannot be empty");
    });
  });

  describe("User Story Generation", () => {
    it("should generate user stories in 'As a [user], I want [action], so that [benefit]' format", async () => {
      const result = await pmRole.analyze(sampleRequirement);

      expect(result.userStories).toBeInstanceOf(Array);
      expect(result.userStories.length).toBeGreaterThan(0);

      const story = result.userStories[0];
      expect(story).toHaveProperty("asA");
      expect(story).toHaveProperty("iWant");
      expect(story).toHaveProperty("soThat");
      expect(story.asA.length).toBeGreaterThan(0);
      expect(story.iWant.length).toBeGreaterThan(0);
      expect(story.soThat.length).toBeGreaterThan(0);
    });

    it("should generate multiple user stories for complex requirements", async () => {
      const result = await pmRole.analyze(sampleRequirement);

      // Complex requirement should generate multiple stories
      expect(result.userStories.length).toBeGreaterThanOrEqual(2);
    });

    it("should format user stories as readable strings", async () => {
      const result = await pmRole.analyze(sampleRequirement);

      const formatted = pmRole.formatUserStory(result.userStories[0]);
      expect(formatted).toMatch(/^As a .+, I want .+, so that .+\.?$/);
    });

    it("should assign unique IDs to each user story", async () => {
      const result = await pmRole.analyze(sampleRequirement);

      const ids = result.userStories.map(s => s.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(result.userStories.length);
    });

    it("should categorize user stories by type", async () => {
      const result = await pmRole.analyze(sampleRequirement);

      for (const story of result.userStories) {
        expect(story.type).toBeDefined();
        expect(["functional", "non-functional", "technical"]).toContain(story.type);
      }
    });
  });

  describe("Acceptance Criteria Extraction", () => {
    it("should extract and refine acceptance criteria", async () => {
      const result = await pmRole.analyze(sampleRequirement);

      expect(result.acceptanceCriteria).toBeInstanceOf(Array);
      expect(result.acceptanceCriteria.length).toBeGreaterThan(0);
      expect(typeof result.acceptanceCriteria[0]).toBe("string");
    });

    it("should generate testable acceptance criteria", async () => {
      const result = await pmRole.analyze(sampleRequirement);

      // Each criterion should be specific and testable
      for (const criterion of result.acceptanceCriteria) {
        expect(criterion.length).toBeGreaterThan(10);
        // Should contain action words
        expect(criterion.toLowerCase()).toMatch(/should|must|can|will|verify|ensure/);
      }
    });

    it("should link acceptance criteria to user stories", async () => {
      const result = await pmRole.analyze(sampleRequirement);

      expect(result.criteriaMapping).toBeDefined();
      expect(result.criteriaMapping).toBeInstanceOf(Array);

      for (const mapping of result.criteriaMapping) {
        expect(mapping.storyId).toBeDefined();
        expect(mapping.criteria).toBeInstanceOf(Array);
      }
    });
  });

  describe("Business Value Analysis", () => {
    it("should analyze business value and ROI", async () => {
      const result = await pmRole.analyze(sampleRequirement);

      expect(result.businessValue).toBeDefined();
      expect(result.businessValue).toHaveProperty("description");
      expect(result.businessValue).toHaveProperty("roi");
      expect(result.businessValue.roi).toHaveProperty("estimate");
    });

    it("should identify value drivers", async () => {
      const result = await pmRole.analyze(sampleRequirement);

      expect(result.businessValue.valueDrivers).toBeInstanceOf(Array);
      expect(result.businessValue.valueDrivers.length).toBeGreaterThan(0);
    });

    it("should assess risk factors", async () => {
      const result = await pmRole.analyze(sampleRequirement);

      expect(result.businessValue.risks).toBeInstanceOf(Array);
    });

    it("should estimate implementation effort", async () => {
      const result = await pmRole.analyze(sampleRequirement);

      expect(result.businessValue.effort).toBeDefined();
      expect(result.businessValue.effort).toHaveProperty("estimate");
      expect(["low", "medium", "high", "very-high"]).toContain(result.businessValue.effort.estimate);
    });
  });

  describe("Priority Assessment", () => {
    it("should suggest priority based on value and complexity", async () => {
      const result = await pmRole.analyze(sampleRequirement);

      expect(result.priority).toBeDefined();
      expect(result.priority).toHaveProperty("level");
      expect(["critical", "high", "medium", "low"]).toContain(result.priority.level);
    });

    it("should provide priority justification", async () => {
      const result = await pmRole.analyze(sampleRequirement);

      expect(result.priority).toHaveProperty("justification");
      expect(result.priority.justification.length).toBeGreaterThan(0);
    });

    it("should include value and complexity scores", async () => {
      const result = await pmRole.analyze(sampleRequirement);

      expect(result.priority).toHaveProperty("valueScore");
      expect(result.priority).toHaveProperty("complexityScore");
      expect(result.priority.valueScore).toBeGreaterThanOrEqual(1);
      expect(result.priority.valueScore).toBeLessThanOrEqual(10);
      expect(result.priority.complexityScore).toBeGreaterThanOrEqual(1);
      expect(result.priority.complexityScore).toBeLessThanOrEqual(10);
    });

    it("should recommend implementation order", async () => {
      const result = await pmRole.analyze(sampleRequirement);

      expect(result.priority).toHaveProperty("suggestedOrder");
      expect(typeof result.priority.suggestedOrder).toBe("number");
    });
  });

  describe("Stakeholder Identification", () => {
    it("should identify stakeholders", async () => {
      const result = await pmRole.analyze(sampleRequirement);

      expect(result.stakeholders).toBeInstanceOf(Array);
      expect(result.stakeholders.length).toBeGreaterThan(0);
    });

    it("should categorize stakeholder roles", async () => {
      const result = await pmRole.analyze(sampleRequirement);

      for (const stakeholder of result.stakeholders) {
        expect(stakeholder).toHaveProperty("name");
        expect(stakeholder).toHaveProperty("role");
        expect(stakeholder).toHaveProperty("interest");
        expect(["primary", "secondary", "tertiary"]).toContain(stakeholder.interest);
      }
    });

    it("should identify communication needs for stakeholders", async () => {
      const result = await pmRole.analyze(sampleRequirement);

      for (const stakeholder of result.stakeholders) {
        expect(stakeholder).toHaveProperty("communicationNeeds");
      }
    });
  });

  describe("Dependency Identification", () => {
    it("should identify dependencies", async () => {
      const result = await pmRole.analyze(sampleRequirement);

      expect(result.dependencies).toBeInstanceOf(Array);
    });

    it("should categorize dependency types", async () => {
      const result = await pmRole.analyze(sampleRequirement);

      for (const dep of result.dependencies) {
        expect(dep).toHaveProperty("name");
        expect(dep).toHaveProperty("type");
        expect(["technical", "business", "external", "internal"]).toContain(dep.type);
      }
    });

    it("should assess dependency risk", async () => {
      const result = await pmRole.analyze(sampleRequirement);

      for (const dep of result.dependencies) {
        expect(dep).toHaveProperty("risk");
        expect(["low", "medium", "high"]).toContain(dep.risk);
      }
    });
  });

  describe("Structured JSON Output", () => {
    it("should output structured JSON with all PM artifacts", async () => {
      const result = await pmRole.analyze(sampleRequirement);

      // All required properties
      expect(result).toHaveProperty("parsedRequirement");
      expect(result).toHaveProperty("userStories");
      expect(result).toHaveProperty("acceptanceCriteria");
      expect(result).toHaveProperty("businessValue");
      expect(result).toHaveProperty("priority");
      expect(result).toHaveProperty("stakeholders");
      expect(result).toHaveProperty("dependencies");
    });

    it("should include metadata in output", async () => {
      const result = await pmRole.analyze(sampleRequirement);

      expect(result.metadata).toBeDefined();
      expect(result.metadata).toHaveProperty("analyzedAt");
      expect(result.metadata).toHaveProperty("version");
    });

    it("should be serializable to valid JSON", async () => {
      const result = await pmRole.analyze(sampleRequirement);

      const jsonString = JSON.stringify(result);
      expect(() => JSON.parse(jsonString)).not.toThrow();
    });

    it("should support toJSON method for custom serialization", async () => {
      const result = await pmRole.analyze(sampleRequirement);

      expect(result.toJSON).toBeInstanceOf(Function);
      const json = result.toJSON();
      expect(json).toHaveProperty("userStories");
    });
  });

  describe("Integration with MultiRoleAnalyzer", () => {
    it("should be usable as a standalone role analyzer", async () => {
      const result = await pmRole.analyze(sampleRequirement);
      expect(result).toBeDefined();
    });

    it("should provide output compatible with MultiRoleAnalyzer PMOutput", async () => {
      const result = await pmRole.analyze(sampleRequirement);

      // Should have properties expected by PMOutput
      expect(result.userStories).toBeInstanceOf(Array);
      expect(result.acceptanceCriteria).toBeInstanceOf(Array);
      expect(result.businessValue).toBeDefined();
      expect(result.priority).toBeDefined();
      expect(result.stakeholders).toBeInstanceOf(Array);
    });
  });
});
