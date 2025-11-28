---
name: init-harness
description: Initialize or upgrade the long-task harness for a project
---

# Init Harness Skill

Set up or upgrade the long-task harness infrastructure for feature-driven development.

## When to Use

Invoke this skill when:

- **Starting a new project** that needs structured feature tracking
- **Adding harness to existing project** for better organization
- **Upgrading harness** after significant project changes
- **Re-scanning features** when new routes or tests are added

## Modes

### Merge Mode (default)

```bash
agent-foreman init "Project goal" --mode merge
```

- Keeps existing features unchanged
- Adds newly discovered features
- Preserves all status and notes
- Best for existing projects

### New Mode

```bash
agent-foreman init "Project goal" --mode new
```

- Creates fresh feature list
- Replaces all existing features
- Re-discovers from routes/tests
- Best for major replanning

### Scan Mode

```bash
agent-foreman init "Project goal" --mode scan
```

- Only observes, does not modify
- Shows what would be discovered
- Useful for preview before commit

## Created Files

### 1. `ai/feature_list.json`

Feature backlog with schema validation:

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
        "System returns JWT token",
        "User is redirected to dashboard"
      ],
      "dependsOn": [],
      "version": 1,
      "origin": "init-from-routes"
    }
  ],
  "metadata": {
    "projectGoal": "Build user authentication system",
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T10:00:00Z",
    "version": "1.0.0"
  }
}
```

### 2. `ai/progress.log`

Session handoff audit log:

```
INIT 2024-01-15T10:00:00Z goal="Build user authentication" note="mode=merge, features=15"

STEP 2024-01-15T11:30:00Z feature=auth.login status=passing tests="npm test" summary="Implemented login endpoint"
```

### 3. `ai/init.sh`

Bootstrap script with detected commands:

```bash
#!/usr/bin/env bash
bootstrap() { npm install }
dev() { npm run dev }
check() { npm run test }
```

### 4. `CLAUDE.md`

Instructions for AI agents working on the project.

## Feature Discovery

Features are derived from:

| Source | Example | Confidence |
|--------|---------|------------|
| Routes | `app.post('/login', ...)` | 80% |
| Tests | `it('should authenticate user', ...)` | 90% |
| Controllers | Handler function patterns | 70% |

## Feature ID Convention

IDs use dot notation: `module.submodule.action`

Examples:
- `auth.login`
- `auth.password.reset`
- `api.users.create`
- `chat.message.edit`

## Usage Examples

### New Project

```bash
# Initialize with goal
agent-foreman init "Build a REST API for task management"

# Check what was created
agent-foreman status
```

### Existing Project

```bash
# First, survey to understand the project
agent-foreman survey

# Then initialize (merge mode preserves existing)
agent-foreman init "Continue development on e-commerce platform" --mode merge

# Start working
agent-foreman step
```

### Major Replanning

```bash
# Preview what would be discovered
agent-foreman init "New direction for the project" --mode scan

# If satisfied, do a full reset
agent-foreman init "New direction for the project" --mode new
```

## Post-Initialization

After initialization:

1. **Review** `ai/feature_list.json` - Adjust priorities, add missing features
2. **Edit** acceptance criteria - Make them specific and testable
3. **Add** dependencies - Set `dependsOn` for features that require others
4. **Configure** `ai/init.sh` - Ensure commands work for your project

## Important Notes

- Run `/project-survey` first for existing projects
- Always review auto-discovered features
- Manually add features that weren't discovered
- Set realistic priorities (1 = highest)

---

*Part of the agent-foreman plugin*
