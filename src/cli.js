#!/usr/bin/env node
import { readFile, mkdir, writeFile, access } from "node:fs/promises";
import { resolve } from "node:path";
import { auditEvent } from "./audit.js";
const [command, arg] = process.argv.slice(2);

async function main() {
  if (command === "init") {
    const dir = resolve(".pesadilla");
    await mkdir(resolve(dir, "events"), { recursive: true });
    await mkdir(resolve(dir, "learning"), { recursive: true });
    const config = { schema_version: "1.0", mode: "report-only", policy: {
      maxRevisionCycles: 2, requirePlan: true, requireResult: true,
      requireEvidenceForApproval: true, requireRequirements: true, blockOnMissingTaskId: true
    }};
    const path = resolve(dir, "config.json");
    try { await access(path); console.log("Config already exists; leaving it unchanged."); }
    catch { await writeFile(path, JSON.stringify(config, null, 2) + "\n"); console.log(`Created ${path}`); }
    return;
  }
  if (command === "audit" && arg) {
    const event = JSON.parse(await readFile(resolve(arg), "utf8"));
    let policy;
    try { policy = JSON.parse(await readFile(resolve(".pesadilla/config.json"), "utf8")).policy; } catch {}
    const report = await auditEvent(event, { policy });
    console.log(JSON.stringify(report, null, 2));
    if (report.status !== "approved") process.exitCode = 2;
    return;
  }
  if (command === "doctor") {
    console.log(JSON.stringify({ node: process.version, modelConfigured: Boolean(process.env.PESADILLA_MODEL_URL && process.env.PESADILLA_MODEL_NAME), apiKeyConfigured: Boolean(process.env.PESADILLA_API_KEY), note: "No model calls are made by doctor." }, null, 2));
    return;
  }
  console.log("PESADILLA — portable agent quality gate\n\nCommands:\n  pesadilla init\n  pesadilla audit <event.json>\n  pesadilla doctor");
  if (command) process.exitCode = 1;
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
