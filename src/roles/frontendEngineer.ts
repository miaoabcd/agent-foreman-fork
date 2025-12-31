/**
 * Frontend Engineer Role Implementation
 * Generates UI/UX specs, component architecture, state management, and frontend-specific requirements
 */

// ============================================================================
// Type Definitions
// ============================================================================

/** User flow step */
export interface UserFlowStep {
  order: number;
  action: string;
  element: string;
  expectedResult: string;
}

/** User flow definition */
export interface UserFlow {
  name: string;
  description: string;
  steps: UserFlowStep[];
}

/** UI/UX Analysis */
export interface UIUXAnalysis {
  userFlows: UserFlow[];
  interactionPatterns: string[];
  designPrinciples: string[];
}

/** Component property definition */
export interface ComponentProp {
  name: string;
  type: string;
  required: boolean;
  description?: string;
}

/** Component definition */
export interface ComponentDef {
  name: string;
  type: "page" | "container" | "presentational" | "layout" | "hook";
  description: string;
  props: ComponentProp[];
  children?: string[];
}

/** File structure definition */
export interface FileStructure {
  basePath: string;
  directories: string[];
}

/** Component architecture */
export interface ComponentArchitecture {
  hierarchy: ComponentDef[];
  sharedComponents: string[];
  fileStructure: FileStructure;
}

/** Local state definition */
export interface LocalStateSpec {
  component: string;
  stateName: string;
  type: string;
  initialValue: string;
}

/** Global store definition */
export interface GlobalStoreSpec {
  name: string;
  shape: Record<string, string>;
  actions: string[];
  selectors: string[];
}

/** State management spec */
export interface StateManagementSpec {
  localState: LocalStateSpec[];
  globalState: GlobalStoreSpec[];
  recommendedLibrary: string;
}

/** API endpoint definition */
export interface APIEndpointSpec {
  path: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  description: string;
  requestType: string;
  responseType: string;
}

/** Error handling spec */
export interface ErrorHandlingSpec {
  strategies: string[];
  fallbackUI: string;
}

/** API integration spec */
export interface APIIntegration {
  endpoints: APIEndpointSpec[];
  errorHandling: ErrorHandlingSpec;
  fetchingPattern: string;
}

/** Breakpoint definition */
export interface BreakpointSpec {
  name: string;
  minWidth: number;
  maxWidth?: number;
  layoutStrategy: string;
}

/** Responsive design spec */
export interface ResponsiveDesignSpec {
  breakpoints: BreakpointSpec[];
  mobileConsiderations: string[];
}

/** Keyboard navigation spec */
export interface KeyboardNavigationSpec {
  requirements: string[];
  focusOrder: string[];
}

/** Form accessibility spec */
export interface FormAccessibilitySpec {
  labelRequirements: string[];
  errorAnnouncement: string;
  validationFeedback: string;
}

/** Accessibility spec */
export interface AccessibilitySpec {
  wcagLevel: "A" | "AA" | "AAA";
  ariaRequirements: string[];
  keyboardNavigation: KeyboardNavigationSpec;
  formAccessibility: FormAccessibilitySpec;
}

/** Analysis metadata */
export interface FrontendMetadata {
  analyzedAt: string;
  version: string;
  analyzer: string;
}

/** Complete frontend analysis result */
export interface FrontendAnalysisResult {
  uiUxAnalysis: UIUXAnalysis;
  componentArchitecture: ComponentArchitecture;
  stateManagement: StateManagementSpec;
  apiIntegration: APIIntegration;
  responsiveDesign: ResponsiveDesignSpec;
  accessibility: AccessibilitySpec;
  metadata: FrontendMetadata;
  toJSON(): Record<string, unknown>;
}

// ============================================================================
// FrontendEngineerRole Implementation
// ============================================================================

export class FrontendEngineerRole {
  /**
   * Analyze a requirement from Frontend Engineer perspective
   */
  async analyze(requirement: string): Promise<FrontendAnalysisResult> {
    if (!requirement || requirement.trim() === "") {
      throw new Error("Requirement cannot be empty");
    }

    const uiUxAnalysis = this.analyzeUIUX(requirement);
    const componentArchitecture = this.generateComponentArchitecture(requirement);
    const stateManagement = this.defineStateManagement(requirement, componentArchitecture);
    const apiIntegration = this.identifyAPIIntegration(requirement);
    const responsiveDesign = this.defineResponsiveDesign(requirement);
    const accessibility = this.defineAccessibility(requirement);

    const result: FrontendAnalysisResult = {
      uiUxAnalysis,
      componentArchitecture,
      stateManagement,
      apiIntegration,
      responsiveDesign,
      accessibility,
      metadata: {
        analyzedAt: new Date().toISOString(),
        version: "1.0.0",
        analyzer: "FrontendEngineerRole",
      },
      toJSON() {
        return {
          uiUxAnalysis: this.uiUxAnalysis,
          componentArchitecture: this.componentArchitecture,
          stateManagement: this.stateManagement,
          apiIntegration: this.apiIntegration,
          responsiveDesign: this.responsiveDesign,
          accessibility: this.accessibility,
          metadata: this.metadata,
        };
      },
    };

    return result;
  }

  // ============================================================================
  // Private Implementation Methods
  // ============================================================================

  private analyzeUIUX(requirement: string): UIUXAnalysis {
    const features = this.extractFeatures(requirement);
    const userFlows: UserFlow[] = [];

    // Generate user flows based on identified features
    for (const feature of features) {
      userFlows.push({
        name: `${this.capitalize(feature)} Flow`,
        description: `User flow for ${feature} functionality`,
        steps: this.generateFlowSteps(feature),
      });
    }

    // Identify interaction patterns
    const interactionPatterns = this.identifyInteractionPatterns(requirement);

    return {
      userFlows,
      interactionPatterns,
      designPrinciples: [
        "Progressive disclosure - show only relevant information",
        "Immediate feedback - provide visual feedback for actions",
        "Error prevention - validate input before submission",
        "Clear hierarchy - organize content by importance",
      ],
    };
  }

  private generateFlowSteps(feature: string): UserFlowStep[] {
    const baseSteps: UserFlowStep[] = [
      {
        order: 1,
        action: `Navigate to ${feature} page`,
        element: "Navigation/Link",
        expectedResult: `${feature} page is displayed`,
      },
      {
        order: 2,
        action: `Fill ${feature} form`,
        element: "Form inputs",
        expectedResult: "Form accepts valid input",
      },
      {
        order: 3,
        action: `Submit ${feature} form`,
        element: "Submit button",
        expectedResult: "Form is submitted successfully",
      },
      {
        order: 4,
        action: "View confirmation",
        element: "Success message/modal",
        expectedResult: "Success confirmation is displayed",
      },
    ];

    return baseSteps;
  }

  private identifyInteractionPatterns(requirement: string): string[] {
    const patterns: string[] = [];
    const lowerReq = requirement.toLowerCase();

    if (lowerReq.includes("form") || lowerReq.includes("input") ||
        lowerReq.includes("login") || lowerReq.includes("register")) {
      patterns.push("Form submission with validation");
    }
    if (lowerReq.includes("wizard") || lowerReq.includes("step")) {
      patterns.push("Multi-step wizard navigation");
    }
    if (lowerReq.includes("list") || lowerReq.includes("table")) {
      patterns.push("Data list with pagination/filtering");
    }
    if (lowerReq.includes("modal") || lowerReq.includes("dialog")) {
      patterns.push("Modal dialog interactions");
    }
    if (lowerReq.includes("search")) {
      patterns.push("Search with autocomplete");
    }

    // Default patterns
    if (patterns.length === 0) {
      patterns.push("Standard form interaction");
      patterns.push("Button click actions");
    }

    return patterns;
  }

  private generateComponentArchitecture(requirement: string): ComponentArchitecture {
    const features = this.extractFeatures(requirement);
    const hierarchy: ComponentDef[] = [];

    // Create page component
    const pageName = `${this.capitalize(features[0] || "Feature")}Page`;
    hierarchy.push({
      name: pageName,
      type: "page",
      description: `Main page for ${features.join(", ")} features`,
      props: [],
      children: features.map(f => `${this.capitalize(f)}Container`),
    });

    // Create container components for each feature
    for (const feature of features) {
      const containerName = `${this.capitalize(feature)}Container`;
      hierarchy.push({
        name: containerName,
        type: "container",
        description: `Container component for ${feature}`,
        props: [
          { name: "onSuccess", type: "() => void", required: false, description: "Success callback" },
          { name: "onError", type: "(error: Error) => void", required: false, description: "Error callback" },
        ],
        children: [`${this.capitalize(feature)}Form`],
      });

      // Create form component
      hierarchy.push({
        name: `${this.capitalize(feature)}Form`,
        type: "presentational",
        description: `Form component for ${feature}`,
        props: [
          { name: "onSubmit", type: "(data: FormData) => void", required: true },
          { name: "isLoading", type: "boolean", required: false },
          { name: "error", type: "string | null", required: false },
        ],
      });
    }

    // Identify shared components
    const sharedComponents = [
      "Button",
      "Input",
      "FormField",
      "ErrorMessage",
      "LoadingSpinner",
    ];

    return {
      hierarchy,
      sharedComponents,
      fileStructure: {
        basePath: "src/components",
        directories: [
          "src/components/pages",
          "src/components/containers",
          "src/components/forms",
          "src/components/shared",
        ],
      },
    };
  }

  private defineStateManagement(
    requirement: string,
    architecture: ComponentArchitecture
  ): StateManagementSpec {
    const features = this.extractFeatures(requirement);
    const localState: LocalStateSpec[] = [];
    const globalState: GlobalStoreSpec[] = [];

    // Local state for form components
    for (const comp of architecture.hierarchy.filter(c => c.type === "presentational")) {
      localState.push({
        component: comp.name,
        stateName: "formData",
        type: "Record<string, string>",
        initialValue: "{}",
      });
      localState.push({
        component: comp.name,
        stateName: "errors",
        type: "Record<string, string>",
        initialValue: "{}",
      });
    }

    // Global state for auth if applicable
    const lowerReq = requirement.toLowerCase();
    if (lowerReq.includes("auth") || lowerReq.includes("login") ||
        lowerReq.includes("user")) {
      globalState.push({
        name: "authStore",
        shape: {
          user: "User | null",
          isAuthenticated: "boolean",
          isLoading: "boolean",
          error: "string | null",
        },
        actions: ["login", "logout", "register", "resetPassword", "clearError"],
        selectors: ["selectUser", "selectIsAuthenticated", "selectAuthError"],
      });
    }

    // General app state
    globalState.push({
      name: "uiStore",
      shape: {
        isLoading: "boolean",
        notifications: "Notification[]",
        theme: "'light' | 'dark'",
      },
      actions: ["setLoading", "addNotification", "removeNotification", "toggleTheme"],
      selectors: ["selectIsLoading", "selectNotifications", "selectTheme"],
    });

    return {
      localState,
      globalState,
      recommendedLibrary: globalState.length > 1 ? "zustand" : "React Context",
    };
  }

  private identifyAPIIntegration(requirement: string): APIIntegration {
    const features = this.extractFeatures(requirement);
    const endpoints: APIEndpointSpec[] = [];

    for (const feature of features) {
      const resourceName = feature.toLowerCase();

      // POST for create/action
      endpoints.push({
        path: `/api/${resourceName}`,
        method: "POST",
        description: `Create/perform ${feature}`,
        requestType: `${this.capitalize(feature)}Request`,
        responseType: `${this.capitalize(feature)}Response`,
      });

      // GET if applicable
      if (!["login", "logout", "reset"].includes(resourceName)) {
        endpoints.push({
          path: `/api/${resourceName}`,
          method: "GET",
          description: `Get ${feature} data`,
          requestType: "void",
          responseType: `${this.capitalize(feature)}Data`,
        });
      }
    }

    return {
      endpoints,
      errorHandling: {
        strategies: [
          "Display user-friendly error messages",
          "Retry failed requests with exponential backoff",
          "Log errors for debugging",
          "Show fallback UI for network failures",
        ],
        fallbackUI: "ErrorBoundary with retry option",
      },
      fetchingPattern: "React Query / SWR with caching",
    };
  }

  private defineResponsiveDesign(requirement: string): ResponsiveDesignSpec {
    return {
      breakpoints: [
        {
          name: "mobile",
          minWidth: 320,
          maxWidth: 767,
          layoutStrategy: "Single column, stacked elements",
        },
        {
          name: "tablet",
          minWidth: 768,
          maxWidth: 1023,
          layoutStrategy: "Two column where appropriate",
        },
        {
          name: "desktop",
          minWidth: 1024,
          layoutStrategy: "Full layout with sidebars if needed",
        },
      ],
      mobileConsiderations: [
        "Touch-friendly tap targets (min 44x44px)",
        "Swipe gestures for navigation",
        "Bottom sheet for actions on mobile",
        "Collapsible navigation menu",
        "Optimized form inputs for mobile keyboards",
      ],
    };
  }

  private defineAccessibility(requirement: string): AccessibilitySpec {
    const lowerReq = requirement.toLowerCase();
    const hasForm = lowerReq.includes("form") || lowerReq.includes("login") ||
                    lowerReq.includes("register") || lowerReq.includes("input");

    return {
      wcagLevel: "AA",
      ariaRequirements: [
        "aria-label for icon buttons",
        "aria-describedby for form field errors",
        "aria-live regions for dynamic content",
        "role attributes for custom components",
        "aria-expanded for collapsible sections",
      ],
      keyboardNavigation: {
        requirements: [
          "All interactive elements focusable via Tab",
          "Escape key closes modals/dropdowns",
          "Enter key submits forms",
          "Arrow keys navigate within components",
        ],
        focusOrder: [
          "Header navigation",
          "Main content",
          "Form fields (top to bottom)",
          "Action buttons",
          "Footer links",
        ],
      },
      formAccessibility: {
        labelRequirements: [
          "Every input has associated label",
          "Required fields clearly marked",
          "Help text linked via aria-describedby",
        ],
        errorAnnouncement: "aria-live='polite' for error messages",
        validationFeedback: "Inline validation with immediate feedback",
      },
    };
  }

  // ============================================================================
  // Helper Methods
  // ============================================================================

  private extractFeatures(requirement: string): string[] {
    const featurePatterns = [
      /login/gi,
      /registration|register|signup|sign up/gi,
      /password reset|reset password|forgot password/gi,
      /authentication|auth/gi,
      /dashboard/gi,
      /profile/gi,
      /settings/gi,
      /search/gi,
    ];

    const features: string[] = [];

    for (const pattern of featurePatterns) {
      const matches = requirement.match(pattern);
      if (matches) {
        const normalized = matches[0].toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/signup|sign up/, "registration")
          .replace(/forgot password/, "password-reset")
          .replace(/reset password/, "password-reset");
        if (!features.includes(normalized)) {
          features.push(normalized);
        }
      }
    }

    // Default feature if none found
    if (features.length === 0) {
      const words = requirement.split(/\s+/).filter(w => w.length > 4);
      features.push(words[0]?.toLowerCase() || "feature");
    }

    return features.slice(0, 5); // Limit to 5 features
  }

  private capitalize(str: string): string {
    return str
      .split("-")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join("");
  }
}
