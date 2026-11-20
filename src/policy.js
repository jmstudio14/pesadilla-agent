export const DEFAULT_POLICY = Object.freeze({
  maxRevisionCycles: 2,
  requirePlan: true,
  requireResult: true,
  requireEvidenceForApproval: true,
  requireRequirements: true,
  blockOnMissingTaskId: true,
  criticalFindings: ["security", "data_loss", "destructive_action", "missing_acceptance_criteria"]
});

export function deterministicAudit(event, policy = DEFAULT_POLICY) {
  const findings = [];
  if (!event || typeof event !== "object" || Array.isArray(event)) {
    return { status: "blocked", findings: [{ severity: "critical", code: "invalid_event", message: "Event must be a JSON object." }] };
  }
  if (policy.blockOnMissingTaskId && !nonEmpty(event.task_id)) findings.push({ severity: "critical", code: "missing_task_id", message: "task_id is mandatory." });
  if (!nonEmpty(event.agent_id)) findings.push({ severity: "high", code: "missing_agent_id", message: "agent_id is mandatory for traceability." });
  if (!["plan", "execution", "result"].includes(event.stage)) findings.push({ severity: "high", code: "invalid_stage", message: "stage must be plan, execution or result." });
  if (policy.requirePlan && event.stage !== "plan" && !nonEmptyArray(event.plan)) findings.push({ severity: "high", code: "missing_plan", message: "A plan is required for execution/result audits." });
  if (policy.requireRequirements && !nonEmptyArray(event.requirements)) findings.push({ severity: "high", code: "missing_requirements", message: "Acceptance requirements are missing; approval cannot be evidence-based." });
  if (event.stage === "result" && policy.requireResult && !nonEmpty(event.result)) findings.push({ severity: "high", code: "missing_result", message: "Result stage requires a result summary." });
  if (event.stage === "result" && policy.requireEvidenceForApproval && !nonEmptyArray(event.evidence)) findings.push({ severity: "critical", code: "missing_evidence", message: "No verification evidence supplied; result cannot be approved." });
  const critical = findings.some(f => f.severity === "critical");
  const high = findings.some(f => f.severity === "high");
  return { status: critical ? "blocked" : high ? "needs_revision" : "approved", findings };
}
function nonEmpty(v) { return typeof v === "string" && v.trim().length > 0; }
function nonEmptyArray(v) { return Array.isArray(v) && v.length > 0; }
