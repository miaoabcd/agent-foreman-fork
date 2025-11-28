# Project Survey (AI-Enhanced)

## Summary

Agent-foreman is a specialized CLI tool designed to act as a harness for AI coding agents. It solves the problem of context loss and lack of direction in long-running tasks by maintaining an external 'memory' (feature list and progress log) and enforcing a strict feature-driven development workflow. The project is well-structured with clear separation of concerns between CLI handling, state management, and AI interaction.

> Analyzed by: gemini

## Tech Stack

| Aspect | Value |
|--------|-------|
| Language | TypeScript |
| Framework | Node.js (CLI) |
| Build Tool | tsc |
| Test Framework | vitest |
| Package Manager | npm |

## Directory Structure

### Entry Points
- `src/index.ts`

### Source Directories
- `src/`

## Modules

### CLI Core
- **Path**: `src/index.ts`
- **Status**: complete
- **Description**: Main entry point and command routing using yargs

### Agent Manager
- **Path**: `src/agents.ts`
- **Status**: complete
- **Description**: Manages execution of external AI agents (Claude, Gemini, Codex) via child processes

### Feature Manager
- **Path**: `src/feature-list.ts`
- **Status**: complete
- **Description**: Handles CRUD operations for the feature list JSON, including selection logic and status updates

### Progress Logger
- **Path**: `src/progress-log.ts`
- **Status**: complete
- **Description**: Manages the persistent audit log of session handoffs and actions

### Project Scanner
- **Path**: `src/project-scanner.ts`
- **Status**: complete
- **Description**: Analyzes file system structure to detect project layout and emptiness

### AI Scanner
- **Path**: `src/ai-scanner.ts`
- **Status**: complete
- **Description**: Orchestrates AI agents to perform deep analysis of the codebase

### Impact Analyzer
- **Path**: `src/impact-analyzer.ts`
- **Status**: complete
- **Description**: Calculates dependency graphs to identify features affected by changes

### Init Generator
- **Path**: `src/init-script.ts`
- **Status**: complete
- **Description**: Generates the bootstrap shell script (init.sh) for project lifecycle management

## Feature Completion Status

| ID | Description | Module | Status |
|----|-------------|--------|--------|
| cli.survey | Generate AI-powered project survey report | cli | ✅ passing |
| cli.init | Initialize or upgrade the long-task harness in a project | cli | ✅ passing |
| cli.step | Select and display the next high-priority feature to work on | cli | ✅ passing |
| cli.status | Show current project status including feature counts and recent logs | cli | ✅ passing |
| core.goal_detection | Auto-detect project goal from package.json or README | cli | ✅ passing |
| core.feature.select | Algorithm to prioritize features based on status (needs_review > failing) and priority | feature-manager | ✅ passing |
| core.impact.analyze | Identify directly dependent and same-module features affected by a change | impact-analyzer | ✅ passing |
| core.agent.spawn | Spawn AI CLI tools with appropriate flags (yolo/danger modes) for automated tasks | agent-runner | ✅ passing |
| feature.select | Algorithm to pick highest priority feature (review > failing > priority) | Feature Management | ✅ passing |
| agent.spawn | Spawn AI agent processes with configurable permissions | Agent Execution | ✅ passing |
| impact.analyze | Calculate cascade effects of feature changes | Impact Analysis | ✅ passing |
| scan.directory | Recursively scan directory structure for context | AI Integration | ✅ passing |
| cli.impact | Analyze impact of changes on other features | cli | ✅ passing |
| cli.complete | Mark a feature as complete | cli | ✅ passing |
| agents.execution | Spawn and manage AI subprocesses with timeout and output handling | agents | ✅ passing |
| scanner.structure | Scan directory structure for entry points, src, tests, and config | scanner | ✅ passing |
| scanner.ai_analysis | Use AI agents to analyze code context and extract tech stack/features | scanner | ✅ passing |
| core.features.validate | Validate feature list JSON against schema | core.data | ✅ passing |
| analysis.impact | Calculate dependency chain and recommend status updates | analysis | ✅ passing |
| feature.crud | Load, save, and update feature list JSON | Feature Management | ✅ passing |
| feature.validation | JSON Schema validation for feature files | Feature Management | ✅ passing |
| scan.structure | Scan directory structure and identify entry points | Project Scanner | ✅ passing |
| init.generate | Generate bootstrap shell scripts | CLI Core | ✅ passing |

## Completion Assessment

**Overall: 100%**

**Notes:**
- All features are passing
- Completed 23/23 features
- Last updated: 2025-11-28

## Recommendations

- Implement end-to-end integration tests to verify the interaction between the CLI and the generated init.sh script.
- Add configuration options to customize the AI agent commands (e.g., custom model names or flags) via a config file.
- Enhance the `survey` command to support more languages/frameworks by expanding the pattern matching in `project-scanner.ts`.

## Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

---

*Generated by agent-foreman with AI analysis*