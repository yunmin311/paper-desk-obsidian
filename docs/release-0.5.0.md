# Paper Desk 0.5.0

## 中文

这一版完善可选首页组件与纸质视觉，不会默认接管任何笔记：默认首页路径仍为空，启动打开默认关闭。

- 首页纸条支持实时 `{{resume}}`，显示并链接上次的非首页笔记；其他纸条文字仍由用户编辑，不依赖联网、模型额度或自动推送。
- 新增可选 `home-excerpt` 本地摘录块：读取指定标题下的第一段正文；目标缺失时不留下空框。
- 支持按工作区展示近期笔记的 `home-threads`，以及可单独开关的首页操作。专注入口打开右侧计时器，不自动开始倒计时。
- 可调时钟尺寸、完整手绘边框、统一纸条字体、窄栏布局与随笔记区域变化的标签居中；冒号恢复闪烁并尊重减少动态效果偏好。
- 改进返回首页时的阅读模式恢复，并允许为其他指定笔记或文件夹配置“到达时阅读”，不阻拦手动切回编辑。
- 修复番茄钟跨日加载异常，整理中英设置说明与 README。

验证：逻辑、双语、渲染回归及严格加载检查通过。此前已在 Windows 的实际 vault 检查首页渲染、返回阅读、纸条链接与设置页；移动端未做实机验证。

手动更新：下载 `main.js`、`manifest.json`、`styles.css`，放入 `.obsidian/plugins/paper-desk/`，然后重启或重新启用插件。请保留自己的 `data.json`；其余 JS 附件的运行内容已内联进 `main.js`。

## English

This release refines the optional homepage components and paper-like presentation. The homepage path still defaults to empty and startup opening stays off.

- Live `{{resume}}` links the desk note to the previous non-homepage note. Other desk-note text is manually editable; no network feed, model quota or automation is required.
- Optional `home-excerpt` reads the first prose paragraph beneath a linked heading, with no empty frame for a missing target.
- `home-threads` provides a local recent-work index. Homepage actions have independent switches; Focus reveals the sidebar timer without starting it.
- Adjustable clock sizing, complete drawn outlines, shared desk-note typography, narrow-pane layouts and responsive tab alignment. The blinking colon respects reduced-motion preferences.
- Improved reading mode on homepage arrival and an optional reading-on-arrival list for other notes/folders, without blocking manual editing.
- Fixed a cross-day Pomodoro startup failure and clarified bilingual settings and documentation.

Logic, localization, rendering and strict-load checks pass. Earlier live Windows checks covered homepage rendering, reading-mode return, resume links and settings. Mobile was not tested on a device.

For manual updates, install `main.js`, `manifest.json` and `styles.css` in `.obsidian/plugins/paper-desk/`, keeping your `data.json`, then restart or re-enable the plugin. Companion JS sources are already inlined into `main.js`.
