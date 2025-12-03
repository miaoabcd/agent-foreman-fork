---
description: Work on features - auto-complete all pending features or work on a specific one
---

# EXECUTE FEATURE WORKFLOW

Start immediately. Do not ask for confirmation.

## Mode Detection

**If a feature_id is provided** (e.g., `/agent-foreman:run auth.login`):
- Work on that specific feature only
- Complete it and stop

**If no feature_id** (e.g., `/agent-foreman:run`):
- Auto-complete all pending features in priority order
- Loop until all done

---

## Single Feature Mode

When feature_id is provided:

```bash
# STEP 1: Get the specified feature
agent-foreman next <feature_id>

# STEP 2: Implement feature
# (satisfy ALL acceptance criteria shown)

# STEP 3: Complete feature
agent-foreman done <feature_id>
```

---

## All Features Mode

When no feature_id:

```bash
# STEP 1: Check status
agent-foreman status

# STEP 2: Get next feature
agent-foreman next

# STEP 3: Implement feature
# (satisfy ALL acceptance criteria shown)

# STEP 4: Complete feature
agent-foreman done <feature_id>

# STEP 5: Decision
# - More features remaining? → Go to STEP 1
# - All passing/deprecated? → STOP, report success
# - Verification failed? → STOP, report failure
```

---

## Rules (MUST Follow)

| Rule | Action |
|------|--------|
| No skipping | Always: status → next → implement → done |
| One at a time | Complete current before next |
| No editing criteria | Implement exactly as specified |
| Never kill processes | Let commands finish naturally |

## Exit Conditions

| Condition | Action |
|-----------|--------|
| All features `passing`/`deprecated` | ✅ STOP - Success |
| Verification fails | ❌ STOP - Report failure |
| User interrupts | ⏹️ STOP - Clean state |
| Single feature completed | ✅ STOP - Feature done |

## Priority Order (Auto-Selected)

1. `needs_review` → highest
2. `failing` → next
3. Lower `priority` number
