# agent-foreman

> Long Task Harness for AI agents - feature-driven development with external memory
>
> AI 代理的长任务管理框架 - 基于功能驱动的开发，提供外部记忆

[![npm version](https://img.shields.io/npm/v/agent-foreman.svg)](https://www.npmjs.com/package/agent-foreman)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Problem

AI coding agents face three common failure modes when working on long-running tasks:

1. **Doing too much at once** - Trying to complete everything in one session, resulting in messy, incomplete code
2. **Premature completion** - Declaring victory before all features actually work
3. **Superficial testing** - Not thoroughly validating implementations

## Solution

**agent-foreman** provides a structured harness that enables AI agents to:

- Maintain **external memory** via structured files
- Work on **one feature at a time** with clear acceptance criteria
- **Hand off cleanly** between sessions via progress logs
- **Track impact** of changes on other features

## Installation

```bash
# Global installation
npm install -g agent-foreman

# Or use with npx
npx agent-foreman --help
```

## Quick Start

### New Project

```bash
# Initialize the harness
agent-foreman init "Build a REST API for task management"

# Check status
agent-foreman status

# Start working on features
agent-foreman step
```

### Existing Project

```bash
# Survey the project first
agent-foreman survey

# Initialize (merge mode preserves existing features)
agent-foreman init "Project goal" --mode merge

# Start working
agent-foreman step
```

## Commands

| Command | Description |
|---------|-------------|
| `survey [output]` | Generate project survey report |
| `init <goal>` | Initialize or upgrade the harness |
| `step [feature_id]` | Show next feature to work on |
| `status` | Show current project status |
| `impact <feature_id>` | Analyze impact of changes |
| `complete <feature_id>` | Mark a feature as complete |

## Core Files

The harness maintains three core artifacts:

| File | Purpose |
|------|---------|
| `ai/feature_list.json` | Feature backlog with status tracking |
| `ai/progress.log` | Session handoff audit log |
| `ai/init.sh` | Environment bootstrap script |

## Feature Status

| Status | Meaning |
|--------|---------|
| `failing` | Not yet implemented |
| `passing` | Acceptance criteria met |
| `blocked` | External dependency blocking |
| `needs_review` | May be affected by changes |
| `deprecated` | No longer needed |

## Workflow

### Session Start

```bash
# 1. Check status
agent-foreman status

# 2. Get next feature
agent-foreman step
```

### Feature Implementation

```bash
# 3. Implement the feature
# ... your development work ...

# 4. Run tests
./ai/init.sh check

# 5. Mark complete
agent-foreman complete auth.login

# 6. Check impact
agent-foreman impact auth.login
```

### Session End

```bash
# 7. Commit with feature ID
git add .
git commit -m "feat(auth): implement user login

Feature: auth.login"
```

## Claude Code Plugin

agent-foreman is also available as a Claude Code plugin:

```bash
# Install plugin
/plugin marketplace add mylukin/agent-foreman
/plugin install agent-foreman
```

### Available Skills

| Skill | Description |
|-------|-------------|
| `/project-survey` | Analyze existing projects |
| `/init-harness` | Initialize the harness |
| `/feature-step` | Work on features |

## Supported Tech Stacks

| Language | Frameworks |
|----------|------------|
| Node.js/TypeScript | Express, Vue, React, Astro, Next.js, Nuxt |
| Go | Echo, Gin, Fiber |
| Python | FastAPI, Flask, Django |

## Feature List Schema

```json
{
  "features": [
    {
      "id": "auth.login",
      "description": "User can log in with email and password",
      "module": "auth",
      "priority": 1,
      "status": "failing",
      "acceptance": [
        "User enters valid credentials",
        "System returns JWT token"
      ],
      "dependsOn": ["auth.register"],
      "version": 1,
      "origin": "manual"
    }
  ],
  "metadata": {
    "projectGoal": "Build authentication system",
    "version": "1.0.0"
  }
}
```

## Best Practices

1. **One feature at a time** - Complete before switching
2. **Update status promptly** - Mark passing when criteria met
3. **Review impact** - Run impact analysis after changes
4. **Clean commits** - One feature = one atomic commit
5. **Read first** - Always check feature list and progress log

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build
npm run build

# Run tests
npm test
```

## License

MIT

## Author

Lukin ([@mylukin](https://github.com/mylukin))

---

Inspired by Anthropic's blog post: [Effective harnesses for long-running agents](https://www.anthropic.com)
