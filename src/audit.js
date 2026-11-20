import { deterministicAudit } from "./policy.js";
import { semanticReview } from "./provider.js";
import { appendFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
const rank = { approved: 0, needs_revision: 1, blocked: 2 };

export async function auditEvent(event, options = {}) {
  const deterministic = deterministicAudit(event, options.policy);
  let semantic = null;
  try {
    semantic = (await semanticReview(event)).review;
  } catch (error) {
    semantic = { status: "needs_revision", findings: [{ severity: "high", code: "semantic_review_unavailable", message: `Semantic review failed: ${error.message}` }], questions: ["Retry semantic review or provide a verified offline review."] };
  }
  const statuses = [deterministic.status, semantic?.status].filter(Boolean);
  const status = statuses.reduce((worst, current) => rank[current] > rank[worst] ? current : worst, "approved");
  const report = {
    schema_version: "1.0", audited_at: new Date().toISOString(),
    task_id: event?.task_id ?? null, agent_id: event?.agent_id ?? null,
    stage: event?.stage ?? null, status, deterministic, semantic,
    approval_scope: "submitted_event_snapshot_only"
  };
  const logPath = resolve(options.logPath ?? ".pesadilla/events/audit.jsonl");
  await mkdir(dirname(logPath), { recursive: true });
  await appendFile(logPath, JSON.stringify(report) + "\n", "utf8");
  return report;
}
