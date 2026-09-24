/**
 * paper-desk 渲染测试
 *
 * 为什么要有它：0.2.0 出过一次「首页整页空白」，而当时逻辑 / i18n / 加载三套测试
 * 全是绿的。它们没有一套看「渲染出来是什么」—— 加载测试只证明插件不抛异常、
 * 设置页铺得出字就够了，没有人检查过笔记里那三个区块真的产出过 DOM。
 * 这一层补的正是那个洞。
 *
 * 两件事：
 *   1. 三个代码块跑完处理器之后必须**真的有内容**（时钟有数字、手写句有那句话、
 *      链接有条目）。什么都不渲染在本测试里算失败。
 *   2. 首页那组行为（藏标题、强制阅读）只作用于首页。「其他笔记不受影响」
 *      是这条设计里最要紧的边界 —— 打在 body 上的写法分屏时会把另一边也藏掉，
 *      所以这里专门摆好几个 leaf 一起测。
 *
 * 跑法：node tests/render.test.js
 */

const fs = require("fs");
const path = require("path");

const MAIN = path.join(__dirname, "..", "main.js");
const src = fs.readFileSync(MAIN, "utf8");

/* ============================================================
   测试台：一套够用的 Obsidian / DOM 替身

   这一段的教训写在每一行注释里：缺桩导致的报错会伪装成插件的 bug，
   而这是这个仓库里已经中过很多次的一类错觉。
   ============================================================ */

class El {
  constructor(tag) {
    this.tagName = String(tag || "div").toUpperCase();
    this.children = [];
    this.parentNode = null;
    // 必须是「像 CSSStyleDeclaration」的对象：插件靠 body.style.setProperty
    // 下发 CSS 变量，裸 {} 会在 onload 里就炸。
    this.style = {
      _vars: {},
      setProperty(k, v) { this._vars[k] = v; this[k] = v; },
      removeProperty(k) { delete this._vars[k]; delete this[k]; },
      getPropertyValue(k) { return this._vars[k] || ""; },
    };
    this.dataset = {};
    this.attrs = {};
    this._text = "";
    this.classList = {
      _s: new Set(),
      add: (...c) => c.forEach((x) => this.classList._s.add(x)),
      remove: (...c) => c.forEach((x) => this.classList._s.delete(x)),
      toggle: (c, f) => (f ? this.classList._s.add(c) : this.classList._s.delete(c)),
      contains: (c) => this.classList._s.has(c),
    };
    this.className = "";
  }
  set textContent(v) { this._text = String(v); }
  get textContent() {
    return this._text + this.children.map((c) => c.textContent || "").join("");
  }
  appendChild(c) { c.parentNode = this; this.children.push(c); return c; }
  removeChild(c) { this.children = this.children.filter((x) => x !== c); return c; }
  remove() { if (this.parentNode) this.parentNode.removeChild(this); }
  setAttribute(k, v) {
    this.attrs[k] = String(v);
    /* 照真机那样，让 setAttribute("class", ...) 也反映到 classList 上。
       不照做的话，凡是用 setAttribute 挂类名的元素（SVG 一律这么写，
       buildStroke 那条手绘横线就是）在测试里都查不到 ——
       这会伪装成「插件没画出来」，实际是测试台的锅。 */
    if (k === "class") {
      this.classList._s.clear();
      this.className = String(v);
      String(v).split(/\s+/).forEach((c) => c && this.classList.add(c));
    }
  }
  getAttribute(k) { return this.attrs[k]; }
  addEventListener(name, callback) {
    (this._listeners = this._listeners || new Map());
    if (!this._listeners.has(name)) this._listeners.set(name, []);
    this._listeners.get(name).push(callback);
  }
  removeEventListener(name, callback) {
    if (this._listeners?.has(name)) {
      this._listeners.set(name, this._listeners.get(name).filter((fn) => fn !== callback));
    }
  }
  async fire(name) {
    for (const callback of this._listeners?.get(name) || []) await callback({ target: this });
  }
  querySelector() { return null; }
  querySelectorAll() { return []; }
  createEl(t, o) { return this.appendChild(makeEl(t, o)); }
  createDiv(o) { return this.appendChild(makeEl("div", o)); }
  createSpan(o) { return this.appendChild(makeEl("span", o)); }
  empty() { this.children = []; return this; }
  setText(v) { this._text = String(v); return this; }
  addClass(c) { this.classList.add(c); return this; }
  removeClass(c) { this.classList.remove(c); return this; }
  setAttr(k, v) { this.setAttribute(k, v); return this; }
}

function makeEl(tag, o) {
  const e = new El(tag);
  if (!o) return e;
  if (o.text !== undefined) e._text = String(o.text);
  if (o.cls) String(o.cls).split(/\s+/).forEach((c) => c && e.classList.add(c));
  if (o.href) e.attrs.href = o.href;
  return e;
}

const bodyEl = new El("body");
const documentEvents = new Map();
let nextFrameId = 1;
let animationFrames = [];
function flushAnimationFrames() {
  const queued = animationFrames.splice(0);
  for (const item of queued) item.callback();
}
globalThis.document = {
  body: bodyEl,
  documentElement: { lang: "zh", classList: bodyEl.classList },
  createElement: (t) => new El(t),
  createElementNS: (ns, t) => new El(t),
  createTextNode: (t) => { const e = new El("#text"); e._text = String(t); return e; },
  querySelector: () => null,
  querySelectorAll: () => [],
  addEventListener(name, callback) {
    if (!documentEvents.has(name)) documentEvents.set(name, new Set());
    documentEvents.get(name).add(callback);
  },
  removeEventListener(name, callback) { documentEvents.get(name)?.delete(callback); },
};
globalThis.window = {
  eval,
  document: globalThis.document,
  devicePixelRatio: 1,
  // 刻意不真的排定时器：渲染一次就够了，真排了进程不会自己退出
  setTimeout: () => 0,
  clearTimeout: () => {},
  setInterval: () => 0,
  clearInterval: () => {},
  requestAnimationFrame: (callback) => {
    const id = nextFrameId++;
    animationFrames.push({ id, callback });
    return id;
  },
  cancelAnimationFrame: (id) => {
    animationFrames = animationFrames.filter((item) => item.id !== id);
  },
  // i18n.js 的 resolveLanguage 会读它。没有这个桩，语言探测就走了
  // documentElement.lang 那条路 —— 能跑，但测的不是同一条路径。
  localStorage: { getItem: () => null, setItem: () => {} },
  addEventListener() {}, removeEventListener() {},
  createEl: (t, o) => makeEl(t, o),
  createDiv: (o) => makeEl("div", o),
  createSpan: (o) => makeEl("span", o),
  createSvg: (t) => makeEl(t),
  createFragment: () => makeEl("div"),
  setIcon: () => {},
};
globalThis.window.activeWindow = globalThis.window;
globalThis.window.activeDocument = globalThis.document;
globalThis.getComputedStyle = () => ({ getPropertyValue: () => "", fontFamily: "serif" });

/* ---- 「看起来很像真的」markdown 视图 ----
   每个视图都记着自己的 mode，好让「到底被谁切了模式」这件事可断言。 */
function makeView(viewPath) {
  const containerEl = new El("div");
  let mode = "source";
  let rerenders = 0;
  return {
    file: viewPath
      ? { path: viewPath, basename: viewPath.replace(/\.md$/, ""), extension: "md" }
      : null,
    containerEl,
    contentEl: new El("div"),
    previewMode: {
      containerEl: new El("div"),
      rerender() { rerenders++; },
      get calls() { return rerenders; },
    },
    getMode: () => mode,
    /* Obsidian 1.13.7 的 MarkdownView.setMode 接受内部 Mode 对象，不接受
       "preview" 字符串。插件一旦碰它就会破坏 currentMode。 */
    setMode: () => { throw new Error("MarkdownView.setMode must not be called with a string"); },
    _setModeForTest: (m) => { mode = m; },
  };
}

function makeLeaf(view) {
  let calls = 0;
  return {
    view,
    tabHeaderEl: new El("div"),
    getViewState() {
      return {
        type: "markdown",
        state: { file: view.file && view.file.path, mode: view.getMode(), source: false },
      };
    },
    setViewState(nextState) {
      calls++;
      view._setModeForTest(nextState.state.mode);
      return Promise.resolve();
    },
    get setViewStateCalls() { return calls; },
  };
}

let leaves = [];
const workspaceEvents = new Map();
function emitWorkspaceEvent(name, value) {
  for (const callback of [...(workspaceEvents.get(name) || [])]) callback(value);
}
const vaultEvents = new Map();
function emitVaultEvent(name, value) {
  for (const callback of [...(vaultEvents.get(name) || [])]) callback(value);
}
async function flushPromises() {
  for (let i = 0; i < 8; i++) await Promise.resolve();
}

const api = {
  /* Component.load() 在真机里触发 onload()。缺了这一步，所有 MarkdownRenderChild
     都不会渲染，测试会把测试台的问题报成「没有内容」—— 又是一桩测试台错觉。 */
  Component: class Component {
    constructor() { this._loaded = false; }
    load() { if (!this._loaded) { this._loaded = true; if (this.onload) this.onload(); } return this; }
    unload() {
      if (this._loaded) {
        this._loaded = false;
        if (this.onunload) this.onunload();
        for (const ref of this._eventRefs || []) ref.off();
      }
      return this;
    }
    onload() {} onunload() {}
    register() {} registerEvent(ref) { (this._eventRefs = this._eventRefs || []).push(ref); } registerDomEvent() {}
    registerInterval() { return 0; }
    addChild(c) { return c && c.load ? c.load() : c; }
    removeChild(c) { return c; }
  },
  Plugin: class Plugin {
    constructor(app, manifest) { this.app = app; this.manifest = manifest; }
    unload() {
      if (this.onunload) this.onunload();
      for (const ref of this._eventRefs || []) ref.off();
    }
    async loadData() { return null; }
    async saveData() {}
    addSettingTab() {} addCommand() {} addRibbonIcon() { return new El("div"); }
    addStatusBarItem() { return new El("div"); }
    registerView() {} registerEvent(ref) { (this._eventRefs = this._eventRefs || []).push(ref); } registerDomEvent() {}
    registerMarkdownPostProcessor() {} registerEditorExtension() {}
    registerInterval() { return 0; }
    registerMarkdownCodeBlockProcessor(lang, fn) {
      (this._codeBlocks = this._codeBlocks || []).push([lang, fn]);
    }
  },
  PluginSettingTab: class PluginSettingTab {
    constructor() { this.containerEl = new El("div"); }
  },
  Setting: class Setting {
    constructor(el) { this.settingEl = el || new El("div"); }
    setName() { return this; } setDesc() { return this; }
  },
  Notice: class Notice { constructor() {} hide() {} },
  Modal: class Modal {
    constructor(app) { this.app = app; this.contentEl = new El("div"); }
    open() { this.onOpen(); }
    close() { this.onClose(); }
  },
  MarkdownRenderer: {
    async render(app, markdown, el) { el.setText(markdown); },
  },
  MarkdownView: class MarkdownView {},
  TFile: class TFile {},
};
/* MarkdownRenderChild 与 ItemView 必须继承 Component。少了这一步，
   任何 `class XBlock extends MarkdownRenderChild` 会在**定义类**时就炸，
   报错长得像插件坏了。 */
api.MarkdownRenderChild = class MarkdownRenderChild extends api.Component {
  constructor(containerEl) { super(); this.containerEl = containerEl; }
};
api.ItemView = class ItemView extends api.Component {
  constructor(leaf) {
    super();
    this.leaf = leaf;
    this.containerEl = new El("div");
    this.contentEl = new El("div");
  }
};

const app = {
  vault: {
    getMarkdownFiles: () => app.__files || [],
    getAbstractFileByPath: (p) =>
      (app.__files || []).find((f) => f.path === p) || null,
    cachedRead: async (file) => (app.__notes || {})[file.path] || "",
    on: (name, callback) => {
      if (!vaultEvents.has(name)) vaultEvents.set(name, []);
      vaultEvents.get(name).push(callback);
      return { off: () => vaultEvents.set(name, (vaultEvents.get(name) || []).filter((fn) => fn !== callback)) };
    },
  },
  metadataCache: {
    getFileCache: (f) => (app.__caches || {})[f.path] || null,
    getFirstLinkpathDest: (linkpath, sourcePath) => {
      const sourceFolder = sourcePath?.includes("/") ? sourcePath.slice(0, sourcePath.lastIndexOf("/")) : "";
      const preferred = sourceFolder ? sourceFolder + "/" + linkpath + ".md" : linkpath + ".md";
      return (app.__files || []).find((file) => file.path === preferred) ||
        (app.__files || []).find((file) => file.path === linkpath + ".md") || null;
    },
  },
  commands: {
    executeCommandById: (id) => {
      (app.__commands = app.__commands || []).push(id);
      return true;
    },
  },
  workspace: {
    getActiveFile: () => app.__activeFile || null,
    getLastOpenFiles: () => app.__lastOpenFiles || [],
    getLeavesOfType: (t) => (t === "markdown" ? leaves : []),
    getRightLeaf: () => ({ view: null }),
    getLeaf: () => ({ view: null, openFile: async () => {} }),
    on: (name, callback) => {
      if (!workspaceEvents.has(name)) workspaceEvents.set(name, []);
      workspaceEvents.get(name).push(callback);
      return { off: () => workspaceEvents.set(name, (workspaceEvents.get(name) || []).filter((fn) => fn !== callback)) };
    },
    onLayoutReady: (cb) => { app.__layoutReady = cb; },
    revealLeaf: async () => {},
    openLinkText: async (path) => {
      (app.__openedLinks = app.__openedLinks || []).push(path);
    },
  },
};

/* ============================================================
   加载插件主体
   ============================================================ */

const mod = { exports: {} };
new Function("require", "module", "exports", src)(
  (name) => (name === "obsidian" ? api : undefined),
  mod,
  mod.exports
);
const PluginClass = mod.exports.default || mod.exports;

/* ============================================================
   断言
   ============================================================ */

let pass = 0;
const fails = [];
function ok(label, cond, detail) {
  if (cond) pass++;
  else fails.push(label + (detail ? "\n     " + detail : ""));
}
function eq(label, got, want) {
  const g = JSON.stringify(got);
  const w = JSON.stringify(want);
  ok(label, g === w, `得到 ${g}\n     期望 ${w}`);
}
function text(el) { return String(el?.textContent || "").trim(); }
function find(el, cls) {
  if (!el) return null;
  for (const c of el.children) {
    if (c.classList.contains(cls)) return c;
    const deeper = find(c, cls);
    if (deeper) return deeper;
  }
  return null;
}

/* ============================================================
   固定时间 —— 让「显示几点」可断言，而不是碰运气
   ============================================================ */

const RealDate = Date;
const FIXED = new RealDate(2026, 8, 22, 14, 5, 30); // 14:05:30
globalThis.Date = class extends RealDate {
  constructor(...args) {
    if (args.length === 0) super(FIXED.getTime());
    else super(...args);
  }
  static now() { return FIXED.getTime(); }
};

(async () => {
  const interruptedPlugin = new PluginClass(app, { id: "paper-desk", version: "0.4.0" });
  interruptedPlugin.loadData = async () => { throw new Error("simulated settings failure"); };
  try {
    await interruptedPlugin.onload();
  } catch (error) {
    // 这里故意让 onload 中断；要断言的是中断前已经完成了哪些注册。
  }
  eq(
    "onload 后续步骤失败时全部首页代码块仍已注册",
    (interruptedPlugin._codeBlocks || []).map(([lang]) => lang).sort(),
    ["clock", "home-actions", "home-brief", "home-date", "home-excerpt", "home-links", "home-note", "home-pins", "home-resume", "home-threads"]
  );

  /* 真机 data.json 留有昨天的 12 轮。这个分支曾把 Date.now() 数字传给
     只接受 Date 的 dayKey，导致插件在注册代码块之后、注册视图之前中断。 */
  const overnightPlugin = new PluginClass(app, { id: "paper-desk", version: "0.4.0" });
  overnightPlugin.loadData = async () => ({
    timer: { completed: 12, day: "2026-09-21" },
  });
  let overnightError = null;
  try {
    await overnightPlugin.onload();
  } catch (error) {
    overnightError = error;
  }
  ok("跨天已有轮次时插件仍能完整启动", !overnightError, overnightError && overnightError.message);
  if (!overnightError) eq("跨天已有轮次在启动时清零", overnightPlugin.timer.completed, 0);
  if (!overnightError) overnightPlugin.unload();

  const plugin = new PluginClass(app, { id: "paper-desk", version: "0.4.0" });
  await plugin.onload();

  const blocks = new Map((plugin._codeBlocks || []).map(([l, fn]) => [l, fn]));

  /* 走一遍处理器：ctx.addChild → load() → onload()，与真机同一条路径 */
  function renderBlock(lang, source, sourcePath = "homepage.md") {
    const fn = blocks.get(lang);
    if (!fn) return null; // 没注册就是没注册，交给断言去报
    const el = new El("div");
    const ctx = { sourcePath, addChild: (c) => {
      el._child = c;
      return c && c.load ? c.load() : c;
    } };
    fn(source || "", el, ctx);
    return el;
  }

  /* ============ 1. 首页区块必须真的渲染出东西 ============ */

  ok("clock 区块已注册", blocks.has("clock"));
  ok("home-note 区块已注册", blocks.has("home-note"));
  ok("home-links 区块已注册", blocks.has("home-links"));
  ok("home-date 区块已注册", blocks.has("home-date"));
  ok("home-resume 区块已注册", blocks.has("home-resume"));
  ok("home-actions 区块已注册", blocks.has("home-actions"));
  ok("home-pins 区块已注册", blocks.has("home-pins"));
  ok("home-brief 区块已注册", blocks.has("home-brief"));
  ok("home-excerpt 区块已注册", blocks.has("home-excerpt"));
  ok("home-threads 区块已注册", blocks.has("home-threads"));

  const clockEl = renderBlock("clock", "");
  const timeRow = clockEl && find(clockEl, "pd-clock-time");
  ok("clock 渲染出了时间行", !!timeRow);
  /* 钉的是「两个数字都在」，不是某一串具体字符 ——
     后者会让每次改 DOM 结构都白红一次。 */
  ok(
    "clock 显示出 14 与 05",
    !!timeRow && /14/.test(text(timeRow)) && /05/.test(text(timeRow)),
    timeRow ? `实际：${text(timeRow)}` : "(没有时间行)"
  );
  ok("clock 画出了手绘横线", !!clockEl && !!find(clockEl, "pd-clock-stroke"));
  const colonDots = find(clockEl, "pd-clock-colon-dots");
  ok("时钟冒号不被行内样式关掉旧版闪烁", !!colonDots && colonDots.children.length === 2 &&
    colonDots.children.every((dot) => dot.style.animation !== "none"));
  eq("时钟默认字号为 72px", find(clockEl, "pd-clock")?.style.getPropertyValue("--pd-clock-config-size"), "72px");
  plugin.settings.clockSize = 80;
  const largerClock = renderBlock("clock", "");
  eq("时钟字号可以独立配置", find(largerClock, "pd-clock")?.style.getPropertyValue("--pd-clock-config-size"), "80px");
  plugin.settings.clockSize = 72;

  const noteEl = renderBlock(
    "home-note",
    "# 只写一行就固定这一句；多写几行就会每天换一句\n今天先把一件事做完"
  );
  ok(
    "home-note 渲染出了那句话",
    !!noteEl && text(noteEl).includes("今天先把一件事做完"),
    noteEl ? `实际：${text(noteEl)}` : "(没有输出)"
  );
  ok("home-note 没把注释行当成正文", !!noteEl && !text(noteEl).includes("多写几行"));

  app.__files = [
    { path: "homepage.md", basename: "homepage", extension: "md" },
    { path: "year2 final2/_Year2 Final Index.md", basename: "_Year2 Final Index", extension: "md" },
    { path: "English Learning/_English Learning Hub.md", basename: "_English Learning Hub", extension: "md" },
    { path: "clutter/some-note.md", basename: "some-note", extension: "md" },
    { path: "inbox.md", basename: "inbox", extension: "md" },
    { path: "BASE.md", basename: "BASE", extension: "md" },
  ];
  app.__caches = {};
  plugin.settings.rules = ["*Index*", "*Hub*"];
  plugin.settings.homePath = "homepage.md";

  const linksEl = renderBlock("home-links", "");
  const listEl = linksEl && find(linksEl, "pd-list");
  ok("home-links 渲染出了列表", !!listEl, linksEl ? `实际：${text(linksEl)}` : "(没有输出)");
  eq("home-links 收进来两条", listEl ? listEl.children.length : -1, 2);
  ok("home-links 不含首页自己", !!listEl && !text(listEl).includes("homepage"));
  ok("home-links 收的是 hub 笔记", !!listEl && text(listEl).includes("_Year2 Final Index"));

  const dateEl = renderBlock("home-date", "");
  const dateLine = dateEl && find(dateEl, "pd-date");
  ok(
    "home-date 是轻量日期落款",
    !!dateLine && /2026/.test(text(dateLine)) && /9/.test(text(dateLine)) && /22/.test(text(dateLine)),
    dateLine ? `实际：${text(dateLine)}` : "(没有日期)"
  );

  app.__lastOpenFiles = ["homepage.md", "clutter/some-note.md", "inbox.md"];
  const resumeEl = renderBlock("home-resume", "");
  const resumeLink = resumeEl && find(resumeEl, "pd-resume-link");
  ok("home-resume 只显示一个继续入口", !!resumeLink && text(resumeLink).includes("some-note"));
  eq("home-resume 指向最近的非首页笔记", resumeLink && resumeLink.attrs.href, "clutter/some-note.md");

  app.__commands = [];
  app.__openedLinks = [];
  const actionsEl = renderBlock("home-actions", "");
  const actions = actionsEl && find(actionsEl, "pd-actions");
  ok("动作区拥有自己的窄栏容器，不改变 Obsidian 工作区", !!actionsEl && actionsEl.classList.contains("pd-actions-host"));
  eq("home-actions 默认只保留真正使用的专注入口", actions ? actions.children.filter((child) => child.tagName === "BUTTON").length : -1, 1);
  for (const action of actions ? actions.children : []) {
    if (typeof action.onclick === "function") action.onclick({ preventDefault() {} });
  }
  eq(
    "默认动作走现有专注命令，不自建第二套流程",
    app.__commands,
    ["paper-desk:open-timer"]
  );

  plugin.settings.showActionNew = true;
  plugin.settings.showActionDaily = false;
  plugin.settings.showActionFocus = true;
  plugin.settings.showActionFixed = true;
  plugin.settings.fixedActionLabel = "课程入口";
  plugin.settings.fixedActionPath = "YEAR3/CSI201/_CSI201 Index.md";
  app.__commands = [];
  app.__openedLinks = [];
  const configuredActionsEl = renderBlock("home-actions", "");
  const configuredActions = configuredActionsEl && find(configuredActionsEl, "pd-actions");
  eq("home-actions 按独立开关只渲染选中的按钮", configuredActions ? configuredActions.children.filter((child) => child.tagName === "BUTTON").length : -1, 3);
  ok("三个动作各有自己的闭合手绘包边", !!configuredActions && configuredActions.children.filter((child) => child.tagName === "BUTTON").every((button) => {
    const frame = find(button, "pd-action-frame");
    return !!frame && /[zZ]\s*$/.test(frame.children[0]?.attrs.d || "");
  }));
  ok("固定入口使用设置里的名称", !!configuredActions && text(configuredActions).includes("课程入口"));
  for (const action of configuredActions ? configuredActions.children : []) {
    if (typeof action.onclick === "function") action.onclick({ preventDefault() {} });
  }
  eq("启用的内置动作仍走原命令", app.__commands, ["file-explorer:new-file", "paper-desk:open-timer"]);
  eq("固定入口打开设置里的笔记", app.__openedLinks, ["YEAR3/CSI201/_CSI201 Index.md"]);

  /* 专注动作不能只证明命令被调用：右侧已有计时器但侧栏收起时，
     必须等它真正显示，再让该页签成为当前焦点；不能重建或启动倒计时。 */
  const originalGetLeaves = app.workspace.getLeavesOfType;
  const originalGetRightLeaf = app.workspace.getRightLeaf;
  const originalRevealLeaf = app.workspace.revealLeaf;
  const originalSetActiveLeaf = app.workspace.setActiveLeaf;
  const timerLeaf = { view: { getViewType: () => "paper-desk-timer" } };
  let sidebarVisible = false;
  let timerWasFocused = false;
  let createdTimerLeaves = 0;
  app.workspace.getLeavesOfType = (type) =>
    type === "paper-desk-timer" ? [timerLeaf] : originalGetLeaves(type);
  app.workspace.getRightLeaf = () => { createdTimerLeaves++; return null; };
  app.workspace.revealLeaf = async (leaf) => {
    await Promise.resolve();
    sidebarVisible = leaf === timerLeaf;
  };
  app.workspace.setActiveLeaf = (leaf, options) => {
    timerWasFocused = sidebarVisible && leaf === timerLeaf && options?.focus === true;
  };
  await plugin.activateView();
  ok("专注入口展开右侧栏并选中已有计时器", sidebarVisible && timerWasFocused);
  eq("专注入口不创建重复计时器", createdTimerLeaves, 0);
  eq("打开计时器不启动倒计时", plugin.timer.running, false);

  const newTimerLeaf = {
    view: null,
    async setViewState(next) {
      if (next.type === "paper-desk-timer") this.view = { getViewType: () => next.type };
    },
  };
  app.workspace.getLeavesOfType = (type) =>
    type === "paper-desk-timer" ? [] : originalGetLeaves(type);
  app.workspace.getRightLeaf = () => { createdTimerLeaves++; return newTimerLeaf; };
  sidebarVisible = false;
  timerWasFocused = false;
  app.workspace.revealLeaf = async (leaf) => {
    sidebarVisible = leaf === newTimerLeaf && leaf.view?.getViewType() === "paper-desk-timer";
  };
  app.workspace.setActiveLeaf = (leaf, options) => {
    timerWasFocused = sidebarVisible && leaf === newTimerLeaf && options?.focus === true;
  };
  await plugin.activateView();
  ok("尚无计时器时在右侧创建并显示它", sidebarVisible && timerWasFocused);
  eq("尚无计时器时只创建一个", createdTimerLeaves, 1);
  app.workspace.getLeavesOfType = originalGetLeaves;
  app.workspace.getRightLeaf = originalGetRightLeaf;
  app.workspace.revealLeaf = originalRevealLeaf;
  app.workspace.setActiveLeaf = originalSetActiveLeaf;

  plugin.settings.showBrief = true;
  const briefEl = renderBlock(
    "home-brief",
    "# Codex 有内容时才更新\n继续：把 Paper Desk 收口\n发现：课程与项目可以并行接续\n收口：确认首页视觉\n第四条：不该出现"
  );
  ok("纸条拥有自己的窄栏容器，不修改其他插件的刻度", !!briefEl && briefEl.classList.contains("pd-brief-host"));
  const brief = briefEl && find(briefEl, "pd-brief");
  eq("案头投递只显示三条并忽略注释", brief ? brief.children.filter((child) => child.classList.contains("pd-brief-line")).length : -1, 3);
  ok("案头投递保留标签与内容", !!brief && text(brief).includes("继续") && text(brief).includes("把 Paper Desk 收口"));
  ok("案头投递不把第四条挤进首页", !!brief && !text(brief).includes("第四条"));
  ok("案头投递默认有完整手绘边框", !!brief && brief.classList.contains("pd-brief-outlined"));
  const briefFrame = brief && find(brief, "pd-brief-frame");
  ok("纸条边框是包住三行的闭合路径，而不是底下一条线", !!briefFrame && /[zZ]\s*$/.test(briefFrame.children[0]?.attrs.d || "") && !find(brief, "pd-brief-stroke"));
  plugin.settings.briefOutline = false;
  const plainBrief = find(renderBlock("home-brief", "继续：还在纸上"), "pd-brief");
  ok("案头投递边框可单独关闭", !!plainBrief && !plainBrief.classList.contains("pd-brief-outlined"));
  ok("关闭纸条边框后不渲染边框", !!plainBrief && !find(plainBrief, "pd-brief-frame"));
  plugin.settings.briefOutline = true;
  ok("动作区默认启用各按钮手绘包边", !!actions && actions.classList.contains("pd-actions-outlined"));
  ok("单个动作有闭合包边且整排没有共用底线", !!actions && !!find(actions.children[0], "pd-action-frame") && !find(actions, "pd-actions-stroke"));
  plugin.settings.actionsOutline = false;
  const plainActions = find(renderBlock("home-actions", ""), "pd-actions");
  ok("动作区手绘包边可单独关闭", !!plainActions && !plainActions.classList.contains("pd-actions-outlined"));
  ok("关闭动作包边后只留下文字入口", !!plainActions && !find(plainActions, "pd-action-frame"));
  plugin.settings.actionsOutline = true;

  app.__files = [
    { path: "homepage.md", basename: "homepage", extension: "md", stat: { mtime: 999 } },
    { path: ".workbuddy/memory/today.md", basename: "today", extension: "md", stat: { mtime: 998 } },
    { path: "clutter/debug.md", basename: "debug", extension: "md", stat: { mtime: 997 } },
    { path: "YEAR3/CSI201/Lecture 03.md", basename: "Lecture 03", extension: "md", stat: { mtime: 900 } },
    { path: "YEAR3/EEE211/Tutorial 03.md", basename: "Tutorial 03", extension: "md", stat: { mtime: 850 } },
    { path: "project/creative-os-notes/README.md", basename: "README", extension: "md", stat: { mtime: 800 } },
    { path: "Compound Interest/Aesthetic/FACE.md", basename: "FACE", extension: "md", stat: { mtime: 700 } },
  ];
  plugin.settings.showThreads = true;
  plugin.settings.threadCount = 3;
  plugin.settings.threadExcludes = ["clutter"];
  const threadsEl = renderBlock("home-threads", "");
  const threads = threadsEl && find(threadsEl, "pd-threads");
  eq("最近线索从不同工作区域各取一条", threads ? threads.children.length : -1, 3);
  ok("最近线索包含课程、项目与审美区域", !!threads && text(threads).includes("YEAR3") && text(threads).includes("project") && text(threads).includes("Compound Interest"));
  ok("最近线索过滤隐藏目录、首页和排除项", !!threads && !text(threads).includes("workbuddy") && !text(threads).includes("debug") && !text(threads).includes("homepage"));

  const pinsEl = renderBlock(
    "home-pins",
    "# 一行一个 Obsidian 链接\n[[inbox|收件箱]]\n[[BASE]]"
  );
  const pins = pinsEl && find(pinsEl, "pd-pins");
  eq("home-pins 渲染两条手动入口", pins ? pins.children.length : -1, 2);
  ok("home-pins 使用别名并忽略注释", !!pins && text(pins).includes("收件箱") && !text(pins).includes("一行一个"));

  /* ============ 2. 藏标题：只打在显示首页的那一格 ============ */

  const homeView = makeView("homepage.md");
  const otherView = makeView("clutter/some-note.md");
  const emptyView = makeView(null); // 空的那一格：新标签、还没打开文件
  const homeLeaf = makeLeaf(homeView);
  const otherLeaf = makeLeaf(otherView);
  const emptyLeaf = makeLeaf(emptyView);
  leaves = [homeLeaf, otherLeaf, emptyLeaf];

  // The tab strip and the view header can have different centers under a theme.
  // Align the homepage tab to the visible filename, not merely within its own tab.
  let homeTabResizeObserver = null;
  globalThis.ResizeObserver = class {
    constructor(callback) { this.callback = callback; homeTabResizeObserver = this; }
    observe(element) { this.observed = element; }
    disconnect() { this.observed = null; }
  };
  homeLeaf.parent = { children: [homeLeaf] };
  homeLeaf.tabHeaderInnerTitleEl = new El("div");
  homeLeaf.tabHeaderInnerTitleEl.getBoundingClientRect = () => ({ left: 130, right: 210 });
  const homeHeaderTitle = new El("div");
  let homeHeaderCenter = 260;
  homeHeaderTitle.getBoundingClientRect = () => ({ left: homeHeaderCenter - 40, right: homeHeaderCenter + 40 });
  homeView.containerEl.querySelector = (selector) =>
    selector === ".view-header-title" ? homeHeaderTitle : null;

  plugin.settings.hideTitle = true;
  plugin.markHomeViews();
  flushAnimationFrames();
  ok("首页那一格被打上标记", homeView.containerEl.classList.contains("pd-is-home"));
  ok("首页标签页得到独立居中标记", homeLeaf.tabHeaderEl.classList.contains("pd-is-home-tab"));
  eq("首页标签文字对齐视图标题的中心", homeLeaf.tabHeaderEl.style.getPropertyValue("--pd-home-tab-offset"), "90px");
  homeHeaderCenter = 350; // sidebars collapse: pane moves without a window resize
  if (homeTabResizeObserver) homeTabResizeObserver.callback();
  flushAnimationFrames();
  eq("侧栏收起改变笔记栏宽度后仍重新对齐", homeLeaf.tabHeaderEl.style.getPropertyValue("--pd-home-tab-offset"), "180px");
  ok("其他笔记那一格没被打标记", !otherView.containerEl.classList.contains("pd-is-home"));
  ok("其他标签页没有居中标记", !otherLeaf.tabHeaderEl.classList.contains("pd-is-home-tab"));
  eq("其他标签页没有位移", otherLeaf.tabHeaderEl.style.getPropertyValue("--pd-home-tab-offset"), "");
  ok("空那一格没被打标记", !emptyView.containerEl.classList.contains("pd-is-home"));

  // 换首页：旧的那格必须把标记退回去，否则分屏时会两边都被藏掉
  plugin.settings.homePath = "clutter/some-note.md";
  plugin.markHomeViews();
  flushAnimationFrames();
  ok("换首页后旧的那格标记被摘掉", !homeView.containerEl.classList.contains("pd-is-home"));
  eq("离开首页后标签位移被清除", homeLeaf.tabHeaderEl.style.getPropertyValue("--pd-home-tab-offset"), "");
  ok("换首页后新的首页被打上标记", otherView.containerEl.classList.contains("pd-is-home"));

  /* ============ 3. 整组关闭：路径为空时什么都不做 ============ */

  plugin.settings.homePath = "";
  plugin.markHomeViews();
  ok("路径留空时那一格没有标记", !homeView.containerEl.classList.contains("pd-is-home"));
  ok("路径留空时其他笔记也没有标记", !otherView.containerEl.classList.contains("pd-is-home"));

  plugin.settings.hideTitle = false;
  plugin.settings.homePath = "homepage.md";
  plugin.markHomeViews();
  ok("关掉藏标题就不打标记（即使路径填着）", !homeView.containerEl.classList.contains("pd-is-home"));
  ok("不藏标题时首页标签仍保持居中标记", homeLeaf.tabHeaderEl.classList.contains("pd-is-home-tab"));
  plugin.settings.hideTitle = true;

  /* ============ 4. 强制阅读：同样只动首页 ============ */

  plugin.settings.forcePreview = true;
  plugin.settings.homePath = "homepage.md";
  homeView._setModeForTest("source");
  otherView._setModeForTest("source");
  emptyView._setModeForTest("source");

  await plugin.enforcePreview({ path: "homepage.md" });
  eq("到达首页落到阅读模式", homeView.getMode(), "preview");
  eq("其他笔记的模式没被动过", otherView.getMode(), "source");
  eq("空那一格的模式没被动过", emptyView.getMode(), "source");

  await plugin.enforcePreview({ path: "clutter/some-note.md" });
  eq("去别的笔记时那一格不被强制阅读", otherView.getMode(), "source");
  eq("首页那一格保持刚才的阅读模式", homeView.getMode(), "preview");

  homeView._setModeForTest("source");
  plugin.settings.forcePreview = false;
  await plugin.enforcePreview({ path: "homepage.md" });
  eq("关掉强制阅读后不再切模式", homeView.getMode(), "source");

  /* 真机的 leaf.setViewState 在 Promise 落定前仍可能让 getMode() 报 source，
     期间又触发一次 file-open。重入保护必须覆盖完整的异步窗口。 */
  const asyncHomeView = makeView("homepage.md");
  const asyncHomeLeaf = makeLeaf(asyncHomeView);
  const setViewStateImmediately = asyncHomeLeaf.setViewState.bind(asyncHomeLeaf);
  const pendingModeChanges = [];
  let asyncSetViewStateCalls = 0;
  asyncHomeLeaf.setViewState = (state, options) => {
    asyncSetViewStateCalls++;
    return new Promise((resolve) => {
      pendingModeChanges.push(() => {
        setViewStateImmediately(state, options).then(resolve);
      });
    });
  };
  leaves = [asyncHomeLeaf];
  plugin.settings.forcePreview = true;

  const firstForce = plugin.enforcePreview({ path: "homepage.md" });
  plugin.enforcePreview({ path: "homepage.md" });
  eq("setViewState 未落定时的重复 file-open 不会再次切模式", asyncSetViewStateCalls, 1);

  for (const settle of pendingModeChanges.splice(0)) settle();
  await firstForce;
  asyncHomeView._setModeForTest("source");
  const secondForce = plugin.enforcePreview({ path: "homepage.md" });
  eq("上一次 setViewState 落定后允许下一次到达首页", asyncSetViewStateCalls, 2);
  for (const settle of pendingModeChanges.splice(0)) settle();
  await secondForce;

  /* file-open 在真机里可能先于 leaf.view.file 更新。事件当场处理会看见旧文件，
     于是“从别处回到首页”漏掉；下一帧再处理才是稳定状态。 */
  const arrivingView = makeView("clutter/some-note.md");
  const arrivingLeaf = makeLeaf(arrivingView);
  arrivingView._setModeForTest("source");
  leaves = [arrivingLeaf];
  app.__activeFile = { path: "homepage.md" };
  emitWorkspaceEvent("file-open", { path: "homepage.md" });
  arrivingView.file = { path: "homepage.md", basename: "homepage", extension: "md" };
  flushAnimationFrames();
  await Promise.resolve();
  await Promise.resolve();
  eq("file-open 早于视图更新时仍会在下一帧进入阅读模式", arrivingView.getMode(), "preview");

  /* 真机比这个更慢：file-open 之后第一帧里 leaf.view 仍可能是上一篇。
     生产代码如果只等固定一帧，这条就会保持 source，正是本次截图里的回归。 */
  const slowlyArrivingView = makeView("clutter/some-note.md");
  const slowlyArrivingLeaf = makeLeaf(slowlyArrivingView);
  slowlyArrivingView._setModeForTest("source");
  leaves = [slowlyArrivingLeaf];
  app.__activeFile = { path: "homepage.md" };
  emitWorkspaceEvent("file-open", { path: "homepage.md" });
  flushAnimationFrames();
  await Promise.resolve();
  eq("首页视图尚未就位时不会误改上一页", slowlyArrivingView.getMode(), "source");
  slowlyArrivingView.file = { path: "homepage.md", basename: "homepage", extension: "md" };
  flushAnimationFrames();
  await Promise.resolve();
  await Promise.resolve();
  eq("首页晚于第一帧就位时仍会进入阅读模式", slowlyArrivingView.getMode(), "preview");
  for (let i = 0; i < 6; i++) await Promise.resolve();

  /* 实机又出现更晚的一步：第一次强制阅读已经执行，Obsidian 的打开流程
     随后恢复了旧的 source 状态，并触发 active-leaf-change。只等视图就位
     仍然太早；这次到达首页必须在恢复后补上阅读模式。 */
  const restoredView = makeView("homepage.md");
  const restoredLeaf = makeLeaf(restoredView);
  leaves = [restoredLeaf];
  app.workspace.activeLeaf = restoredLeaf;
  app.__activeFile = { path: "homepage.md" };
  emitWorkspaceEvent("file-open", { path: "homepage.md" });
  flushAnimationFrames();
  for (let i = 0; i < 6; i++) await Promise.resolve();
  eq("首次到达先尝试阅读模式", restoredView.getMode(), "preview");
  restoredView._setModeForTest("source");
  emitWorkspaceEvent("active-leaf-change", restoredLeaf);
  for (let i = 0; i < 6; i++) await Promise.resolve();
  flushAnimationFrames();
  for (let i = 0; i < 6; i++) await Promise.resolve();
  eq("Obsidian 晚恢复 source 后仍回到阅读模式", restoredView.getMode(), "preview");

  restoredView._setModeForTest("source");
  emitWorkspaceEvent("active-leaf-change", restoredLeaf);
  flushAnimationFrames();
  await Promise.resolve();
  eq("同一篇手动切编辑后不被反复弹回", restoredView.getMode(), "source");

  const editedView = makeView("homepage.md");
  const editedLeaf = makeLeaf(editedView);
  leaves = [editedLeaf];
  app.workspace.activeLeaf = editedLeaf;
  emitWorkspaceEvent("file-open", { path: "homepage.md" });
  flushAnimationFrames();
  for (let i = 0; i < 6; i++) await Promise.resolve();
  editedView._setModeForTest("source");
  for (const callback of documentEvents.get("pointerdown") || []) callback();
  emitWorkspaceEvent("active-leaf-change", editedLeaf);
  for (let i = 0; i < 6; i++) await Promise.resolve();
  flushAnimationFrames();
  eq("到达后立即手动编辑也不会被补做券弹回", editedView.getMode(), "source");

  /* 指定阅读的笔记与首页是独立配置：只改到达的那一格。 */
  const selectedView = makeView("Reading/essay.md");
  const selectedLeaf = makeLeaf(selectedView);
  const siblingView = makeView("inbox.md");
  const siblingLeaf = makeLeaf(siblingView);
  leaves = [selectedLeaf, siblingLeaf];
  app.workspace.activeLeaf = selectedLeaf;
  app.__activeFile = { path: "Reading/essay.md" };
  plugin.settings.forcePreview = false;
  plugin.settings.previewPaths = ["Reading"];
  emitWorkspaceEvent("file-open", { path: "Reading/essay.md" });
  flushAnimationFrames();
  for (let i = 0; i < 6; i++) await Promise.resolve();
  eq("选中文件夹里的笔记在到达时进入阅读模式", selectedView.getMode(), "preview");
  eq("分屏另一侧未选中的笔记不被改模式", siblingView.getMode(), "source");
  const duplicateView = makeView("Reading/essay.md");
  const duplicateLeaf = makeLeaf(duplicateView);
  leaves = [duplicateLeaf, selectedLeaf, siblingLeaf];
  selectedView._setModeForTest("source");
  await plugin.enforcePreview({ path: "Reading/essay.md" });
  eq("同一笔记在另一分屏中也不被连带切模式", duplicateView.getMode(), "source");
  eq("只切换当前到达的叶片", selectedView.getMode(), "preview");
  selectedView._setModeForTest("source");
  emitWorkspaceEvent("active-leaf-change", selectedLeaf);
  flushAnimationFrames();
  await Promise.resolve();
  eq("选中笔记手动切编辑后不被弹回", selectedView.getMode(), "source");

  emitWorkspaceEvent("file-open", { path: "Reading/essay.md" });
  flushAnimationFrames();
  for (let i = 0; i < 6; i++) await Promise.resolve();
  selectedView._setModeForTest("source");
  emitWorkspaceEvent("active-leaf-change", selectedLeaf);
  for (let i = 0; i < 6; i++) await Promise.resolve();
  flushAnimationFrames();
  for (let i = 0; i < 6; i++) await Promise.resolve();
  eq("选中笔记在 Obsidian 晚恢复编辑模式后仍进阅读", selectedView.getMode(), "preview");
  selectedView._setModeForTest("source");

  plugin.settings.previewPaths = [];
  emitWorkspaceEvent("file-open", { path: "Reading/essay.md" });
  flushAnimationFrames();
  await Promise.resolve();
  eq("移除指定阅读后不再接管这篇笔记", selectedView.getMode(), "source");

  /* 从真正的主文件提取选择窗口：测试树形选择和写回路径，不复制实现。 */
  const pickerFrom = src.indexOf("class PreviewPathsModal extends Modal");
  const pickerTo = src.indexOf("class PaperDeskSettingTab", pickerFrom);
  ok("阅读范围选择窗口存在", pickerFrom > 0 && pickerTo > pickerFrom);
  const Picker = new Function("Modal", "CSS_PREFIX",
    src.slice(pickerFrom, pickerTo) + "\nreturn PreviewPathsModal;")(api.Modal, "pd-");
  const folder = { path: "Reading", name: "Reading", children: [] };
  const file = { path: "Reading/essay.md", name: "essay.md", extension: "md" };
  folder.children.push(file);
  app.vault.getAllLoadedFiles = () => [folder, file];
  const picker = new Picker(app, plugin, null);
  picker.open();
  const tree = find(picker.contentEl, "pd-preview-tree");
  eq("选择窗口初始只展开顶层文件夹", tree?.children.length, 1);
  const folderRow = tree?.children[0];
  folderRow.children[1].checked = true;
  await folderRow.children[1].fire("change");
  const footer = find(picker.contentEl, "pd-preview-picker-footer");
  await footer.children[2].fire("click");
  eq("勾选文件夹只保存本插件的路径列表", plugin.settings.previewPaths, ["Reading"]);
  plugin.settings.previewPaths = [];

  /* ============ 5. 12 小时制真的落到界面上 ============ */

  plugin.settings.forcePreview = true;
  plugin.settings.hourFormat = "12";
  const clock12 = renderBlock("clock", "");
  const row12 = clock12 && find(clock12, "pd-clock-time");
  const meridiem = row12 && find(row12, "pd-clock-meridiem");
  ok(
    "12 小时制下出现了上下午标记",
    !!meridiem && /AM|PM/.test(text(meridiem)),
    meridiem ? `实际：${text(meridiem)}` : "(没有标记节点)"
  );
  ok("12 小时制下 14 点读作 2", !!row12 && /^2/.test(text(row12)),
     row12 ? `实际：${text(row12)}` : "(没有时间行)");

  plugin.settings.hourFormat = "24";
  const clock24 = renderBlock("clock", "");
  const row24 = clock24 && find(clock24, "pd-clock-time");
  const meridiem24 = row24 && find(row24, "pd-clock-meridiem");
  ok(
    "24 小时制下标记为空串（CSS 的 :empty 会把它整块拿掉）",
    !!meridiem24 && text(meridiem24) === "",
    meridiem24 ? `实际："${text(meridiem24)}"` : "(没有标记节点)"
  );

  /* 动态纸条事件放在首页到达测试之后，避免测试用的文件切换影响模式断言。 */
  app.__files = [
    { path: "homepage.md", basename: "homepage", extension: "md" },
    { path: "clutter/some-note.md", basename: "some-note", extension: "md" },
    { path: "inbox.md", basename: "inbox", extension: "md" },
  ];
  app.__lastOpenFiles = ["homepage.md", "clutter/some-note.md"];
  const liveBrief = renderBlock("home-brief", "继续：{{resume}}\n留意：原样保留");
  const liveResume = renderBlock("home-resume", "");
  eq("纸条继续指向最近非首页", find(liveBrief, "pd-brief-resume-link")?.attrs.href, "clutter/some-note.md");
  app.__lastOpenFiles = ["homepage.md", "inbox.md"];
  emitWorkspaceEvent("file-open", { path: "homepage.md" });
  eq("返回首页后继续入口刷新", find(liveBrief, "pd-brief-resume-link")?.attrs.href, "inbox.md");
  eq("独立继续区块与纸条始终指向同一篇", find(liveResume, "pd-resume-link")?.attrs.href, "inbox.md");
  app.__openedLinks = [];
  find(liveBrief, "pd-brief-resume-link")?.onclick?.({ preventDefault() {} });
  eq("纸条继续入口打开最近笔记", app.__openedLinks, ["inbox.md"]);
  const longRecentName = "Lecture 04 - Transformation Pipeline and Geometric Transformations";
  app.__files.push({ path: `YEAR3/${longRecentName}.md`, basename: longRecentName, extension: "md" });
  app.__lastOpenFiles = ["homepage.md", `YEAR3/${longRecentName}.md`];
  emitWorkspaceEvent("file-open", { path: "homepage.md" });
  eq("长标题省略时仍能查看完整笔记名", find(liveBrief, "pd-brief-resume-link")?.attrs.title, longRecentName);
  app.__lastOpenFiles = ["homepage.md", "deleted.md"];
  emitWorkspaceEvent("active-leaf-change", null);
  ok("无有效继续目标时只保留普通行", !find(liveBrief, "pd-brief-resume-link") && text(liveBrief).includes("原样保留"));

  const sourceFile = { path: "folder/note.md", basename: "note", extension: "md" };
  const otherSameName = { path: "note.md", basename: "note", extension: "md" };
  app.__files = [sourceFile, otherSameName, ...app.__files];
  app.__notes = {
    "folder/note.md": "# Course\n## Summary\n\n第一段 **正文**\n\n第二段不取\n## Next\n别的章节",
    "note.md": "## Summary\n\n错误的同名笔记",
  };
  app.__caches = {
    "folder/note.md": { headings: [
      { heading: "Summary", level: 2, position: { start: { line: 1 } } },
      { heading: "Next", level: 2, position: { start: { line: 5 } } },
    ] },
    "note.md": { headings: [{ heading: "Summary", level: 2, position: { start: { line: 0 } } }] },
  };
  const excerptEl = renderBlock("home-excerpt", "[[note#Summary]]", "folder/homepage.md");
  await flushPromises();
  ok("摘录显示目标标题下首段", text(excerptEl).includes("第一段 **正文**") && !text(excerptEl).includes("第二段不取"));
  ok("同名笔记按首页位置解析", !text(excerptEl).includes("错误的同名笔记"));
  eq("摘录可回到原文标题", find(excerptEl, "pd-excerpt-source")?.attrs.href, "folder/note.md#Summary");
  app.__openedLinks = [];
  find(excerptEl, "pd-excerpt-source")?.onclick?.({ preventDefault() {} });
  eq("来源入口打开原文标题", app.__openedLinks, ["folder/note.md#Summary"]);
  const savedCache = app.__caches["folder/note.md"];
  app.__caches["folder/note.md"] = null;
  const uncachedExcerpt = renderBlock("home-excerpt", "[[note#Summary]]", "folder/homepage.md");
  await flushPromises();
  ok("标题缓存尚未就绪时仍从有效原文摘录", text(uncachedExcerpt).includes("第一段 **正文**"));
  uncachedExcerpt?._child?.unload();
  app.__caches["folder/note.md"] = savedCache;
  ok("缺标题双链不留空框", !find(renderBlock("home-excerpt", "[[note]]", "folder/homepage.md"), "pd-excerpt"));
  ok("两条来源不擅自选一条", !find(renderBlock("home-excerpt", "[[note#Summary]]\n[[other#Summary]]", "folder/homepage.md"), "pd-excerpt"));
  ok("缺失来源不留空框", !find(renderBlock("home-excerpt", "[[missing#Summary]]", "folder/homepage.md"), "pd-excerpt"));
  const missingHeading = renderBlock("home-excerpt", "[[note#Missing]]", "folder/homepage.md");
  await flushPromises();
  ok("缺失标题不显示其他章节", !find(missingHeading, "pd-excerpt"));

  app.__notes["folder/note.md"] = "## Summary\n\n修改后的正文";
  app.__caches["folder/note.md"].headings = [{ heading: "Summary", level: 2, position: { start: { line: 0 } } }];
  emitVaultEvent("modify", sourceFile);
  await flushPromises();
  ok("来源笔记修改后摘录局部更新", text(excerptEl).includes("修改后的正文"));
  app.__notes["folder/note.md"] = "# New\n前言\n## Summary\n\n移动标题后的正文";
  emitVaultEvent("modify", sourceFile); // 模拟正文先更新、标题元数据稍后更新
  await flushPromises();
  ok("标题行号缓存尚未更新也不会摘到错误段落", text(excerptEl).includes("移动标题后的正文") && !text(excerptEl).includes("前言"));
  excerptEl._child?.unload();
  missingHeading._child?.unload();

  const originalCachedRead = app.vault.cachedRead;
  const reads = [];
  app.vault.cachedRead = () => new Promise((resolve) => reads.push(resolve));
  const racingExcerpt = renderBlock("home-excerpt", "[[note#Summary]]", "folder/homepage.md");
  emitVaultEvent("modify", sourceFile);
  eq("快速修改会启动两次独立读取", reads.length, 2);
  if (reads.length >= 2) {
    reads[1]("## Summary\n\n新版本");
    await flushPromises();
    reads[0]("## Summary\n\n旧版本");
    await flushPromises();
  }
  ok("较旧异步读取不能覆盖新摘录", text(racingExcerpt).includes("新版本") && !text(racingExcerpt).includes("旧版本"));
  app.vault.cachedRead = originalCachedRead;

  globalThis.Date = RealDate;

  /* ============ 结果 ============ */

  if (fails.length) {
    console.error(`\n✗ ${pass} 通过 / ${fails.length} 失败\n`);
    for (const f of fails) console.error("  " + f + "\n");
    process.exit(1);
  }
  console.log(`\n✓ ${pass} 通过 / 0 失败`);
})().catch((e) => {
  console.error("\n✗ 渲染测试崩了 —— 先怀疑测试台，再看插件\n");
  console.error(e);
  process.exit(1);
});
