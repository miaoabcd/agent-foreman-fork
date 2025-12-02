# Project Survey (AI-Enhanced)

## Summary

agent-foreman is a TypeScript CLI harness that orchestrates AI-assisted project surveys, feature backlogs, and verification workflows for long tasks.
> agent-foreman 是一个 TypeScript CLI 脚手架，用于协调整个 AI 辅助的项目调研、功能清单与长任务验证流程。
It scans or generates features, manages progress/logs, detects capabilities, and drives automated checks plus AI reasoning to mark features complete.
> 它可以扫描或生成功能，管理进度与日志，检测项目能力，并驱动自动检查与 AI 推理来标记功能完成。

> Analyzed by: codex

## Tech Stack

| Aspect | Value |
|--------|-------|
| Language | TypeScript
> 使用 TypeScript |
| Framework | none
> 无框架 |
| Build Tool | tsc
> tsc 构建工具 |
| Test Framework | Vitest
> Vitest 测试框架 |
| Package Manager | npm (package-lock.json)
> npm（package-lock.json） |

## Directory Structure

### Entry Points
- `src/index.ts`

### Source Directories
- `src/`

## Modules

### CLI entrypoint
- **Path**: `src/index.ts`
- **Status**: complete
- **Description**: Yargs-driven CLI providing survey, init, step, status, impact, complete, check, agents, and detect-capabilities commands

### AI scanner
- **Path**: `src/ai-scanner.ts`
- **Status**: complete
- **Description**: Builds autonomous prompts, parses AI responses, and renders survey markdown for project scans

### Agent manager
- **Path**: `src/agents.ts`
- **Status**: complete
- **Description**: Spawns Claude/Gemini/Codex subprocesses, retries, and reports availability

### Debug logger
- **Path**: `src/debug.ts`
- **Status**: complete
- **Description**: Namespaced debug logging controlled via DEBUG env with helpers per subsystem

### Feature list ops
- **Path**: `src/feature-list.ts`
- **Status**: complete
- **Description**: Load/save/validate feature_list.json, select next work item, merge discoveries, and compute stats

### File utilities
- **Path**: `src/file-utils.ts`
- **Status**: complete
- **Description**: Safe path checks, guarded file reads, existence checks, and directory detection

### Git utilities
- **Path**: `src/git-utils.ts`
- **Status**: complete
- **Description**: Git repo detection, change inspection, staging, committing, branch lookup, and init helper

### Impact analyzer
- **Path**: `src/impact-analyzer.ts`
- **Status**: complete
- **Description**: Computes dependency impact chains and recommendations across features

### Init helpers
- **Path**: `src/init-helpers.ts`
- **Status**: complete
- **Description**: Detects project state, merges/creates feature lists, and generates harness artifacts with AI merging

### Init script generator
- **Path**: `src/init-script.ts`
- **Status**: complete
- **Description**: Produces ai/init.sh from capabilities with typecheck, lint, build, and E2E support

### Progress log
- **Path**: `src/progress-log.ts`
- **Status**: complete
- **Description**: Formats, parses, appends, and queries ai/progress.log entries

### Progress indicators
- **Path**: `src/progress.ts`
- **Status**: complete
- **Description**: TTY-aware spinner, progress bar, and step progress utilities

### Capabilities detector
- **Path**: `src/project-capabilities.ts`
- **Status**: complete
- **Description**: Caches and AI-discovers test/typecheck/lint/build/E2E commands with formatting helpers

### Project scanner
- **Path**: `src/project-scanner.ts`
- **Status**: complete
- **Description**: Finds entry points, source/test dirs, and config files plus emptiness check

### Prompt templates
- **Path**: `src/prompts.ts`
- **Status**: complete
- **Description**: Generates harness docs, commit messages, feature/impact guidance, and session summaries

### Schema validator
- **Path**: `src/schema.ts`
- **Status**: complete
- **Description**: AJV schema and validators for feature_list.json with helpers

### Test discovery
- **Path**: `src/test-discovery.ts`
- **Status**: complete
- **Description**: Maps source changes to tests, builds selective test/E2E commands, and extracts modules

### Timeout/config
- **Path**: `src/timeout-config.ts`
- **Status**: complete
- **Description**: Central timeout defaults, env overrides, agent priority parsing, and formatting

### Type definitions
- **Path**: `src/types.ts`
- **Status**: complete
- **Description**: Shared domain types for features, progress logs, surveys, and commands

### Upgrade helper
- **Path**: `src/upgrade.ts`
- **Status**: complete
- **Description**: Checks npm for updates, prompts, upgrades package and optional plugin

### Verification prompts
- **Path**: `src/verification-prompts.ts`
- **Status**: complete
- **Description**: Builds/truncates diffs, crafts verification prompts, and parses AI responses

### Verification reports
- **Path**: `src/verification-report.ts`
- **Status**: complete
- **Description**: Renders markdown reports and summaries from verification results

### Verification store
- **Path**: `src/verification-store.ts`
- **Status**: complete
- **Description**: Persists verification runs per feature, maintains index, and migrates legacy results

### Verification types
- **Path**: `src/verification-types.ts`
- **Status**: complete
- **Description**: Types for verification capabilities, results, metadata, and AI responses

### Verifier
- **Path**: `src/verifier.ts`
- **Status**: complete
- **Description**: Runs automated checks, AI diff analysis or autonomous verification, and saves outcomes

## Feature Completion Status

| ID | Description | Module | Status |
|----|-------------|--------|--------|
| cli.survey | Generate AI-powered project survey report | cli | ✅ passing |
| cli.init | Initialize harness (feature list, progress log, init script) | cli | ✅ passing |
| cli.step | Select and present the next high-priority feature to work on | cli | ✅ passing |
| cli.status | Display current project health and feature completion stats | cli | ✅ passing |
| cli.impact | Analyze dependent features for a specific change | cli | ✅ passing |
| cli.complete | Mark a feature as passing and update logs | cli | ✅ passing |
| scanner.autonomous_exploration | Agent autonomously explores codebase to discover features | ai-scanner | ✅ passing |
| scanner.generate_from_goal | Generate initial feature list from a text goal for empty projects | ai-scanner | ✅ passing |
| agents.abstraction | Unified interface for Gemini, Claude, and Codex CLIs | agents | ✅ passing |
| agents.retry | Retry logic for failed AI agent calls | agents | ✅ passing |
| features.dependency_graph | Build and traverse feature dependency graph | impact-analyzer | ✅ passing |
| features.circular_check | Detect circular dependencies in features | impact-analyzer | ✅ passing |
| logging.audit | Structured logging of all harness actions to markdown | progress-log | ✅ passing |
| init.script_gen | Generate project-specific 'ai/init.sh' bootstrap script | init-script | ✅ passing |
| verify.types | Define TypeScript types for verification system | verification | ✅ passing |
| verify.store | Persistence layer for verification results | verification | ✅ passing |
| verify.capability_detector | Detect project verification capabilities (tests, types, lint, build) | verification | ✅ passing |
| verify.prompts | AI prompt templates for comprehensive verification | verification | ✅ passing |
| verify.core | Core verification logic orchestrating checks and AI analysis | verification | ✅ passing |
| verify.cli | CLI verify command for AI-powered feature verification | verification | ✅ passing |
| verify.init_script | Enhanced init.sh generation with verification commands | verification | ✅ passing |
| verify.tests | Unit tests for verification system | verification | ✅ passing |
| capability.extended_types | Add ExtendedCapabilities and CustomRule types for dynamic language detection | capability | ✅ passing |
| capability.cache | Cache infrastructure for persisting detected capabilities to ai/capabilities.json | capability | ✅ passing |
| capability.preset_refactor | Refactor existing preset detection with confidence scoring | capability | ✅ passing |
| capability.ai_discovery | AI-based capability discovery for unknown project types | capability | ✅ passing |
| capability.three_tier | Implement three-tier detection: cache → preset → AI discovery | capability | ✅ passing |
| capability.cli_command | CLI command for manual capability detection and refresh | capability | ✅ passing |
| capability.tests | Unit tests for extensible capability detection system | capability | ✅ passing |
| git.utils | Create git utility functions for auto-commit functionality | git | ✅ passing |
| git.step_guard | Enforce clean working directory check in step command | git | ✅ passing |
| git.auto_commit | Auto-commit all changes when completing a feature | git | ✅ passing |
| git.tests | Unit tests for git utility functions with 100% branch coverage | git | ✅ passing |
| security.command_injection | Fix command injection vulnerabilities by using spawnSync with argument arrays | security | ✅ passing |
| security.path_traversal | Add path traversal validation for file operations | security | ✅ passing |
| quality.error_logging | Add proper error logging to all silent catch blocks | quality | ✅ passing |
| quality.file_utils | Create shared file-utils.ts module to eliminate code duplication | quality | ✅ passing |
| quality.refactor_runinit | Refactor runInit function into smaller focused functions | quality | ✅ passing |
| cli.quiet_json_output | Add --quiet and --json output modes for scripting | cli | ✅ passing |
| agents.windows_support | Add Windows support for agent detection | agents | ✅ passing |
| test.init_script | Add unit tests for init-script.ts | test | ✅ passing |
| test.prompts | Add unit tests for prompts.ts | test | ✅ passing |
| test.integration | Add integration tests for CLI commands | test | ✅ passing |
| test.verifier_coverage | Add comprehensive unit tests for verifier.ts to achieve 100% coverage | test | ✅ passing |
| test.debug_coverage | Add unit tests for debug.ts to achieve 100% coverage | test | ✅ passing |
| test.init_helpers_coverage | Add more unit tests for init-helpers.ts to achieve 100% coverage | test | ✅ passing |
| test.verification_store_coverage | Add unit tests for verification-store.ts to achieve 100% coverage | test | ✅ passing |
| test.capability_discovery_coverage | Add unit tests for capability-discovery.ts to achieve 100% coverage | test | ✅ passing |
| test.agents_coverage | Add unit tests for agents.ts to achieve 100% coverage | test | ✅ passing |
| test.capability_detector_coverage | Add unit tests for capability-detector.ts to achieve 100% coverage | test | ✅ passing |
| test.capability_cache_coverage | Add unit tests for capability-cache.ts to achieve 100% coverage | test | ✅ passing |
| verify.integrate_complete | Integrate AI verification into complete command for single-step workflow | verification | ✅ passing |
| verify.smart_diff_truncation | Implement intelligent diff truncation for large diffs in AI prompts | verification | ✅ passing |
| verify.ai_retry_logic | Add retry logic with exponential backoff for AI verification calls | verification | ✅ passing |
| docs.clean_survey_format | Clean up PROJECT_SURVEY.md format by separating translations | docs | ✅ passing |
| test.e2e_cli_flows | Add end-to-end integration tests for CLI command flows | test | ✅ passing |
| ux.progress_indicators | Add progress indicators for long-running operations | ux | ✅ passing |
| cli.auto_upgrade | Automatically detect and silently upgrade to newer npm package versions on CLI startup | cli | ✅ passing |
| test.test_discovery_coverage | Add comprehensive unit tests for test-discovery.ts to achieve >90% coverage | test | ✅ passing |
| test.verifier_selective_coverage | Add unit tests for selective test execution features in verifier.ts | test | ✅ passing |
| test.overall_coverage_target | Achieve overall project code coverage of >85% | test | ✅ passing |
| test.verifier_autonomous_coverage | Add unit tests for autonomous verification mode in verifier.ts | test | ✅ passing |
| test.upgrade_coverage | Add unit tests for interactive upgrade functionality in upgrade.ts | test | ✅ passing |
| test.progress_coverage | Add unit tests for progress indicator edge cases in progress.ts | test | ✅ passing |
| test.timeout_config_coverage | Add unit tests for timeout configuration in timeout-config.ts | test | ✅ passing |
| test.git_utils_coverage | Add unit tests for remaining git utility functions in git-utils.ts | test | ✅ passing |
| test.ai_scanner_coverage | Add unit tests for AI scanner edge cases in ai-scanner.ts | test | ✅ passing |
| test.overall_coverage_90 | Achieve overall project code coverage of >90% | test | ✅ passing |
| config.agent_priority_env | Add single environment variable for agent priority and enablement | config | ✅ passing |
| config.agent_priority_function | Create getAgentPriority() function to centralize agent order retrieval | config | ✅ passing |
| config.refactor_hardcoded_priority | Refactor agent calling functions to use centralized priority configuration | config | ✅ passing |
| config.update_env_example | Update .env.example with agent configuration documentation | config | ✅ passing |
| test.agent_priority_coverage | Add unit tests for agent priority configuration | test | ✅ passing |
| verify.store_types | Add new TypeScript interfaces for per-feature verification storage | verification | ✅ passing |
| verify.report_generator | Create markdown report generator for verification results | verification | ✅ passing |
| verify.store_refactor | Refactor verification-store.ts for per-feature subdirectory storage | verification | ✅ passing |
| verify.store_migration | Add migration from old results.json to new per-feature structure | verification | ✅ passing |
| test.verify_store_refactor | Add unit tests for refactored verification storage | test | ✅ passing |
| init.capabilities_bridge | Add bridge function to convert ExtendedCapabilities to init.sh script | init | ✅ passing |
| init.detect_during_init | Run capabilities detection during init command and use results for init.sh | init | ✅ passing |
| test.init_capabilities_coverage | Add unit tests for unified capabilities detection during init | test | ✅ passing |
| e2e.schema_extension | Add e2eTags field to Feature type and JSON schema | types | ✅ passing |
| e2e.capability_detection | Detect Playwright E2E test capabilities during capability detection | verification | ✅ passing |
| e2e.command_builder | Build selective E2E test commands from e2eTags | test-discovery | ✅ passing |
| e2e.verifier_integration | Integrate E2E test execution into verification flow | verification | ✅ passing |
| e2e.init_script_update | Update init.sh generator to support selective E2E testing when E2E capabilities detected | init | ✅ passing |
| e2e.tests | Add unit tests for E2E selective testing features | test | ✅ passing |

## Completion Assessment

**Overall: 100%**

**Notes:**
- All features are passing
- Completed 87/87 features
- Last updated: 2025-12-02

## Recommendations

- 1) Add offline fallbacks when no AI agents are installed to allow manual survey/verification modes.
> 1) 当未安装 AI 代理时增加离线回退，使手动调查/验证模式可用。
- 2) Provide a flag to skip or silence upgrade checks for non-interactive environments.
> 2) 为非交互环境提供跳过或静默升级检查的开关。
- 3) Expand integration tests covering full CLI flows for detect-capabilities and autonomous verification paths.
> 3) 扩展集成测试以覆盖 detect-capabilities 及自主验证路径的完整 CLI 流程。

## Commands

```bash
# Install dependencies
npm install
> npm install

# Start development server
npm run dev
> npm run dev

# Build for production
npm run build
> npm run build

# Run tests
npm test
> npm test
```

---

*Generated by agent-foreman with AI analysis*