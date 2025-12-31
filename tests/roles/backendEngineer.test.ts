/**
 * Tests for src/roles/backendEngineer.ts - Backend Engineer role implementation
 */
import { describe, it, expect, beforeEach } from "vitest";
import {
  BackendEngineerRole,
  BackendAnalysisResult,
} from "../../src/roles/backendEngineer.js";

describe("BackendEngineerRole", () => {
  let beRole: BackendEngineerRole;
  const sampleRequirement = "Implement user authentication with JWT tokens, password hashing, and session management";

  beforeEach(() => {
    beRole = new BackendEngineerRole();
  });

  describe("API Design", () => {
    it("should design REST API endpoints with request/response schemas", async () => {
      const result = await beRole.analyze(sampleRequirement);

      expect(result.apiDesign).toBeDefined();
      expect(result.apiDesign.endpoints).toBeInstanceOf(Array);
      expect(result.apiDesign.endpoints.length).toBeGreaterThan(0);

      const endpoint = result.apiDesign.endpoints[0];
      expect(endpoint).toHaveProperty("method");
      expect(endpoint).toHaveProperty("path");
      expect(endpoint).toHaveProperty("requestSchema");
      expect(endpoint).toHaveProperty("responseSchema");
    });

    it("should handle empty requirement gracefully", async () => {
      await expect(beRole.analyze("")).rejects.toThrow("Requirement cannot be empty");
    });
  });

  describe("Data Models", () => {
    it("should define data models and database schema changes", async () => {
      const result = await beRole.analyze(sampleRequirement);

      expect(result.dataModels).toBeInstanceOf(Array);
      expect(result.dataModels.length).toBeGreaterThan(0);

      const model = result.dataModels[0];
      expect(model).toHaveProperty("name");
      expect(model).toHaveProperty("fields");
      expect(model.fields).toBeInstanceOf(Array);
    });
  });

  describe("Service Architecture", () => {
    it("should identify service architecture patterns", async () => {
      const result = await beRole.analyze(sampleRequirement);

      expect(result.serviceArchitecture).toBeDefined();
      expect(result.serviceArchitecture.pattern).toBeDefined();
      expect(["monolith", "microservices", "serverless", "modular"]).toContain(
        result.serviceArchitecture.pattern
      );
    });

    it("should define services and their responsibilities", async () => {
      const result = await beRole.analyze(sampleRequirement);

      expect(result.serviceArchitecture.services).toBeInstanceOf(Array);
      expect(result.serviceArchitecture.services.length).toBeGreaterThan(0);
    });
  });

  describe("Authentication & Authorization", () => {
    it("should define authentication and authorization requirements", async () => {
      const result = await beRole.analyze(sampleRequirement);

      expect(result.authRequirements).toBeDefined();
      expect(result.authRequirements.authentication).toBeDefined();
      expect(result.authRequirements.authorization).toBeDefined();
    });
  });

  describe("Caching & Performance", () => {
    it("should suggest caching and performance optimizations", async () => {
      const result = await beRole.analyze(sampleRequirement);

      expect(result.cachingStrategy).toBeDefined();
      expect(result.cachingStrategy.approach).toBeDefined();
    });
  });

  describe("Infrastructure", () => {
    it("should identify infrastructure requirements", async () => {
      const result = await beRole.analyze(sampleRequirement);

      expect(result.infrastructureRequirements).toBeInstanceOf(Array);
      expect(result.infrastructureRequirements.length).toBeGreaterThan(0);
    });
  });

  describe("Structured Output", () => {
    it("should output structured JSON with backend specifications", async () => {
      const result = await beRole.analyze(sampleRequirement);

      expect(result).toHaveProperty("apiDesign");
      expect(result).toHaveProperty("dataModels");
      expect(result).toHaveProperty("serviceArchitecture");
      expect(result).toHaveProperty("authRequirements");
      expect(result).toHaveProperty("cachingStrategy");
      expect(result).toHaveProperty("infrastructureRequirements");
      expect(result).toHaveProperty("metadata");
    });

    it("should be serializable to valid JSON", async () => {
      const result = await beRole.analyze(sampleRequirement);
      expect(() => JSON.stringify(result)).not.toThrow();
    });

    it("should support toJSON method", async () => {
      const result = await beRole.analyze(sampleRequirement);
      expect(result.toJSON).toBeInstanceOf(Function);
    });
  });
});
