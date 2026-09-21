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
      "在笔记顶部放一枚安静的时钟，在侧栏放一个专注计时器。两者都刻意做得不占地方。",

    "command.openTimer": "打开专注计时器",
    "command.toggleTimer": "开始 / 暂停计时",
    "command.resetTimer": "重置计时",
    "command.skipPhase": "跳到下一段",
    "command.insertClock": "插入时钟代码块",

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
      "用于计时器里的阶段名（专注 / 短休息 / 长休息）。填一个 CSS font-family，多个用逗号分隔、按顺序回落；留空表示跟随正文。时钟下方的笔迹是画出来的线，不依赖字体。",
    "settings.reset.name": "恢复默认设置",
    "settings.reset.desc":
      "把时长、手写字体与轮次显示都恢复初值（界面语言会保留 —— 那是设置页自身的属性，不属于插件配置）。",
  },

  en: {
    "meta.desc":
      "A quiet clock for the top of a note and a pomodoro timer for the sidebar. Both stay out of the way.",

    "command.openTimer": "Open the focus timer",
    "command.toggleTimer": "Start or pause the timer",
    "command.resetTimer": "Reset the timer",
    "command.skipPhase": "Skip to the next phase",
    "command.insertClock": "Insert a clock block",

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
      "Used for the phase name (Focus / Short break / Long break). Give a CSS font-family; commas fall back in order. Empty follows your body font. The stroke under the clock is a drawn path, so it needs no font.",
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
