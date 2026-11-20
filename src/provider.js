export async function semanticReview(event) {
  const url = process.env.PESADILLA_MODEL_URL;
  const model = process.env.PESADILLA_MODEL_NAME;
  if (!url || !model) return { configured: false, review: null };
  const prompt = [
    "You are PESADILLA, an independent and skeptical quality auditor.",
    "Review the submitted agent event. Do not assume claims are true.",
    "Return ONLY JSON with: status (approved|needs_revision|blocked), findings (array of {severity,code,message,evidence_needed}), questions (array of strings), and improvement_lesson (string or null).",
    "Approve only when requirements are satisfied and evidence is sufficient. Never claim tests ran unless evidence says so.",
    "Do not request certainty; assess observable evidence and uncertainty.",
    JSON.stringify(event)
  ].join("\n\n");
  const headers = { "content-type": "application/json" };
  if (process.env.PESADILLA_API_KEY) headers.authorization = `Bearer ${process.env.PESADILLA_API_KEY}`;
  const response = await fetch(url, {
    method: "POST", headers,
    body: JSON.stringify({ model, temperature: 0, messages: [{ role: "user", content: prompt }] }),
    signal: AbortSignal.timeout(30000)
  });
  if (!response.ok) throw new Error(`Model endpoint returned HTTP ${response.status}`);
  const payload = await response.json();
  const content = payload?.choices?.[0]?.message?.content;
  if (typeof content !== "string") throw new Error("Model response did not contain choices[0].message.content");
  const parsed = JSON.parse(content);
  if (!["approved", "needs_revision", "blocked"].includes(parsed.status) || !Array.isArray(parsed.findings)) throw new Error("Invalid semantic review schema");
  return { configured: true, review: parsed };
}
