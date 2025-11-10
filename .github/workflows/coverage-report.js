// coverage-report.js
const fs = require("fs");
const fetch = require("node-fetch");

const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

const summary = JSON.parse(
  fs.readFileSync("./coverage/coverage-summary.json", "utf8")
);

function pad(text, length) {
  return text.toString().padEnd(length, " ");
}

const headers = [
  ["File", 26],
  ["% Stmts", 8],
  ["% Branch", 8],
  ["% Funcs", 8],
  ["% Lines", 8],
  ["Uncovered Line #s", 30],
];

function row(cols) {
  return cols.map((c, i) => pad(c, headers[i][1])).join(" | ") + "\n";
}

let table = "";
table += row(headers.map((h) => h[0]));
table += headers.map((h) => "-".repeat(h[1])).join("-|-") + "\n";

for (const file in summary) {
  const s = summary[file];
  if (file === "total") continue;
  table += row([
    file,
    s.statements.pct,
    s.branches.pct,
    s.functions.pct,
    s.lines.pct,
    (s.statements.uncoveredLines || []).join(", "),
  ]);
}

const embed = {
  username: "Jest Bot",
  embeds: [
    {
      title: "✅ Jest Coverage Report",
      description: "Branch: main",
      color: 0x00ff9d,
      fields: [
        {
          name: "Coverage Summary",
          value: "```text\n" + table + "```",
        },
      ],
    },
  ],
};

fetch(webhookUrl, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(embed),
})
  .then(() => console.log("Discord message sent ✅"))
  .catch((err) => console.error("Discord error ❌:", err));
