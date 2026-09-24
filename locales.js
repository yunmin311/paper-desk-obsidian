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

    "home.resume": "继续",
    "home.action.new": "新建笔记",
    "home.action.daily": "今日日记",
    "home.action.focus": "专注计时",

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

    "settings.clock.heading": "时钟",
    "settings.hourFormat.name": "小时制",
    "settings.hourFormat.desc":
      "24 小时制读作 14:05，12 小时制读作 2:05 PM。只影响笔记里的那枚时钟 —— 计时器显示的始终是剩余时间，跟它无关。",
    "settings.hourFormat.24": "24 小时（14:05）",
    "settings.hourFormat.12": "12 小时（2:05 PM）",
    "settings.clockSize.name": "时钟字号",
    "settings.clockSize.desc": "默认 72 px；窄笔记栏会按实际栏宽自动收小。",

    "settings.home.heading": "首页",
    "settings.homePath.name": "首页笔记的路径",
    "settings.homePath.desc":
      "从库根目录算起的完整路径，要带 .md。留空会关掉首页的打开、藏标题与阅读模式；下方单独选择的默认阅读笔记不受影响。",
    "settings.openOnStartup.name": "启动时打开",
    "settings.openOnStartup.desc": "Obsidian 启动后自动打开上面那篇笔记。",
    "settings.openMode.name": "打开方式",
    "settings.openMode.desc":
      "启动时打开首页，选择复用当前标签页或新建标签页。",
    "settings.openMode.replace": "替换当前标签",
    "settings.openMode.newTab": "在新标签页打开",
    "settings.forcePreview.name": "首页始终用阅读模式打开",
    "settings.forcePreview.desc":
      "每次打开首页、或者从别的笔记切回来，都落在阅读模式。不这样做的话，光标会掉进 clock 这类代码块里。想改首页时自己切进编辑模式即可，插件不拦。这一开关只控制首页；其他笔记由下方列表单独选择。",
    "settings.previewPaths.name": "其他默认阅读的文件与文件夹",
    "settings.previewPaths.desc": "仅在进入勾选的笔记时切到阅读模式；选文件夹会覆盖其下的 Markdown 笔记。手动切编辑不拦截，与首页开关独立。",
    "settings.previewPaths.count": "已选 {n} 项。",
    "settings.previewPaths.choose": "选择文件或文件夹",
    "settings.previewPicker.title": "默认阅读范围",
    "settings.previewPicker.hint": "勾选文件或文件夹。只保存路径，不移动文件，也不改变其他插件的文件树。",
    "settings.previewPicker.search": "搜索路径…",
    "settings.previewPicker.empty": "没有匹配的文件或文件夹",
    "settings.previewPicker.clear": "清空选择",
    "settings.previewPicker.cancel": "取消",
    "settings.previewPicker.save": "保存选择",
    "settings.hideTitle.name": "藏起首页的笔记标题",
    "settings.hideTitle.desc":
      "只隐藏首页正文顶部的文件名标题；标签页标题和其他笔记不受影响。",

    "settings.homeTools.heading": "首页组件",
    "settings.homeTools.desc":
      "按需显示首页入口和区块。纸条文字保存在首页笔记中；最近线索只读取本地笔记。",
    "settings.actionNew.name": "显示「新建笔记」",
    "settings.actionNew.desc": "在首页动作区显示新建笔记按钮。",
    "settings.actionDaily.name": "显示「今日日记」",
    "settings.actionDaily.desc": "在首页动作区显示 Obsidian 今日日记按钮。",
    "settings.actionFocus.name": "显示「专注计时」",
    "settings.actionFocus.desc": "在首页显示专注计时器入口；点击只展开并选中右侧计时器，不会自动开始倒计时。",
    "settings.actionFixed.name": "显示固定入口",
    "settings.actionFixed.desc": "显示一个由你命名、打开指定笔记的按钮。",
    "settings.fixedActionLabel.name": "固定入口文字",
    "settings.fixedActionLabel.desc": "例如「收件箱」或「课程入口」。",
    "settings.fixedActionPath.name": "固定入口路径",
    "settings.fixedActionPath.desc": "从库根目录算起的笔记路径，例如 inbox.md。",
    "settings.brief.name": "显示首页纸条",
    "settings.brief.desc":
      "显示 home-brief 代码块中的最多三行文字。只有 {{resume}} 会自动更新；其余文字需在笔记中编辑。",
    "settings.briefOutline.name": "纸条的手绘边框",
    "settings.briefOutline.desc": "用与时钟横线同样的笔触包住整张纸条；文字仍在首页笔记的 home-brief 代码块里改。",
    "settings.actionsOutline.name": "入口按钮的手绘边框",
    "settings.actionsOutline.desc": "每个入口按钮各有一圈轻淡的手绘边框；关闭后仍保留可点击的文字。",
    "settings.threads.name": "显示最近线索",
    "settings.threads.desc":
      "从本地最近修改的笔记里，按顶层文件夹各取一条，避免同一项目占满首页。",
    "settings.threadCount.name": "最近线索条数",
    "settings.threadCount.desc": "显示 1–4 条，默认 3 条。",
    "settings.threadExcludes.name": "最近线索排除路径",
    "settings.threadExcludes.desc": "每行一个文件夹路径前缀；隐藏文件夹、首页和库根笔记会自动排除。",

    "settings.note.heading": "首页手写句",
    "settings.note.desc":
      "代码块里写什么就显示什么：只写一行就是固定那一句；写多行就会每天换一句。它不计数、不累积 —— 只是一句人话。",
    "settings.noteStyle.name": "样式",
    "settings.noteStyle.desc":
      "选择纯文字、手绘引号或轻微倾斜；不会额外添加下划线。",
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
      "每行一条规则，不含 .md，不区分大小写。index 精确匹配；index* 匹配前缀；*index 匹配后缀；*index* 匹配包含该词的文件名。",
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
      "同一个手写体用在计时器阶段名、首页手写句和案头纸条。填一个 CSS font-family，多个用逗号分隔、按顺序回落；留空表示跟随正文。手绘线与边框不依赖字体。",
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

    "home.resume": "Continue",
    "home.action.new": "New note",
    "home.action.daily": "Today",
    "home.action.focus": "Focus timer",

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

    "settings.clock.heading": "Clock",
    "settings.hourFormat.name": "Hour format",
    "settings.hourFormat.desc":
      "24-hour reads 14:05; 12-hour reads 2:05 PM. This is only for the clock in your notes — the timer always counts down and is unaffected.",
    "settings.hourFormat.24": "24-hour (14:05)",
    "settings.hourFormat.12": "12-hour (2:05 PM)",
    "settings.clockSize.name": "Clock size",
    "settings.clockSize.desc": "72 px by default; scales down to the actual note-pane width when narrow.",

    "settings.home.heading": "Homepage",
    "settings.homePath.name": "Path of the homepage note",
    "settings.homePath.desc":
      "Full path from the vault root, including .md. Leave it empty to disable homepage opening, title hiding, and its reading-mode rule. Separately selected reading-mode notes are unaffected.",
    "settings.openOnStartup.name": "Open on startup",
    "settings.openOnStartup.desc": "Open that note once Obsidian has started.",
    "settings.openMode.name": "How to open it",
    "settings.openMode.desc":
      "When opening the homepage on startup, reuse the current tab or create a new one.",
    "settings.openMode.replace": "Replace the current tab",
    "settings.openMode.newTab": "Open in a new tab",
    "settings.forcePreview.name": "Always open the homepage in reading mode",
    "settings.forcePreview.desc":
      "Land in reading mode whenever you arrive at the homepage, avoiding an accidental edit inside a clock block. You can still switch to editing yourself. This switch controls the homepage only; other notes are selected separately below.",
    "settings.previewPaths.name": "Other files and folders to open in reading mode",
    "settings.previewPaths.desc": "Switch to reading mode only when entering selected notes. A selected folder covers its Markdown notes. Manual editing remains available; independent of the homepage switch.",
    "settings.previewPaths.count": "{n} selected.",
    "settings.previewPaths.choose": "Choose files or folders",
    "settings.previewPicker.title": "Reading-mode selection",
    "settings.previewPicker.hint": "Select files or folders. Only paths are saved; files and other plugins' file trees are untouched.",
    "settings.previewPicker.search": "Search paths…",
    "settings.previewPicker.empty": "No matching files or folders",
    "settings.previewPicker.clear": "Clear selection",
    "settings.previewPicker.cancel": "Cancel",
    "settings.previewPicker.save": "Save selection",
    "settings.hideTitle.name": "Hide the note title on the homepage",
    "settings.hideTitle.desc":
      "Hide only the inline filename at the top of the homepage. The tab title and other notes are unaffected.",

    "settings.homeTools.heading": "Homepage components",
    "settings.homeTools.desc":
      "Choose which entries and blocks appear. Desk-note text lives in the homepage note; recent threads read local notes only.",
    "settings.actionNew.name": "Show New note",
    "settings.actionNew.desc": "Show a new-note button in the homepage action row.",
    "settings.actionDaily.name": "Show Today",
    "settings.actionDaily.desc": "Show Obsidian's daily-note button in the homepage action row.",
    "settings.actionFocus.name": "Show Focus timer",
    "settings.actionFocus.desc": "Show the timer entry on the homepage; clicking reveals and selects the right-sidebar timer without starting it.",
    "settings.actionFixed.name": "Show a fixed entry",
    "settings.actionFixed.desc": "Show one custom-labelled button that opens a note you choose.",
    "settings.fixedActionLabel.name": "Fixed-entry label",
    "settings.fixedActionLabel.desc": "For example, Inbox or Course hub.",
    "settings.fixedActionPath.name": "Fixed-entry path",
    "settings.fixedActionPath.desc": "A note path from the vault root, such as inbox.md.",
    "settings.brief.name": "Show desk note",
    "settings.brief.desc":
      "Show up to three lines from a home-brief block. Only {{resume}} updates automatically; edit other text in the note.",
    "settings.briefOutline.name": "Hand-drawn note border",
    "settings.briefOutline.desc": "Outline the whole desk note with the same pen character as the clock stroke. Edit its text in the homepage's home-brief block.",
    "settings.actionsOutline.name": "Hand-drawn button borders",
    "settings.actionsOutline.desc": "Give each action its own faint hand-drawn border. Turning this off keeps the text actions clickable.",
    "settings.threads.name": "Show recent threads",
    "settings.threads.desc":
      "Pick one locally modified note from each top-level folder, so one project cannot fill the homepage.",
    "settings.threadCount.name": "Number of recent threads",
    "settings.threadCount.desc": "Show 1–4 threads; the default is 3.",
    "settings.threadExcludes.name": "Paths excluded from recent threads",
    "settings.threadExcludes.desc": "One folder-path prefix per line. Hidden folders, the homepage, and vault-root notes are excluded automatically.",

    "settings.note.heading": "Homepage line",
    "settings.note.desc":
      "The block shows exactly what you write in it: one line means a fixed line, several means it changes once a day. It counts nothing and accumulates nothing — it is just a sentence.",
    "settings.noteStyle.name": "Style",
    "settings.noteStyle.desc":
      "Choose plain text, drawn quotation marks, or a slight tilt. No extra underline is added.",
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
      "One case-insensitive rule per line, without .md. index matches exactly; index* matches a prefix; *index matches a suffix; *index* matches anywhere.",
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
      'One handwriting font for the timer phase name, homepage line, and desk note. Give a CSS font-family; commas fall back in order. Empty follows your body font. Drawn strokes and borders need no font.',
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
