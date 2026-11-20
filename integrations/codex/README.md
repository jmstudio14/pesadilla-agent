# Codex integration

Codex hook support and event semantics depend on the installed CLI version. Check the CLI's `/hooks` interface and current official documentation before enabling an adapter.

Suggested rollout:
1. Confirm that the installed version supports the lifecycle event needed.
2. Map its native event payload to PESADILLA's common event schema.
3. Begin in report-only mode.
4. Verify whether the event can block continuation; do not assume Claude Code semantics transfer to Codex.

Documentation: https://developers.openai.com/codex/
