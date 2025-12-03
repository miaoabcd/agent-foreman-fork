---
name: feature-next
description: Work on the next priority feature with guided implementation
---

# 🚀 Feature Next

**One command**: `agent-foreman next`

## Quick Start

```bash
agent-foreman next           # Auto-select next priority
agent-foreman next auth.login  # Specific feature
```

## Workflow

```
next → implement → done
```

```bash
agent-foreman next              # 1. Get task + acceptance criteria
# ... implement the feature ... # 2. Write code
agent-foreman done <id>     # 3. Verify + commit
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
agent-foreman done <id>             # Quick mode (related tests only)
agent-foreman done <id> --full      # All tests
agent-foreman done <id> --skip-e2e  # Skip E2E tests
agent-foreman done <id> --no-commit # Manual commit
```
