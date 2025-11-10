const fs = require("fs");

// prefer global fetch (Node 18+). If not present, fail with a clear error so you can install node-fetch.
const fetchFn = globalThis.fetch;
if (!fetchFn) {
  console.error(
    "No global fetch available. Run this with Node 18+ or install and import node-fetch."
  );
  process.exit(1);
}

const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
if (!webhookUrl) {
  console.error("DISCORD_WEBHOOK_URL not set");
  process.exit(1);
}

let summary;
try {
  summary = JSON.parse(
    fs.readFileSync("./coverage/coverage-summary.json", "utf8")
  );
} catch (err) {
  console.error("Could not read coverage/coverage-summary.json:", err.message);
  process.exit(1);
}

function pad(text, length) {
  return String(text).padEnd(length, " ");
}

const headers = [
  ["File", 30],
  ["% Stmts", 8],
  ["% Branch", 8],
  ["% Funcs", 8],
  ["% Lines", 8],
  ["Uncovered", 20],
];

function row(cols) {
  return cols.map((c, i) => pad(c, headers[i][1])).join(" | ") + "\n";
}

let table = "";
table += row(headers.map((h) => h[0]));
table += headers.map((h) => "-".repeat(h[1])).join("-|-") + "\n";

for (const file of Object.keys(summary)) {
  if (file === "total") continue;
  const s = summary[file];
  table += row([
    file,
    s.statements.pct + "%",
    s.branches.pct + "%",
    s.functions.pct + "%",
    s.lines.pct + "%",
    (s.statements.uncoveredLines || []).slice(0, 5).join(", "),
  ]);
}

// include overall totals at top
const total = summary.total || {};
const totalLine = `All files | Stmts ${
  total.statements?.pct ?? "N/A"
}% | Branches ${total.branches?.pct ?? "N/A"}% | Funcs ${
  total.functions?.pct ?? "N/A"
}% | Lines ${total.lines?.pct ?? "N/A"}%`;

// build message payload as plain content with a code block (Discord will preserve formatting)
let content = `✅ Jest Coverage Report\nBranch: main\n\n${totalLine}\n\n\`\`\`text\n${table}\`\`\``;

// Discord message limit ~2000 chars — truncate if needed
const MAX = 1900;
if (content.length > MAX) {
  // keep header + truncated table
  const header = `✅ Jest Coverage Report\nBranch: main\n\n${totalLine}\n\n\`\`\`text\n`;
  const available = MAX - header.length - 6; // leave room for closing/backticks/ellipsis
  const truncatedTable =
    table.slice(0, Math.max(0, available)) + "\n... (truncated)";
  content = header + truncatedTable + "\n```";
}

const payload = { content };

fetchFn(webhookUrl, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(payload),
})
  .then((res) => {
    if (!res.ok) {
      return res.text().then((t) => {
        throw new Error(`Discord returned ${res.status}: ${t}`);
      });
    }
    console.log("Discord message sent ✅");
  })
  .catch((err) => console.error("Discord error ❌:", err.message));
