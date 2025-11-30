---
name: feature-auto-complete
description: Automatically complete all pending features from the feature list in priority order
---

# Feature Auto-Complete

Automatically work through and complete all pending features from the feature list in priority order.

## When to Use

- Starting a development session and want to complete multiple features
- Running autonomous development on a project
- Batch processing all remaining features
- When you want hands-off feature completion

## How It Works

1. Read `ai/feature_list.json` to get all features
2. Filter features by status: `needs_review` and `failing`
3. Sort by priority (needs_review first, then by priority number)
4. For each feature:
   - Display feature info and acceptance criteria
   - Implement the feature
   - Run `agent-foreman complete <feature_id>` to verify and mark as passing
   - Log progress to `ai/progress.log`
   - Move to next feature
5. Continue until all features are passing or an error occurs

## Workflow Loop

```text
┌─────────────────────────────────────────────────────┐
│                  AUTO-COMPLETE LOOP                  │
├─────────────────────────────────────────────────────┤
│                                                      │
│  1. agent-foreman status (check remaining features) │
│                    ↓                                 │
│  2. agent-foreman step (get next priority feature)  │
│                    ↓                                 │
│  3. Implement feature based on acceptance criteria  │
│                    ↓                                 │
│  4. agent-foreman complete <feature_id>             │
│      (verify + mark passing + auto-commit)          │
│                    ↓                                 │
│  5. Check if more features remain                   │
│      YES → Go to step 1                             │
│      NO  → Done! All features complete              │
│                                                      │
└─────────────────────────────────────────────────────┘
```

## Feature Selection Priority

1. `needs_review` - May be broken by recent changes (highest)
2. `failing` - Not yet implemented
3. By `priority` field - Lower number = higher priority

## Exit Conditions

The auto-complete loop stops when:

- All features are `passing` or `deprecated`
- A feature fails verification
- User interrupts the process

## Progress Tracking

Each completed feature is logged to `ai/progress.log`:

```log
STEP 2025-01-15T10:30:00Z feature=auth.login status=passing summary="Auto-completed login flow"
STEP 2025-01-15T11:00:00Z feature=auth.logout status=passing summary="Auto-completed logout flow"
```

## Best Practices

1. **Review first** - Run `agent-foreman status` before starting
2. **Monitor progress** - Check `ai/progress.log` for status updates
3. **Handle failures** - Review failed features manually before retrying

## Related Commands

```bash
# Check project status first
agent-foreman status

# Work on single feature
agent-foreman step

# Verify a specific feature
agent-foreman verify <feature_id>

# Complete a specific feature
agent-foreman complete <feature_id>
```
