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
    "\nreturn { splitHM, formatDuration, durationFor, advancePhase, msToNextMinute, remainingOf, dayKey, needsDailyReset, nextAutoStart, matchesRule, matchesAny, aliasOf, displayNameFor, parseNoteLines, dayOfYear, pickNoteFor, isHomePath, shouldForcePreview };"
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

/* ---------------- matchesRule / matchesAny（首页链接）---------------- */
eq("精确匹配", L.matchesRule("index", "index"), true);
eq("精确匹配不收多字符", L.matchesRule("project index", "index"), false);
eq("前缀", [L.matchesRule("index-a", "index*"), L.matchesRule("a-index", "index*")], [true, false]);
eq("后缀", [L.matchesRule("a-index", "*index"), L.matchesRule("index-a", "*index")], [true, false]);
eq("包含", L.matchesRule("my-index-page", "*index*"), true);
/* 这条最反直觉，值得专门钉住：github 是「以 hub 结尾」的（g-i-t-h-u-b），
   所以任何锚在结尾的写法都会把它收进来，不只是「包含」那一种。 */
eq("★ 后缀规则会收掉 github", L.matchesRule("github", "*hub"), true);
eq("★ 包含规则也会收掉 github", L.matchesRule("github", "*hub*"), true);
/* github 既不是以 hub 开头，也不等于 hub —— 所以想收 hub 又想避开 github，
   唯一干净的写法是前缀 hub*。这两条一起钉住才说明白。 */
eq("前缀规则不会收掉 github", L.matchesRule("github", "hub*"), false);
eq("前缀规则确实能收以 hub 开头的", L.matchesRule("hub-page", "hub*"), true);
eq("裸 hub 精确匹配不吃 github", L.matchesRule("github", "hub"), false);
eq("大小写不敏感", L.matchesRule("MyHub", "*hub*"), true);
eq("自动去掉 .md 后缀", L.matchesRule("index.md", "index"), true);
/* 裸 * 若当成「包含空串」就会匹配一切 ——
   一条手滑的空通配符会把整个库铺到首页上。 */
eq("裸 * 视为无效", [L.matchesRule("任意", "*"), L.matchesRule("任意", "**")], [false, false]);
eq("空规则不匹配", L.matchesRule("index", ""), false);
eq("matchesAny 命中任一条", L.matchesAny("_Project Index", ["*Index*", "*Hub*"]), true);
eq("matchesAny 全不命中", L.matchesAny("随便", ["*Index*", "*Hub*"]), false);
eq("matchesAny 空规则表", L.matchesAny("_Project Index", []), false);

/* ---------------- aliasOf / displayNameFor ---------------- */
eq("YAML 列表取第一个", L.aliasOf({ aliases: ["英语学习", "备用"] }), "英语学习");
eq("单条字符串", L.aliasOf({ aliases: "英语学习" }), "英语学习");
eq("逗号分隔", L.aliasOf({ aliases: "英语学习, 备用" }), "英语学习");
eq("alias 单数键也认", L.aliasOf({ alias: "英语学习" }), "英语学习");
eq("没有别名返回空", L.aliasOf({}), "");
eq("null 不出错", L.aliasOf(null), "");
eq("数字等非字符串也能转", L.aliasOf({ aliases: [2026] }), "2026");
eq("有别名就用别名", L.displayNameFor("_English Learning Hub", { aliases: ["英语学习"] }), "英语学习");
eq("没有别名就用文件名", L.displayNameFor("_English Learning Hub", null), "_English Learning Hub");
eq("文件名为空时退化成空串", L.displayNameFor(null, null), "");

/* ---------------- parseNoteLines（首页手写句）---------------- */
eq("空块读出空列表", L.parseNoteLines(""), []);
eq("只有空行也读出空列表", L.parseNoteLines("\n\n   \n"), []);
eq("一行就是一句", L.parseNoteLines("今天先把一件事做完"), ["今天先把一件事做完"]);
eq("两端空白会被去掉", L.parseNoteLines("  慢慢来  "), ["慢慢来"]);
eq("空行不进列表", L.parseNoteLines("甲\n\n乙"), ["甲", "乙"]);
/* 手写句这种东西，人一定会在上面写「夏天用」「别太长」之类的备注，
   不撑住就会被当成句子显示出来。 */
eq("# 开头的是注释", L.parseNoteLines("# 夏天用\n甲\n# 别太长\n乙"), ["甲", "乙"]);
eq("null 不出错", L.parseNoteLines(null), []);

/* ---------------- dayOfYear / pickNoteFor ---------------- */
eq("1 月 1 日是第 1 天", L.dayOfYear(new Date(2026, 0, 1)), 1);
eq("平年最后一天是 365", L.dayOfYear(new Date(2026, 11, 31)), 365);
/* 闰年这条最值得钉住：手搓月份天数表每隔四年会错一天，而且错得很安静。 */
eq("闰年最后一天是 366", L.dayOfYear(new Date(2024, 11, 31)), 366);
eq("闰年 2 月 29 日是第 60 天", L.dayOfYear(new Date(2024, 1, 29)), 60);
eq("平年 3 月 1 日是第 60 天", L.dayOfYear(new Date(2026, 2, 1)), 60);

eq("没有句子就返回空", L.pickNoteFor([], new Date(2026, 0, 1)), "");
eq("null 列表不出错", L.pickNoteFor(null, new Date(2026, 0, 1)), "");
eq("只有一句时固定不变", L.pickNoteFor(["唯一"], new Date(2026, 5, 20)), "唯一");

/* 多句时相邻两天必须不同。取模而不是随机，就是为了这条 ——
   随机在句数少的时候连续撞同一句的概率不低，看着像坏了。 */
{
  const lines = ["甲", "乙", "丙"];
  let ok = true;
  let prev = null;
  for (let d = 1; d <= 90; d++) {
    const got = L.pickNoteFor(lines, new Date(2026, 0, d));
    if (got === prev) ok = false;
    prev = got;
  }
  eq("连续 90 天里相邻两天不重复", ok, true);
}
/* 走完一圈要覆盖每一句 —— 否则等于有几句永远看不到。 */
{
  const lines = ["甲", "乙", "丙", "丁", "戊"];
  const seen = new Set();
  for (let d = 1; d <= 5; d++) seen.add(L.pickNoteFor(lines, new Date(2026, 0, d)));
  eq("五天走完五句", seen.size, 5);
}

/* ---------------- isHomePath / shouldForcePreview ---------------- */
eq("isHomePath 认得首页", L.isHomePath("homepage.md", "homepage.md"), true);
eq("isHomePath 不认别的笔记", L.isHomePath("homepage.md", "a.md"), false);
eq("isHomePath 路径为空时一律不是", L.isHomePath("", "homepage.md"), false);
eq("开关关掉就一律不干预", L.shouldForcePreview(false, "homepage.md", "homepage.md"), false);
eq("在首页上要干预", L.shouldForcePreview(true, "homepage.md", "homepage.md"), true);
/* 这条最要紧：需求原话是「只有 homepage 是默认阅读模式，其他笔记正常」。
   写错成「对所有笔记都强制阅读」会毁掉整个库的编辑体验。 */
eq("★ 别的笔记不受影响", L.shouldForcePreview(true, "homepage.md", "其他笔记.md"), false);
eq("首页路径带空格也能认", L.shouldForcePreview(true, "  homepage.md  ", "homepage.md"), true);
eq("子目录下的同名文件不算首页", L.shouldForcePreview(true, "homepage.md", "子目录/homepage.md"), false);

/* ---------------- 结果 ---------------- */
if (fails.length) {
  console.error(`\n✗ ${pass} 通过 / ${fails.length} 失败\n`);
  for (const f of fails) console.error("  ✗ " + f);
  process.exit(1);
}
console.log(`\n✓ ${pass} 通过 / 0 失败`);
