/**
 * paper-desk 字符串表完整性检查
 *
 * 为什么需要它：i18n 的 t() 缺键时**不报错**，而是回落英语、再回落成键名本身。
 * 也就是说拼错一个键，界面上就会直接显示 "settings.work.name" 这种字样 ——
 * 而那正好是最容易漏测的地方（设置页只要不抛异常就算「渲染成功」）。
 * 所以这里做两件事：把用到的键全扫出来，逐个确认中英**都有真实译文**。
 *
 * 跑法：node tests/i18n.test.js
 */

const fs = require("fs");
const path = require("path");

const MAIN = path.join(__dirname, "..", "main.js");
const src = fs.readFileSync(MAIN, "utf8");

/* ---- 抠出内联的 locales 段并求值 ---- */
const from = src.indexOf("来自 locales.js");
const to = src.indexOf("来自 i18n.js");
if (from < 0 || to < 0) {
  console.error("✗ 找不到内联的 locales 段 —— main.js 结构变了，先修这个测试");
  process.exit(1);
}
const seg = src.slice(src.indexOf("\n", from), src.lastIndexOf("/*", to));
const LOCALES = new Function(seg + "\nreturn buildLocales();")();

/* ---- 只扫插件主体，不扫内联模块本身 ---- */
const bodyAt = src.indexOf("内联模块结束");
const body = src.slice(bodyAt);

/* 取所有形如 xxx.yyy 的字符串字面量。
   不区分它出现在 t("...") 里还是当作参数传给辅助函数 ——
   numberSetting("workMinutes", "settings.work.name", ...) 这种写法
   键名并不直接包在 t() 里，只扫 t() 会漏掉一大半。 */
const literalRe = /"([a-z][a-zA-Z]*(?:\.[a-zA-Z][a-zA-Z0-9]*)+)"/g;
const keys = new Set();
for (const m of body.matchAll(literalRe)) keys.add(m[1]);

/* 动态拼的键：t("phase." + phase)，取值只有这三种。 */
for (const p of ["work", "short", "long"]) keys.add("phase." + p);

/* i18n.js 运行时自己会用的公共键（不出现插件主体里） */
for (const k of ["settings.language.name", "settings.language.desc",
                 "sponsor.title", "sponsor.body",
                 "meta.version", "meta.repository",
                 "common.reset", "common.reset.done", "common.clear", "common.open"]) {
  keys.add(k);
}

/* ---- 断言 ---- */
const missingZh = [];
const missingEn = [];
const sameAsEn = [];   // 中文表里落着英文原文 = 多半是忘了翻译
const sorted = [...keys].sort();

for (const k of sorted) {
  if (LOCALES.zh === undefined || LOCALES.zh[k] === undefined) missingZh.push(k);
  if (LOCALES.en === undefined || LOCALES.en[k] === undefined) missingEn.push(k);
  const zh = LOCALES.zh && LOCALES.zh[k];
  const en = LOCALES.en && LOCALES.en[k];
  /* 允许中英相同的情况：有些词本来就不翻（版本号、仓库名之类） */
  const allowSame = /^(meta\.(version|repository))$/.test(k);
  if (!allowSame && zh !== undefined && en !== undefined && zh === en) sameAsEn.push(k);
}

let pass = 0;
const fails = [];
if (missingZh.length) fails.push(`zh 缺 ${missingZh.length} 个键：${missingZh.join(", ")}`);
if (missingEn.length) fails.push(`en 缺 ${missingEn.length} 个键：${missingEn.join(", ")}`);
if (sameAsEn.length) fails.push(`中英相同（疑似漏翻）：${sameAsEn.join(", ")}`);
if (!fails.length) pass = sorted.length;

console.log(`\n扫描到键 ${sorted.length} 个`);
console.log(`  语言表：${Object.keys(LOCALES).join(" / ")}`);
if (fails.length) {
  console.error("\n✗ 检查未通过");
  for (const f of fails) console.error("  " + f);
  process.exit(1);
}
console.log(`\n✓ ${pass} 个键在中英两表都有独立译文`);
