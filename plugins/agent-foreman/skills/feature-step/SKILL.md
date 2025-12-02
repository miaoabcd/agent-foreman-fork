---
name: feature-step
description: Work on the next priority feature with guided implementation
---

# 🚀 Feature Step

**One command**: `agent-foreman step`

## Quick Start

```bash
agent-foreman step           # Auto-select next priority
agent-foreman step auth.login  # Specific feature
```

## Workflow

```
step → implement → complete
```

```bash
agent-foreman step              # 1. Get task + acceptance criteria
# ... implement the feature ... # 2. Write code
agent-foreman complete <id>     # 3. Verify + commit
```

## Priority Order

1. `needs_review` → may be broken
2. `failing` → not implemented
3. Lower `priority` number → higher priority

## Options

| Flag | Effect |
|------|--------|
| `--check` | Run tests before showing feature |
| `--dry-run` | Preview without changes |

## Complete Options

```bash
agent-foreman complete <id>             # Quick mode (related tests only)
agent-foreman complete <id> --full      # All tests
agent-foreman complete <id> --skip-e2e  # Skip E2E tests
agent-foreman complete <id> --no-commit # Manual commit
```
