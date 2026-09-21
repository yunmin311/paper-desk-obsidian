/**
 * paper-desk 纯逻辑单测
 *
 * 为什么这么写：判定类逻辑不接受「看起来对」。这里刻意不复制一份函数，
 * 而是**从真的 main.js 里把那段代码抠出来跑** —— 复制一份就会变成
 * 「测的是副本」，主文件改坏了测试照样绿（这个坑在 i18n 测试台上踩过）。
 *
 * 只有不碰 Obsidian API 的部分能这么测；视图、设置页只能靠实机验证，
 * 那部分见 README 末尾的自检清单。
 *
 * 跑法：node tests/logic.test.js
 */

const fs = require("fs");
const path = require("path");

const MAIN = path.join(__dirname, "..", "main.js");
const src = fs.readFileSync(MAIN, "utf8");

const START = "纯逻辑（可单测）";
const END = "const SVG_NS";
const from = src.indexOf(START);
const to = src.indexOf(END);
if (from < 0 || to < 0 || to <= from) {
  console.error("✗ 找不到纯逻辑段落 —— main.js 结构变了，先修这个测试");
  process.exit(1);
}

/* 起点要落在那段说明注释结束之后，否则会把注释正文当成代码。
   终点取「时钟」小节注释的起点。 */
const slice = src.slice(src.indexOf("*/", from) + 2, src.lastIndexOf("/*", to));

const factory = new Function(
  slice +
    "\nreturn { splitHM, formatDuration, durationFor, advancePhase, msToNextMinute, remainingOf, dayKey, needsDailyReset, nextAutoStart };"
);
const L = factory();

let pass = 0;
const fails = [];

function eq(label, got, want) {
  const g = JSON.stringify(got);
  const w = JSON.stringify(want);
  if (g === w) pass++;
  else fails.push(`${label}\n     得到 ${g}\n     期望 ${w}`);
}

/* ---------------- splitHM ---------------- */
eq("splitHM 补零", L.splitHM(new Date(2026, 8, 21, 9, 5, 0)), { hh: "09", mm: "05" });
eq("splitHM 午夜", L.splitHM(new Date(2026, 8, 21, 0, 0, 0)), { hh: "00", mm: "00" });
eq("splitHM 23:59", L.splitHM(new Date(2026, 8, 21, 23, 59, 59)), { hh: "23", mm: "59" });

/* ---------------- formatDuration ----------------
   这里用 ceil：起步就显示 25:00，走到 0 正好停在 00:00。
   用 floor 的话第一秒会显示 24:59，看着像已经过了一秒。 */
eq("formatDuration 满 25 分钟", L.formatDuration(25 * 60 * 1000), "25:00");
eq("formatDuration 归零", L.formatDuration(0), "00:00");
eq("formatDuration 1ms", L.formatDuration(1), "00:01");
eq("formatDuration 负值夹到 0", L.formatDuration(-5000), "00:00");
eq("formatDuration 1500ms", L.formatDuration(1500), "00:02");
eq("formatDuration 跨分钟", L.formatDuration(90 * 1000), "01:30");
eq("formatDuration 长休息", L.formatDuration(15 * 60 * 1000), "15:00");

/* ---------------- durationFor ---------------- */
const S = { workMinutes: 25, shortMinutes: 5, longMinutes: 15 };
eq("durationFor work", L.durationFor("work", S), 1500000);
eq("durationFor short", L.durationFor("short", S), 300000);
eq("durationFor long", L.durationFor("long", S), 900000);
eq("durationFor 非法值回落 25 分", L.durationFor("work", { workMinutes: 0 }), 1500000);
eq(
  "durationFor 非数字回落 25 分",
  L.durationFor("work", { workMinutes: "abc" }),
  1500000
);

/* ---------------- advancePhase ----------------
   只有 focus 记轮次；休息不记，否则长休息的节奏会漂。 */
eq("work 后进短休息", L.advancePhase("work", 0, 4), { phase: "short", completed: 1 });
eq("第 4 轮后进长休息", L.advancePhase("work", 3, 4), { phase: "long", completed: 4 });
eq("短休息后回 work", L.advancePhase("short", 1, 4), { phase: "work", completed: 1 });
eq("长休息后回 work", L.advancePhase("long", 4, 4), { phase: "work", completed: 4 });
eq("休息不增加轮次", L.advancePhase("short", 7, 4).completed, 7);
eq("longEvery 非法时按 4", L.advancePhase("work", 3, 0), { phase: "long", completed: 4 });
eq("第 8 轮再进长休息", L.advancePhase("work", 7, 4), { phase: "long", completed: 8 });

/* ---------------- msToNextMinute ----------------
   多出的 60ms 是刻意留的余量：不留的话定时器可能在临界点前几毫秒醒，
   醒了发现什么都没变，还要再等一整分钟。 */
eq("秒=30 → 30060", L.msToNextMinute(new Date(2026, 8, 21, 9, 5, 30, 0)), 30060);
eq("秒=0 微秒=0 → 60060", L.msToNextMinute(new Date(2026, 8, 21, 9, 5, 0, 0)), 60060);
eq("秒=59.5 → 560", L.msToNextMinute(new Date(2026, 8, 21, 9, 5, 59, 500)), 560);

/* ---------------- remainingOf ----------------
   存「开始时刻」而不是「剩余秒数」，是为了 Obsidian 重启后计时按真实时间接着走。 */
const NOW = 1_000_000_000_000;

eq(
  "未开始时用存下的剩余值",
  L.remainingOf({ running: false, startedAt: 0, remainingMs: 120000, phase: "work" }, S, NOW),
  120000
);
eq(
  "未开始且剩余为 0 时回落整段时长",
  L.remainingOf({ running: false, startedAt: 0, remainingMs: 0, phase: "short" }, S, NOW),
  300000
);
eq(
  "运行中按真实时间扣减",
  L.remainingOf(
    { running: true, startedAt: NOW - 60000, remainingMs: 1500000, phase: "work" },
    S,
    NOW
  ),
  1440000
);
eq(
  "运行中扣到 0 就夹住（不给负数）",
  L.remainingOf(
    { running: true, startedAt: NOW - 9999999, remainingMs: 1000, phase: "work" },
    S,
    NOW
  ),
  0
);
eq(
  "running 但缺 startedAt（数据残缺）时不乱扣",
  L.remainingOf({ running: true, startedAt: 0, remainingMs: 60000, phase: "work" }, S, NOW),
  60000
);

/* ---------------- dayKey ----------------
   跨天判断用日期键，而不是「距上次打开过了几小时」——
   后者在跨时区、改系统时间、以及「晚上 11:59 打开、第二天 0:01 又打开」时都会错。 */
eq("dayKey 补零", L.dayKey(new Date(2026, 8, 21, 9, 5, 0)), "2026-09-21");
eq("dayKey 个位月日", L.dayKey(new Date(2026, 0, 3, 23, 59, 0)), "2026-01-03");
eq("dayKey 跨年夜", L.dayKey(new Date(2026, 11, 31, 23, 59, 59)), "2026-12-31");

/* ---------------- needsDailyReset ---------------- */
const DR = { dailyReset: true };
eq(
  "同一天不清零",
  L.needsDailyReset({ completed: 3, day: "2026-09-21" }, DR, new Date(2026, 8, 21, 10, 0)),
  false
);
eq(
  "跨天要清零",
  L.needsDailyReset({ completed: 3, day: "2026-09-20" }, DR, new Date(2026, 8, 21, 10, 0)),
  true
);
eq(
  "轮次本来就是 0 时不必清零",
  L.needsDailyReset({ completed: 0, day: "2026-01-01" }, DR, new Date(2026, 8, 21, 10, 0)),
  false
);
eq(
  "关掉开关就永不清零",
  L.needsDailyReset(
    { completed: 9, day: "2020-01-01" },
    { dailyReset: false },
    new Date(2026, 8, 21)
  ),
  false
);
eq(
  "首次使用（day 为空）且已有轮次 → 清",
  L.needsDailyReset({ completed: 2, day: "" }, DR, new Date(2026, 8, 21)),
  true
);

/* ---------------- nextAutoStart ----------------
   两个开关分开判断：只想要「专注完自动休息」是很常见的用法。 */
const DEFAULTS_S = { autoStartBreak: true, autoStartWork: true };
eq(
  "默认（两个都开）",
  [L.nextAutoStart("short", DEFAULTS_S), L.nextAutoStart("long", DEFAULTS_S), L.nextAutoStart("work", DEFAULTS_S)],
  [true, true, true]
);
eq(
  "只开「专注完自动休息」→ 休息结束不自动开始",
  L.nextAutoStart("work", { autoStartBreak: true, autoStartWork: false }),
  false
);
eq(
  "两个都关 → 一律不自动",
  [L.nextAutoStart("short", { autoStartBreak: false, autoStartWork: false }),
   L.nextAutoStart("work", { autoStartBreak: false, autoStartWork: false })],
  [false, false]
);

/* ---------------- 结果 ---------------- */
if (fails.length) {
  console.error(`\n✗ ${pass} 通过 / ${fails.length} 失败\n`);
  for (const f of fails) console.error("  ✗ " + f);
  process.exit(1);
}
console.log(`\n✓ ${pass} 通过 / 0 失败`);
