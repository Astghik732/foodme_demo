// Builds the mutation report from .mutation/mutants.jsonl.
//   node summarize.mjs            -> .mutation/report.json and .mutation/report.md
// Env: SCORE_THRESHOLD (default 70), MUTATION_MODULES (modules that were in scope).
//
// report.json schema
//   mutations   number of valid mutants (killed + survived; timeouts count as killed)
//   survived    mutants the tests did NOT catch
//   killed      mutants the tests caught
//   score       killed / mutations * 100 (null when there were no mutants)
//   rate        killed / mutations as a fraction (null when there were no mutants)
//   result      "pass" if score >= threshold (or nothing to mutate), else "fail"
//   mutants[]   every mutant: id, module, category, description, file, line, status,
//               testsPassed (true = the module's tests still passed with the mutant = survived),
//               killedBy, seconds, diff
import fs from "node:fs";
import path from "node:path";

const dir = path.resolve(".mutation");
const threshold = Number(process.env.SCORE_THRESHOLD ?? 70);
const listFile = path.join(dir, "mutants.jsonl");
const mutants = fs.existsSync(listFile)
  ? fs.readFileSync(listFile, "utf8").replace(/^﻿/, "").split("\n").map((l) => l.trim()).filter(Boolean).map((l) => JSON.parse(l))
  : [];

const isKilled = (m) => m.status === "killed" || m.status === "timeout";
const isValid = (m) => m.status === "killed" || m.status === "timeout" || m.status === "survived";

function stats(list) {
  const valid = list.filter(isValid);
  const killed = valid.filter(isKilled).length;
  const survived = valid.length - killed;
  const mutations = valid.length;
  return {
    mutations,
    survived,
    killed,
    score: mutations ? Math.round((killed / mutations) * 1000) / 10 : null,
    rate: mutations ? Math.round((killed / mutations) * 1000) / 1000 : null,
  };
}

const total = stats(mutants);
const result = total.mutations === 0 || total.score >= threshold ? "pass" : "fail";

const scoped = (process.env.MUTATION_MODULES || "").split(",").filter(Boolean);
const modules = {};
for (const name of new Set([...scoped, ...mutants.map((m) => m.module)])) {
  const own = mutants.filter((m) => m.module === name);
  const s = stats(own);
  modules[name] = { ...s, result: s.mutations === 0 || s.score >= threshold ? "pass" : "fail", invalid: own.filter((m) => m.status === "invalid").length };
}

const report = {
  mutations: total.mutations,
  survived: total.survived,
  killed: total.killed,
  score: total.score,
  rate: total.rate,
  result,
  threshold,
  modules,
  mutants: mutants.map((m) => ({
    id: m.id,
    module: m.module,
    category: m.category,
    description: m.description,
    file: m.file,
    line: m.line,
    status: m.status,
    testsPassed: m.testsPassed,
    killedBy: m.killedBy ?? [],
    note: m.note || undefined,
    seconds: m.seconds,
    diff: m.diff,
  })),
};
fs.writeFileSync(path.join(dir, "report.json"), JSON.stringify(report, null, 2));

// ------------------------------------------------------------- markdown
const icon = { killed: "killed", timeout: "killed (timeout)", survived: "SURVIVED", invalid: "invalid (did not compile)" };
const esc = (s) => String(s ?? "").replace(/\|/g, "\\|").replace(/\n/g, " ");
const pct = (s) => (s === null ? "n/a" : `${s}%`);
let md = `## Mutation testing report\n\n`;
md += `**Result: ${result.toUpperCase()}** - score ${pct(total.score)} (threshold ${threshold}%)\n\n`;
md += `| mutations | killed | survived | score | result |\n|---|---|---|---|---|\n`;
md += `| ${total.mutations} | ${total.killed} | ${total.survived} | ${pct(total.score)} | ${result} |\n\n`;
if (Object.keys(modules).length) {
  md += `### By module\n\n| module | mutations | killed | survived | score | result | invalid |\n|---|---|---|---|---|---|---|\n`;
  for (const [n, s] of Object.entries(modules)) {
    md += `| ${n} | ${s.mutations} | ${s.killed} | ${s.survived} | ${pct(s.score)} | ${s.result} | ${s.invalid} |\n`;
  }
  md += `\n`;
}
md += `### All mutants\n\n`;
if (!mutants.length) {
  md += `_No mutants were generated (no mutable added code in scope)._\n`;
} else {
  md += `Tests result = whether the module's tests PASSED with the mutant applied (pass = the mutant was missed).\n\n`;
  md += `| # | module | type | location | mutation | tests result | status |\n|---|---|---|---|---|---|---|\n`;
  for (const m of report.mutants) {
    const tests = m.testsPassed === true ? "pass" : m.testsPassed === false ? "fail" : "n/a";
    md += `| ${m.id} | ${m.module} | ${m.category} | \`${esc(m.file)}:${m.line}\` | ${esc(m.description)} | ${tests} | ${icon[m.status] ?? m.status} |\n`;
  }
  const survivors = report.mutants.filter((m) => m.status === "survived");
  if (survivors.length) {
    md += `\n### Survived mutants (tests to add)\n\n`;
    for (const m of survivors) {
      md += `<details><summary>#${m.id} ${esc(m.module)} - ${esc(m.description)} (<code>${esc(m.file)}:${m.line}</code>)</summary>\n\n\`\`\`diff\n${m.diff}\n\`\`\`\n</details>\n\n`;
    }
  }
}
fs.writeFileSync(path.join(dir, "report.md"), md);
console.log(`mutations=${total.mutations} killed=${total.killed} survived=${total.survived} score=${pct(total.score)} result=${result}`);
