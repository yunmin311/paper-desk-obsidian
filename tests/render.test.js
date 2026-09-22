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
  addEventListener() {} removeEventListener() {}
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
  addEventListener() {}, removeEventListener() {},
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
const workspaceEvents = {};

const api = {
  /* Component.load() 在真机里触发 onload()。缺了这一步，所有 MarkdownRenderChild
     都不会渲染，测试会把测试台的问题报成「没有内容」—— 又是一桩测试台错觉。 */
  Component: class Component {
    constructor() { this._loaded = false; }
    load() { if (!this._loaded) { this._loaded = true; if (this.onload) this.onload(); } return this; }
    unload() { if (this._loaded) { this._loaded = false; if (this.onunload) this.onunload(); } return this; }
    onload() {} onunload() {}
    register() {} registerEvent() {} registerDomEvent() {}
    registerInterval() { return 0; }
    addChild(c) { return c && c.load ? c.load() : c; }
    removeChild(c) { return c; }
  },
  Plugin: class Plugin {
    constructor(app, manifest) { this.app = app; this.manifest = manifest; }
    async loadData() { return null; }
    async saveData() {}
    addSettingTab() {} addCommand() {} addRibbonIcon() { return new El("div"); }
    addStatusBarItem() { return new El("div"); }
    registerView() {} registerEvent() {} registerDomEvent() {}
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
  },
  metadataCache: { getFileCache: (f) => (app.__caches || {})[f.path] || null },
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
      workspaceEvents[name] = callback;
      return {};
    },
    onLayoutReady: (cb) => { app.__layoutReady = cb; },
    revealLeaf: async () => {},
    openLinkText: async () => {},
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
function text(el) { return String(el.textContent || "").trim(); }
function find(el, cls) {
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
    ["clock", "home-actions", "home-date", "home-links", "home-note", "home-pins", "home-resume"]
  );

  const plugin = new PluginClass(app, { id: "paper-desk", version: "0.4.0" });
  await plugin.onload();

  const blocks = new Map((plugin._codeBlocks || []).map(([l, fn]) => [l, fn]));

  /* 走一遍处理器：ctx.addChild → load() → onload()，与真机同一条路径 */
  function renderBlock(lang, source) {
    const fn = blocks.get(lang);
    if (!fn) return null; // 没注册就是没注册，交给断言去报
    const el = new El("div");
    const ctx = { addChild: (c) => (c && c.load ? c.load() : c) };
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
  const actionsEl = renderBlock("home-actions", "");
  const actions = actionsEl && find(actionsEl, "pd-actions");
  eq("home-actions 只有三个轻动作", actions ? actions.children.length : -1, 3);
  for (const action of actions ? actions.children : []) {
    if (typeof action.onclick === "function") action.onclick({ preventDefault() {} });
  }
  eq(
    "三个轻动作走现有命令，不自建第二套流程",
    app.__commands,
    ["file-explorer:new-file", "daily-notes", "paper-desk:open-timer"]
  );

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

  plugin.settings.hideTitle = true;
  plugin.markHomeViews();
  ok("首页那一格被打上标记", homeView.containerEl.classList.contains("pd-is-home"));
  ok("首页标签页得到独立居中标记", homeLeaf.tabHeaderEl.classList.contains("pd-is-home-tab"));
  ok("其他笔记那一格没被打标记", !otherView.containerEl.classList.contains("pd-is-home"));
  ok("其他标签页没有居中标记", !otherLeaf.tabHeaderEl.classList.contains("pd-is-home-tab"));
  ok("空那一格没被打标记", !emptyView.containerEl.classList.contains("pd-is-home"));

  // 换首页：旧的那格必须把标记退回去，否则分屏时会两边都被藏掉
  plugin.settings.homePath = "clutter/some-note.md";
  plugin.markHomeViews();
  ok("换首页后旧的那格标记被摘掉", !homeView.containerEl.classList.contains("pd-is-home"));
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
  workspaceEvents["file-open"]({ path: "homepage.md" });
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
  workspaceEvents["file-open"]({ path: "homepage.md" });
  flushAnimationFrames();
  await Promise.resolve();
  eq("首页视图尚未就位时不会误改上一页", slowlyArrivingView.getMode(), "source");
  slowlyArrivingView.file = { path: "homepage.md", basename: "homepage", extension: "md" };
  flushAnimationFrames();
  await Promise.resolve();
  await Promise.resolve();
  eq("首页晚于第一帧就位时仍会进入阅读模式", slowlyArrivingView.getMode(), "preview");

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
