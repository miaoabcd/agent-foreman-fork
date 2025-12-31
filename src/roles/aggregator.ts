/**
 * Role Output Aggregator
 * Merges outputs from all roles into a unified, comprehensive requirement document
 */
import type { PMAnalysisResult } from "./productManager.js";
import type { FrontendAnalysisResult } from "./frontendEngineer.js";
import type { BackendAnalysisResult } from "./backendEngineer.js";
import type { TesterAnalysisResult } from "./tester.js";

// ============================================================================
// Type Definitions
// ============================================================================

export interface AggregateInput {
  requirement: string;
  pmOutput: PMAnalysisResult;
  frontendOutput: FrontendAnalysisResult;
  backendOutput: BackendAnalysisResult;
  qaOutput: TesterAnalysisResult;
  format?: "json" | "markdown";
}

export interface Conflict {
  roles: string[];
  description: string;
  resolution?: string;
}

export interface TraceabilityLink {
  source: { type: string; id: string };
  target: { type: string; id: string };
  relationship: string;
}

export interface UnifiedMetadata {
  generatedAt: string;
  rolesIncluded: string[];
  version: string;
}

export interface UnifiedDocument {
  originalRequirement: string;
  pm: PMAnalysisResult;
  frontend: FrontendAnalysisResult;
  backend: BackendAnalysisResult;
  qa: TesterAnalysisResult;
  conflicts: Conflict[];
  traceability: { links: TraceabilityLink[] };
  metadata: UnifiedMetadata;
  summary: string;
}

// ============================================================================
// RoleAggregator Implementation
// ============================================================================

export class RoleAggregator {
  async aggregate(input: AggregateInput): Promise<UnifiedDocument> {
    const { requirement, pmOutput, frontendOutput, backendOutput, qaOutput } = input;

    const conflicts = this.detectConflicts(frontendOutput, backendOutput);
    const traceability = this.generateTraceability(pmOutput, frontendOutput, backendOutput, qaOutput);
    const summary = this.generateSummary(requirement);

    return {
      originalRequirement: requirement,
      pm: pmOutput,
      frontend: frontendOutput,
      backend: backendOutput,
      qa: qaOutput,
      conflicts,
      traceability,
      metadata: {
        generatedAt: new Date().toISOString(),
        rolesIncluded: ["pm", "frontend", "backend", "qa"],
        version: "1.0.0",
      },
      summary,
    };
  }

  async toMarkdown(input: AggregateInput): Promise<string> {
    const doc = await this.aggregate(input);
    return this.formatAsMarkdown(doc);
  }

  async updateRole(
    existing: UnifiedDocument,
    role: "pm" | "frontend" | "backend" | "qa",
    newOutput: PMAnalysisResult | FrontendAnalysisResult | BackendAnalysisResult | TesterAnalysisResult
  ): Promise<UnifiedDocument> {
    const updated = { ...existing };

    switch (role) {
      case "pm":
        updated.pm = newOutput as PMAnalysisResult;
        break;
      case "frontend":
        updated.frontend = newOutput as FrontendAnalysisResult;
        break;
      case "backend":
        updated.backend = newOutput as BackendAnalysisResult;
        break;
      case "qa":
        updated.qa = newOutput as TesterAnalysisResult;
        break;
    }

    updated.metadata = {
      ...updated.metadata,
      generatedAt: new Date().toISOString(),
    };

    return updated;
  }

  private detectConflicts(
    frontend: FrontendAnalysisResult,
    backend: BackendAnalysisResult
  ): Conflict[] {
    const conflicts: Conflict[] = [];

    // Check for API endpoint mismatches
    const feEndpoints = frontend.apiIntegration.endpoints.map(e => e.path);
    const beEndpoints = backend.apiDesign.endpoints.map(e => e.path);

    for (const fePath of feEndpoints) {
      const normalized = fePath.replace(/\/:?\w+/g, "/:id");
      const hasMatch = beEndpoints.some(bePath =>
        bePath.replace(/\/:?\w+/g, "/:id") === normalized
      );
      if (!hasMatch) {
        conflicts.push({
          roles: ["frontend", "backend"],
          description: `Frontend expects endpoint ${fePath} but backend doesn't define it`,
          resolution: "Add endpoint to backend API design",
        });
      }
    }

    return conflicts;
  }

  private generateTraceability(
    pm: PMAnalysisResult,
    frontend: FrontendAnalysisResult,
    backend: BackendAnalysisResult,
    qa: TesterAnalysisResult
  ): { links: TraceabilityLink[] } {
    const links: TraceabilityLink[] = [];

    // Link user stories to components
    for (const story of pm.userStories) {
      for (const comp of frontend.componentArchitecture.hierarchy) {
        if (comp.type === "page" || comp.type === "container") {
          links.push({
            source: { type: "user_story", id: story.id },
            target: { type: "component", id: comp.name },
            relationship: "implemented_by",
          });
        }
      }
    }

    // Link components to API endpoints
    for (const endpoint of frontend.apiIntegration.endpoints) {
      const beEndpoint = backend.apiDesign.endpoints.find(e => e.path === endpoint.path);
      if (beEndpoint) {
        links.push({
          source: { type: "frontend_endpoint", id: endpoint.path },
          target: { type: "backend_endpoint", id: beEndpoint.path },
          relationship: "calls",
        });
      }
    }

    // Link acceptance criteria to tests
    for (const criterion of pm.acceptanceCriteria) {
      for (const test of qa.unitTestCases) {
        links.push({
          source: { type: "criterion", id: criterion.substring(0, 30) },
          target: { type: "test", id: test.description },
          relationship: "verified_by",
        });
        break; // One link per criterion
      }
    }

    return { links };
  }

  private generateSummary(requirement: string): string {
    return `Unified requirement analysis for: "${requirement}". ` +
      `This document contains specifications from Product Manager, Frontend Engineer, ` +
      `Backend Engineer, and QA perspectives.`;
  }

  private formatAsMarkdown(doc: UnifiedDocument): string {
    let md = `# Unified Requirement Document\n\n`;
    md += `**Requirement:** ${doc.originalRequirement}\n\n`;
    md += `**Generated:** ${doc.metadata.generatedAt}\n\n`;
    md += `---\n\n`;

    // PM Section
    md += `## Product Manager Analysis\n\n`;
    md += `### User Stories\n`;
    for (const story of doc.pm.userStories) {
      md += `- As a ${story.asA}, I want ${story.iWant}, so that ${story.soThat}\n`;
    }
    md += `\n### Priority: ${doc.pm.priority.level}\n\n`;

    // Frontend Section
    md += `## Frontend Engineer Analysis\n\n`;
    md += `### Components\n`;
    for (const comp of doc.frontend.componentArchitecture.hierarchy) {
      md += `- **${comp.name}** (${comp.type})\n`;
    }
    md += `\n`;

    // Backend Section
    md += `## Backend Engineer Analysis\n\n`;
    md += `### API Endpoints\n`;
    for (const ep of doc.backend.apiDesign.endpoints) {
      md += `- \`${ep.method} ${ep.path}\`\n`;
    }
    md += `\n`;

    // QA Section
    md += `## QA Analysis\n\n`;
    md += `### Test Cases\n`;
    for (const test of doc.qa.unitTestCases) {
      md += `- ${test.description}\n`;
    }
    md += `\n`;

    // Conflicts
    if (doc.conflicts.length > 0) {
      md += `## Conflicts Detected\n\n`;
      for (const c of doc.conflicts) {
        md += `- ${c.description}\n`;
      }
    }

    return md;
  }
}
