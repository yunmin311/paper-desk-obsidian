/* Paper Desk（案头）—— 界面字符串表。
   含命令、Notice、侧栏计时器面板与设置页的全部界面文字。 */

"use strict";

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

module.exports = { LOCALES: buildLocales() };

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
