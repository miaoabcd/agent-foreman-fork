---
name: feature-run
description: Work on features - auto-complete all pending features or work on a specific one
---

# 🔄 Feature Run

**Mode**: Work on all features or a specific one

## Mode Detection

**If feature_id provided** (e.g., `feature-run auth.login`):
- Work on that specific feature only
- Complete it and stop

**If no feature_id** (e.g., `feature-run`):
- Auto-complete all pending features
- Loop until all done

---

## Single Feature Mode

When feature_id is provided:

```bash
# STEP 1: Get the specified feature
agent-foreman next <feature_id>

# STEP 2: Implement (satisfy ALL acceptance criteria)
# ... write code ...

# STEP 3: Verify + commit
agent-foreman done <feature_id>
```

---

## All Features Mode

When no feature_id:

```bash
# STEP 1: Check remaining features
agent-foreman status

# STEP 2: Get next priority feature
agent-foreman next

# STEP 3: Implement (satisfy ALL acceptance criteria)
# ... write code ...

# STEP 4: Verify + commit
agent-foreman done <feature_id>

# STEP 5: Loop or exit
# - More features? → Go to STEP 1
# - All passing? → DONE
# - Verification failed? → STOP
```

---

## Rules

| Rule | Description |
|------|-------------|
| One at a time | Complete current before next |
| No skipping | Always status → next → implement → done |
| No editing criteria | Implement as specified |
| Never kill processes | Let commands finish naturally |

## Priority Order

1. `needs_review` → may be broken (highest)
2. `failing` → not implemented
3. Lower `priority` number

## Exit When

- ✅ All features `passing` or `deprecated`
- ✅ Single feature completed (when feature_id provided)
- ❌ Verification fails
- ⏹️ User interrupts
