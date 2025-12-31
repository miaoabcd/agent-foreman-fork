/**
 * Tester/QA Role Implementation
 * Generates unit test cases, E2E scenarios, edge cases, and test data requirements
 */

// ============================================================================
// Type Definitions
// ============================================================================

export interface UnitTestCase {
  description: string;
  assertions: string[];
  category: string;
}

export interface E2EScenario {
  name: string;
  steps: string[];
  expectedResult: string;
}

export interface TestFixture {
  name: string;
  type: string;
  description: string;
}

export interface TestDataRequirements {
  fixtures: TestFixture[];
  mockData: string[];
}

export interface TraceabilityEntry {
  criterion: string;
  testCases: string[];
}

export interface TesterMetadata {
  analyzedAt: string;
  version: string;
  analyzer: string;
}

export interface TesterAnalysisResult {
  unitTestCases: UnitTestCase[];
  e2eScenarios: E2EScenario[];
  edgeCases: string[];
  testDataRequirements: TestDataRequirements;
  integrationTestPoints: string[];
  traceabilityMatrix: TraceabilityEntry[];
  metadata: TesterMetadata;
  toJSON(): Record<string, unknown>;
}

// ============================================================================
// TesterRole Implementation
// ============================================================================

export class TesterRole {
  async analyze(requirement: string): Promise<TesterAnalysisResult> {
    if (!requirement || requirement.trim() === "") {
      throw new Error("Requirement cannot be empty");
    }

    const unitTestCases = this.generateUnitTests(requirement);
    const e2eScenarios = this.generateE2EScenarios(requirement);
    const edgeCases = this.identifyEdgeCases(requirement);
    const testDataRequirements = this.defineTestData(requirement);
    const integrationTestPoints = this.identifyIntegrationPoints(requirement);
    const traceabilityMatrix = this.createTraceabilityMatrix(requirement, unitTestCases);

    const result: TesterAnalysisResult = {
      unitTestCases,
      e2eScenarios,
      edgeCases,
      testDataRequirements,
      integrationTestPoints,
      traceabilityMatrix,
      metadata: {
        analyzedAt: new Date().toISOString(),
        version: "1.0.0",
        analyzer: "TesterRole",
      },
      toJSON() {
        return {
          unitTestCases: this.unitTestCases,
          e2eScenarios: this.e2eScenarios,
          edgeCases: this.edgeCases,
          testDataRequirements: this.testDataRequirements,
          integrationTestPoints: this.integrationTestPoints,
          traceabilityMatrix: this.traceabilityMatrix,
          metadata: this.metadata,
        };
      },
    };

    return result;
  }

  private generateUnitTests(requirement: string): UnitTestCase[] {
    const tests: UnitTestCase[] = [];
    const lowerReq = requirement.toLowerCase();

    // Happy path test
    tests.push({
      description: "should complete successfully with valid input",
      assertions: ["expect(result).toBeDefined()", "expect(result.success).toBe(true)"],
      category: "happy-path",
    });

    // Validation tests
    if (lowerReq.includes("validation") || lowerReq.includes("email")) {
      tests.push({
        description: "should validate input correctly",
        assertions: ["expect(validate(invalidData)).toBeFalsy()", "expect(validate(validData)).toBeTruthy()"],
        category: "validation",
      });
    }

    // Error handling tests
    if (lowerReq.includes("error")) {
      tests.push({
        description: "should handle errors gracefully",
        assertions: ["expect(() => handleError()).not.toThrow()", "expect(errorMessage).toBeDefined()"],
        category: "error-handling",
      });
    }

    // Auth tests
    if (lowerReq.includes("login") || lowerReq.includes("auth")) {
      tests.push({
        description: "should authenticate user with valid credentials",
        assertions: ["expect(result.token).toBeDefined()", "expect(result.user).toBeDefined()"],
        category: "authentication",
      });
      tests.push({
        description: "should reject invalid credentials",
        assertions: ["expect(result.success).toBe(false)", "expect(result.error).toBeDefined()"],
        category: "authentication",
      });
    }

    return tests;
  }

  private generateE2EScenarios(requirement: string): E2EScenario[] {
    const scenarios: E2EScenario[] = [];
    const lowerReq = requirement.toLowerCase();

    scenarios.push({
      name: "User completes primary flow successfully",
      steps: ["Navigate to page", "Fill required fields", "Submit form", "Verify success"],
      expectedResult: "User sees success confirmation",
    });

    if (lowerReq.includes("login")) {
      scenarios.push({
        name: "User login flow",
        steps: ["Go to login page", "Enter email", "Enter password", "Click login", "Verify redirect"],
        expectedResult: "User is logged in and redirected to dashboard",
      });
    }

    if (lowerReq.includes("error")) {
      scenarios.push({
        name: "Error handling flow",
        steps: ["Trigger error condition", "Verify error message displays", "Retry action"],
        expectedResult: "User can recover from error",
      });
    }

    return scenarios;
  }

  private identifyEdgeCases(requirement: string): string[] {
    const edges = [
      "Empty input fields",
      "Maximum length input",
      "Special characters in input",
      "Concurrent operations",
      "Network timeout",
      "Session expiry during operation",
    ];

    if (requirement.toLowerCase().includes("email")) {
      edges.push("Invalid email format", "Email with unicode characters");
    }

    return edges;
  }

  private defineTestData(requirement: string): TestDataRequirements {
    return {
      fixtures: [
        { name: "validUserData", type: "object", description: "Valid user input data" },
        { name: "invalidUserData", type: "object", description: "Invalid input for negative tests" },
      ],
      mockData: ["Mock API success response", "Mock API error response", "Mock timeout scenario"],
    };
  }

  private identifyIntegrationPoints(requirement: string): string[] {
    const points = ["API endpoint integration", "Database operations"];

    if (requirement.toLowerCase().includes("auth") || requirement.toLowerCase().includes("login")) {
      points.push("Authentication service", "Token validation");
    }

    return points;
  }

  private createTraceabilityMatrix(requirement: string, tests: UnitTestCase[]): TraceabilityEntry[] {
    return [
      {
        criterion: "Feature works correctly",
        testCases: tests.filter(t => t.category === "happy-path").map(t => t.description),
      },
      {
        criterion: "Input validation works",
        testCases: tests.filter(t => t.category === "validation").map(t => t.description),
      },
    ];
  }
}
