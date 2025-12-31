/**
 * Tests for init command --roles flag
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { parseRolesOption, runMultiRoleAnalysis, RoleAnalysisOptions } from "../../src/commands/init-roles.js";

describe("Init --roles flag", () => {
  describe("parseRolesOption", () => {
    it("should parse --roles flag with all roles", () => {
      const result = parseRolesOption("all");
      expect(result).toEqual(["pm", "frontend", "backend", "qa"]);
    });

    it("should parse --roles flag with specific roles", () => {
      const result = parseRolesOption("pm,frontend");
      expect(result).toEqual(["pm", "frontend"]);
    });

    it("should parse --roles flag with single role", () => {
      const result = parseRolesOption("pm");
      expect(result).toEqual(["pm"]);
    });

    it("should handle empty string as all roles", () => {
      const result = parseRolesOption("");
      expect(result).toEqual(["pm", "frontend", "backend", "qa"]);
    });

    it("should normalize role names", () => {
      const result = parseRolesOption("PM,Frontend,BACKEND,Qa");
      expect(result).toEqual(["pm", "frontend", "backend", "qa"]);
    });

    it("should filter invalid role names", () => {
      const result = parseRolesOption("pm,invalid,frontend");
      expect(result).toEqual(["pm", "frontend"]);
    });
  });

  describe("runMultiRoleAnalysis", () => {
    it("should run all 4 roles when roles=all", async () => {
      const options: RoleAnalysisOptions = {
        requirement: "Implement user authentication",
        roles: ["pm", "frontend", "backend", "qa"],
        outputDir: "/tmp/test",
      };

      const result = await runMultiRoleAnalysis(options);

      expect(result.success).toBe(true);
      expect(result.outputs).toHaveProperty("pm");
      expect(result.outputs).toHaveProperty("frontend");
      expect(result.outputs).toHaveProperty("backend");
      expect(result.outputs).toHaveProperty("qa");
    });

    it("should run only specified roles", async () => {
      const options: RoleAnalysisOptions = {
        requirement: "Implement user authentication",
        roles: ["pm", "frontend"],
        outputDir: "/tmp/test",
      };

      const result = await runMultiRoleAnalysis(options);

      expect(result.success).toBe(true);
      expect(result.outputs).toHaveProperty("pm");
      expect(result.outputs).toHaveProperty("frontend");
      expect(result.outputs).not.toHaveProperty("backend");
      expect(result.outputs).not.toHaveProperty("qa");
    });

    it("should aggregate outputs into unified document", async () => {
      const options: RoleAnalysisOptions = {
        requirement: "Implement user authentication",
        roles: ["pm", "frontend", "backend", "qa"],
        outputDir: "/tmp/test",
      };

      const result = await runMultiRoleAnalysis(options);

      expect(result.unifiedDocument).toBeDefined();
      expect(result.unifiedDocument?.originalRequirement).toBe(options.requirement);
    });

    it("should handle errors gracefully", async () => {
      const options: RoleAnalysisOptions = {
        requirement: "",
        roles: ["pm"],
        outputDir: "/tmp/test",
      };

      const result = await runMultiRoleAnalysis(options);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});
