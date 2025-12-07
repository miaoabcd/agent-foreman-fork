---
description: Work on the next priority feature with guided implementation workflow
---

# EXECUTE NOW

Run this command immediately:

```bash
agent-foreman next
```

Wait for completion. Review the feature shown.

## If User Specifies Feature

| User Says | Execute |
|-----------|---------|
| Feature ID provided | `agent-foreman next <feature_id>` |
| "check" / "test first" | `agent-foreman next --check` |
| "preview" / "dry-run" | `agent-foreman next --dry-run` |
| (default) | `agent-foreman next` |

## After Step Command

1. **Read** the acceptance criteria shown
2. **Implement** the feature to satisfy ALL criteria
3. **Verify** with: `agent-foreman check <feature_id>`
4. **Complete** with: `agent-foreman done <feature_id> --skip-check`

## Complete Options

| User Says | Execute |
|-----------|---------|
| "skip verification" | `agent-foreman done <id> --skip-check` |
| "full test" / "all tests" | `agent-foreman done <id> --full` |
| "skip e2e" | `agent-foreman done <id> --skip-e2e` |
| "no commit" / "manual commit" | `agent-foreman done <id> --no-commit` |
| (default, auto-verify) | `agent-foreman done <id>` |

## Priority Order (Auto-Selected)

1. `needs_review` → may be broken (highest)
2. `failing` → not implemented
3. Lower `priority` number
