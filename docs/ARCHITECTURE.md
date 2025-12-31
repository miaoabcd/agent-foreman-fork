# Project Survey (AI-Enhanced)

## Summary

agent-foreman is a Long-Task Harness for AI agents providing feature-driven development with external memory. It helps AI coding agents avoid common failure modes by providing structured workflows, acceptance criteria verification, TDD enforcement, and clean session handoffs through ai/feature_list.json and ai/progress.log.

> Analyzed by: claude

## Tech Stack

| Aspect | Value |
|--------|-------|
| Language | TypeScript |
| Framework | none |
| Build Tool | TypeScript Compiler (tsc) |
| Test Framework | Vitest |
| Package Manager | pnpm |

## Directory Structure

### Entry Points
- `src/index.ts`

### Source Directories
- `src/`

## Modules

### commands
- **Path**: `src/commands`
- **Status**: complete
- **Description**: CLI command handlers for all agent-foreman commands (analyze, init, next, status, check, done, fail, scan, impact, install, uninstall, agents, tdd)

### agents
- **Path**: `src/agents.ts`
- **Status**: complete
- **Description**: AI agent subprocess management for Claude, Gemini, and Codex CLI tools with retry logic and priority ordering

### capabilities
- **Path**: `src/capabilities`
- **Status**: complete
- **Description**: Project capability detection with memory and disk caching, git invalidation, and AI-powered discovery

### verifier
- **Path**: `src/verifier`
- **Status**: complete
- **Description**: Feature verification system including automated checks, AI analysis, TDD verification, and autonomous exploration

### tdd-guidance
- **Path**: `src/tdd-guidance`
- **Status**: complete
- **Description**: TDD workflow guidance generator converting acceptance criteria to test case suggestions with skeleton generation

### gitignore
- **Path**: `src/gitignore`
- **Status**: complete
- **Description**: Gitignore generation with GitHub API integration and bundled templates for comprehensive project protection

### rules
- **Path**: `src/rules`
- **Status**: complete
- **Description**: Rule template management for Claude Code integration with embedded rules support

### verification-store
- **Path**: `src/verification-store`
- **Status**: complete
- **Description**: Verification result persistence with migration support and index operations

### feature-list
- **Path**: `src/feature-list.ts`
- **Status**: complete
- **Description**: Feature list CRUD operations with optimistic locking, TDD migration, and conflict detection

### plugins
- **Path**: `plugins/agent-foreman`
- **Status**: complete
- **Description**: Claude Code plugin with agents, skills, and slash commands for IDE integration

## Discovered Features

| ID | Description | Module | Source | Confidence |
|----|-------------|--------|--------|------------|
| cli.analyze | Generate AI-powered project analysis report and output to docs/ARCHITECTURE.md | commands | code | 100% |
| cli.init | Initialize or upgrade the long-task harness with AI analysis, feature discovery, and TDD mode selection | commands | code | 100% |
| cli.next | Show next feature to work on with external memory sync, TDD guidance, and JSON output support | commands | code | 100% |
| cli.status | Show current harness status with feature statistics, progress bar, and recent activity | commands | code | 100% |
| cli.check | Verify code changes with layered check mode (fast git-diff based) or full task verification with AI analysis | commands | code | 100% |
| cli.done | Mark feature as complete with verification, auto-commit, TDD gate enforcement, and loop mode support | commands | code | 100% |
| cli.fail | Mark feature as failed and continue to next feature in loop workflow | commands | code | 100% |
| cli.scan | Scan project verification capabilities and cache to ai/capabilities.json | commands | code | 100% |
| cli.impact | Analyze impact of changes to a feature including dependent and same-module features | commands | code | 100% |
| cli.install | Install Claude Code plugin to marketplace, cache, and enable in settings | commands | code | 100% |
| cli.uninstall | Uninstall Claude Code plugin from all registries and delete cache | commands | code | 100% |
| cli.agents | Show available AI agents status (Claude, Codex, Gemini) | commands | code | 100% |
| cli.tdd | View or change TDD mode configuration (strict, recommended, disabled) | commands | code | 100% |
| agents.call | Call AI agent with prompt and return output | agents | code | 100% |
| agents.callWithRetry | Call AI agent with retry logic and configurable timeout | agents | code | 100% |
| agents.callAnyAvailable | Try multiple agents in priority order until one succeeds with progress indicator | agents | code | 100% |
| agents.checkAvailable | Check which AI agents are available in PATH | agents | code | 100% |
| agents.filterAvailable | Filter agent configurations to only available ones | agents | code | 100% |
| agents.commandExists | Cross-platform command existence check using which/where | agents | code | 100% |
| featureList.load | Load feature list from ai/feature_list.json with validation and TDD migration | feature-list | code | 100% |
| featureList.save | Save feature list with optimistic locking and conflict detection | feature-list | code | 100% |
| featureList.selectNext | Select next feature based on status priority (needs_review > failing) and priority number | feature-list | code | 100% |
| featureList.updateStatus | Update feature status and notes | feature-list | code | 100% |
| featureList.updateVerification | Update feature verification summary | feature-list | code | 100% |
| featureList.merge | Merge discovered features with existing features without duplicates | feature-list | code | 100% |
| featureList.getStats | Get statistics about feature statuses | feature-list | code | 100% |
| featureList.getCompletion | Calculate completion percentage excluding deprecated features | feature-list | code | 100% |
| featureList.groupByModule | Group features by module name | feature-list | code | 100% |
| featureList.optimisticRetry | Execute operations with optimistic retry on conflict using exponential backoff | feature-list | code | 100% |
| featureList.migrateToStrictTDD | Migrate features to strict TDD mode by setting testRequirements.unit.required | feature-list | code | 100% |
| capabilities.detect | Detect project capabilities using memory cache, disk cache, or AI discovery | capabilities | code | 100% |
| capabilities.memoryCache | In-memory caching of capabilities with TTL | capabilities | code | 100% |
| capabilities.diskCache | Disk-based caching to ai/capabilities.json | capabilities | code | 100% |
| capabilities.gitInvalidation | Git-based cache invalidation by tracking commit hash and build file changes | capabilities | code | 100% |
| capabilities.aiDiscovery | AI-powered discovery of test, lint, typecheck, and build commands | capabilities | code | 100% |
| verifier.verify | Main verification orchestration for feature completion checking | verifier | code | 100% |
| verifier.autonomous | AI-powered autonomous verification mode with exploration | verifier | code | 100% |
| verifier.tdd | TDD verification mode with test execution | verifier | code | 100% |
| verifier.layeredCheck | Fast git-diff based verification with selective tests and task impact | verifier | code | 100% |
| verifier.taskImpact | Detect which tasks are affected by file changes | verifier | code | 100% |
| verifier.checkExecutor | Run automated checks (tests, lint, typecheck, build) in parallel | verifier | code | 100% |
| verifier.aiAnalysis | AI analysis with retry logic and related file reading | verifier | code | 100% |
| verifier.gitOperations | Git diff and commit hash operations for verification | verifier | code | 100% |
| verifier.report | Generate markdown verification reports and summaries | verifier | code | 100% |
| tddGuidance.generate | Generate TDD guidance from acceptance criteria | tdd-guidance | code | 100% |
| tddGuidance.criterionMapper | Map acceptance criteria to unit test cases and E2E scenarios | tdd-guidance | code | 100% |
| tddGuidance.skeletonGenerator | Generate unit test skeletons for various frameworks (Vitest, Jest, Mocha) | tdd-guidance | code | 100% |
| tddGuidance.e2eScenarios | Generate Playwright E2E test skeleton | tdd-guidance | code | 100% |
| tddGuidance.aiGenerator | AI-powered TDD guidance generation with caching | tdd-guidance | code | 100% |
| testGate.verify | Verify required test files exist before feature completion | test-gate | code | 100% |
| testGate.discover | Discover all test files for a feature based on configuration | test-gate | code | 100% |
| testGate.verifyTDD | Enhanced TDD gate verification respecting project-level strict mode | test-gate | code | 100% |
| gitUtils.isRepo | Check if directory is a git repository | git-utils | code | 100% |
| gitUtils.hasUncommittedChanges | Check for staged, unstaged, or untracked changes | git-utils | code | 100% |
| gitUtils.getChangedFiles | Get list of all changed files | git-utils | code | 100% |
| gitUtils.add | Stage files for commit | git-utils | code | 100% |
| gitUtils.commit | Create git commit with message | git-utils | code | 100% |
| gitUtils.init | Initialize git repository with minimal gitignore | git-utils | code | 100% |
| progressLog.append | Append entry to ai/progress.log | progress-log | code | 100% |
| progressLog.read | Read all entries from progress log | progress-log | code | 100% |
| progressLog.getRecent | Get most recent entries from log | progress-log | code | 100% |
| progressLog.parse | Parse progress log entry from line format | progress-log | code | 100% |
| progressLog.createEntry | Create INIT, STEP, CHANGE, REPLAN, or VERIFY entries | progress-log | code | 100% |
| aiScanner.scan | AI-powered project scan using autonomous exploration | ai-scanner | code | 100% |
| aiScanner.generateFromSurvey | Generate features from existing ARCHITECTURE.md | ai-scanner | code | 100% |
| aiScanner.generateFromGoal | Generate features from goal description for new projects | ai-scanner | code | 100% |
| aiScanner.parseResponse | Parse AI response to extract analysis results | ai-scanner | code | 100% |
| aiScanner.toSurvey | Convert AI analysis result to ProjectSurvey format | ai-scanner | code | 100% |
| aiScanner.generateMarkdown | Generate enhanced survey markdown with AI insights | ai-scanner | code | 100% |
| projectScanner.scanStructure | Scan directory structure for entry points, source dirs, and configs | project-scanner | code | 100% |
| projectScanner.isEmpty | Check if project has no source files | project-scanner | code | 100% |
| schema.validate | Validate feature list against JSON schema using AJV | schema | code | 100% |
| schema.parse | Validate and return typed feature list | schema | code | 100% |
| schema.isValidFeatureId | Validate feature ID format | schema | code | 100% |
| initHelpers.detectAndAnalyze | Detect project type and analyze with AI | init-helpers | code | 100% |
| initHelpers.mergeOrCreate | Merge or create features based on init mode | init-helpers | code | 100% |
| initHelpers.generateHarness | Generate harness files (init.sh, rules, progress.log) | init-helpers | code | 100% |
| pluginInstaller.install | Full plugin installation to Claude Code marketplace | plugin-installer | code | 100% |
| pluginInstaller.uninstall | Full plugin uninstallation from all registries | plugin-installer | code | 100% |
| pluginInstaller.checkAndInstall | Auto-install/update plugins on CLI startup | plugin-installer | code | 100% |
| pluginInstaller.isCompiled | Check if running as compiled binary vs npm install | plugin-installer | code | 100% |
| pluginInstaller.hasEmbedded | Check if embedded plugins are available | plugin-installer | code | 100% |
| upgrade.check | Check for available upgrades from npm or GitHub | upgrade | code | 100% |
| upgrade.interactive | Interactive upgrade check on CLI startup with user prompt | upgrade | code | 100% |
| upgrade.perform | Perform full upgrade (npm package + Claude Code plugin) | upgrade | code | 100% |
| upgrade.compareVersions | Compare semantic version strings | upgrade | code | 100% |
| impactAnalyzer.analyze | Analyze impact of changes to a feature | impact-analyzer | code | 100% |
| impactAnalyzer.applyRecommendations | Apply impact recommendations to feature list | impact-analyzer | code | 100% |
| impactAnalyzer.buildDependencyGraph | Build reverse dependency graph for features | impact-analyzer | code | 100% |
| impactAnalyzer.getBlockingFeatures | Get features blocking a given feature | impact-analyzer | code | 100% |
| impactAnalyzer.sortByDependency | Topological sort of features by dependency order | impact-analyzer | code | 100% |
| rules.copy | Copy rule templates to project .claude/rules/ directory | rules | code | 100% |
| rules.getTemplate | Get rule template by name from embedded or filesystem | rules | code | 100% |
| rules.verify | Verify rule templates are available | rules | code | 100% |
| rules.update | Update project rules if already installed | rules | code | 100% |
| gitignore.ensureMinimal | Create minimal gitignore for immediate protection | gitignore | code | 100% |
| gitignore.ensureComprehensive | Create comprehensive gitignore with language templates | gitignore | code | 100% |
| gitignore.fetchTemplates | Fetch gitignore templates from GitHub API | gitignore | code | 100% |
| gitignore.bundledTemplates | Use bundled gitignore templates when offline | gitignore | code | 100% |
| plugin.agent.foreman | Claude Code foreman agent for feature management orchestration | plugins | code | 100% |

*... and 9 more features*

## Completion Assessment

**Overall: 95%**

**Notes:**
- Comprehensive CLI tool with 13 commands fully implemented
- AI agent integration with Claude, Codex, and Gemini support
- TDD workflow with strict/recommended/disabled modes
- Plugin system for Claude Code IDE integration
- Extensive test coverage with 43+ test files
- Optimistic locking for concurrent feature list access
- Two-tier caching (memory + disk) for capabilities

## Recommendations

- Consider adding E2E tests for CLI commands to complement existing unit and integration tests
- Document the plugin development workflow for third-party plugin creation
- Add timeout configuration documentation for different AI agents
- Consider implementing feature priority auto-rebalancing based on dependency completion

## Commands

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Run tests
CI=true pnpm test
```

---

*Generated by agent-foreman with AI analysis*