/**
 * Roles module - Multi-perspective requirement analysis
 */
export * from "./multiPerspective.js";

// Re-export productManager with renamed UserStory to avoid conflict
export {
  ProductManagerRole,
  PMAnalysisResult,
  ParsedRequirement,
  UserStory as PMUserStory,
  CriteriaMapping,
  ROIEstimate,
  EffortEstimate,
  BusinessValue,
  PriorityAssessment,
  Stakeholder,
  Dependency,
  AnalysisMetadata,
} from "./productManager.js";
