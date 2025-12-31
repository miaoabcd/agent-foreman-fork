/**
 * Multi-role requirement analysis module
 * Analyzes requirements from different perspectives:
 * - Product Manager (PM)
 * - Frontend Engineer
 * - Backend Engineer
 * - QA/Tester
 */

// ============================================================================
// Type Definitions
// ============================================================================

export type RoleType = "pm" | "frontend" | "backend" | "qa";

export type OutputFormat = "json" | "markdown";

/** User story in standard format */
export interface UserStory {
  asA: string;
  iWant: string;
  soThat: string;
}

/** Product Manager role output */
export interface PMOutput {
  role: "pm";
  userStories: UserStory[];
  acceptanceCriteria: string[];
  businessValue: string;
  priority: "high" | "medium" | "low";
  stakeholders: string[];
  dependencies: string[];
}

/** API integration point */
export interface APIIntegrationPoint {
  endpoint: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  description: string;
  requestPayload?: Record<string, unknown>;
  responsePayload?: Record<string, unknown>;
}

/** Component structure */
export interface ComponentStructure {
  components: Array<{
    name: string;
    type: "page" | "component" | "layout" | "hook";
    description: string;
    children?: string[];
  }>;
}

/** State management requirements */
export interface StateManagement {
  stores: Array<{
    name: string;
    purpose: string;
    scope: "local" | "global";
  }>;
}

/** Frontend Engineer role output */
export interface FrontendOutput {
  role: "frontend";
  uiRequirements: string[];
  componentStructure: ComponentStructure;
  stateManagement: StateManagement;
  apiIntegrationPoints: APIIntegrationPoint[];
  accessibilityRequirements: string[];
  responsiveDesign: {
    breakpoints: string[];
    considerations: string[];
  };
}

/** API endpoint definition */
export interface APIEndpoint {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  path: string;
  description: string;
  requestSchema: Record<string, unknown>;
  responseSchema: Record<string, unknown>;
  authentication?: boolean;
}

/** Data model definition */
export interface DataModel {
  name: string;
  description: string;
  fields: Array<{
    name: string;
    type: string;
    required: boolean;
    description?: string;
  }>;
}

/** Service architecture */
export interface ServiceArchitecture {
  pattern: "monolith" | "microservices" | "serverless" | "hybrid";
  services: Array<{
    name: string;
    responsibility: string;
  }>;
}

/** Auth requirements */
export interface AuthRequirements {
  authentication: {
    method: string;
    details: string;
  };
  authorization: {
    model: string;
    roles?: string[];
  };
}

/** Backend Engineer role output */
export interface BackendOutput {
  role: "backend";
  apiDesign: {
    endpoints: APIEndpoint[];
    baseUrl?: string;
  };
  dataModels: DataModel[];
  serviceArchitecture: ServiceArchitecture;
  infrastructureRequirements: string[];
  authRequirements: AuthRequirements;
  cachingStrategy: {
    approach: string;
    targets: string[];
  };
}

/** Unit test case */
export interface UnitTestCase {
  description: string;
  assertions: string[];
  category?: string;
}

/** E2E scenario */
export interface E2EScenario {
  name: string;
  steps: string[];
  expectedResult: string;
}

/** Test data requirements */
export interface TestDataRequirements {
  fixtures: Array<{
    name: string;
    type: string;
    description: string;
  }>;
  mockData: string[];
}

/** Traceability entry */
export interface TraceabilityEntry {
  acceptanceCriterion: string;
  testCases: string[];
}

/** QA/Tester role output */
export interface QAOutput {
  role: "qa";
  unitTestCases: UnitTestCase[];
  e2eScenarios: E2EScenario[];
  edgeCases: string[];
  testDataRequirements: TestDataRequirements;
  traceabilityMatrix: TraceabilityEntry[];
  integrationTestPoints: string[];
}

/** Union type for all role outputs */
export type RoleOutput = PMOutput | FrontendOutput | BackendOutput | QAOutput;

/** Parallel execution result for a single role */
export interface ParallelRoleResult {
  role: RoleType;
  requirement: string;
  output?: RoleOutput;
  success: boolean;
  error?: string;
}

/** Traceability link between artifacts */
export interface TraceabilityLink {
  source: {
    type: "user_story" | "component" | "endpoint" | "test";
    id: string;
  };
  target: {
    type: "user_story" | "component" | "endpoint" | "test";
    id: string;
  };
  relationship: string;
}

/** Conflict between role outputs */
export interface RoleConflict {
  roles: RoleType[];
  description: string;
  resolution?: string;
}

/** Unified requirement document */
export interface UnifiedRequirementDocument {
  originalRequirement: string;
  pm: PMOutput;
  frontend: FrontendOutput;
  backend: BackendOutput;
  qa: QAOutput;
  metadata: {
    generatedAt: string;
    rolesIncluded: RoleType[];
    analysisVersion: string;
  };
  summary: string;
  conflicts: RoleConflict[];
  traceability: {
    links: TraceabilityLink[];
  };
}

/** Analyze options */
export interface AnalyzeOptions {
  format?: OutputFormat;
  roles?: RoleType[];
  continueOnError?: boolean;
}

/** Agent provider function type */
export type AgentProvider = (prompt: string) => Promise<{ success: boolean; output: string }>;

// ============================================================================
// MultiRoleAnalyzer Implementation
// ============================================================================

export class MultiRoleAnalyzer {
  private _activeRoles: RoleType[] = ["pm", "frontend", "backend", "qa"];
  private _agentProvider?: AgentProvider;

  /** Supported role types */
  get supportedRoles(): RoleType[] {
    return ["pm", "frontend", "backend", "qa"];
  }

  /** Supported output formats */
  get supportedFormats(): OutputFormat[] {
    return ["json", "markdown"];
  }

  /** Currently active roles */
  get activeRoles(): RoleType[] {
    return [...this._activeRoles];
  }

  /**
   * Configure the analyzer with specific roles
   */
  configure(options: { roles: RoleType[] }): { activeRoles: RoleType[] } {
    if (!options.roles || options.roles.length === 0) {
      throw new Error("At least one role must be specified");
    }

    for (const role of options.roles) {
      if (!this.supportedRoles.includes(role)) {
        throw new Error(`Invalid role: ${role}`);
      }
    }

    this._activeRoles = [...options.roles];
    return { activeRoles: this._activeRoles };
  }

  /**
   * Set the AI agent provider for analysis
   */
  setAgentProvider(provider: AgentProvider): void {
    this._agentProvider = provider;
  }

  /**
   * Analyze requirement from a specific role's perspective
   */
  async analyzeAsRole(role: RoleType, requirement: string): Promise<RoleOutput> {
    if (!requirement || requirement.trim() === "") {
      throw new Error("Requirement cannot be empty");
    }

    switch (role) {
      case "pm":
        return this.analyzePM(requirement);
      case "frontend":
        return this.analyzeFrontend(requirement);
      case "backend":
        return this.analyzeBackend(requirement);
      case "qa":
        return this.analyzeQA(requirement);
      default:
        throw new Error(`Unknown role: ${role}`);
    }
  }

  /**
   * Analyze requirement in parallel across all active roles
   */
  async analyzeParallel(
    requirement: string,
    options?: { continueOnError?: boolean }
  ): Promise<ParallelRoleResult[]> {
    const continueOnError = options?.continueOnError ?? false;

    const promises = this._activeRoles.map(async (role): Promise<ParallelRoleResult> => {
      try {
        const output = await this.analyzeAsRole(role, requirement);
        return {
          role,
          requirement,
          output,
          success: true,
        };
      } catch (error) {
        if (!continueOnError) {
          throw error;
        }
        return {
          role,
          requirement,
          success: false,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    });

    return Promise.all(promises);
  }

  /**
   * Analyze requirement and return unified document or markdown
   */
  async analyze(
    requirement: string,
    options?: AnalyzeOptions
  ): Promise<UnifiedRequirementDocument | string> {
    if (!requirement || requirement.trim() === "") {
      throw new Error("Requirement cannot be empty");
    }

    const format = options?.format ?? "json";
    const roles = options?.roles ?? this._activeRoles;

    // Save and restore active roles
    const savedRoles = this._activeRoles;
    this._activeRoles = roles;

    try {
      const results = await this.analyzeParallel(requirement, { continueOnError: true });

      const pmResult = results.find(r => r.role === "pm");
      const frontendResult = results.find(r => r.role === "frontend");
      const backendResult = results.find(r => r.role === "backend");
      const qaResult = results.find(r => r.role === "qa");

      const unifiedDoc: UnifiedRequirementDocument = {
        originalRequirement: requirement,
        pm: (pmResult?.output as PMOutput) ?? this.getDefaultPMOutput(),
        frontend: (frontendResult?.output as FrontendOutput) ?? this.getDefaultFrontendOutput(),
        backend: (backendResult?.output as BackendOutput) ?? this.getDefaultBackendOutput(),
        qa: (qaResult?.output as QAOutput) ?? this.getDefaultQAOutput(),
        metadata: {
          generatedAt: new Date().toISOString(),
          rolesIncluded: roles,
          analysisVersion: "1.0.0",
        },
        summary: this.generateSummary(requirement, results),
        conflicts: this.detectConflicts(results),
        traceability: {
          links: this.generateTraceabilityLinks(results),
        },
      };

      if (format === "markdown") {
        return this.toMarkdown(unifiedDoc);
      }

      return unifiedDoc;
    } finally {
      this._activeRoles = savedRoles;
    }
  }

  // ============================================================================
  // Role-specific Analysis Methods
  // ============================================================================

  private async analyzePM(requirement: string): Promise<PMOutput> {
    // If agent provider is set, use AI analysis
    if (this._agentProvider) {
      try {
        const result = await this._agentProvider(
          `Analyze this requirement as a Product Manager and generate user stories, acceptance criteria, business value, and priority:\n\n${requirement}`
        );
        if (result.success && result.output) {
          const parsed = JSON.parse(result.output);
          return { role: "pm", ...parsed };
        }
      } catch {
        // Fall through to rule-based analysis
      }
    }

    // Rule-based fallback analysis
    return {
      role: "pm",
      userStories: [
        {
          asA: "user",
          iWant: `to ${this.extractAction(requirement)}`,
          soThat: "I can achieve my goals efficiently",
        },
      ],
      acceptanceCriteria: this.extractAcceptanceCriteria(requirement),
      businessValue: `Implementing ${requirement} will improve user experience and system functionality`,
      priority: this.inferPriority(requirement),
      stakeholders: ["End Users", "Product Team", "Development Team"],
      dependencies: [],
    };
  }

  private async analyzeFrontend(requirement: string): Promise<FrontendOutput> {
    if (this._agentProvider) {
      try {
        const result = await this._agentProvider(
          `Analyze this requirement as a Frontend Engineer and generate UI/UX requirements, component structure, and API integration points:\n\n${requirement}`
        );
        if (result.success && result.output) {
          const parsed = JSON.parse(result.output);
          return { role: "frontend", ...parsed };
        }
      } catch {
        // Fall through to rule-based analysis
      }
    }

    const componentName = this.extractComponentName(requirement);

    return {
      role: "frontend",
      uiRequirements: [
        `Create ${componentName} component with responsive design`,
        "Implement proper error handling and loading states",
        "Add form validation with user-friendly error messages",
      ],
      componentStructure: {
        components: [
          {
            name: `${componentName}Page`,
            type: "page",
            description: `Main page for ${requirement}`,
            children: [`${componentName}Form`, `${componentName}List`],
          },
          {
            name: `${componentName}Form`,
            type: "component",
            description: "Form component for user input",
          },
        ],
      },
      stateManagement: {
        stores: [
          {
            name: `${componentName.toLowerCase()}Store`,
            purpose: `Manage ${componentName} state`,
            scope: "global",
          },
        ],
      },
      apiIntegrationPoints: [
        {
          endpoint: `/api/${componentName.toLowerCase()}`,
          method: "POST",
          description: `Create new ${componentName}`,
        },
        {
          endpoint: `/api/${componentName.toLowerCase()}`,
          method: "GET",
          description: `Get ${componentName} list`,
        },
      ],
      accessibilityRequirements: [
        "All interactive elements must be keyboard accessible",
        "Form inputs must have associated labels",
        "Color contrast must meet WCAG AA standards",
      ],
      responsiveDesign: {
        breakpoints: ["mobile: 320px", "tablet: 768px", "desktop: 1024px"],
        considerations: [
          "Stack form fields vertically on mobile",
          "Use responsive grid for list items",
        ],
      },
    };
  }

  private async analyzeBackend(requirement: string): Promise<BackendOutput> {
    if (this._agentProvider) {
      try {
        const result = await this._agentProvider(
          `Analyze this requirement as a Backend Engineer and generate API design, data models, and service architecture:\n\n${requirement}`
        );
        if (result.success && result.output) {
          const parsed = JSON.parse(result.output);
          return { role: "backend", ...parsed };
        }
      } catch {
        // Fall through to rule-based analysis
      }
    }

    const resourceName = this.extractResourceName(requirement);

    return {
      role: "backend",
      apiDesign: {
        endpoints: [
          {
            method: "POST",
            path: `/api/${resourceName}`,
            description: `Create new ${resourceName}`,
            requestSchema: { type: "object", properties: {} },
            responseSchema: { type: "object", properties: { id: { type: "string" } } },
            authentication: true,
          },
          {
            method: "GET",
            path: `/api/${resourceName}`,
            description: `List ${resourceName}s`,
            requestSchema: {},
            responseSchema: { type: "array", items: { type: "object" } },
            authentication: true,
          },
          {
            method: "GET",
            path: `/api/${resourceName}/:id`,
            description: `Get ${resourceName} by ID`,
            requestSchema: {},
            responseSchema: { type: "object" },
            authentication: true,
          },
        ],
        baseUrl: "/api/v1",
      },
      dataModels: [
        {
          name: this.capitalize(resourceName),
          description: `${resourceName} entity`,
          fields: [
            { name: "id", type: "string", required: true, description: "Unique identifier" },
            { name: "createdAt", type: "datetime", required: true },
            { name: "updatedAt", type: "datetime", required: true },
          ],
        },
      ],
      serviceArchitecture: {
        pattern: "monolith",
        services: [
          {
            name: `${resourceName}Service`,
            responsibility: `Handle ${resourceName} business logic`,
          },
        ],
      },
      infrastructureRequirements: [
        "Database for persistent storage",
        "Caching layer for frequently accessed data",
        "Logging and monitoring",
      ],
      authRequirements: {
        authentication: {
          method: "JWT",
          details: "Bearer token authentication",
        },
        authorization: {
          model: "RBAC",
          roles: ["admin", "user"],
        },
      },
      cachingStrategy: {
        approach: "Cache-aside pattern",
        targets: [`${resourceName} list queries`, "Frequently accessed entities"],
      },
    };
  }

  private async analyzeQA(requirement: string): Promise<QAOutput> {
    if (this._agentProvider) {
      try {
        const result = await this._agentProvider(
          `Analyze this requirement as a QA Engineer and generate unit tests, E2E scenarios, and edge cases:\n\n${requirement}`
        );
        if (result.success && result.output) {
          const parsed = JSON.parse(result.output);
          return { role: "qa", ...parsed };
        }
      } catch {
        // Fall through to rule-based analysis
      }
    }

    const featureName = this.extractFeatureName(requirement);

    return {
      role: "qa",
      unitTestCases: [
        {
          description: `should create ${featureName} successfully`,
          assertions: [
            "expect(result).toBeDefined()",
            "expect(result.id).toBeTruthy()",
          ],
          category: "creation",
        },
        {
          description: `should validate ${featureName} input`,
          assertions: [
            "expect(validateInput(invalidData)).toBeFalsy()",
            "expect(validateInput(validData)).toBeTruthy()",
          ],
          category: "validation",
        },
        {
          description: `should handle ${featureName} errors gracefully`,
          assertions: [
            "expect(() => handleError()).not.toThrow()",
            "expect(errorMessage).toBeDefined()",
          ],
          category: "error-handling",
        },
      ],
      e2eScenarios: [
        {
          name: `User can complete ${featureName} flow`,
          steps: [
            "Navigate to the feature page",
            "Fill in the required fields",
            "Submit the form",
            "Verify success message",
          ],
          expectedResult: `${featureName} is completed successfully`,
        },
        {
          name: `User sees validation errors for invalid ${featureName} input`,
          steps: [
            "Navigate to the feature page",
            "Submit form with invalid data",
            "Verify error messages appear",
          ],
          expectedResult: "Validation errors are displayed clearly",
        },
      ],
      edgeCases: [
        "Empty input fields",
        "Maximum length input",
        "Special characters in input",
        "Concurrent submissions",
        "Network timeout during submission",
      ],
      testDataRequirements: {
        fixtures: [
          {
            name: `valid${this.capitalize(featureName)}Data`,
            type: "object",
            description: "Valid input data for happy path tests",
          },
          {
            name: `invalid${this.capitalize(featureName)}Data`,
            type: "object",
            description: "Invalid input data for validation tests",
          },
        ],
        mockData: [
          "Mock API responses for success cases",
          "Mock API responses for error cases",
        ],
      },
      traceabilityMatrix: [
        {
          acceptanceCriterion: `${featureName} can be created`,
          testCases: [`should create ${featureName} successfully`],
        },
        {
          acceptanceCriterion: `${featureName} validates input`,
          testCases: [`should validate ${featureName} input`],
        },
      ],
      integrationTestPoints: [
        "API endpoint integration",
        "Database operations",
        "Authentication flow",
      ],
    };
  }

  // ============================================================================
  // Helper Methods
  // ============================================================================

  private extractAction(requirement: string): string {
    // Simple extraction - take first verb phrase
    const words = requirement.toLowerCase().split(" ");
    const verbIndex = words.findIndex(w =>
      ["implement", "create", "add", "build", "develop", "enable"].includes(w)
    );
    if (verbIndex >= 0) {
      return words.slice(verbIndex + 1).join(" ");
    }
    return requirement.toLowerCase();
  }

  private extractAcceptanceCriteria(requirement: string): string[] {
    return [
      `The system should ${requirement.toLowerCase()}`,
      "The feature should handle edge cases gracefully",
      "The implementation should be well-tested",
      "The feature should be accessible to all users",
    ];
  }

  private inferPriority(requirement: string): "high" | "medium" | "low" {
    const lowercaseReq = requirement.toLowerCase();
    if (lowercaseReq.includes("critical") || lowercaseReq.includes("urgent") ||
        lowercaseReq.includes("security") || lowercaseReq.includes("auth")) {
      return "high";
    }
    if (lowercaseReq.includes("optional") || lowercaseReq.includes("nice to have")) {
      return "low";
    }
    return "medium";
  }

  private extractComponentName(requirement: string): string {
    // Extract main noun from requirement
    const words = requirement.split(" ");
    const nouns = words.filter(w =>
      !["implement", "create", "add", "build", "with", "and", "the", "a", "an", "for"].includes(w.toLowerCase())
    );
    return this.capitalize(nouns[0] || "Feature");
  }

  private extractResourceName(requirement: string): string {
    const componentName = this.extractComponentName(requirement);
    return componentName.toLowerCase();
  }

  private extractFeatureName(requirement: string): string {
    return this.extractComponentName(requirement).toLowerCase();
  }

  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  private generateSummary(requirement: string, results: ParallelRoleResult[]): string {
    const successCount = results.filter(r => r.success).length;
    return `Analysis of "${requirement}" completed. ${successCount}/${results.length} roles analyzed successfully.`;
  }

  private detectConflicts(_results: ParallelRoleResult[]): RoleConflict[] {
    // In a real implementation, this would analyze outputs for conflicts
    return [];
  }

  private generateTraceabilityLinks(_results: ParallelRoleResult[]): TraceabilityLink[] {
    // In a real implementation, this would create links between artifacts
    return [];
  }

  private toMarkdown(doc: UnifiedRequirementDocument): string {
    let md = `# Requirement Analysis\n\n`;
    md += `**Original Requirement:** ${doc.originalRequirement}\n\n`;
    md += `**Generated:** ${doc.metadata.generatedAt}\n\n`;
    md += `---\n\n`;

    md += `## Product Manager\n\n`;
    md += `### User Stories\n`;
    for (const story of doc.pm.userStories) {
      md += `- As a ${story.asA}, I want ${story.iWant}, so that ${story.soThat}\n`;
    }
    md += `\n### Acceptance Criteria\n`;
    for (const criterion of doc.pm.acceptanceCriteria) {
      md += `- ${criterion}\n`;
    }
    md += `\n### Business Value\n${doc.pm.businessValue}\n`;
    md += `\n### Priority: ${doc.pm.priority}\n\n`;

    md += `## Frontend Engineer\n\n`;
    md += `### UI Requirements\n`;
    for (const req of doc.frontend.uiRequirements) {
      md += `- ${req}\n`;
    }
    md += `\n### Components\n`;
    for (const comp of doc.frontend.componentStructure.components) {
      md += `- **${comp.name}** (${comp.type}): ${comp.description}\n`;
    }
    md += `\n`;

    md += `## Backend Engineer\n\n`;
    md += `### API Endpoints\n`;
    for (const endpoint of doc.backend.apiDesign.endpoints) {
      md += `- \`${endpoint.method} ${endpoint.path}\`: ${endpoint.description}\n`;
    }
    md += `\n### Data Models\n`;
    for (const model of doc.backend.dataModels) {
      md += `- **${model.name}**: ${model.description}\n`;
    }
    md += `\n`;

    md += `## QA/Tester\n\n`;
    md += `### Unit Test Cases\n`;
    for (const test of doc.qa.unitTestCases) {
      md += `- ${test.description}\n`;
    }
    md += `\n### E2E Scenarios\n`;
    for (const scenario of doc.qa.e2eScenarios) {
      md += `- **${scenario.name}**\n`;
    }
    md += `\n### Edge Cases\n`;
    for (const edge of doc.qa.edgeCases) {
      md += `- ${edge}\n`;
    }

    return md;
  }

  private getDefaultPMOutput(): PMOutput {
    return {
      role: "pm",
      userStories: [],
      acceptanceCriteria: [],
      businessValue: "",
      priority: "medium",
      stakeholders: [],
      dependencies: [],
    };
  }

  private getDefaultFrontendOutput(): FrontendOutput {
    return {
      role: "frontend",
      uiRequirements: [],
      componentStructure: { components: [] },
      stateManagement: { stores: [] },
      apiIntegrationPoints: [],
      accessibilityRequirements: [],
      responsiveDesign: { breakpoints: [], considerations: [] },
    };
  }

  private getDefaultBackendOutput(): BackendOutput {
    return {
      role: "backend",
      apiDesign: { endpoints: [] },
      dataModels: [],
      serviceArchitecture: { pattern: "monolith", services: [] },
      infrastructureRequirements: [],
      authRequirements: {
        authentication: { method: "", details: "" },
        authorization: { model: "" },
      },
      cachingStrategy: { approach: "", targets: [] },
    };
  }

  private getDefaultQAOutput(): QAOutput {
    return {
      role: "qa",
      unitTestCases: [],
      e2eScenarios: [],
      edgeCases: [],
      testDataRequirements: { fixtures: [], mockData: [] },
      traceabilityMatrix: [],
      integrationTestPoints: [],
    };
  }
}
