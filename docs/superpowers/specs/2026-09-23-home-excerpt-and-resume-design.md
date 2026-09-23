# Homepage excerpt and live resume — design

## Intent and boundaries

Make the existing sparse homepage useful without turning it into a dashboard. Both additions are opt-in, local, read-only components written as Markdown code blocks. They retain Paper Desk's quiet paper style, do not change Obsidian notes or other plugins, and do not require a network connection or model quota. Existing clock, homepage reading mode, title hiding, and file-tree behavior remain untouched.

## Chosen approach

Use Obsidian's vault and metadata APIs from the existing Markdown code-block processors. This reuses the plugin's renderer lifecycle and the current recent-file algorithm. A second data store or generated homepage would duplicate vault state and make offline behavior less predictable; background rewriting of `homepage.md` is explicitly out of scope.

## `home-excerpt`

The code block accepts exactly one non-comment line containing a wiki link with a heading, for example `[[YEAR3/CSI201/Lecture 03#Summary]]`. The link is resolved relative to the homepage through Obsidian's link resolver. The block reads the referenced Markdown note and renders the first non-empty prose paragraph under the first matching heading. A heading of the same or higher level ends the section. Code fences, lists, tables, and headings are not substituted for a prose paragraph. Inline Markdown in that paragraph is rendered by Obsidian. The component shows a restrained source label and a link back to the heading; it inherits existing theme colors and typography, with no hard-coded palette or new global style.

If the source, heading, or paragraph is missing, the block renders nothing. It never changes the source note. A modification to that source refreshes the excerpt while the homepage is open. No polling or network request is used. Only one source is rendered per block, preventing an accidental feed.

## `home-brief` live resume

Within an existing `home-brief` line, the exact token `{{resume}}` replaces the line's text with the display name of the most recently opened Markdown note that is not the configured homepage. For example `继续：{{resume}}` becomes a clickable continuation link. Resolution uses the same helper as the existing `home-resume` block so the two cannot disagree. If there is no eligible note, only the token line is omitted; other brief lines remain. A literal line without the token remains unchanged. The row refreshes on relevant workspace file/leaf changes, so returning to the homepage updates it even when the Markdown view is reused. The brief keeps its existing three-line limit and hand-drawn frame.

## Isolation and lifecycle

All DOM and CSS changes stay inside Paper Desk's own code-block elements or its already-owned homepage tab marker. Subscriptions are registered through Markdown render children and removed with them. No file-tree event, drag/drop handler, body-wide selector, or other plugin data is altered. The previously identified sidebar-width alignment fix remains a separate, tested change: a ResizeObserver on the homepage view schedules one alignment calculation and is disconnected on unload.

## Verification

Start with failing render/logic tests for excerpt parsing, link resolution, paragraph boundaries, missing targets, live resume substitution/refresh, and no cross-note effects. Then implement and run syntax check, logic, i18n, render, and strict-load tests. Add English and Chinese README usage instructions, including opt-in and failure behavior. After Obsidian is closed, sync the managed files with the existing script and check its byte-for-byte verification. Live validation must cover returning to homepage, both sidebars collapsed, excerpt click-through, updated resume after opening another note, and Flexplorer still functioning. Do not claim visual completion from unit tests alone.

## Not included

No automatic content generation, scheduled pushes, persistent sticky-note database, multi-excerpt feed, new settings switch, or changes to unrelated plugins. Publishing or pushing requires separate explicit approval.
