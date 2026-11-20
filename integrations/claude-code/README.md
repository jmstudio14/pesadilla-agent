# Claude Code integration

Claude Code supports lifecycle hooks. The exact event schema, blocking behavior and settings format must be checked against the installed version before enabling enforcement.

Suggested rollout:
1. Start with a completion audit in report-only mode.
2. Normalize hook JSON input into PESADILLA's common event schema.
3. Call `pesadilla audit <event.json>` from a small adapter script.
4. Test allow and block outcomes in a disposable repository.
5. Only then enable a blocking hook for the relevant event.

Do not enable a live blocking configuration until native hook input/output behavior is tested.

Official reference: https://code.claude.com/docs/en/hooks
