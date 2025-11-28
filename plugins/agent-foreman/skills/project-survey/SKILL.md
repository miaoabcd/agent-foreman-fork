---
name: project-survey
description: Analyze existing projects to generate comprehensive survey reports
---

# Project Survey Skill

Scan and analyze existing projects to understand their structure, tech stack, and feature coverage.

## When to Use

Automatically invoke this skill when:

- **Joining an existing project** for the first time
- **Assessing project health** and completion status
- **Understanding codebase structure** before making changes
- **Identifying implemented features** from routes and tests

## What It Does

1. **Detects tech stack** - Language, framework, build tools, test framework
2. **Maps directory structure** - Entry points, source directories, test directories
3. **Discovers modules** - Identifies logical modules and their status
4. **Finds features** - Extracts features from routes and test files
5. **Assesses completion** - Estimates overall project completion

## Supported Tech Stacks

| Language | Frameworks |
|----------|------------|
| Node.js/TypeScript | Express, Vue, React, Astro, Next.js, Nuxt, Fastify, Koa |
| Go | Echo, Gin, Fiber, Chi |
| Python | FastAPI, Flask, Django |

## Usage

```bash
# Generate survey to default location (docs/PROJECT_SURVEY.md)
agent-foreman survey

# Generate to custom path
agent-foreman survey ./custom/path/SURVEY.md

# Verbose output
agent-foreman survey --verbose
```

## Output

The skill generates `docs/PROJECT_SURVEY.md` containing:

### Tech Stack Table
| Aspect | Value |
|--------|-------|
| Language | typescript/javascript |
| Framework | express |
| Build Tool | tsc |
| Test Framework | vitest |
| Package Manager | pnpm |

### Directory Structure
- Entry points found
- Source directories
- Test directories
- Configuration files

### Discovered Features
Features extracted from:
- Route definitions (e.g., `app.get('/users', ...)`)
- Test descriptions (e.g., `it('should create user', ...)`)

### Completion Assessment
- Overall percentage
- Per-module breakdown

### Available Commands
```bash
# Install dependencies
pnpm install

# Start development server
pnpm run dev

# Run tests
pnpm run test
```

## Important Notes

- This skill is **read-only** - it does not modify the codebase
- Does **not** create or update `feature_list.json`
- Useful for initial assessment before running `/init-harness`
- Feature discovery uses pattern matching and may miss some features
- Review the generated report and add missing features manually

## Example Workflow

```bash
# 1. Survey the project
agent-foreman survey

# 2. Review the report
cat docs/PROJECT_SURVEY.md

# 3. If satisfied, initialize harness
agent-foreman init "Project goal" --mode merge
```

---

*Part of the agent-foreman plugin*
