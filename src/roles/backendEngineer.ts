/**
 * Backend Engineer Role Implementation
 * Generates API design, data models, service architecture, and infrastructure requirements
 */

// ============================================================================
// Type Definitions
// ============================================================================

export interface APIEndpoint {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  path: string;
  description: string;
  requestSchema: Record<string, unknown>;
  responseSchema: Record<string, unknown>;
  authentication: boolean;
  rateLimit?: string;
}

export interface APIDesign {
  endpoints: APIEndpoint[];
  baseUrl: string;
  versioning: string;
}

export interface ModelField {
  name: string;
  type: string;
  required: boolean;
  unique?: boolean;
  indexed?: boolean;
  description?: string;
}

export interface DataModel {
  name: string;
  description: string;
  fields: ModelField[];
  relationships: string[];
}

export interface ServiceDef {
  name: string;
  responsibility: string;
  dependencies: string[];
}

export interface ServiceArchitecture {
  pattern: "monolith" | "microservices" | "serverless" | "modular";
  services: ServiceDef[];
  communication: string;
}

export interface AuthRequirements {
  authentication: {
    method: string;
    details: string;
    tokenExpiry?: string;
  };
  authorization: {
    model: string;
    roles: string[];
  };
}

export interface CachingStrategy {
  approach: string;
  targets: string[];
  ttl: string;
}

export interface BackendMetadata {
  analyzedAt: string;
  version: string;
  analyzer: string;
}

export interface BackendAnalysisResult {
  apiDesign: APIDesign;
  dataModels: DataModel[];
  serviceArchitecture: ServiceArchitecture;
  authRequirements: AuthRequirements;
  cachingStrategy: CachingStrategy;
  infrastructureRequirements: string[];
  metadata: BackendMetadata;
  toJSON(): Record<string, unknown>;
}

// ============================================================================
// BackendEngineerRole Implementation
// ============================================================================

export class BackendEngineerRole {
  async analyze(requirement: string): Promise<BackendAnalysisResult> {
    if (!requirement || requirement.trim() === "") {
      throw new Error("Requirement cannot be empty");
    }

    const features = this.extractFeatures(requirement);
    const apiDesign = this.designAPI(features);
    const dataModels = this.defineDataModels(features, requirement);
    const serviceArchitecture = this.defineServiceArchitecture(features);
    const authRequirements = this.defineAuthRequirements(requirement);
    const cachingStrategy = this.defineCachingStrategy(features);
    const infrastructureRequirements = this.defineInfrastructure(requirement);

    const result: BackendAnalysisResult = {
      apiDesign,
      dataModels,
      serviceArchitecture,
      authRequirements,
      cachingStrategy,
      infrastructureRequirements,
      metadata: {
        analyzedAt: new Date().toISOString(),
        version: "1.0.0",
        analyzer: "BackendEngineerRole",
      },
      toJSON() {
        return {
          apiDesign: this.apiDesign,
          dataModels: this.dataModels,
          serviceArchitecture: this.serviceArchitecture,
          authRequirements: this.authRequirements,
          cachingStrategy: this.cachingStrategy,
          infrastructureRequirements: this.infrastructureRequirements,
          metadata: this.metadata,
        };
      },
    };

    return result;
  }

  private extractFeatures(requirement: string): string[] {
    const patterns = [/auth|login|jwt|session/gi, /user/gi, /password/gi, /token/gi];
    const features: string[] = [];
    for (const p of patterns) {
      if (p.test(requirement)) {
        features.push(p.source.split("|")[0]);
      }
    }
    return features.length > 0 ? features : ["feature"];
  }

  private designAPI(features: string[]): APIDesign {
    const endpoints: APIEndpoint[] = [];

    for (const feature of features) {
      endpoints.push({
        method: "POST",
        path: `/api/${feature}`,
        description: `Create/perform ${feature}`,
        requestSchema: { type: "object" },
        responseSchema: { type: "object", properties: { success: { type: "boolean" } } },
        authentication: true,
      });
      endpoints.push({
        method: "GET",
        path: `/api/${feature}/:id`,
        description: `Get ${feature} by ID`,
        requestSchema: {},
        responseSchema: { type: "object" },
        authentication: true,
      });
    }

    return { endpoints, baseUrl: "/api/v1", versioning: "URL path versioning" };
  }

  private defineDataModels(features: string[], requirement: string): DataModel[] {
    const models: DataModel[] = [];
    const lowerReq = requirement.toLowerCase();

    if (lowerReq.includes("user") || lowerReq.includes("auth")) {
      models.push({
        name: "User",
        description: "User account model",
        fields: [
          { name: "id", type: "uuid", required: true, unique: true },
          { name: "email", type: "string", required: true, unique: true, indexed: true },
          { name: "passwordHash", type: "string", required: true },
          { name: "createdAt", type: "timestamp", required: true },
          { name: "updatedAt", type: "timestamp", required: true },
        ],
        relationships: ["has many Sessions"],
      });
    }

    if (lowerReq.includes("session") || lowerReq.includes("token")) {
      models.push({
        name: "Session",
        description: "User session model",
        fields: [
          { name: "id", type: "uuid", required: true, unique: true },
          { name: "userId", type: "uuid", required: true, indexed: true },
          { name: "token", type: "string", required: true, unique: true },
          { name: "expiresAt", type: "timestamp", required: true },
        ],
        relationships: ["belongs to User"],
      });
    }

    if (models.length === 0) {
      models.push({
        name: "Entity",
        description: "Generic entity model",
        fields: [
          { name: "id", type: "uuid", required: true, unique: true },
          { name: "data", type: "jsonb", required: false },
          { name: "createdAt", type: "timestamp", required: true },
        ],
        relationships: [],
      });
    }

    return models;
  }

  private defineServiceArchitecture(features: string[]): ServiceArchitecture {
    return {
      pattern: "modular",
      services: [
        { name: "AuthService", responsibility: "Handle authentication logic", dependencies: ["UserRepository"] },
        { name: "UserService", responsibility: "User management", dependencies: ["UserRepository", "EmailService"] },
      ],
      communication: "Direct method calls (monolith) or HTTP/gRPC (microservices)",
    };
  }

  private defineAuthRequirements(requirement: string): AuthRequirements {
    const lowerReq = requirement.toLowerCase();
    const useJWT = lowerReq.includes("jwt");

    return {
      authentication: {
        method: useJWT ? "JWT Bearer Token" : "Session-based",
        details: useJWT ? "RS256 signed tokens" : "Server-side session storage",
        tokenExpiry: useJWT ? "15 minutes (access), 7 days (refresh)" : undefined,
      },
      authorization: {
        model: "RBAC",
        roles: ["admin", "user", "guest"],
      },
    };
  }

  private defineCachingStrategy(features: string[]): CachingStrategy {
    return {
      approach: "Cache-aside with Redis",
      targets: ["User profiles", "Session data", "Frequently accessed resources"],
      ttl: "5 minutes for user data, session duration for tokens",
    };
  }

  private defineInfrastructure(requirement: string): string[] {
    const infra = [
      "PostgreSQL database for persistent storage",
      "Redis for caching and session storage",
      "Load balancer for horizontal scaling",
    ];

    if (requirement.toLowerCase().includes("password")) {
      infra.push("bcrypt/argon2 for password hashing");
    }

    return infra;
  }
}
