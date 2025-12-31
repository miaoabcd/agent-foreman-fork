/**
 * Product Manager Role Implementation
 * Generates user stories, acceptance criteria, business value analysis, and priority recommendations
 */

// ============================================================================
// Type Definitions
// ============================================================================

/** Parsed requirement with extracted components */
export interface ParsedRequirement {
  raw: string;
  keywords: string[];
  entities: string[];
  actions: string[];
}

/** User story with full details */
export interface UserStory {
  id: string;
  asA: string;
  iWant: string;
  soThat: string;
  type: "functional" | "non-functional" | "technical";
}

/** Criteria mapping to user story */
export interface CriteriaMapping {
  storyId: string;
  criteria: string[];
}

/** ROI estimate */
export interface ROIEstimate {
  estimate: string;
  timeframe: string;
  confidence: "low" | "medium" | "high";
}

/** Effort estimate */
export interface EffortEstimate {
  estimate: "low" | "medium" | "high" | "very-high";
  description: string;
}

/** Business value assessment */
export interface BusinessValue {
  description: string;
  roi: ROIEstimate;
  valueDrivers: string[];
  risks: string[];
  effort: EffortEstimate;
}

/** Priority assessment */
export interface PriorityAssessment {
  level: "critical" | "high" | "medium" | "low";
  justification: string;
  valueScore: number;
  complexityScore: number;
  suggestedOrder: number;
}

/** Stakeholder details */
export interface Stakeholder {
  name: string;
  role: string;
  interest: "primary" | "secondary" | "tertiary";
  communicationNeeds: string;
}

/** Dependency details */
export interface Dependency {
  name: string;
  type: "technical" | "business" | "external" | "internal";
  description: string;
  risk: "low" | "medium" | "high";
}

/** Analysis metadata */
export interface AnalysisMetadata {
  analyzedAt: string;
  version: string;
  analyzer: string;
}

/** Complete PM analysis result */
export interface PMAnalysisResult {
  parsedRequirement: ParsedRequirement;
  userStories: UserStory[];
  acceptanceCriteria: string[];
  criteriaMapping: CriteriaMapping[];
  businessValue: BusinessValue;
  priority: PriorityAssessment;
  stakeholders: Stakeholder[];
  dependencies: Dependency[];
  metadata: AnalysisMetadata;
  toJSON(): Record<string, unknown>;
}

// ============================================================================
// ProductManagerRole Implementation
// ============================================================================

export class ProductManagerRole {
  private storyIdCounter = 0;

  /**
   * Analyze a requirement from PM perspective
   */
  async analyze(requirement: string): Promise<PMAnalysisResult> {
    if (!requirement || requirement.trim() === "") {
      throw new Error("Requirement cannot be empty");
    }

    const parsedRequirement = this.parseRequirement(requirement);
    const userStories = this.generateUserStories(parsedRequirement);
    const acceptanceCriteria = this.extractAcceptanceCriteria(parsedRequirement, userStories);
    const criteriaMapping = this.mapCriteriaToStories(userStories, acceptanceCriteria);
    const businessValue = this.analyzeBusinessValue(parsedRequirement);
    const priority = this.assessPriority(businessValue, parsedRequirement);
    const stakeholders = this.identifyStakeholders(parsedRequirement);
    const dependencies = this.identifyDependencies(parsedRequirement);

    const result: PMAnalysisResult = {
      parsedRequirement,
      userStories,
      acceptanceCriteria,
      criteriaMapping,
      businessValue,
      priority,
      stakeholders,
      dependencies,
      metadata: {
        analyzedAt: new Date().toISOString(),
        version: "1.0.0",
        analyzer: "ProductManagerRole",
      },
      toJSON() {
        return {
          parsedRequirement: this.parsedRequirement,
          userStories: this.userStories,
          acceptanceCriteria: this.acceptanceCriteria,
          criteriaMapping: this.criteriaMapping,
          businessValue: this.businessValue,
          priority: this.priority,
          stakeholders: this.stakeholders,
          dependencies: this.dependencies,
          metadata: this.metadata,
        };
      },
    };

    return result;
  }

  /**
   * Format a user story as a readable string
   */
  formatUserStory(story: UserStory): string {
    return `As a ${story.asA}, I want ${story.iWant}, so that ${story.soThat}.`;
  }

  // ============================================================================
  // Private Implementation Methods
  // ============================================================================

  private parseRequirement(requirement: string): ParsedRequirement {
    const words = requirement.toLowerCase().split(/\s+/);

    // Extract keywords (significant words)
    const stopWords = new Set([
      "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for",
      "of", "with", "by", "from", "as", "is", "are", "was", "were", "be",
      "been", "being", "have", "has", "had", "do", "does", "did", "will",
      "would", "could", "should", "may", "might", "must", "shall",
    ]);
    const keywords = words.filter(w => w.length > 2 && !stopWords.has(w));

    // Extract entities (nouns - simplified heuristic)
    const entities = this.extractEntities(requirement);

    // Extract actions (verbs)
    const actions = this.extractActions(requirement);

    return {
      raw: requirement,
      keywords: Array.from(new Set(keywords)),
      entities,
      actions,
    };
  }

  private extractEntities(requirement: string): string[] {
    const entityPatterns = [
      /user[s]?/gi,
      /authentication/gi,
      /login/gi,
      /registration/gi,
      /password/gi,
      /account[s]?/gi,
      /session[s]?/gi,
      /token[s]?/gi,
      /email[s]?/gi,
      /profile[s]?/gi,
      /admin[s]?/gi,
      /system/gi,
      /data/gi,
      /service[s]?/gi,
      /api/gi,
      /database/gi,
      /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g, // Capitalized words
    ];

    const entities: string[] = [];
    for (const pattern of entityPatterns) {
      const matches = requirement.match(pattern);
      if (matches) {
        entities.push(...matches.map(m => m.toLowerCase()));
      }
    }

    return Array.from(new Set(entities));
  }

  private extractActions(requirement: string): string[] {
    const actionVerbs = [
      "implement", "create", "add", "build", "develop", "enable", "allow",
      "login", "register", "authenticate", "reset", "verify", "validate",
      "update", "delete", "remove", "modify", "send", "receive", "process",
      "display", "show", "hide", "submit", "save", "load", "fetch",
    ];

    const words = requirement.toLowerCase().split(/\s+/);
    const actions = words.filter(w => actionVerbs.includes(w));

    return Array.from(new Set(actions));
  }

  private generateUserStories(parsed: ParsedRequirement): UserStory[] {
    const stories: UserStory[] = [];

    // Generate stories based on entities and actions
    const userTypes = ["user", "admin", "system"];
    const foundUserType = parsed.entities.find(e =>
      userTypes.some(u => e.includes(u))
    ) || "user";

    // Primary story
    stories.push({
      id: this.nextStoryId(),
      asA: foundUserType,
      iWant: `to ${parsed.actions[0] || "use"} ${parsed.entities[0] || "the feature"}`,
      soThat: "I can accomplish my goals efficiently",
      type: "functional",
    });

    // Generate additional stories for each major entity/action combination
    const actions = parsed.actions.length > 0 ? parsed.actions : ["access"];
    const entities = parsed.entities.filter(e => !userTypes.some(u => e.includes(u)));

    for (let i = 0; i < Math.min(entities.length, 3); i++) {
      const entity = entities[i];
      const action = actions[i % actions.length] || actions[0];

      if (entity && action) {
        stories.push({
          id: this.nextStoryId(),
          asA: foundUserType,
          iWant: `to ${action} ${entity}`,
          soThat: `I can manage my ${entity} effectively`,
          type: this.inferStoryType(action, entity),
        });
      }
    }

    // Add security story if authentication-related
    if (parsed.keywords.some(k => ["auth", "login", "password", "security"].some(s => k.includes(s)))) {
      stories.push({
        id: this.nextStoryId(),
        asA: foundUserType,
        iWant: "to have my credentials securely stored",
        soThat: "my account remains protected",
        type: "non-functional",
      });
    }

    return stories;
  }

  private inferStoryType(action: string, entity: string): "functional" | "non-functional" | "technical" {
    const nonFunctionalKeywords = ["secure", "fast", "reliable", "scalable", "performance"];
    const technicalKeywords = ["api", "database", "integration", "migration", "infrastructure"];

    if (nonFunctionalKeywords.some(k => action.includes(k) || entity.includes(k))) {
      return "non-functional";
    }
    if (technicalKeywords.some(k => action.includes(k) || entity.includes(k))) {
      return "technical";
    }
    return "functional";
  }

  private nextStoryId(): string {
    return `US-${++this.storyIdCounter}`;
  }

  private extractAcceptanceCriteria(parsed: ParsedRequirement, stories: UserStory[]): string[] {
    const criteria: string[] = [];

    // Generate criteria from stories
    for (const story of stories) {
      criteria.push(`User should be able to ${story.iWant.replace(/^to /, "")}`);
    }

    // Add validation criteria
    criteria.push("System must validate all user inputs");
    criteria.push("Error messages should be clear and actionable");

    // Add security criteria if relevant
    if (parsed.keywords.some(k => ["auth", "login", "password", "security"].some(s => k.includes(s)))) {
      criteria.push("Passwords must be securely hashed before storage");
      criteria.push("Session should expire after inactivity period");
    }

    // Add performance criteria
    criteria.push("Response time should be under 2 seconds for normal operations");

    return criteria;
  }

  private mapCriteriaToStories(stories: UserStory[], criteria: string[]): CriteriaMapping[] {
    const mappings: CriteriaMapping[] = [];

    for (const story of stories) {
      const relatedCriteria = criteria.filter(c =>
        c.toLowerCase().includes(story.iWant.split(" ").slice(-1)[0].toLowerCase()) ||
        story.type === "non-functional" && c.toLowerCase().includes("must")
      );

      if (relatedCriteria.length > 0) {
        mappings.push({
          storyId: story.id,
          criteria: relatedCriteria,
        });
      } else {
        // Assign at least one criterion
        mappings.push({
          storyId: story.id,
          criteria: [criteria[0]],
        });
      }
    }

    return mappings;
  }

  private analyzeBusinessValue(parsed: ParsedRequirement): BusinessValue {
    const isSecurityRelated = parsed.keywords.some(k =>
      ["auth", "login", "password", "security"].some(s => k.includes(s))
    );

    const valueDrivers: string[] = [
      "Improved user experience",
      "Increased user engagement",
    ];

    if (isSecurityRelated) {
      valueDrivers.push("Enhanced security posture");
      valueDrivers.push("Regulatory compliance");
    }

    const risks: string[] = [];
    if (isSecurityRelated) {
      risks.push("Security vulnerabilities if not implemented correctly");
      risks.push("User friction if security is too strict");
    }
    risks.push("Integration complexity with existing systems");

    const complexity = this.estimateComplexity(parsed);

    return {
      description: `Implementing ${parsed.raw} will provide significant value by improving the overall system capabilities and user satisfaction.`,
      roi: {
        estimate: isSecurityRelated ? "High - reduces security incident costs" : "Medium - improves user retention",
        timeframe: "3-6 months",
        confidence: "medium",
      },
      valueDrivers,
      risks,
      effort: {
        estimate: complexity,
        description: `Based on ${parsed.entities.length} entities and ${parsed.actions.length} actions identified`,
      },
    };
  }

  private estimateComplexity(parsed: ParsedRequirement): "low" | "medium" | "high" | "very-high" {
    const entityCount = parsed.entities.length;
    const actionCount = parsed.actions.length;
    const score = entityCount + actionCount;

    if (score <= 3) return "low";
    if (score <= 6) return "medium";
    if (score <= 10) return "high";
    return "very-high";
  }

  private assessPriority(businessValue: BusinessValue, parsed: ParsedRequirement): PriorityAssessment {
    const isSecurityRelated = parsed.keywords.some(k =>
      ["auth", "login", "password", "security", "critical"].some(s => k.includes(s))
    );

    // Value score (1-10)
    let valueScore = 5;
    if (businessValue.roi.estimate.toLowerCase().includes("high")) valueScore += 3;
    if (isSecurityRelated) valueScore += 2;
    valueScore = Math.min(10, valueScore);

    // Complexity score (1-10)
    const complexityMap: Record<string, number> = {
      "low": 3,
      "medium": 5,
      "high": 7,
      "very-high": 9,
    };
    const complexityScore = complexityMap[businessValue.effort.estimate] || 5;

    // Determine priority level
    let level: "critical" | "high" | "medium" | "low";
    if (isSecurityRelated || valueScore >= 8) {
      level = valueScore >= 9 ? "critical" : "high";
    } else if (valueScore >= 6) {
      level = "medium";
    } else {
      level = "low";
    }

    return {
      level,
      justification: `Based on business value (${valueScore}/10) and complexity (${complexityScore}/10). ${isSecurityRelated ? "Security-related features receive priority boost." : ""}`.trim(),
      valueScore,
      complexityScore,
      suggestedOrder: level === "critical" ? 1 : level === "high" ? 2 : level === "medium" ? 3 : 4,
    };
  }

  private identifyStakeholders(parsed: ParsedRequirement): Stakeholder[] {
    const stakeholders: Stakeholder[] = [];

    // Primary stakeholder - end users
    const hasUserEntity = parsed.entities.some(e => e.includes("user"));
    stakeholders.push({
      name: "End Users",
      role: hasUserEntity ? "Direct users of the feature" : "Feature beneficiaries",
      interest: "primary",
      communicationNeeds: "Feature updates, training materials, release notes",
    });

    // Product team
    stakeholders.push({
      name: "Product Team",
      role: "Feature definition and prioritization",
      interest: "primary",
      communicationNeeds: "Requirements clarification, progress updates, demo sessions",
    });

    // Development team
    stakeholders.push({
      name: "Development Team",
      role: "Implementation and technical decisions",
      interest: "primary",
      communicationNeeds: "Technical specifications, design reviews, blockers",
    });

    // Security team for auth-related features
    if (parsed.keywords.some(k => ["auth", "login", "password", "security"].some(s => k.includes(s)))) {
      stakeholders.push({
        name: "Security Team",
        role: "Security review and compliance",
        interest: "secondary",
        communicationNeeds: "Security requirements, threat assessment, compliance checklist",
      });
    }

    // QA team
    stakeholders.push({
      name: "QA Team",
      role: "Quality assurance and testing",
      interest: "secondary",
      communicationNeeds: "Test cases, acceptance criteria, bug reports",
    });

    return stakeholders;
  }

  private identifyDependencies(parsed: ParsedRequirement): Dependency[] {
    const dependencies: Dependency[] = [];

    // Check for common dependencies based on keywords
    if (parsed.keywords.some(k => ["auth", "login", "password"].some(s => k.includes(s)))) {
      dependencies.push({
        name: "Authentication Service",
        type: "technical",
        description: "Core authentication infrastructure",
        risk: "medium",
      });

      dependencies.push({
        name: "User Database",
        type: "technical",
        description: "User credential storage",
        risk: "high",
      });
    }

    if (parsed.keywords.some(k => ["email", "notification"].some(s => k.includes(s)))) {
      dependencies.push({
        name: "Email Service",
        type: "external",
        description: "Email delivery provider",
        risk: "medium",
      });
    }

    // Add common internal dependencies
    dependencies.push({
      name: "API Gateway",
      type: "internal",
      description: "Request routing and rate limiting",
      risk: "low",
    });

    return dependencies;
  }
}
