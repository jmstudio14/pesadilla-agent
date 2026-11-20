import test from "node:test";
import assert from "node:assert/strict";
import { deterministicAudit } from "../src/policy.js";

test("blocks result without evidence", () => {
  const result = deterministicAudit({ task_id: "1", agent_id: "agent", stage: "result", plan: ["build"], result: "done", requirements: ["works"] });
  assert.equal(result.status, "blocked");
  assert.ok(result.findings.some(f => f.code === "missing_evidence"));
});
test("requests revision when requirements are absent", () => {
  const result = deterministicAudit({ task_id: "1", agent_id: "agent", stage: "plan", plan: ["build"] });
  assert.equal(result.status, "needs_revision");
});
test("approves complete plan event", () => {
  const result = deterministicAudit({ task_id: "1", agent_id: "agent", stage: "plan", plan: ["build", "test"], requirements: ["tests pass"] });
  assert.equal(result.status, "approved");
});
