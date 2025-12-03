---
name: project-analyze
description: Analyze existing projects to generate comprehensive survey reports
---

# 🔍 Project Analyze

**One command**: `agent-foreman analyze`

## Quick Start

```bash
agent-foreman analyze
```

Output: `docs/ARCHITECTURE.md`

## Options

| Flag | Effect |
|------|--------|
| `./path/FILE.md` | Custom output path |
| `--verbose` | Show detailed progress |

## Use When

- Joining existing project → understand before changing
- Before `agent-foreman init` → faster initialization

## Skip When

- New/empty project → use `agent-foreman init` directly

## Read-Only

No code changes. No commits. Safe to run anytime.
