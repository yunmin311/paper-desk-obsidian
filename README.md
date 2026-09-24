# Paper Desk

Three things on the desk: a quiet clock for the top of a note, a pomodoro timer for the
sidebar, and the homepage that ties them together.

[中文说明](#中文说明)

---

## What it does

Three parts, designed to stay out of the way.

**A clock.** Put a `clock` block at the top of any note and it renders centred: monospace
digits, a once-per-second blinking colon made of two pixel squares, and a hand-drawn stroke
underneath. An invisible colon reserves the width, so blinking never shifts the digits.

**A pomodoro timer.** A sidebar panel, the same place your calendar lives. Focus → short
break → … → long break, advancing on its own. It keeps the start *timestamp* rather than a
countdown, so closing Obsidian mid-session does not restart it.

**A homepage.** Obsidian has no homepage of its own — a "homepage" note is only a homepage if
something opens it. So this opens it, and then makes it stop behaving like a note:

- **The title.** Obsidian's switch for the inline filename title is *global*; turning it off
  changes every note in the vault. So "no title here, titles everywhere else" cannot be
  expressed in the settings. The plugin tags the view currently showing the homepage and
  scopes the rule to that tag. The tab title stays.
- **The mode.** Landing in editing mode drops the caret inside a `clock` block — one stray
  keystroke and you have edited the block rather than written anything. Arriving at the
  homepage therefore always lands in reading mode. Only *on arrival*: switch into editing
  deliberately and nothing fights you; it just returns to reading mode next time.

Both homepage behaviors are scoped to that note. **Leave the homepage path empty and this
group switches off.** The separate reading-mode file/folder list also defaults empty; if you
choose anything there, only those selected notes are affected on arrival.

Nine optional blocks can go with it. `home-note` shows exactly what you write in it — **one line
means a fixed line, several means it changes once a day** — and `home-links` builds its list
from rules. The optional helpers add a date byline, one link back to the last note, individually
switchable text actions, a short row of hand-picked links, a three-line local note, a linked
excerpt from a heading you choose, and recent notes from distinct work areas. None adds a
counter, dashboard statistic, network call, or model dependency.

## Design notes

The plugin follows a rule that is worth stating because it is what makes it portable:

> **Colours come from theme variables. Only geometry is hard-coded.**

Geometry — the square-to-digit ratio and stroke width — is the same on everyone's machine, so
writing it down is correct. Colour is not: the ink here is
`color-mix(in srgb, var(--text-normal) 92%, var(--interactive-accent) 8%)`, which means it
picks up your own accent and stays legible in light and dark themes alike. A hard-coded ink
colour would simply vanish on a dark theme.

The handwriting font is the one exception. Obsidian exposes `--font-interface`,
`--font-text` and `--font-monospace`, but has no handwriting variable — so it gets a setting,
with a cross-platform fallback stack and "empty means follow your body font".

Two deliberate smallnesses:

- The stroke under the clock is a **drawn path**, not a border. A 1px rule reads as a divider;
  a slightly uneven stroke reads as a pen mark. It carries no information, so it can never
  become noise.
- The clock stroke is the main decorative mark. Optional note and button outlines only group
  their content; they add no second accent.

## Install

Not yet in the community directory. To install manually:

1. Download `main.js`, `manifest.json` and `styles.css` from the latest release.
2. Put them in `<your vault>/.obsidian/plugins/paper-desk/`.
3. Enable **Paper Desk** in Settings → Community plugins.

## Usage

Insert a clock with the command **Paper Desk: Insert a clock block**, or type it by hand:

````
```clock
```
````

The block takes no options. Open the timer from the ribbon icon, or with
**Paper Desk: Open the focus timer**.

The two main homepage blocks can be inserted with **Insert a homepage line block** and
**Insert a homepage link block**:

````
```home-note
Take one thing to the end today
```
````

````
```home-links
```
````

`home-note` shows what you write in it: one line is a fixed line, several lines rotate once a
day. Lines starting with `#` are skipped, so a remark above the sentences stays off the page.
`home-links` takes no options — the rules live in settings.

Seven quieter helpers can be typed by hand wherever they fit your homepage:

````
```home-date
```

```home-resume
```

```home-brief
Continue: {{resume}}
Notice: a line you write yourself
```

```home-excerpt
[[Projects/Plan#Next steps]]
```

```home-actions
```

```home-threads
```

```home-pins
[[inbox|Inbox]]
[[Projects|Projects]]
```
````

`home-resume` shows the most recent non-homepage note and refreshes as you switch notes.
In `home-brief`, only `{{resume}}` updates automatically: it becomes a clickable link to that
note. Other lines are text you maintain in the code block; the plugin does not fetch or generate
them. `home-excerpt` is a separate block. Replace its example link with a note and heading in
your own vault; it reads the first prose paragraph under that heading and links back to it.
If the note, heading, or paragraph is missing, it leaves no empty frame. Neither block rewrites
your notes or needs a network connection. Every `home-actions` button has its own switch; by
default only Focus timer is on, and one custom-labelled note entry can be added.
`home-brief` shows up to three local lines. `home-threads` locally picks the newest note from
distinct top-level folders.
`home-pins` accepts one Obsidian wiki link per line; `#` comments and blank lines are ignored.
Leave any helper out and it leaves no placeholder behind.

### Settings

| Setting | Default | Notes |
|---|---|---|
| Interface language | Follow Obsidian | zh / en |
| Hour format | 24-hour | Or 12-hour, which reads 2:05 PM. Digits only — the timer always counts down. |
| Clock size | 72 px | 40–112 px; scales down automatically in a narrow note pane |
| Path of the homepage note | **empty** | Leaving it empty switches the whole homepage group off |
| Open on startup | off | Only does something once a path above is set |
| How to open it | Replace the current tab | Or open in a new tab |
| Always open the homepage in reading mode | on | Homepage rule, independent of the selected files below |
| Other files and folders to open in reading mode | empty | Pick files/folders in a searchable tree; only selected notes switch on arrival, and manual editing remains available |
| Hide the note title | on | Scoped to the homepage, not a global switch |
| Show New note | off | Independent homepage action |
| Show Today | off | Independent homepage action |
| Show Focus timer | on | Reveals and selects the right-sidebar timer; does not start it |
| Show a fixed entry | off | Custom label and note path |
| Show desk note | on | Only renders when a `home-brief` block exists |
| Hand-drawn note border | on | Toggle the frame around the whole desk note; edit its text in the `home-brief` block |
| Hand-drawn button borders | on | Toggle a separate frame around each action; action labels and paths remain configurable above |
| Show recent threads | on | Only renders when a `home-threads` block exists |
| Number of recent threads | 3 | One note per top-level folder, 1–4 total |
| Paths excluded from recent threads | empty | One folder-path prefix per line |
| Line style | Plain | Or drawn quotes, or a slight tilt |
| Line size | 24 px | Handwriting fonts read smaller than body fonts |
| File names to collect | `*Index*`, `*Hub*` | One wildcard rule per line |
| Blank space above the links | 55 | Percent of viewport height |
| Focus length | 25 min | |
| Short break | 5 min | |
| Long break | 15 min | |
| Rounds before a long break | 4 | |
| Start the break automatically | on | Off = every phase waits for you |
| Start focusing automatically | on | Same, for when a break ends |
| Tell me when a phase ends | Obsidian notice | Or "Nothing" for complete quiet |
| Play a tone when a phase ends | off | Synthesised in the browser; there is a **Preview** button |
| Show the remaining time in the status bar | off | |
| Reset the round count each day | on | |
| Show completed rounds | **off** | A running total. Off by default on purpose — see below. |
| Handwriting font | cross-platform stack | Shared by the timer phase name, homepage line, and desk note |

**One trap worth knowing about the link rules.** `github` *ends with* `hub`. So `*hub` and
`*hub*` will both collect github-flavoured notes; `hub*` and a bare `hub` will not. That is
not a bug, it is what suffix matching means.

**Why the two chaining switches are separate.** "Focus finished, start the break" and "break
finished, start focusing" are different decisions. A lot of people want the first and not
the second — they want to choose when to come back. One combined switch cannot express that,
and it happens to be the least-effort configuration.

**On the round counter.** It is off by default. A counter of "how much have I done" is a
different thing from a timer of "how long is left", and not everyone wants the first one on
a page they look at every day. Turn it on if it helps you; leave it off if it does not.

## Requirements

Obsidian 1.4.0 or later. Desktop and mobile.

The clock is capped at 19% of its note pane's width, up to the size you set. On a narrow app
window, its vertical spacing also shrinks. Desktop narrow-pane behavior has been checked;
phone layout has not been verified on a physical device.

## License

MIT — see [LICENSE](LICENSE).

---

## 中文说明

案头上的三样东西：笔记顶部一枚安静的时钟、侧栏一个专注计时器，以及把它们串起来的那个首页。
三者都刻意做得不占地方。

### 有什么

**时钟。** 在任意笔记顶部写一个 `clock` 代码块，它会居中渲染：等宽数字、一个由两个像素
方块组成并按秒亮灭的冒号、以及下方一条手绘横线。冒号是「像素」和「闪」能共存的原因——
**像素点缀本身就是那次闪烁**，而不是在时钟上另贴一块像素装饰。方块被一个不可见的真冒号
包住，所以数字的宽度永远不变，时钟不会左右抖。

**专注计时器。** 一个侧栏面板，和你的日历插件同一个位置。专注 → 短休息 → …… → 长休息，
自动接续。它存的是**开始时刻**而不是倒计时秒数，所以在会话中途关掉 Obsidian 不会把它重置。

**首页。** Obsidian 本身没有「首页」这个概念 —— 没有插件负责打开它，那它就只是一篇普通笔记。
所以这里负责打开它，并且**让它不再像一篇笔记**：

- **标题**：Obsidian 那个「显示文件名标题」的开关是**全局**的，关掉会影响库里每一篇笔记，
  所以「只在这一篇上不显示」在原生设置里表达不出来。插件给「当前正在显示首页」的那个视图
  打标记，规则只作用在这个标记上。标签页上的标题保留。
- **模式**：落在编辑模式时光标会掉进 `clock` 这类代码块里，随手打一个字就把代码块改坏了。
  所以每次**到达**首页都落在阅读模式。只在到达那一刻做 —— 你自己切进编辑模式时它不拦你，
  只是下次再到达时又回到阅读。

这两项首页行为都只作用于首页。**把首页路径留空，这一整组行为就关掉。** 另外的默认阅读
文件/文件夹列表默认也是空的；手动选了之后，也只在到达选中笔记时生效。

配套的九个可选区块都只做「位置」，不做「量」。`home-note` 显示你写进去的东西（**一行就固定，
多行就每天换一句**），`home-links` 按规则生成链接列表；可选区块再放日期落款、最近一篇非首页
笔记、可分别开关的文字动作、一小排手动固定入口、最多三行的本地纸条、一段指定标题下的笔记摘录，
以及来自不同工作区的最近笔记。没有计数、仪表盘统计、联网请求或模型依赖。

### 设计约定

有一条准则值得写出来，因为它是这个插件能落到别人机器上的原因：

> **颜色一律取主题变量；只有几何是硬编码的。**

几何——方块与字号的比例、线宽——在任何人的机器上都一样，写死是对的。
颜色不行：这里的墨色是 `color-mix(in srgb, var(--text-normal) 92%, var(--interactive-accent) 8%)`，
它会带上你自己的主色，并且在浅色和深色主题下都成立。硬编码的墨色在深色主题下会直接消失。

手写字体是唯一的例外。Obsidian 暴露了 `--font-interface` / `--font-text` / `--font-monospace`，
但没有「手写体」这个变量，所以只能给一个设置项，配一串跨平台回落，并约定「留空即跟随正文」。

另外两处刻意的克制：

- 时钟下方那条线是**画出来的**，不是 border。1px 直线会读成「分隔线」；略微不齐的笔迹
  才读成「笔迹」。它不承载任何信息，所以不会变成噪音。
- 时钟横线是页面的主笔迹。纸条和入口的细框只负责包住内容，不再增加第二种装饰符号。

### 安装

尚未上架社区目录。手动安装：

1. 从最新的 Release 下载 `main.js`、`manifest.json`、`styles.css`。
2. 放进 `<你的 vault>/.obsidian/plugins/paper-desk/`。
3. 在「设置 → 第三方插件」里启用 **Paper Desk**。

### 用法

用命令 **Paper Desk: 插入时钟代码块** 插入，或手写：

````
```clock
```
````

代码块不接受任何参数。计时器从左侧功能区的图标打开，或用命令 **Paper Desk: 打开专注计时器**。

两个主要的首页区块可以用命令 **插入首页手写句区块** 与 **插入首页链接区块**：

````
```home-note
今天先把一件事做完
```
````

````
```home-links
```
````

`home-note` 显示的就是你写进去的东西：一行固定、多行每天换一句。以 `#` 开头的行会被忽略，
所以可以在句子上面给自己留个备注，它不会显示到页面上。`home-links` 不接受参数 —— 规则在设置页里。

七个更轻的辅助区块按需要手写即可：

````
```home-date
```

```home-resume
```

```home-brief
继续：{{resume}}
留意：自己写的一条线索
```

```home-excerpt
[[Projects/Plan#Next steps]]
```

```home-actions
```

```home-threads
```

```home-pins
[[inbox|收件箱]]
[[Projects|项目]]
```
````

`home-resume` 只显示最近打开的一篇非首页笔记，切换笔记后会更新。纸条里只有 `{{resume}}`
会自动更新，并变成指向那篇笔记的可点击入口；其他行是你在代码块中维护的文字，插件不会自动抓取
或生成。`home-excerpt` 是独立区块：把示例双链改成自己库里的一篇笔记及标题，它会读取该标题下
的第一段正文，并提供返回原文的链接；笔记、标题或正文缺失时不留下空框。插件不会改写原笔记，
也不需要联网。`home-actions` 的每个按钮都有独立开关，默认只开「专注计时」，也可加一个自定义
名称与路径的固定入口。`home-brief` 最多显示三行本地文字；`home-threads` 按不同顶层文件夹挑最近笔记。
`home-pins` 每行接受一个 Obsidian 双链，也会忽略空行与 `#` 注释。不写某个区块，页面上就不会留下占位。

### 设置

| 设置项 | 默认 | 说明 |
|---|---|---|
| 界面语言 | 跟随 Obsidian | 中文 / 英文 |
| 小时制 | 24 小时 | 也可选 12 小时，读作 2:05 PM。只影响这枚钟 —— 计时器显示的始终是剩余时间 |
| 时钟字号 | 72 px | 可调 40–112 px；笔记栏变窄时自动收小 |
| 首页笔记的路径 | **空** | **留空会关掉整组首页行为** |
| 启动时打开 | 关 | 上面那个路径填了才有意义 |
| 打开方式 | 替换当前标签 | 也可在新标签页打开 |
| 首页始终用阅读模式打开 | 开 | 首页独立规则，不受下方文件选择影响 |
| 其他默认阅读的文件与文件夹 | 空 | 在可搜索文件树中勾选；仅进入选中笔记时切阅读，手动编辑不拦截 |
| 藏起首页的笔记标题 | 开 | 只作用于首页，不是全局开关 |
| 显示「新建笔记」 | 关 | 独立的首页动作 |
| 显示「今日日记」 | 关 | 独立的首页动作 |
| 显示「专注计时」 | 开 | 展开并选中右侧计时器，不自动开始倒计时 |
| 显示固定入口 | 关 | 自定义名称和笔记路径 |
| 显示首页纸条 | 开 | 只有写了 `home-brief` 区块才会显示 |
| 纸条的手绘边框 | 开 | 包住整张纸条，可独立关闭；内容仍在 `home-brief` 代码块中改 |
| 入口按钮的手绘边框 | 开 | 每个入口各有一圈，可独立关闭；动作名称与路径在上方设置中改 |
| 显示最近线索 | 开 | 只有写了 `home-threads` 区块才会显示 |
| 最近线索条数 | 3 | 每个顶层文件夹一篇，共 1–4 条 |
| 最近线索排除路径 | 空 | 每行一个文件夹路径前缀 |
| 手写句样式 | 素句 | 另有「手绘引号」「轻微倾斜」 |
| 手写句字号 | 24 px | 手写体比正文显小，默认值给得比正文大 |
| 要收进来的文件名 | `*Index*`、`*Hub*` | 每行一条通配符规则 |
| 链接上方留多少空 | 55 | 视口高度的百分比 |
| 专注时长 | 25 分钟 | |
| 短休息 | 5 分钟 | |
| 长休息 | 15 分钟 | |
| 几轮后进长休息 | 4 | |
| 专注结束后自动开始休息 | 开 | 关掉的话每段都要你自己点开始 |
| 休息结束后自动开始专注 | 开 | 同上，作用在休息之后 |
| 阶段结束时的提示 | Obsidian 提示条 | 选「不提示」就完全安静 |
| 阶段结束时响一声 | 关 | 浏览器合成，带**试听**按钮 |
| 在状态栏显示剩余时间 | 关 | |
| 跨天自动清零轮次 | 开 | |
| 显示已完成轮次 | **关闭** | 一个累计数字。刻意默认关闭，理由见下。 |
| 手写字体 | 跨平台字体栈 | 计时器阶段名、首页手写句与案头纸条**共用**这一项 |

**一个值得知道的陷阱：链接规则里的 `github`。** `github` 是**以 `hub` 结尾**的
（g-i-t-h-u-b），所以 `*hub` 和 `*hub*` 都会把它收进来；`hub*` 和裸词 `hub` 不会。
这不是 bug，是后缀匹配的必然结果。

**为什么「自动接续」是两个开关而不是一个。** 「专注完自动进休息」和「休息完自动进专注」
是两个不同的决定。很多人只想要前者，不想要后者——休息结束该由自己决定什么时候回来。
一个总开关表达不了这种组合，而它恰恰是最省心的配置。

**关于轮次计数。** 它默认是关的。「还剩多久」和「我已经做了多少」是两件事，
不是每个人都想在每天都会看一眼的页面上看到后者。有帮助就打开，没有就留着关。

### 依赖

Obsidian 1.4.0 及以上。桌面端与移动端均可用。

时钟会随笔记栏变窄，最大不超过笔记栏宽度的 19%，同时不超过设置里的字号。应用窗口较窄时，
时钟上下留白也会收小。桌面端的窄栏行为已检查；手机布局尚未在实体设备上验证。

### 许可

MIT —— 见 [LICENSE](LICENSE)。
