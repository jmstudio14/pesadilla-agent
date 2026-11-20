# PESADILLA

**Portable Agent Quality Gate & Continuous Improvement**

PESADILLA is a project-independent supervisor for AI-agent workflows. It audits plans and results, records recurring failure patterns, proposes improvements, and requires evidence before a task is marked approved.

> Status: early MVP scaffold (v0.1.0). This repository is a foundation, not yet a fully autonomous multi-agent runtime.

## Design principles

- **Independent review:** the executing agent cannot approve its own work.
- **Evidence over confidence:** approval depends on criteria, checks and evidence—not a claimed "100% certainty".
- **Fail closed on critical gaps:** missing mandatory evidence means `needs_revision` or `blocked`.
- **Least privilege:** PESADILLA may recommend changes; it must not silently rewrite agent prompts, skills, code or project configuration.
- **Bounded retries:** prevent endless review loops and token waste.
- **Portable core:** project adapters feed a common event format into the same audit engine.
- **Learning with regression tests:** a lesson is reusable only after validation.

## Requirements

- Node.js 20+
- Optional OpenAI-compatible model endpoint for semantic audits. Without it, the CLI runs deterministic checks only.

## Quick start

```bash
npm install
npm test
node ./src/cli.js init
node ./src/cli.js audit examples/sample-task.json
```

Copy `.pesadilla/` into a project, or install this repository as a Git dependency once published:

```bash
npm install --save-dev github:jmstudio14/pesadilla-agent
npx pesadilla init
```

## Commands

- `pesadilla init` — creates `.pesadilla/config.json` and local event/learning folders.
- `pesadilla audit <file.json>` — audits a task event using deterministic policy checks and, when configured, an LLM reviewer.
- `pesadilla doctor` — checks configuration and runtime prerequisites.

## Model configuration

Set environment variables (never commit secrets):

```bash
PESADILLA_MODEL_URL=https://api.example.com/v1/chat/completions
PESADILLA_MODEL_NAME=your-model
PESADILLA_API_KEY=...
```

The endpoint must accept the OpenAI Chat Completions request shape. No provider is bundled and no API key is required for deterministic mode.

## Common event format

```json
{
  "task_id": "task-123",
  "agent_id": "backend-agent",
  "stage": "result",
  "task": "Implement a REST endpoint",
  "plan": ["Define contract", "Implement", "Test"],
  "result": "Endpoint implemented",
  "requirements": ["Returns 200 for valid input", "Rejects invalid input"],
  "evidence": ["npm test: 12 passed"],
  "changed_files": ["src/routes/users.js"],
  "metadata": { "project": "example" }
}
```

Stages: `plan`, `execution`, `result`. Adapters normalize native platform events to this schema.

## Approval states

- `approved`: required fields and configured checks pass.
- `needs_revision`: correctable gaps or failed checks.
- `blocked`: critical missing evidence, policy violation, or retry budget exhausted.

Approval is scoped to the submitted task snapshot. Any material change to the plan, files or result invalidates prior approval.

## Continuous improvement lifecycle

1. Record a finding with evidence and reproducible context.
2. Classify it (instruction, reasoning, tool selection, context, implementation, verification).
3. Draft a lesson and proposed agent-instruction change.
4. Add a regression case reproducing the original failure.
5. Validate the lesson against regression and relevant existing tests.
6. Only then mark the lesson `validated`.
7. A human or explicitly configured policy owner approves changes to prompts, skills and integrations.

The MVP stores audit events. It does not mutate agent instructions automatically.

## Integrations

- `integrations/claude-code/`: integration notes and example rollout.
- `integrations/codex/`: integration notes. Hook availability and event semantics are version-dependent; verify with the installed CLI's `/hooks` command and current official docs.
- Other agents: implement an adapter that sends the common event schema to `pesadilla audit`.

## Security

- Treat model output, agent output and repository content as untrusted.
- Never execute shell commands proposed by an agent during an audit.
- Keep API keys in environment variables or a secret manager.
- Start in report-only mode. Enable blocking only after validating the adapter.
- Do not allow autonomous approval of destructive operations, credential handling, deployments or production changes without explicit policy.
- Keep audit logs local by default.

## Roadmap

1. Stable core event schema, deterministic policy engine and tests.
2. Claude Code hook adapter with tested allow/block semantics.
3. Codex hook adapter, gated by installed-version support.
4. Provider adapters and structured semantic review.
5. Validated learning store and regression harness.
6. Optional dashboards, team policy packs and signed audit reports.

## License

MIT. See `LICENSE`.
