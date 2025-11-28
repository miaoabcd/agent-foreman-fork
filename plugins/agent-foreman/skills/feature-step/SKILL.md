---
name: feature-step
description: Work on the next priority feature with guided implementation
---

# Feature Step Skill

Select and work on the next priority feature from the backlog with structured guidance.

## When to Use

Automatically invoke this skill when:

- **Starting a development session** to pick up where you left off
- **Completing a feature** to identify the next task
- **Checking feature details** before implementation
- **Understanding acceptance criteria** for a specific feature

## How It Works

1. **Reads context** - Loads feature list and progress log
2. **Selects feature** - Chooses highest priority available
3. **Displays guidance** - Shows description, acceptance criteria, dependencies
4. **Tracks progress** - Updates status and logs changes

## Feature Selection Priority

Features are selected in this order:

| Priority | Status | Reason |
|----------|--------|--------|
| 1st | `needs_review` | May be broken by recent changes |
| 2nd | `failing` | Not yet implemented |
| 3rd | By `priority` field | Lower number = higher priority |

## Usage

### Auto-Select Next Feature

```bash
agent-foreman step
```

Automatically selects the highest priority feature.

### Work on Specific Feature

```bash
agent-foreman step auth.login
```

Shows details for the specified feature.

### Preview Without Changes

```bash
agent-foreman step --dry-run
```

Shows what would be selected without making changes.

## Output Example

```
📋 Selected Feature: auth.login
   Module: auth
   Priority: 1
   Status: failing

   User can log in with email and password

   Acceptance Criteria:
   1. User enters valid credentials
   2. System returns JWT token
   3. User is redirected to dashboard

   ⚠ Depends on: auth.register

   ─────────────────────────────────────────
   When done, run: agent-foreman complete auth.login
```

## Workflow After Selection

### 1. Plan

- Review acceptance criteria
- Check dependencies are passing
- Identify files to modify

### 2. Implement

- Write code to satisfy criteria
- Keep changes focused on this feature
- Don't introduce unrelated changes

### 3. Test

```bash
# Run project tests
./ai/init.sh check

# Or specific test command
npm run test
```

### 4. Verify Acceptance

Go through each criterion:
- [ ] User enters valid credentials
- [ ] System returns JWT token
- [ ] User is redirected to dashboard

### 5. Mark Complete

```bash
agent-foreman complete auth.login
```

### 6. Check Impact

```bash
agent-foreman impact auth.login
```

### 7. Commit

```bash
git add .
git commit -m "feat(auth): implement user login

- Add login endpoint
- Return JWT on success
- Add redirect logic

Feature: auth.login"
```

## Feature States

| Status | Can Work On? | Action |
|--------|-------------|--------|
| `failing` | Yes | Implement the feature |
| `needs_review` | Yes | Review and verify still works |
| `passing` | No | Already complete |
| `blocked` | No | Waiting for external dependency |
| `deprecated` | No | No longer needed |

## Dependencies

If a feature has dependencies:

```
⚠ Depends on: auth.register, user.profile
```

**Check that dependencies are passing before starting.**

If dependencies are failing, work on them first:

```bash
agent-foreman step auth.register
```

## Notes Field

Features may have notes from previous sessions:

```
Notes: Started implementation, need to add validation
```

Continue from where the previous session left off.

## Common Commands

```bash
# See what's next
agent-foreman step

# Check project status
agent-foreman status

# Mark feature complete
agent-foreman complete <feature_id>

# Mark feature complete with notes
agent-foreman complete <feature_id> --notes "Added extra validation"

# Check impact of changes
agent-foreman impact <feature_id>
```

## Best Practices

1. **One feature at a time** - Don't start multiple features
2. **Complete or pause cleanly** - Leave code in working state
3. **Update notes** - If pausing, note what's done and what's left
4. **Test thoroughly** - Check all acceptance criteria
5. **Clean commits** - One feature = one commit

## Troubleshooting

### "No feature list found"

Run initialization first:
```bash
agent-foreman init "Your project goal"
```

### "Feature not found"

Check available features:
```bash
agent-foreman status
```

### "All features passing"

```
🎉 All features are passing or blocked. Nothing to do!
```

Your project is complete! Add new features manually to `ai/feature_list.json`.

---

*Part of the agent-foreman plugin*
