# agent-foreman

> AI Agent 长任务执行框架 — 让 AI 像人类团队一样高效协作

[![npm version](https://img.shields.io/npm/v/agent-foreman.svg)](https://www.npmjs.com/package/agent-foreman)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[English](./README.md)

## 痛点

AI 编程助手在处理复杂项目时，常常会掉进这三个坑：

1. **贪多嚼不烂** — 试图一口气搞定所有功能，结果代码乱成一团
2. **虎头蛇尾** — 还没验证就急着宣布「搞定了」，实际一堆 bug
3. **走过场式测试** — 测试覆盖不到位，上线后问题频出

## 破局之道

**agent-foreman** 提供了一套结构化的工作框架，让 AI 能够：

- 通过外部文件**持久化记忆**，不再「失忆」
- **专注单一功能**，配合清晰的验收标准
- 通过进度日志实现**无缝交接**，换个 Agent 接着干
- **追踪变更影响**，改一处知全局

## 为什么管用

道理很简单：**AI 需要和人类团队一样的协作工具**。

人类工程师也不靠脑子记事。我们用：
- Git 管理版本
- Issue 跟踪任务
- 文档做交接
- 测试保质量

agent-foreman 把这套打法搬给了 AI：

| 人类的做法 | AI 的等价物 |
|-----------|------------|
| Scrum 看板 | `feature_list.json` |
| 站会纪要 | `progress.log` |
| CI/CD 流水线 | `init.sh check` |
| Code Review | 验收标准 |

### 为什么选 JSON 而非 Markdown？

Anthropic 的研究发现：

> "相比 Markdown 清单，模型处理 JSON 结构时更加准确和稳定。"

用 JSON 存储功能列表，配合明确的 `status` 字段，AI：
- 不会手滑删条目
- 能精准更新状态
- 严格遵守数据结构

这就是「项目稳定推进」和「功能莫名消失」的分水岭。

## 安装

```bash
# 全局安装
npm install -g agent-foreman

# 或者用 npx 直接运行
npx agent-foreman --help
```

## Claude Code 插件

agent-foreman 也可以作为 Claude Code 插件使用：

```bash
# 安装插件
/plugin marketplace add mylukin/agent-foreman
/plugin install agent-foreman
```

---

## 配合 Claude Code 使用

### 项目初始化

#### 从零开始

创建一个全新项目：

```bash
mkdir my-project && cd my-project
agent-foreman init "搭建一个任务管理 REST API" --mode new
```

**给 Claude Code 的提示词：**

```text
用 foreman 初始化这个项目。
目标：搭建一个任务管理 REST API
```

#### 已有项目

给现有项目加上 foreman 管理：

```bash
agent-foreman analyze
agent-foreman init "你的项目目标"
```

**给 Claude Code 的提示词：**

```text
用 foreman 初始化这个项目。
```

---

### 任务循环

#### 单任务模式

```text
用 foreman 获取下一个任务，实现它，然后标记完成。
```

#### 连续作战模式

**一键自动化提示词：**

```text
用 foreman 检查项目状态，然后循环完成所有任务。每个任务：
1. 执行 `agent-foreman next` 获取任务
2. 按验收标准实现功能
3. 执行 `agent-foreman done <feature_id>` 验证并完成（自动提交）
4. 循环直到全部通过
```

#### 状态速览

```text
用 foreman 看一下项目当前进度。
```

#### 全面分析

```text
用 foreman 分析这个项目，给我一份完整的状态报告。
```

---

### 任务管理

#### 添加新任务

直接编辑 `ai/feature_list.json`，或者让 Claude Code 帮忙：

```text
添加一个新功能：
- ID: auth.oauth
- 描述：接入 Google OAuth2 登录
- 模块：auth
- 优先级：5
- 验收标准：用户能用 Google 账号登录
```

**功能 JSON 结构：**

```json
{
  "id": "auth.oauth",
  "description": "接入 Google OAuth2 登录",
  "module": "auth",
  "priority": 5,
  "status": "failing",
  "acceptance": [
    "页面显示「使用 Google 登录」按钮",
    "点击后跳转到 Google 授权页",
    "授权完成后跳回应用并完成登录"
  ],
  "dependsOn": ["auth.login"],
  "tags": ["oauth", "google"],
  "version": 1,
  "origin": "manual",
  "notes": ""
}
```

#### 调整项目目标

```text
把项目目标改成：「搭建一个带 React 前端的全栈任务管理应用」
顺便更新一下相关功能。
```

#### 修改已有任务

```text
更新 'api.users.create' 功能：
- 描述改成：「创建用户并发送验证邮件」
- 新增验收标准：「注册后发送验证邮件」
- 优先级调成 3
```

#### 标记为阻塞

```text
把 'payment.stripe' 标记为阻塞，备注：「等 Stripe API 密钥」
```

---

### 全自动模式

#### 方式一：循环执行提示词

最靠谱的全自动提示词：

```text
作为自主开发者，用 agent-foreman 持续完成所有待办任务：

1. `agent-foreman status` 检查状态
2. `agent-foreman next` 获取任务
3. 完整实现功能
4. `agent-foreman done <id>` 验证完成（自动测试+提交）
5. 回到步骤 2，直到全部通过

除非遇到必须我介入的问题，否则不要停。
```

#### 方式二：使用 Foreman Agent

```text
用 foreman agent 自动完成这个项目的所有待办任务，
逐个推进直到 100% 完成。
```

#### 方式三：批量标记（功能已实现的情况）

如果功能已经做好了，只是没标记：

```text
这个项目的功能都已经实现并测试过了。
用 foreman 逐个标记为完成。
```

---

### 工作流程图

agent-foreman 采用 **TDD (测试驱动开发)** 理念：先定义验收标准，再实现功能，最后验证通过。

```text
┌──────────────────────────────────────────────────────────────────────────┐
│                          AGENT-FOREMAN 工作流                             │
│                        (基于 TDD 测试驱动开发)                             │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  初始化阶段                                                               │
│  ┌─────────┐    ┌─────────────────┐    ┌──────────┐                     │
│  │ survey  │───▶│ detect-         │───▶│   init   │                     │
│  │ 分析项目 │    │ capabilities    │    │ 生成配置 │                     │
│  └─────────┘    └─────────────────┘    └──────────┘                     │
│                                              │                           │
│                                              ▼                           │
│                                    定义验收标准 (RED)                     │
│                                    feature_list.json                     │
│                                                                          │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  TDD 开发循环                                                             │
│                                                                          │
│      ┌──────────────────────────────────────────────────────┐           │
│      │                          循环                        │           │
│      ▼                                                      │           │
│  ┌──────────┐    ┌──────────────────────────────────────┐  │           │
│  │  step    │───▶│  RED: 查看验收标准 (预期行为)         │  │           │
│  │ 获取任务 │    │  验收标准 = 失败的测试用例             │  │           │
│  └──────────┘    └──────────────────────────────────────┘  │           │
│                                   │                         │           │
│                                   ▼                         │           │
│                  ┌──────────────────────────────────────┐  │           │
│                  │  GREEN: 实现功能                      │  │           │
│                  │  编写最少代码让验收标准通过            │  │           │
│                  └──────────────────────────────────────┘  │           │
│                                   │                         │           │
│                                   ▼                         │           │
│                  ┌──────────────────────────────────────┐  │           │
│                  │  done <id>                            │  │           │
│                  │  - 运行测试 (验证 GREEN)              │  │           │
│                  │  - AI 验证验收标准                    │  │           │
│                  │  - 自动提交 (REFACTOR 可选)           │  │           │
│                  └──────────────────────────────────────┘  │           │
│                                   │                         │           │
│                                   ▼                         │           │
│                          ┌───────────────┐                 │           │
│                          │ 还有任务？    │─────有──────────┘           │
│                          └───────────────┘                              │
│                                   │ 没有                                │
│                                   ▼                                     │
│                  ┌───────────────────────────────┐                     │
│                  │  全部通过！(100%)              │                     │
│                  │  PROJECT_SURVEY.md 已更新      │                     │
│                  └───────────────────────────────┘                     │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

**TDD 核心理念：**
- **RED** — 先定义验收标准（等同于失败的测试）
- **GREEN** — 编写最少代码让标准通过
- **REFACTOR** — 在测试保护下重构优化

**核心命令：**
| 阶段 | 命令 | 用途 |
|------|------|------|
| 初始化 | `analyze` | 分析现有项目结构 |
| 初始化 | `detect-capabilities` | 自动检测构建/测试/检查工具 |
| 初始化 | `init <goal>` | 生成框架和功能列表 |
| 开发 | `status` | 查看当前进度 |
| 开发 | `next` | 获取下一个优先任务 (RED) |
| 开发 | `done <id>` | 验证 + 提交 (GREEN → REFACTOR) |
| 调试 | `impact <id>` | 检查可能受影响的功能 |

---

## 命令速查

| 命令 | 说明 |
|------|------|
| `analyze` | 生成项目分析报告 |
| `init <goal>` | 初始化或升级框架 |
| `next` | 显示下一个要做的任务 |
| `status` | 查看项目进度 |
| `impact <feature_id>` | 分析改动的影响范围 |
| `done <feature_id>` | 验证 + 标记完成 + 自动提交 |
| `check <feature_id>` | 只验证不完成 |
| `agents` | 查看可用的 AI 代理 |
| `detect-capabilities` | 检测项目的验证能力 |

### done 命令选项

| 参数 | 说明 |
|------|------|
| `--quick` | 只跑相关测试（默认模式） |
| `--full` | 跑完整测试套件 |
| `--skip-e2e` | 跳过 E2E 测试 |
| `--skip-verify` | 跳过 AI 验证 |
| `--no-commit` | 不自动提交 |
| `--test-pattern <pattern>` | 指定测试文件匹配模式 |

### init 模式

| 模式 | 说明 |
|------|------|
| `--mode merge` | 合并到现有配置（默认） |
| `--mode new` | 全新创建，已存在则报错 |
| `--mode scan` | 只扫描，不写入 |

---

## 核心文件

| 文件 | 用途 |
|------|------|
| `ai/feature_list.json` | 功能清单，带状态追踪 |
| `ai/progress.log` | 进度日志，用于会话交接 |
| `ai/init.sh` | 环境启动脚本 |
| `docs/PROJECT_SURVEY.md` | AI 生成的项目分析报告 |

---

## 功能状态

| 状态 | 含义 |
|------|------|
| `failing` | 待实现 |
| `passing` | 已完成验收 |
| `blocked` | 被外部依赖卡住 |
| `needs_review` | 可能受其他改动影响，需复查 |
| `deprecated` | 已废弃 |

---

## 支持的技术栈

**通用支持** — agent-foreman 使用 AI 驱动的自动检测来分析任何项目，并自动确定合适的验证方法。

```bash
# 检测项目能力
agent-foreman detect-capabilities
```

检测系统会自动识别：
- **构建系统** (npm, yarn, pnpm, go, cargo, pip 等)
- **测试框架** (Jest, Vitest, pytest, go test 等)
- **代码检查** (ESLint, Prettier, golint 等)
- **E2E 测试** (Playwright, Cypress 等)
- **类型检查** (TypeScript, mypy 等)

无需配置 — 只需运行 `detect-capabilities`，框架会自动适配你的项目。

---

## 最佳实践

1. **一次只做一件事** — 完成当前任务再切换
2. **及时更新状态** — 验收通过就标记
3. **关注影响范围** — 改完跑一下 impact 分析
4. **原子化提交** — 一个功能对应一个 commit
5. **先看再动手** — 开工前先读功能列表和进度日志

---

## 本地开发

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建
npm run build

# 跑测试
npm test
```

## 开源协议

MIT

## 作者

Lukin ([@mylukin](https://github.com/mylukin))

---

灵感来源：Anthropic 博客 [Effective harnesses for long-running agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)
