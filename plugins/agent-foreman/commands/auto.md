---
description: Automatically complete all pending features from the feature list in priority order
---

# Auto-Complete All Features

Run through and complete all pending features from the feature list automatically.

## When to Use

- Starting a development session to complete multiple features
- Running autonomous development on a project
- Batch processing all remaining features

## Auto-Complete Loop

Execute this workflow repeatedly until all features are complete:

1. Run `agent-foreman status` to check remaining features
2. Run `agent-foreman step` to get the next priority feature
3. Implement the feature based on acceptance criteria
4. Run `agent-foreman complete <feature_id>` to verify and mark as passing
5. If more features remain, go to step 1

## Feature Selection Priority

1. `needs_review` - May be broken by recent changes
2. `failing` - Not yet implemented
3. By `priority` field - Lower number = higher priority

## Exit Conditions

Stop the loop when:

- All features are `passing` or `deprecated`
- A feature fails verification
- User interrupts the process

## Related Commands

```bash
# Check project status
agent-foreman status

# Work on single feature
agent-foreman step

# Verify and complete a feature
agent-foreman complete <feature_id>
```
