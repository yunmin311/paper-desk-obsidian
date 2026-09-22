/* Paper Desk（案头）
   两个东西，都刻意做得不占地方：

   1. 时钟 —— 一个 ```clock 代码块，在笔记顶部渲染一枚居中的时钟。
      数字用等宽体，冒号是【两个像素方块】并按秒亮灭。
      为什么冒号用方块：这样「像素元素」和「每秒轻闪」是同一件事，
      而不是在时钟上另贴一个像素装饰。方块占的宽度 = 一个等宽字符宽
      （用一个 visibility:hidden 的真冒号撑开），所以数字永远不跳。

   2. 专注计时器 —— 侧栏 InspectView 型面板（和日历插件同一个位置）。
      完整番茄循环：专注 → 短休息 → …… → 长休息，自动接续。

   颜色一律取主题变量；只有几何（方块大小、线宽、字号）是硬编码的。
   理由：几何跟主题无关，硬编码才对；颜色若硬编码，别人换个深色主题就看不见。
   唯一的例外是手写字体 —— Obsidian 没有「手写体」这个变量（已查过 asar，
   对任何中文字体名都是零引用），只能自己给个设置项。

   实现路线见 bundle-inline 的说明：i18n / locales / sponsor 三段被内联进本文件，
   因为 Obsidian 注入的 require 是白名单函数，require("./x") 会返回 undefined。
*/

"use strict";

const { Plugin, PluginSettingTab, Setting, ItemView, Notice, MarkdownRenderChild } = require("obsidian");


/* ============================================================
   【内联模块 · 自动生成，请勿手改这一段】
   ------------------------------------------------------------
   以下三段来自仓库里的 locales.js / i18n.js / sponsor.js，
   由打包脚本 bundle-inline.js 拼接到此（脚本在 _scratch/_i18n/）。

   为什么不写 require("./locales")：
   Obsidian 注入的 require 是白名单函数，只认 obsidian / @codemirror /
   @lezer 与 Electron 的 window.require，**不解析插件的相对路径** ——
   require("./x") 会返回 undefined，插件直接加载失败。

   改动流程：改源文件 → node bundle-inline.js <插件目录> → 跑 sync-plugins.ps1
   ============================================================ */

/* ---------- 来自 locales.js ---------- */
/* Paper Desk（案头）—— 界面字符串表。
   含命令、Notice、侧栏计时器面板与设置页的全部界面文字。 */

const COMMON = {
  zh: {
    "settings.language.name": "界面语言",
    "settings.language.desc":
      "设置页、命令与提示的显示语言。「跟随 Obsidian」会随界面语言自动切换。",
    "sponsor.title": "赞助支持",
    "sponsor.body":
      "这些插件都是独立开发并免费开源的，没有任何商业绑定。如果它确实省下了时间，可以通过 GitHub Sponsors 支持后续维护。",
    "meta.version": "版本",
    "meta.repository": "仓库",
    "common.reset": "恢复默认",
    "common.reset.done": "已恢复默认设置",
    "common.clear": "清除",
    "common.open": "打开",
  },
  en: {
    "settings.language.name": "Interface language",
    "settings.language.desc":
      'Language for this settings page, commands and notices. "Follow Obsidian" tracks the app language.',
    "sponsor.title": "Sponsorship",
    "sponsor.body":
      "These plugins are built independently and released free and open-source, with no commercial tie-in. If one of them saves you time, you can support ongoing maintenance via GitHub Sponsors.",
    "meta.version": "Version",
    "meta.repository": "Repository",
    "common.reset": "Restore defaults",
    "common.reset.done": "Settings restored to defaults",
    "common.clear": "Clear",
    "common.open": "Open",
  },
};

const OWN = {
  zh: {
    "meta.desc":
      "案头上的三样东西：笔记顶部一枚安静的时钟、侧栏一个专注计时器，以及把它们串起来的那个首页。三者都刻意做得不占地方。",

    "command.openTimer": "打开专注计时器",
    "command.toggleTimer": "开始 / 暂停计时",
    "command.resetTimer": "重置计时",
    "command.skipPhase": "跳到下一段",
    "command.insertClock": "插入时钟代码块",
    "command.openHome": "打开首页",
    "command.insertLinks": "插入首页链接区块",
    "command.insertNote": "插入首页手写句区块",

    /* 阶段名。这三个词会用手写字体渲染 —— 它们是全插件唯一用手写体的地方，
       刻意选短词：手写体在长句上可读性会塌。 */
    "phase.work": "专注",
    "phase.short": "短休息",
    "phase.long": "长休息",

    "view.title": "专注",

    "timer.start": "开始",
    "timer.pause": "暂停",
    "timer.reset": "重置",
    "timer.skip": "跳过",
    "timer.idle": "未开始",
    "timer.rounds": "已完成 {n}",

    "notice.workDone": "专注结束 —— 该休息了",
    "notice.breakDone": "休息结束 —— 回到专注",
    "notice.alreadyRunning": "计时器已经在跑了",
    "notice.started": "开始专注",
    "notice.paused": "已暂停",
    "notice.reset": "计时已重置",
    "notice.staleTimer":
      "上次的计时在 Obsidian 关闭期间已经走完，已停在下一段的开头（不会替你补记）",
    "notice.notFound": "找不到这篇笔记：{path}",

    "settings.home.heading": "首页",
    "settings.homePath.name": "首页笔记的路径",
    "settings.homePath.desc":
      "从库根目录算起的完整路径，要带 .md。留空会彻底关掉「打开、藏标题、强制阅读」这一整组行为 —— 那时它就只是一枚时钟加一个计时器，不碰你的任何一篇笔记。",
    "settings.openOnStartup.name": "启动时打开",
    "settings.openOnStartup.desc": "Obsidian 启动后自动打开上面那篇笔记。",
    "settings.openMode.name": "打开方式",
    "settings.openMode.desc":
      "「替换当前标签」会把恢复出来的那篇笔记挤掉 —— 这通常正是首页想要的。",
    "settings.openMode.replace": "替换当前标签",
    "settings.openMode.newTab": "在新标签页打开",
    "settings.forcePreview.name": "首页始终用阅读模式打开",
    "settings.forcePreview.desc":
      "每次打开首页、或者从别的笔记切回来，都落在阅读模式。不这样做的话，光标会掉进 clock 这类代码块里，随手打一个字就把代码块改坏了。想改首页内容时自己切进编辑模式即可，插件不拦 —— 只是下次再打开时又回到阅读。只作用于首页，其他笔记不受影响。",
    "settings.hideTitle.name": "藏起首页的笔记标题",
    "settings.hideTitle.desc":
      "Obsidian 只给了一个「显示文件名标题」的全局开关，改了会影响库里每一篇笔记 —— 所以「只在这一篇上不显示」在原生设置里做不到。这个开关只作用于首页那篇。标签页上的标题会保留，藏掉的只是正文顶部那一行的文件名。",

    "settings.note.heading": "首页手写句",
    "settings.note.desc":
      "代码块里写什么就显示什么：只写一行就是固定那一句；写多行就会每天换一句。它不计数、不累积 —— 只是一句人话。",
    "settings.noteStyle.name": "样式",
    "settings.noteStyle.desc":
      "「素句」只有字。另外两个各多一样装饰：手绘引号，或者整句轻微倾斜。时钟下面已经有一条手绘线了，所以这里不再给下划线 —— 同一种装饰出现两次，页面就从一枚印章变成一本贴纸册。",
    "settings.noteStyle.plain": "素句",
    "settings.noteStyle.quotes": "手绘引号",
    "settings.noteStyle.tilt": "轻微倾斜",
    "settings.noteSize.name": "字号",
    "settings.noteSize.desc":
      "单位是 px。手写体比正文字体显小，所以默认值比正文大不少。",

    "settings.links.heading": "首页链接",
    "settings.links.desc":
      "下面这个代码块会按规则自动生成链接列表 —— 库里的笔记改了名、新增了，列表跟着变，不需要手工维护。",
    "settings.rules.name": "要收进来的文件名",
    "settings.rules.desc":
      "每行一条关键词（不含 .md 后缀，不区分大小写）。用 * 作通配符：index 精确匹配；index* 以 index 开头；*index 以 index 结尾；*index* 含 index 即收录。注意一个反直觉的地方：github 是以 hub 结尾的，所以 *hub 和 *hub* 都会把 github 相关的笔记收进来；想避开就用 hub* 或精确写 hub。",
    "settings.linksGap.name": "链接上方留多少空",
    "settings.linksGap.desc":
      "用视口高度的百分比表示（0–150）。默认 55，意思是「要往下滚才看得到」。调小它就往上浮。",

    "settings.timer.heading": "专注计时器",
    "settings.work.name": "专注时长（分钟）",
    "settings.work.desc": "一轮专注的长度。",
    "settings.short.name": "短休息（分钟）",
    "settings.short.desc": "每轮专注之后的休息长度。",
    "settings.long.name": "长休息（分钟）",
    "settings.long.desc": "若干个短休息之后的那一次长休息。",
    "settings.longEvery.name": "几轮后进长休息",
    "settings.longEvery.desc": "每完成这么多轮专注，下一次休息换成长休息。",

    "settings.autoStart.heading": "自动接续",
    "settings.autoStartBreak.name": "专注结束后自动开始休息",
    "settings.autoStartBreak.desc": "关掉的话，每段结束都要你自己点开始。",
    "settings.autoStartWork.name": "休息结束后自动开始专注",
    "settings.autoStartWork.desc": "同上，只是作用在休息结束之后。",

    "settings.alerts.heading": "提醒与显示",
    "settings.notify.name": "阶段结束时的提示",
    "settings.notify.desc": "选「不提示」就完全安静，只靠你自己看面板。",
    "settings.notify.off": "不提示",
    "settings.notify.notice": "Obsidian 提示条",
    "settings.sound.name": "阶段结束时响一声",
    "settings.sound.desc": "用浏览器内置的音频合成，不加载任何音频文件。",
    "settings.sound.test": "试听",
    "settings.statusBar.name": "在状态栏显示剩余时间",
    "settings.statusBar.desc": "不用一直开着侧栏也能看到还剩多久。",
    "settings.dailyReset.name": "跨天自动清零轮次",
    "settings.dailyReset.desc": "新的一天第一次打开时，把已完成轮次归零。",
    "settings.showRounds.name": "显示已完成轮次",
    "settings.showRounds.desc":
      "默认关闭。这是一个累计数字 —— 如果你不希望这一页上出现任何「做了多少」的计数，就保持关闭。",
    "settings.font.heading": "外观",
    "settings.font.name": "手写字体",
    "settings.font.desc":
      "同一个手写体用在两处：计时器里的阶段名（专注 / 短休息 / 长休息），和首页手写句。填一个 CSS font-family，多个用逗号分隔、按顺序回落；留空表示跟随正文。时钟下方那条笔迹是画出来的线，不依赖字体。",
    "settings.reset.name": "恢复默认设置",
    "settings.reset.desc":
      "把时长、手写字体与轮次显示都恢复初值（界面语言会保留 —— 那是设置页自身的属性，不属于插件配置）。",
  },

  en: {
    "meta.desc":
      "Three things on the desk: a quiet clock for the top of a note, a pomodoro timer for the sidebar, and the homepage that ties them together. All three stay out of the way.",

    "command.openTimer": "Open the focus timer",
    "command.toggleTimer": "Start or pause the timer",
    "command.resetTimer": "Reset the timer",
    "command.skipPhase": "Skip to the next phase",
    "command.insertClock": "Insert a clock block",
    "command.openHome": "Open the homepage",
    "command.insertLinks": "Insert a homepage link block",
    "command.insertNote": "Insert a homepage line block",

    "phase.work": "Focus",
    "phase.short": "Short break",
    "phase.long": "Long break",

    "view.title": "Focus",

    "timer.start": "Start",
    "timer.pause": "Pause",
    "timer.reset": "Reset",
    "timer.skip": "Skip",
    "timer.idle": "Not started",
    "timer.rounds": "{n} done",

    "notice.workDone": "Focus finished — time for a break",
    "notice.breakDone": "Break over — back to focus",
    "notice.alreadyRunning": "The timer is already running",
    "notice.started": "Focus started",
    "notice.paused": "Paused",
    "notice.reset": "Timer reset",
    "notice.staleTimer":
      "The last timer ran out while Obsidian was closed. It is parked at the start of the next phase rather than back-filled.",
    "notice.notFound": "No note at that path: {path}",

    "settings.home.heading": "Homepage",
    "settings.homePath.name": "Path of the homepage note",
    "settings.homePath.desc":
      "Full path from the vault root, including .md. Leave it empty and the whole group below — opening it, hiding its title, forcing reading mode — switches off entirely, leaving a clock and a timer that touch no note of yours at all.",
    "settings.openOnStartup.name": "Open on startup",
    "settings.openOnStartup.desc": "Open that note once Obsidian has started.",
    "settings.openMode.name": "How to open it",
    "settings.openMode.desc":
      '"Replace the current tab" pushes aside whatever the session restored — which is usually what a homepage is for.',
    "settings.openMode.replace": "Replace the current tab",
    "settings.openMode.newTab": "Open in a new tab",
    "settings.forcePreview.name": "Always open the homepage in reading mode",
    "settings.forcePreview.desc":
      "Land in reading mode every time the homepage opens, or every time you switch back to it from another note. Without this the caret lands inside a code block such as clock, and one stray keystroke breaks the block. Switch into editing yourself when you want to change something — the plugin does not fight you, it just returns to reading mode the next time you arrive. The homepage only; other notes are untouched.",
    "settings.hideTitle.name": "Hide the note title on the homepage",
    "settings.hideTitle.desc":
      "Obsidian only offers a global switch for the inline filename title, and changing it affects every note in the vault — so \"no title on this one note\" is not something the native settings can do. This applies to the homepage alone. The tab title stays; only the filename line at the top of the page is hidden.",

    "settings.note.heading": "Homepage line",
    "settings.note.desc":
      "The block shows exactly what you write in it: one line means a fixed line, several means it changes once a day. It counts nothing and accumulates nothing — it is just a sentence.",
    "settings.noteStyle.name": "Style",
    "settings.noteStyle.desc":
      '"Plain" is the words alone. The other two each add one decoration: drawn quotation marks, or a slight tilt. The clock already has a drawn rule under it, so there is no underline here — let one decoration appear twice and the page stops being a seal and becomes a sticker album.',
    "settings.noteStyle.plain": "Plain",
    "settings.noteStyle.quotes": "Drawn quotes",
    "settings.noteStyle.tilt": "Slight tilt",
    "settings.noteSize.name": "Size",
    "settings.noteSize.desc":
      "In px. Handwriting fonts read smaller than body fonts, so the default sits well above body size.",

    "settings.links.heading": "Homepage links",
    "settings.links.desc":
      "The block below builds its link list from rules, so renaming a note or adding a new one updates the list for you — nothing to maintain by hand.",
    "settings.rules.name": "File names to collect",
    "settings.rules.desc":
      "One keyword per line (without the .md extension, case-insensitive). Use * as a wildcard: index matches exactly; index* starts with index; *index ends with index; *index* contains index. One counter-intuitive trap: github ends with hub, so both *hub and *hub* will pull in github-flavoured notes — use hub* or a bare hub to avoid that.",
    "settings.linksGap.name": "Blank space above the links",
    "settings.linksGap.desc":
      "As a percentage of the viewport height (0-150). The default, 55, means you have to scroll down to reach them. Lower it to bring them up.",

    "settings.timer.heading": "Focus timer",
    "settings.work.name": "Focus length (minutes)",
    "settings.work.desc": "How long one focus round lasts.",
    "settings.short.name": "Short break (minutes)",
    "settings.short.desc": "The break after each focus round.",
    "settings.long.name": "Long break (minutes)",
    "settings.long.desc": "The longer break that comes up after several rounds.",
    "settings.longEvery.name": "Rounds before a long break",
    "settings.longEvery.desc":
      "After this many focus rounds, the next break becomes a long one.",

    "settings.autoStart.heading": "Chaining",
    "settings.autoStartBreak.name": "Start the break automatically",
    "settings.autoStartBreak.desc":
      "With this off, every phase waits for you to press start.",
    "settings.autoStartWork.name": "Start focusing automatically",
    "settings.autoStartWork.desc": "The same, for when a break ends.",

    "settings.alerts.heading": "Alerts and display",
    "settings.notify.name": "Tell me when a phase ends",
    "settings.notify.desc":
      'Choose "Nothing" to stay completely quiet and rely on the panel alone.',
    "settings.notify.off": "Nothing",
    "settings.notify.notice": "Obsidian notice",
    "settings.sound.name": "Play a tone when a phase ends",
    "settings.sound.desc":
      "Synthesised in the browser. No audio file is loaded or bundled.",
    "settings.sound.test": "Preview",
    "settings.statusBar.name": "Show the remaining time in the status bar",
    "settings.statusBar.desc":
      "See how long is left without keeping the sidebar open.",
    "settings.dailyReset.name": "Reset the round count each day",
    "settings.dailyReset.desc":
      "On the first launch of a new day, the completed-round count goes back to zero.",
    "settings.showRounds.name": "Show completed rounds",
    "settings.showRounds.desc":
      'Off by default. It is a running total — if you would rather not see a "how much have I done" number, leave it off.',
    "settings.font.heading": "Appearance",
    "settings.font.name": "Handwriting font",
    "settings.font.desc":
      'One handwriting font for two things: the phase name (Focus / Short break / Long break) and the homepage line. Give a CSS font-family; commas fall back in order. Empty follows your body font. The stroke under the clock is a drawn path, so it needs no font.',
    "settings.reset.name": "Restore defaults",
    "settings.reset.desc":
      "Reset the durations, the handwriting font and the round counter (the interface language is kept — it belongs to the settings page, not to the plugin).",
  },
};
const LOCALES = buildLocales();
/** 把公共表与本插件表合并；插件缺某语言时回落到英语。 */
function buildLocales() {
  const out = {};
  const langs = new Set([...Object.keys(COMMON), ...Object.keys(OWN)]);
  for (const lang of langs) {
    out[lang] = Object.assign(
      {},
      COMMON[lang] || COMMON.en,
      OWN[lang] || OWN.en
    );
  }
  return out;
}

/* ---------- 来自 i18n.js ---------- */
/* i18n —— 多语言运行时。

   为什么不用 Obsidian 的 moment.locale()：moment 只管日期格式化，不提供
   界面字符串表；而且用户在设置页切语言要即时生效，moment 的切换要等界面重建。

   设计约束：
   - t() 永不抛异常：缺键回落到英语，英语也缺就返回键名本身。
     设置页少一行字，好过整页白屏。
   - 支持 {name} 占位符；参数没给就原样保留，方便定位漏传。
   - 界面字符串全部集中在 locales.js，main.js 里不留字面量。

   这份 i18n.js 在四个自研插件里是同一份（各自复制，因为插件是独立仓库、
   不能互相 require）。改动请四处同步。 */

/** 设置页语言下拉框的定义顺序。 */
const LANGUAGE_OPTIONS = [
  { id: "auto", label: "跟随 Obsidian / Follow Obsidian" },
  { id: "zh", label: "简体中文" },
  { id: "en", label: "English" },
];

/**
 * 把偏好解析成实际语言 id。
 * "auto" 时读 Obsidian 的界面语言；任何异常都回落到英语 ——
 * 语言探测失败不值得让设置页打不开。
 */
function resolveLanguage(pref) {
  if (pref && pref !== "auto" && LOCALES[pref]) return pref;
  try {
    const raw =
      window.localStorage.getItem("language") ||
      document.documentElement.lang ||
      "";
    const short = String(raw).toLowerCase().slice(0, 2);
    if (short && LOCALES[short]) return short;
  } catch (e) {
    /* 忽略：回落英语 */
  }
  return "en";
}

function translate(lang, key, vars) {
  const table = LOCALES[lang] || LOCALES.en;
  let s = table[key];
  if (s === undefined) {
    const fb = LOCALES.en[key];
    s = fb === undefined ? key : fb;
  }
  if (!vars) return s;
  return String(s).replace(/\{(\w+)\}/g, (m, name) =>
    vars[name] === undefined ? m : String(vars[name])
  );
}

/** 绑定插件实例：读 settings.language，暴露 t()。 */
function bindI18n(plugin) {
  const current = () =>
    resolveLanguage(plugin && plugin.settings ? plugin.settings.language : "auto");

  plugin.i18n = {
    get resolved() {
      return current();
    },
    t(key, vars) {
      return translate(current(), key, vars);
    },
    options: LANGUAGE_OPTIONS,
  };
  return plugin.i18n;
}

/* ---------- 来自 sponsor.js ---------- */
/* 赞助区块。
 *
 * 刻意做成一个独立小节而不是塞进说明文字里：设置页是用户唯一会认真读的
 * 地方，藏起来等于没有。区块只渲染链接，不引任何外部脚本或图片 ——
 * 插件必须保持零网络请求，否则会在社区市场审核时被质疑。
 *
 * 为什么只有 GitHub Sponsors 一条：
 *   最初国内 / 海外分列（爱发电 + Ko-fi），但 qy 决定统一走 GitHub ——
 *   单一入口便于维护，也避免在插件里出现多个可能失效/需要实名认证的平台。
 *   保留 SPONSORS 数组结构（而不是塌成一个字符串），是为了将来真要加
 *   第二条时改数据即可，不用动渲染代码。
 */

const SPONSORS = [
  { label: "GitHub Sponsors", url: "https://github.com/sponsors/yunmin311" },
];

function linkRow(parent, label, url) {
  const a = parent.createEl("a", { cls: "sp-link", text: label, href: url });
  a.setAttr("target", "_blank");
  a.setAttr("rel", "noopener");
}

/** 在 parent 里渲染赞助区块。t 是当前语言的取词函数。 */
function renderSponsor(parent, t) {
  const box = parent.createDiv({ cls: "sp-box" });
  box.createDiv({ cls: "sp-title", text: t("sponsor.title") });
  box.createDiv({ cls: "sp-body", text: t("sponsor.body") });

  const row = box.createDiv({ cls: "sp-row" });
  for (const l of SPONSORS) linkRow(row, l.label, l.url);
}

/* ======================== 内联模块结束 ======================== */
/* ============================ 常量 ============================ */

const CLOCK_LANG = "clock";
const LINKS_LANG = "home-links";
const NOTE_LANG = "home-note";
const VIEW_TYPE = "paper-desk-timer";
const CSS_PREFIX = "pd-";

/* 手写字体的默认值。
   为什么是一个栈而不是单个字体名：这个是给市场用户的，谁机器上装了什么无法预知。
   按顺序逐级回落，KaiTi / STKaiti 在 Windows 与 macOS 上覆盖了绝大多数情况，
   最后的 serif 保证一定有个像样的兜底 —— 用户要换成别的自己填即可。 */
const DEFAULT_FONT_STACK = '"KaiTi", "STKaiti", "Kaiti SC", "LXGW WenKai", "楷体", serif';

const DEFAULTS = {
  // 界面语言：auto / zh / en（见 i18n.js）。
  language: "auto",
  handwritingFont: DEFAULT_FONT_STACK,

  /* ---- 首页 ----

     默认留空 = 首页那组行为整组关闭。这是刻意的，不是偷懒：
     默认值一旦写成 "homepage.md"，插件装上就会去接管库里同名的一篇笔记 ——
     藏掉它的标题、把它按回阅读模式、每次启动把它打开。使用者只是想要一枚时钟，
     却发现自己那篇笔记被一个刚装的插件改了样子，这越界了，而且他无从得知是谁干的。
     首页是「点开来要的」，不是「装上就有的」：留空由使用者自己填。

     留空时 isHomePath() 恒为 false，打开 / 藏标题 / 强制阅读会一起失效，
     不需要额外分支 —— 这也正是首页逻辑可以整组关掉的原因。 */
  homePath: "",
  openOnStartup: false,
  // "replace" | "newTab"
  openMode: "replace",
  /* 默认开：这两件事 Obsidian 自己都做不到，而它们正是「首页还像一篇笔记」的两处破绽。
     标题 —— 原生只有全局开关，改了会影响库里每一篇笔记。
     模式 —— 落在编辑模式时光标会掉进 clock 这类代码块里，随手打一个字就把代码块改坏了。 */
  forcePreview: true,
  hideTitle: true,
  noteStyle: "plain",
  /* 手写体比正文显小：同样的 px 值，楷体看上去比无衬线小一号。
     默认给到 24 而不是 16 —— 再小就退化成「一段普通正文」，笔锋看不出来。 */
  noteSize: 24,
  /* 默认规则照着常用 hub 笔记的命名来：`000_Index` / `_Project Index` 命中 *Index*，
     `_English Learning Hub` 命中 *Hub*。形状不同的（如 `00-目录`）
     由使用者自己在设置里补一条精确规则。 */
  rules: ["*Index*", "*Hub*"],
  /* 链接上方的留白，单位是「视口高度的百分比」。
     做成设置项是因为它取决于屏幕高度与个人口味 —— 固定值在小屏上会刚好露出来，
     在大屏上又不够远。55 的意思是「要往下滚才看得到」。 */
  linksGap: 55,

  // ---- 计时器 ----
  workMinutes: 25,
  shortMinutes: 5,
  longMinutes: 15,
  longEvery: 4,
  /* 自动接续刻意拆成两个开关而不是合成一个：
     常见的真实用法是「专注一结束就自动进休息」但「休息结束要我自己决定什么时候回来」。
     一个总开关表达不了这种组合，而它恰恰是最省心的配置。 */
  autoStartBreak: true,
  autoStartWork: true,
  // "notice"（Obsidian 提示条）| "off"（完全安静）
  notify: "notice",
  sound: false,
  statusBar: false,
  dailyReset: true,
  // 默认关闭 —— 见 settings.showRounds.desc 里的说明。
  showRounds: false,
};

const TIMER_DEFAULTS = {
  phase: "work",
  running: false,
  // 开始当前这一段的时刻（epoch ms）；0 表示没在跑。
  // 刻意存「开始时刻」而不是「剩余秒数」：这样 Obsidian 重启后，
  // 计时是按真实时间continue的，而不是从头再来。
  startedAt: 0,
  // 没在跑时剩下的毫秒数；0 表示「用该阶段的完整时长」。
  remainingMs: 0,
  completed: 0,
  // 轮次计数所属的那一天（本地时区，YYYY-MM-DD）。跨天清零靠它判断，
  // 而不是去数「距上次打开过了多久」—— 后者在跨时区/改系统时间时会错。
  day: "",
};

/* ======================= 纯逻辑（可单测）=======================
   下面这几个函数不碰任何 Obsidian API，所以能被单独抽出来跑断言。
   判定类逻辑不接受「看起来对」—— 见仓库的 tests/logic.test.js。 */

/** 当前时间的时、分，补零成两位。 */
function splitHM(date) {
  return {
    hh: String(date.getHours()).padStart(2, "0"),
    mm: String(date.getMinutes()).padStart(2, "0"),
  };
}

/** 毫秒 → MM:SS。
    ceiling 而不是 floor：25:00 起步、走到 0 时正好停在 00:00，
    floor 会让开始的一瞬间显示 24:59，看着像已经过了一秒。 */
function formatDuration(ms) {
  const total = Math.ceil(Math.max(0, ms) / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
}

/** 某个阶段的完整时长（毫秒）。 */
function durationFor(phase, settings) {
  const key =
    phase === "long" ? "longMinutes" : phase === "short" ? "shortMinutes" : "workMinutes";
  const mins = Number(settings[key]);
  return (Number.isFinite(mins) && mins > 0 ? mins : 25) * 60 * 1000;
}

/** 走完当前阶段之后该去哪。
   completed 只统计「专注」轮数 —— 休息不算一轮，否则长休息的节奏会漂。 */
function advancePhase(phase, completed, longEvery) {
  if (phase !== "work") return { phase: "work", completed };
  const done = completed + 1;
  const every = Number(longEvery) > 0 ? Number(longEvery) : 4;
  return { phase: done % every === 0 ? "long" : "short", completed: done };
}

/** 到下一个整分钟还有多少毫秒。
   +60 是刻意留的余量：不加的话定时器可能在临界点前几毫秒就醒了，
   于是这一次什么都没变，还要再等一整分钟。 */
function msToNextMinute(date) {
  return (60 - date.getSeconds()) * 1000 - date.getMilliseconds() + 60;
}

/** 当前还剩多少毫秒。running 时按真实时间推算，否则用存下来的值。 */
function remainingOf(timer, settings, now) {
  if (timer.running && timer.startedAt) {
    return Math.max(0, timer.remainingMs - (now - timer.startedAt));
  }
  return timer.remainingMs > 0 ? timer.remainingMs : durationFor(timer.phase, settings);
}

/** 某一天的键（本地时区）。跨天判断用它，而不是「距上次打开过了几小时」。 */
function dayKey(date) {
  return (
    date.getFullYear() +
    "-" +
    String(date.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(date.getDate()).padStart(2, "0")
  );
}

/** 新的一天第一次打开时，是否要把已完成轮次清零。 */
function needsDailyReset(timer, settings, now) {
  if (!settings.dailyReset) return false;
  if (!timer.completed) return false; // 本来就是 0，没什么可清的
  return timer.day !== dayKey(now);
}

/** 走完一段之后，下一段要不要自动开始。
   拆开判断是刻意的：「专注完自动休息」和「休息完自动专注」是两件事，
   很多人只想要前者。 */
function nextAutoStart(nextPhase, settings) {
  return nextPhase === "work" ? !!settings.autoStartWork : !!settings.autoStartBreak;
}

/* ==================== 首页：规则匹配与手写句 ====================
   与 quiet-shelf 用的是同一套通配符语义，因为那是 qy 已经熟悉的心智模型。 */

/**
 * 通配符规则匹配：
 *   index    精确
 *   index*   以 index 开头
 *   *index   以 index 结尾
 *   *index*  包含 index
 * 只看文件名（去掉 .md），不区分大小写。
 *
 * ⚠️ 反直觉之处：`github` 是**以 `hub` 结尾**的（g-i-t-h-u-b），
 * 所以 `*hub` 与 `*hub*` 都会把它收进来。这不是 bug，是后缀锚定的必然结果 ——
 * 设置页里明说了，测试里也钉住了。
 */
function matchesRule(name, rule) {
  const base = String(name == null ? "" : name)
    .replace(/\.md$/i, "")
    .toLowerCase();
  let key = String(rule == null ? "" : rule).trim().toLowerCase();
  if (!key) return false;

  const head = key.startsWith("*");
  const tail = key.endsWith("*");
  if (head) key = key.slice(1);
  if (tail) key = key.slice(0, -1);
  key = key.trim();
  /* 裸的 * / ** 视为无效规则。若当成「包含空串」就会匹配一切，
     一条手滑的空通配符会悄悄把整个库铺到首页上。 */
  if (!key) return false;

  if (head && tail) return base.includes(key);
  if (tail) return base.startsWith(key);
  if (head) return base.endsWith(key);
  return base === key;
}

/** 文件名是否命中规则中的任意一条。 */
function matchesAny(name, rules) {
  const list = Array.isArray(rules) ? rules : [];
  for (const r of list) if (matchesRule(name, r)) return true;
  return false;
}

/** 取 frontmatter 里的第一个别名。
    兼容三种写法：YAML 列表 `aliases: [a, b]`、单条 `aliases: a`、
    以及逗号分隔的字符串 `aliases: a, b`（Obsidian 两者都认）。 */
function aliasOf(frontmatter) {
  if (!frontmatter || typeof frontmatter !== "object") return "";
  const raw =
    frontmatter.aliases !== undefined ? frontmatter.aliases : frontmatter.alias;
  if (raw === undefined || raw === null) return "";
  if (Array.isArray(raw)) return String(raw[0] === undefined ? "" : raw[0]).trim();
  return String(raw).split(",")[0].trim();
}

/** 链接显示名：别名优先，否则文件名。
    不在这里去掉前导下划线 —— 那是命名习惯，不是插件该替他决定的事。 */
function displayNameFor(basename, frontmatter) {
  const a = aliasOf(frontmatter);
  return a || String(basename == null ? "" : basename);
}

/**
 * 从代码块正文里读出句子。
 * 一行一句；空行跳过；以 # 开头的行当作注释跳过 ——
 * 手写句这种东西，人很容易想在上面写个「夏天用」「别太长」之类的备注。
 */
function parseNoteLines(source) {
  return String(source == null ? "" : source)
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"));
}

/**
 * 今天是这一年的第几天（1 起算）。
 * 用「减掉去年最后一天」而不是手搓月份天数表：闰年由 Date 自己负责，
 * 手搓的那张表每隔四年会错一天，而且错得很安静。
 */
function dayOfYear(date) {
  const d = date instanceof Date ? date : new Date();
  const start = new Date(d.getFullYear(), 0, 0);
  return Math.floor((d - start) / 86400000);
}

/**
 * 今天该显示哪一句。
 * 用「第几天 % 句数」而不是随机、也不是「距上次打开过了几天」：
 *  - 随机会让连续两天撞同一句，句数少的时候概率不低，看着像坏了；
 *  - 按天取模保证相邻两天一定不同，并且把整个列表均匀走完一圈再重复。
 */
function pickNoteFor(lines, date) {
  const list = Array.isArray(lines) ? lines : [];
  if (!list.length) return "";
  if (list.length === 1) return list[0];
  return list[dayOfYear(date) % list.length];
}

/** 是不是首页。抽成函数是为了能单测，也为了让两处开关共用同一个判断。 */
function isHomePath(homePath, filePath) {
  const home = String(homePath || "").trim();
  const cur = String(filePath || "").trim();
  return !!home && !!cur && cur === home;
}

/** 该不该把首页按回阅读模式。见 enforcePreview 里的说明。 */
function shouldForcePreview(force, homePath, filePath) {
  return !!force && isHomePath(homePath, filePath);
}

/* ============================ 时钟 ============================ */

const SVG_NS = "http://www.w3.org/2000/svg";

/** 手绘横线。
   用 SVG path 而不是 border-bottom：笔迹要有轻微的起伏和不齐，
   一条 1px 直线会立刻变成「分隔线」，那就成了另一种东西。
   刻意不承载任何信息，所以它不会变成噪音。 */
function buildStroke() {
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("class", CSS_PREFIX + "clock-stroke");
  svg.setAttribute("viewBox", "0 0 140 6");
  svg.setAttribute("preserveAspectRatio", "none");
  svg.setAttribute("aria-hidden", "true");
  const path = document.createElementNS(SVG_NS, "path");
  path.setAttribute("d", "M2 3.2C22 1.4 46 4.6 70 2.8S112 4.2 138 2.6");
  svg.appendChild(path);
  return svg;
}

/**
 * 把时钟渲染进 el，返回需要随时刷新的两个数字节点。
 *
 * 冒号的做法：一个真实但不可见的 ":" 负责撑出【正好一个等宽字符】的宽度，
 * 两个方块绝对定位盖在它上面。这样不管用户把等宽字体换成什么、
 * 字宽比例是多少，数字都不会因为冒号而位移。
 */
function renderClock(el) {
  const root = el.createDiv({ cls: CSS_PREFIX + "clock" });
  const line = root.createDiv({ cls: CSS_PREFIX + "clock-time" });

  const hh = line.createSpan({ cls: CSS_PREFIX + "clock-part", text: "--" });

  const colon = line.createSpan({ cls: CSS_PREFIX + "clock-colon" });
  colon.createSpan({ cls: CSS_PREFIX + "clock-colon-ghost", text: ":" });
  const dots = colon.createSpan({ cls: CSS_PREFIX + "clock-colon-dots" });
  dots.createSpan({ cls: CSS_PREFIX + "colon-dot" });
  dots.createSpan({ cls: CSS_PREFIX + "colon-dot" });

  const mm = line.createSpan({ cls: CSS_PREFIX + "clock-part", text: "--" });

  root.appendChild(buildStroke());

  /* 把闪烁对齐到真实秒：CSS 动画默认从元素挂载那一刻起算，
     那样它会和墙上时钟的秒错开，看着像「随机的呼吸」。
     用负的 animation-delay 把动画相位推到当前秒上。 */
  dots.style.animationDelay = "-" + ((Date.now() / 1000) % 2).toFixed(3) + "s";

  return { hh, mm };
}

/** 时钟的渲染生命周期。
   用 MarkdownRenderChild 挂到渲染上下文上，笔记重渲染或关闭时
   onunload 会被调用 —— 定时器不会泄漏。 */
class ClockBlock extends MarkdownRenderChild {
  constructor(containerEl) {
    super(containerEl);
    this._timeout = 0;
  }

  onload() {
    const parts = renderClock(this.containerEl);

    const paint = () => {
      const hm = splitHM(new Date());
      parts.hh.setText(hm.hh);
      parts.mm.setText(hm.mm);
    };

    /* 刻意不在 1Hz 上跑：秒不需要显示，闪烁交给 CSS。
       只在每个整分钟醒一次，把两个数字刷新一下即可。 */
    const tick = () => {
      paint();
      this._timeout = window.setTimeout(tick, msToNextMinute(new Date()));
    };

    paint();
    this._timeout = window.setTimeout(tick, msToNextMinute(new Date()));
  }

  onunload() {
    if (this._timeout) window.clearTimeout(this._timeout);
    this._timeout = 0;
  }
}

/* ======================= 首页手写句区块 ======================= */

/**
 * 一只手绘引号。
 * 走 currentColor 而不是写死颜色 —— 颜色必须跟着主题走，这是这条插件线的总原则；
 * 引号只是笔画，不该比字更显眼，所以它继承文字色。
 */
function buildQuoteMark(side) {
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("class", CSS_PREFIX + "quote");
  svg.setAttribute("viewBox", "0 0 12 14");
  svg.setAttribute("width", "12");
  svg.setAttribute("height", "14");
  svg.setAttribute("aria-hidden", "true");

  const path = document.createElementNS(SVG_NS, "path");
  path.setAttribute(
    "d",
    side === "left"
      ? "M 9 3 C 9 0 4 0 3 3 C 2 6 6 7 6 11"
      : "M 3 3 C 3 0 8 0 9 3 C 10 6 6 7 6 11"
  );
  path.setAttribute("fill", "none");
  path.setAttribute("stroke", "currentColor");
  path.setAttribute("stroke-width", "1.4");
  path.setAttribute("stroke-linecap", "round");
  svg.appendChild(path);
  return svg;
}

class NoteBlock extends MarkdownRenderChild {
  constructor(containerEl, plugin, source) {
    super(containerEl);
    this.plugin = plugin;
    this.source = source;
  }

  onload() {
    const lines = parseNoteLines(this.source);
    /* 空块什么都不渲染。首页要的是留白 —— 一个「还没有写句子」的占位提示
       本身就是噪音，而且它会一直待在那里提醒你还没写。 */
    if (!lines.length) return;

    const line = pickNoteFor(lines, new Date());
    if (!line) return;

    const style = this.plugin.settings.noteStyle || "plain";
    const root = this.containerEl.createDiv({
      cls: `${CSS_PREFIX}note ${CSS_PREFIX}note-${style}`,
    });

    if (style === "quotes") root.appendChild(buildQuoteMark("left"));
    root.createSpan({ cls: CSS_PREFIX + "note-text", text: line });
    if (style === "quotes") root.appendChild(buildQuoteMark("right"));
  }
}

/** 用 MarkdownRenderChild 挂到渲染上下文上：笔记重渲染或关闭时 onunload 会被调用，
    不会留下悬挂的 DOM。区块本身不持有定时器，所以 onunload 无需额外清理。 */
class LinksBlock extends MarkdownRenderChild {
  constructor(containerEl, plugin) {
    super(containerEl);
    this.plugin = plugin;
  }

  onload() {
    const items = this.plugin.collectHubs();
    /* 一条都没命中就什么都不渲染。
       首页要的是留白，不是「没有结果」的占位提示 —— 那种提示本身就是噪音。
       真要排查规则，看设置页的说明就够了。 */
    if (!items.length) return;

    const root = this.containerEl.createDiv({ cls: CSS_PREFIX + "links" });
    const list = root.createEl("ul", { cls: CSS_PREFIX + "list" });

    for (const item of items) {
      const li = list.createEl("li", { cls: CSS_PREFIX + "item" });
      const a = li.createEl("a", {
        cls: CSS_PREFIX + "link",
        text: item.title,
        href: item.file.path,
      });
      a.onclick = (e) => {
        e.preventDefault();
        this.plugin.app.workspace.openLinkText(item.file.path, "", false);
      };
    }
  }
}

/* ======================= 专注计时器面板 ======================= */

/** 用 WebAudio 现场合成一声短音。
   为什么不用音频文件：插件必须保持零外部请求、也不该为一声「叮」塞进几百 KB 素材，
   社区市场审核对这两点都敏感。合成方式零依赖、零体积。

   包一层 try：没有输出设备、被浏览器策略拦住、AudioContext 不可用 —— 任何一种
   都不该影响计时本身。响不了就算了，计时继续走。 */
function playTone() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = 660;
    /* 快起快落。直接把增益开关会爆出咔哒声 ——
       所以两端都用指数逼近一个极小值而不是 0（指数曲线碰不到 0）。 */
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.45);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
    osc.onended = () => ctx.close();
  } catch (e) {
    /* 静默忽略 —— 见上 */
  }
}

class PomodoroView extends ItemView {
  constructor(leaf, plugin) {
    super(leaf);
    this.plugin = plugin;
  }

  getViewType() {
    return VIEW_TYPE;
  }

  getDisplayText() {
    return this.plugin.i18n.t("view.title");
  }

  getIcon() {
    return "timer";
  }

  async onOpen() {
    this.render();
    /* 刻意不在这里起定时器。1Hz 的心跳统一由插件持有（见 PaperDeskPlugin.onload），
       因为它还要驱动状态栏 —— 那个在面板关着的时候也得走。
       两处各起一个定时器就是两个真相来源，迟早会不同步。 */
  }

  async onClose() {
    /* 面板自己不持有任何资源；状态的推进与显示刷新都由插件负责。 */
  }

  render() {
    const el = this.contentEl;
    const t = (k, v) => this.plugin.i18n.t(k, v);
    el.empty();
    el.addClass(CSS_PREFIX + "timer");

    this.phaseEl = el.createDiv({ cls: CSS_PREFIX + "timer-phase" });
    this.timeEl = el.createDiv({ cls: CSS_PREFIX + "timer-time" });
    this.roundsEl = el.createDiv({ cls: CSS_PREFIX + "timer-rounds" });

    const row = el.createDiv({ cls: CSS_PREFIX + "timer-row" });
    this.toggleBtn = row.createEl("button", {
      cls: CSS_PREFIX + "timer-btn",
      text: t("timer.start"),
    });
    this.toggleBtn.onclick = () => this.plugin.startOrPause();

    const skipBtn = row.createEl("button", {
      cls: CSS_PREFIX + "timer-btn",
      text: t("timer.skip"),
    });
    skipBtn.onclick = () => this.plugin.skipPhase();

    const resetBtn = row.createEl("button", {
      cls: CSS_PREFIX + "timer-btn",
      text: t("timer.reset"),
    });
    resetBtn.onclick = () => this.plugin.resetTimer();

    this.updateDisplay();
  }

  updateDisplay() {
    if (!this.timeEl || !this.timeEl.isConnected) return;
    const s = this.plugin.settings;
    const tm = this.plugin.timer;
    const t = (k, v) => this.plugin.i18n.t(k, v);

    this.timeEl.setText(formatDuration(remainingOf(tm, s, Date.now())));
    this.phaseEl.setText(t("phase." + tm.phase));
    this.toggleBtn.setText(t(tm.running ? "timer.pause" : "timer.start"));

    if (s.showRounds) {
      this.roundsEl.setText(t("timer.rounds", { n: tm.completed }));
      this.roundsEl.removeClass(CSS_PREFIX + "hidden");
    } else {
      this.roundsEl.addClass(CSS_PREFIX + "hidden");
    }
  }
}

/* ============================ 设置页 ============================ */

class PaperDeskSettingTab extends PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display() {
    const { containerEl } = this;
    const s = this.plugin.settings;
    const t = (k, v) => this.plugin.i18n.t(k, v);
    containerEl.empty();

    containerEl.createEl("h3", { text: "Paper Desk" });

    new Setting(containerEl)
      .setName(t("settings.language.name"))
      .setDesc(t("settings.language.desc"))
      .addDropdown((drop) => {
        for (const opt of this.plugin.i18n.options) drop.addOption(opt.id, opt.label);
        drop.setValue(s.language || "auto").onChange(async (value) => {
          s.language = value;
          await this.plugin.save();
          this.display();
        });
      });

    /* ---- 首页 ----
       这一组放在计时器前面：它们决定的是「你打开 Obsidian 时看到什么」，
       而计时器是「你坐下来之后用什么」。 */
    containerEl.createEl("h3", { text: t("settings.home.heading") });

    new Setting(containerEl)
      .setName(t("settings.homePath.name"))
      .setDesc(t("settings.homePath.desc"))
      .addText((txt) =>
        txt.setValue(s.homePath || "").onChange(async (v) => {
          s.homePath = v.trim();
          await this.plugin.save();
          this.plugin.markHomeViews();
        })
      );

    new Setting(containerEl)
      .setName(t("settings.openOnStartup.name"))
      .setDesc(t("settings.openOnStartup.desc"))
      .addToggle((tg) =>
        tg.setValue(!!s.openOnStartup).onChange(async (v) => {
          s.openOnStartup = v;
          await this.plugin.save();
        })
      );

    new Setting(containerEl)
      .setName(t("settings.openMode.name"))
      .setDesc(t("settings.openMode.desc"))
      .addDropdown((drop) => {
        drop.addOption("replace", t("settings.openMode.replace"));
        drop.addOption("newTab", t("settings.openMode.newTab"));
        drop.setValue(s.openMode || "replace").onChange(async (v) => {
          s.openMode = v;
          await this.plugin.save();
        });
      });

    new Setting(containerEl)
      .setName(t("settings.forcePreview.name"))
      .setDesc(t("settings.forcePreview.desc"))
      .addToggle((tg) =>
        tg.setValue(!!s.forcePreview).onChange(async (v) => {
          s.forcePreview = v;
          await this.plugin.save();
          if (v) {
            const home = String(s.homePath || "").trim();
            if (home) {
              this.plugin.enforcePreview(this.app.vault.getAbstractFileByPath(home));
            }
          }
        })
      );

    new Setting(containerEl)
      .setName(t("settings.hideTitle.name"))
      .setDesc(t("settings.hideTitle.desc"))
      .addToggle((tg) =>
        tg.setValue(!!s.hideTitle).onChange(async (v) => {
          s.hideTitle = v;
          await this.plugin.save();
          this.plugin.markHomeViews();
        })
      );

    /* ---- 首页手写句 ---- */
    containerEl.createEl("h3", { text: t("settings.note.heading") });
    containerEl.createDiv({ cls: CSS_PREFIX + "setting-note", text: t("settings.note.desc") });

    new Setting(containerEl)
      .setName(t("settings.noteStyle.name"))
      .setDesc(t("settings.noteStyle.desc"))
      .addDropdown((drop) => {
        drop.addOption("plain", t("settings.noteStyle.plain"));
        drop.addOption("quotes", t("settings.noteStyle.quotes"));
        drop.addOption("tilt", t("settings.noteStyle.tilt"));
        drop.setValue(s.noteStyle || "plain").onChange(async (v) => {
          s.noteStyle = v;
          await this.plugin.save();
          this.plugin.refreshBlocks();
        });
      });

    /* 字体不在这里另设一项 —— 计时器阶段名和手写句共用「外观」那一项。
       合并前它们是两个各自独立的设置，没人想为同一个手写体设两遍。 */

    new Setting(containerEl)
      .setName(t("settings.noteSize.name"))
      .setDesc(t("settings.noteSize.desc"))
      .addSlider((sl) =>
        sl
          .setLimits(12, 48, 1)
          .setValue(Number(s.noteSize) || 24)
          .setDynamicTooltip()
          .onChange(async (v) => {
            s.noteSize = v;
            this.plugin.applyStyles();
            await this.plugin.save();
          })
      );

    /* ---- 首页链接 ---- */
    containerEl.createEl("h3", { text: t("settings.links.heading") });
    containerEl.createDiv({ cls: CSS_PREFIX + "setting-note", text: t("settings.links.desc") });

    new Setting(containerEl)
      .setName(t("settings.rules.name"))
      .setDesc(t("settings.rules.desc"))
      .addTextArea((txt) => {
        txt.setValue((s.rules || []).join("\n")).onChange(async (v) => {
          s.rules = v
            .split("\n")
            .map((x) => x.trim())
            .filter(Boolean);
          await this.plugin.save();
          this.plugin.refreshBlocks();
        });
        txt.inputEl.rows = 4;
      });

    /* 用滑块而不是输入框：这是个「调到手感对为止」的值，
       滑块带即时数字提示，比让人反复改数字再回头看要快得多。 */
    new Setting(containerEl)
      .setName(t("settings.linksGap.name"))
      .setDesc(t("settings.linksGap.desc"))
      .addSlider((sl) =>
        sl
          .setLimits(0, 150, 5)
          .setValue(Number(s.linksGap) || 0)
          .setDynamicTooltip()
          .onChange(async (v) => {
            s.linksGap = v;
            this.plugin.applyStyles();
            await this.plugin.save();
          })
      );

    /* ---- 专注计时器 ---- */
    containerEl.createEl("h3", { text: t("settings.timer.heading") });

    const numberSetting = (key, nameKey, descKey, min, max) =>
      new Setting(containerEl)
        .setName(t(nameKey))
        .setDesc(t(descKey))
        .addText((txt) => {
          txt.inputEl.type = "number";
          txt.inputEl.min = String(min);
          txt.inputEl.max = String(max);
          txt.setValue(String(s[key])).onChange(async (v) => {
            const n = Number(v);
            if (!Number.isFinite(n) || n <= 0) return; // 空值/非法值不写盘，等用户填完
            s[key] = Math.min(max, Math.max(min, Math.round(n)));
            await this.plugin.save();
            this.plugin.refreshViews();
          });
        });

    numberSetting("workMinutes", "settings.work.name", "settings.work.desc", 1, 180);
    numberSetting("shortMinutes", "settings.short.name", "settings.short.desc", 1, 60);
    numberSetting("longMinutes", "settings.long.name", "settings.long.desc", 1, 120);
    numberSetting("longEvery", "settings.longEvery.name", "settings.longEvery.desc", 2, 12);

    /** 布尔项的样板太长，抽成一个小工厂；顺带保证每个开关都会落盘并刷新显示。 */
    const toggleSetting = (key, nameKey, descKey) =>
      new Setting(containerEl)
        .setName(t(nameKey))
        .setDesc(t(descKey))
        .addToggle((tg) =>
          tg.setValue(!!s[key]).onChange(async (v) => {
            s[key] = v;
            await this.plugin.save();
            this.plugin.refreshViews();
          })
        );

    containerEl.createEl("h4", { text: t("settings.autoStart.heading") });
    toggleSetting(
      "autoStartBreak",
      "settings.autoStartBreak.name",
      "settings.autoStartBreak.desc"
    );
    toggleSetting(
      "autoStartWork",
      "settings.autoStartWork.name",
      "settings.autoStartWork.desc"
    );

    /* ---- 提醒与显示 ---- */
    containerEl.createEl("h3", { text: t("settings.alerts.heading") });

    new Setting(containerEl)
      .setName(t("settings.notify.name"))
      .setDesc(t("settings.notify.desc"))
      .addDropdown((drop) => {
        drop.addOption("notice", t("settings.notify.notice"));
        drop.addOption("off", t("settings.notify.off"));
        drop.setValue(s.notify || "notice").onChange(async (v) => {
          s.notify = v;
          await this.plugin.save();
        });
      });

    new Setting(containerEl)
      .setName(t("settings.sound.name"))
      .setDesc(t("settings.sound.desc"))
      .addToggle((tg) =>
        tg.setValue(!!s.sound).onChange(async (v) => {
          s.sound = v;
          await this.plugin.save();
        })
      )
      /* 试听按钮和开关同一行：声音这种设置必须能立刻听到，
         否则用户只能等下一次阶段结束才知道自己开没开对。 */
      .addButton((b) =>
        b.setButtonText(t("settings.sound.test")).onClick(() => playTone())
      );

    toggleSetting("statusBar", "settings.statusBar.name", "settings.statusBar.desc");
    toggleSetting("dailyReset", "settings.dailyReset.name", "settings.dailyReset.desc");
    toggleSetting("showRounds", "settings.showRounds.name", "settings.showRounds.desc");

    /* ---- 外观 ---- */
    containerEl.createEl("h3", { text: t("settings.font.heading") });

    let fontText;
    const fontSetting = new Setting(containerEl)
      .setName(t("settings.font.name"))
      .setDesc(t("settings.font.desc"))
      .addText((txt) => {
        fontText = txt;
        txt.setValue(s.handwritingFont || "").onChange(async (v) => {
          s.handwritingFont = v;
          await this.plugin.save();
          this.plugin.applyStyles();
          this.plugin.refreshViews();
        });
      });

    fontSetting.addExtraButton((b) =>
      b
        .setIcon("rotate-ccw")
        .setTooltip(t("common.reset"))
        .onClick(async () => {
          s.handwritingFont = DEFAULT_FONT_STACK;
          await this.plugin.save();
          fontText.setValue(DEFAULT_FONT_STACK);
          this.plugin.applyStyles();
          this.plugin.refreshViews();
        })
    );

    new Setting(containerEl)
      .setName(t("settings.reset.name"))
      .setDesc(t("settings.reset.desc"))
      .addButton((b) =>
        b.setButtonText(t("common.reset")).onClick(async () => {
          /* 刻意保留 language：那是设置页自身的属性，不属于插件配置 ——
             用户点了「恢复默认」不该发现界面语言也被换掉。 */
          const keepLang = s.language;
          Object.assign(s, DEFAULTS, { language: keepLang });
          await this.plugin.save();
          /* 计时器状态刻意不动（它存在 timer 字段里，不在 DEFAULTS 中）——
             点「恢复默认设置」不该把正在跑的计时一起干掉。 */
          this.plugin.applyStyles();
          this.plugin.refreshViews();
          this.plugin.markHomeViews();
          this.plugin.refreshBlocks();
          new Notice(t("common.reset.done"));
          this.display();
        })
      );

    this.renderFooter(containerEl, t);
  }

  /** 版本 + 仓库 + 赞助。自研插件共用同一套结构与文案。 */
  renderFooter(containerEl, t) {
    const wrap = containerEl.createDiv({ cls: CSS_PREFIX + "about" });

    const meta = wrap.createDiv({ cls: CSS_PREFIX + "about-meta" });
    meta.createSpan({ text: `${t("meta.version")} ${this.plugin.manifest.version}` });
    meta.createSpan({ cls: CSS_PREFIX + "about-sep", text: "·" });
    const repo = meta.createEl("a", {
      text: this.plugin.manifest.id,
      href: `https://github.com/yunmin311/${this.plugin.manifest.id}-obsidian`,
    });
    repo.setAttr("target", "_blank");
    repo.setAttr("rel", "noopener");

    renderSponsor(wrap, t);
  }
}

/* ============================= 插件 ============================= */

class PaperDeskPlugin extends Plugin {
  async onload() {
    const data = (await this.loadData()) || {};
    this.settings = Object.assign({}, DEFAULTS, data);
    delete this.settings.timer;
    this.timer = Object.assign({}, TIMER_DEFAULTS, data.timer || {});

    bindI18n(this);
    const t = (k, v) => this.i18n.t(k, v);

    /* 三个区块的注册刻意放在 onload 的最前面，早于下面任何可能失败的步骤。
       顺序在这里是正确性的一部分，不是风格问题：一次事故里，onload 中途抛错
       导致这三个注册没被执行，于是首页整篇空白 —— 而当时标题已经被藏掉了，
       于是「插件加载了」和「内容没渲染」同时成立，看上去像渲染器坏了。
       注册先做，即使后面某一步失败，笔记里的区块仍然照常渲染。 */
    this.registerMarkdownCodeBlockProcessor(CLOCK_LANG, (source, el, ctx) => {
      ctx.addChild(new ClockBlock(el));
    });

    this.registerMarkdownCodeBlockProcessor(LINKS_LANG, (source, el, ctx) => {
      ctx.addChild(new LinksBlock(el, this));
    });

    this.registerMarkdownCodeBlockProcessor(NOTE_LANG, (source, el, ctx) => {
      ctx.addChild(new NoteBlock(el, this, source));
    });

    this.applyStyles();
    this.markHomeViews();

    /* 这三行不再是构造相关（this.applyStyles 只是下发 CSS 变量），
       现在纯粹为了把 style 变量在下一次 render 之前写好。 */

    /* 跨天清零放在最前面，早于下面那段「离线走完」的修正 ——
       顺序反了会变成「先补推进一段、再清零」，刚补的那轮就被吃掉了。 */
    if (needsDailyReset(this.timer, this.settings, Date.now())) {
      this.timer.completed = 0;
    }
    this.timer.day = dayKey(new Date());

    /* 状态栏条目只建一次，之后靠 CSS 类显隐。
       反复 addStatusBarItem() 会越加越多 —— 每次改设置都会多出一个。 */
    this.statusBarEl = this.addStatusBarItem();
    /* 判空不是多疑：移动端没有状态栏，这里拿到的可能是空值。
       直接 .addClass 会抛，进而中断整个 onload —— 一个排版用的小挂件
       不该有本事让时钟和首页区块都渲染不出来。拿不到就跳过状态栏，
       计时本身照常（面板和通知都不依赖它）。 */
    if (this.statusBarEl) this.statusBarEl.addClass(CSS_PREFIX + "statusbar");
    this.setupTicker();

    /* 在 Obsidian 关闭期间把计时走完了的情况：只推进一个阶段就停下，
       不顺着补记下去。理由：离线这段时间用户到底有没有在专注，我无从得知，
       替他往前推等于凭空造出几轮记录。 */
    let stale = false;
    if (this.timer.running && remainingOf(this.timer, this.settings, Date.now()) <= 0) {
      const adv = advancePhase(this.timer.phase, this.timer.completed, this.settings.longEvery);
      this.timer.phase = adv.phase;
      this.timer.completed = adv.completed;
      this.timer.running = false;
      this.timer.startedAt = 0;
      this.timer.remainingMs = 0;
      stale = true;
      await this.save();
    }

    this.registerView(VIEW_TYPE, (leaf) => new PomodoroView(leaf, this));

    this.addRibbonIcon("timer", t("view.title"), () => this.activateView());

    /* 首页那组行为靠这两个事件维持。
       file-open：活动文件变化（打开首页、从别处切回来）。
       layout-change：新建标签、分屏、把首页拖到另一个面板。只听一个是漏的。 */
    this.registerEvent(
      this.app.workspace.on("file-open", (file) => {
        this.markHomeViews();
        this.enforcePreview(file);
      })
    );
    this.registerEvent(
      this.app.workspace.on("layout-change", () => this.markHomeViews())
    );

    this.addCommand({
      id: "open-timer",
      name: t("command.openTimer"),
      callback: () => this.activateView(),
    });

    this.addCommand({
      id: "toggle-timer",
      name: t("command.toggleTimer"),
      callback: () => this.startOrPause(),
    });

    this.addCommand({
      id: "reset-timer",
      name: t("command.resetTimer"),
      callback: () => this.resetTimer(),
    });

    this.addCommand({
      id: "skip-phase",
      name: t("command.skipPhase"),
      callback: () => this.skipPhase(),
    });

    this.addCommand({
      id: "open-home",
      name: t("command.openHome"),
      callback: () => this.openHome(false),
    });

    this.addCommand({
      id: "insert-links",
      name: t("command.insertLinks"),
      editorCallback: (editor) =>
        editor.replaceSelection("```" + LINKS_LANG + "\n```\n"),
    });

    this.addCommand({
      id: "insert-note",
      name: t("command.insertNote"),
      editorCallback: (editor) =>
        editor.replaceSelection("```" + NOTE_LANG + "\n```\n"),
    });

    this.addCommand({
      id: "insert-clock",
      name: t("command.insertClock"),
      editorCallback: (editor) => editor.replaceSelection("```" + CLOCK_LANG + "\n```\n"),
    });

    this.addSettingTab(new PaperDeskSettingTab(this.app, this));

    if (stale) {
      this.app.workspace.onLayoutReady(() => new Notice(t("notice.staleTimer")));
    }

    if (this.settings.openOnStartup) {
      this.app.workspace.onLayoutReady(() => this.openHome(true));
    }
  }

  onunload() {
    // 视图由 Obsidian 按 registerView 回收；这里只需把样式变量撤掉，保证禁用后界面复原。
    document.body.style.removeProperty("--pd-handwriting");
    document.body.style.removeProperty("--pd-note-size");
    document.body.style.removeProperty("--pd-links-gap");
    // 标记也要摘掉，否则藏起来的标题在禁用插件后仍然是藏着的
    for (const leaf of this.app.workspace.getLeavesOfType("markdown")) {
      if (leaf.view && leaf.view.containerEl) {
        leaf.view.containerEl.classList.remove(CSS_PREFIX + "is-home");
      }
    }
  }

  /** 把受设置影响的值写成 body 上的 CSS 变量。
      挂在 body 上而不是逐个元素：面板与笔记视图都是随时重建的，
      变量放在最外层就不用管它们什么时候重建。 */
  applyStyles() {
    const s = this.settings;

    /* 手写字体：同一个变量同时给计时器阶段名和首页手写句用 ——
       这两处本来就该是同一个字体，合并前是两个各自独立的设置，没人想设两遍。 */
    const font = String(s.handwritingFont || "").trim();
    document.body.style.setProperty(
      "--pd-handwriting",
      // 留空 = 跟随正文（Obsidian 自己的变量，永远存在，不会失败）
      font || "var(--font-text)"
    );

    /* 字号钳在 12–48：再小就不是手写句了，再大会顶到时钟。
       输入非法（NaN）时写默认值而不是写 "NaNpx" —— 后者会让整条声明作废，
       字会掉回继承值，看起来像「设置没生效」。 */
    const size = Number(s.noteSize);
    document.body.style.setProperty(
      "--pd-note-size",
      (Number.isFinite(size) ? Math.min(48, Math.max(12, size)) : 24) + "px"
    );

    const gap = Number(s.linksGap);
    document.body.style.setProperty(
      "--pd-links-gap",
      (Number.isFinite(gap) ? Math.min(150, Math.max(0, gap)) : 55) + "vh"
    );
  }

  async save() {
    await this.saveData(Object.assign({}, this.settings, { timer: this.timer }));
  }

  /** 1Hz 心跳，由插件独占 —— 侧栏面板刻意不自带定时器。
      它同时管两件事：推进已到期的阶段、刷新状态栏。
      没在计时时也照跑：状态栏和面板都得能跟上外部变化（改设置、跨天清零），
      1Hz 的代价可以忽略，换来的是「只有一个真相来源」。 */
  setupTicker() {
    const id = window.setInterval(() => {
      if (this.timer.running) {
        const left = remainingOf(this.timer, this.settings, Date.now());
        if (left <= 0) {
          this.completePhase(true);
          return; // completePhase 内部已经刷新过，别重复刷
        }
      }
      this.refreshViews();
    }, 1000);
    this.registerInterval(id);
  }

  refreshViews() {
    for (const leaf of this.app.workspace.getLeavesOfType(VIEW_TYPE)) {
      if (leaf.view && leaf.view.updateDisplay) leaf.view.updateDisplay();
    }
    this.updateStatusBar();
  }

  /** 状态栏只显示「阶段 + 剩余」，不显示累计轮次 ——
      累计是可选信息，默认关，别把它偷偷塞进状态栏。 */
  updateStatusBar() {
    if (!this.statusBarEl) return;
    if (!this.settings.statusBar) {
      this.statusBarEl.addClass(CSS_PREFIX + "hidden");
      return;
    }
    this.statusBarEl.removeClass(CSS_PREFIX + "hidden");
    const tm = this.timer;
    const left = remainingOf(tm, this.settings, Date.now());
    this.statusBarEl.setText(
      this.i18n.t("phase." + tm.phase) + " " + formatDuration(left)
    );
  }

  /* ---- 首页 ---- */

  /**
   * 打开首页。
   * silent=true 是启动时那条路径：路径不存在就安静跳过 ——
   * 启动时弹一个「找不到笔记」的报错，比不打开更烦人。
   */
  async openHome(silent) {
    const path = String(this.settings.homePath || "").trim();
    if (!path) return;

    const file = this.app.vault.getAbstractFileByPath(path);
    if (!file || !file.path) {
      if (!silent) new Notice(this.i18n.t("notice.notFound", { path }));
      return;
    }

    const newLeaf = this.settings.openMode === "newTab";
    const leaf = this.app.workspace.getLeaf(newLeaf);
    if (!leaf) return;
    await leaf.openFile(file);

    // 打开之后补一次：file-open 事件在这个路径上不一定已经触发
    this.markHomeViews();
    this.enforcePreview(file);
  }

  /**
   * 给「当前显示的是首页」的视图打标记，CSS 靠它只在这一篇上藏标题。
   *
   * 标记打在 view 的 containerEl 上，不打在 body 上：body 是全局的，
   * 分屏时两个标签共用它，那样会把另一篇笔记的标题也一起藏掉。
   */
  markHomeViews() {
    const home = String(this.settings.homePath || "").trim();
    const on = !!this.settings.hideTitle && !!home;

    for (const leaf of this.app.workspace.getLeavesOfType("markdown")) {
      const view = leaf.view;
      if (!view || !view.containerEl) continue;
      const isHome = on && !!view.file && isHomePath(home, view.file.path);
      view.containerEl.classList.toggle(CSS_PREFIX + "is-home", isHome);
    }
  }

  /**
   * 刚切到首页时把它按回阅读模式。
   *
   * 只在「到达首页的那一刻」做，这一点很关键：不这么做的话，
   * 用户在首页里自己切进编辑模式也会被立刻弹回来，首页就改不了了。
   * 挂在 file-open 上正好 —— 它只在活动文件变化时触发，
   * 而在同一篇笔记里切换模式不会触发它。
   *
   * 用 setMode 前先确认它存在：这是 MarkdownView 上较新的方法，
   * 老版本没有。缺了就静默跳过，不能因为排版偏好让整个插件挂掉。
   */
  enforcePreview(file) {
    if (!shouldForcePreview(this.settings.forcePreview, this.settings.homePath, file && file.path)) {
      return;
    }
    /* 重入闸门：setMode 是异步的，改完模式后可能再抛一次 file-open，
       而那一刻 getMode() 也许还报着旧值。没有这道闸门就会变成
       「切模式 → 触发事件 → 又切一次」的来回，最终把渲染线程钉住。
       一次 file-open 只允许真正动手一次。 */
    if (this._forcingPreview) return;
    this._forcingPreview = true;
    try {
      this._forcePreviewNow();
    } finally {
      this._forcingPreview = false;
    }
  }

  _forcePreviewNow() {
    const home = String(this.settings.homePath || "").trim();

    for (const leaf of this.app.workspace.getLeavesOfType("markdown")) {
      const view = leaf.view;
      if (!view || !view.file || view.file.path !== home) continue;
      if (typeof view.getMode !== "function" || typeof view.setMode !== "function") continue;
      if (view.getMode() !== "source") continue;
      view.setMode("preview");
    }
  }

  /** 按规则收集要列在首页上的笔记。
      排序用 localeCompare + numeric，这样「第 2 篇」会排在「第 10 篇」前面 ——
      纯字典序会把 10 排到 2 前面，在这种带编号的库里很刺眼。 */
  collectHubs() {
    const rules = (this.settings.rules || []).filter(Boolean);
    if (!rules.length) return [];

    const home = String(this.settings.homePath || "").trim();
    const out = [];

    for (const file of this.app.vault.getMarkdownFiles()) {
      // 别把首页自己列进去
      if (home && file.path === home) continue;
      if (!matchesAny(file.basename, rules)) continue;

      const cache = this.app.metadataCache.getFileCache(file);
      out.push({
        file,
        title: displayNameFor(file.basename, cache && cache.frontmatter),
      });
    }

    out.sort((a, b) =>
      a.title.localeCompare(b.title, undefined, { numeric: true })
    );
    return out;
  }

  /** 规则改了之后让已打开的区块重画。
      直接重画所有 markdown 视图 —— 只对当前那篇有意义，但代价可以忽略，
      而「去精准定位包含区块的那一篇」要多绕好几层 API。 */
  refreshBlocks() {
    for (const leaf of this.app.workspace.getLeavesOfType("markdown")) {
      const view = leaf.view;
      if (view && view.previewMode && view.previewMode.rerender) {
        view.previewMode.rerender(true);
      }
    }
  }

  async activateView() {
    const { workspace } = this.app;
    let leaf = workspace.getLeavesOfType(VIEW_TYPE)[0];
    if (!leaf) {
      leaf = workspace.getRightLeaf(false);
      if (!leaf) return;
      await leaf.setViewState({ type: VIEW_TYPE, active: true });
    }
    workspace.revealLeaf(leaf);
  }

  /* ---- 计时器动作 ---- */

  startOrPause() {
    const t = (k) => this.i18n.t(k);
    const now = Date.now();
    if (this.timer.running) {
      this.timer.remainingMs = remainingOf(this.timer, this.settings, now);
      this.timer.running = false;
      this.timer.startedAt = 0;
      new Notice(t("notice.paused"));
    } else {
      if (this.timer.remainingMs <= 0) {
        this.timer.remainingMs = durationFor(this.timer.phase, this.settings);
      }
      this.timer.running = true;
      this.timer.startedAt = now;
      new Notice(t("notice.started"));
    }
    this.save();
    this.refreshViews();
  }

  resetTimer() {
    this.timer.running = false;
    this.timer.startedAt = 0;
    this.timer.remainingMs = 0;
    this.timer.phase = "work";
    this.timer.completed = 0;
    this.timer.day = dayKey(new Date());
    this.save();
    this.refreshViews();
    new Notice(this.i18n.t("notice.reset"));
  }

  skipPhase() {
    this.completePhase(this.timer.running, true);
  }

  /** 走完当前阶段。
      autoStart=true 时直接接着跑下一段（完整番茄循环的「自动接续」）。
      silent=true 用于手动跳过 —— 跳过不该弹「专注结束」那种提示。 */
  completePhase(autoStart, silent) {
    const wasWork = this.timer.phase === "work";
    const adv = advancePhase(this.timer.phase, this.timer.completed, this.settings.longEvery);
    this.timer.phase = adv.phase;
    this.timer.completed = adv.completed;
    this.timer.day = dayKey(new Date());
    this.timer.remainingMs = durationFor(adv.phase, this.settings);

    /* autoStart 的意思是「上一段当时是在跑着的」，是否真的接着跑还要看对应的开关。
       分两层是因为「在跑」和「允许自动接续」是两回事 ——
       暂停状态下手动跳过，不该把计时器顺手启动起来。 */
    const go = !!autoStart && nextAutoStart(adv.phase, this.settings);
    this.timer.running = go;
    this.timer.startedAt = go ? Date.now() : 0;

    this.save();
    this.refreshViews();

    if (!silent) {
      /* 手动跳过不响铃也不弹提示 —— 用户本来就知道自己跳了。 */
      if (this.settings.sound) playTone();
      if (this.settings.notify !== "off") {
        new Notice(this.i18n.t(wasWork ? "notice.workDone" : "notice.breakDone"));
      }
    }
  }
}

module.exports = PaperDeskPlugin;
