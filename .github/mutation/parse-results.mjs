// Normalises test results into {"ran": <number>, "failed": ["<id>", ...]}.
//   node parse-results.mjs junit <dir with TEST-*.xml>      (Gradle / JUnit)
//   node parse-results.mjs playwright <report.json>          (Playwright JSON reporter)
// A missing report (build/compile error, dev server crash) yields ran = 0.
import fs from "node:fs";
import path from "node:path";

const [kind, target] = process.argv.slice(2);
const out = { ran: 0, failed: [] };

if (kind === "junit") {
  const files = fs.existsSync(target) ? fs.readdirSync(target).filter((f) => f.endsWith(".xml")) : [];
  for (const f of files) {
    const xml = fs.readFileSync(path.join(target, f), "utf8");
    const re = /<testcase\b([^>]*?)(?:\/>|>([\s\S]*?)<\/testcase>)/g;
    let m;
    while ((m = re.exec(xml))) {
      const name = /\bname="([^"]*)"/.exec(m[1])?.[1] ?? "?";
      const cls = /\bclassname="([^"]*)"/.exec(m[1])?.[1] ?? "?";
      out.ran++;
      if (m[2] && /<(failure|error)\b/.test(m[2])) out.failed.push(`${cls}::${name}`);
    }
  }
} else if (kind === "playwright") {
  if (fs.existsSync(target)) {
    try {
      const report = JSON.parse(fs.readFileSync(target, "utf8").replace(/^﻿/, ""));
      const walk = (suite, titles) => {
        for (const spec of suite.specs ?? []) {
          out.ran++;
          if (!spec.ok) out.failed.push(`${spec.file}::${[...titles, spec.title].join(" > ")}`);
        }
        for (const child of suite.suites ?? []) {
          // a top-level suite is the file itself; only keep describe() titles
          const keep = child.title && child.title !== child.file ? [...titles, child.title] : titles;
          walk(child, keep);
        }
      };
      for (const s of report.suites ?? []) walk(s, []);
    } catch {
      /* unreadable report => ran stays 0 */
    }
  }
} else {
  console.error("usage: parse-results.mjs junit|playwright <path>");
  process.exit(2);
}

out.failed = [...new Set(out.failed)].sort();
process.stdout.write(JSON.stringify(out));
