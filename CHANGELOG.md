# Changelog

## 0.4.0

**The homepage is a quiet front page again: it opens safely, returns to reading mode, and
adds four optional, deliberately low-key pieces of context.**

The lock-up behind the 0.3.1 failure is now proven rather than guessed. The plugin passed
the string `"preview"` to Obsidian's private `MarkdownView.setMode()` method, but that method
expects an internal mode object. The call replaced `currentMode` with a string; Obsidian
then failed on `show`, `onResize`, and `getEphemeralState`, leaving the homepage blank and
making every other note appear unclickable. The fix uses the public leaf-state path:
`getViewState()` → set `state.mode` → `setViewState()`.

Returning to the homepage also had a separate timing edge. `file-open` can arrive several
animation frames before the leaf's view has finished adopting the new file, so the homepage
check now waits for the actual target view, with a short bounded retry instead of assuming
one frame is enough. The protection remains arrival-only:
switching the homepage to editing mode by hand is still allowed until the next visit.

The homepage tab gets its own scoped marker so its title is centred independently of the
close button. Nothing is hidden by that rule, and no other tab is changed.

Four optional code blocks add only orientation and entry points — no cards, counters,
statistics, or second decorative system:

- `home-date`: a small date byline;
- `home-resume`: one link to the most recent non-homepage note;
- `home-actions`: three text actions for a new note, today's note, and the focus timer;
- `home-pins`: a short, manually curated row of wiki links.

The renderer suite now covers 49 cases, including the original private-mode corruption,
multi-frame `file-open`, title scoping, all seven homepage processors, and the new restrained
components. The auxiliary controls also share one paper-label treatment with deliberate
spacing instead of inheriting Obsidian's cramped default buttons.

## 0.3.1

**The homepage group is back on, and there is now a test that would catch the failure
which took it offline.**

When 0.2.0 left the homepage blank, the fix was to default `homePath` to empty, which made
the homepage opt-in. That was right as a default and wrong as an endpoint: it quietly threw
away the reason the homepage is a note at all. A note is searchable, linkable and version
controlled; writing a custom view instead gives all of that up to avoid two lines of CSS.

So this restores it — in your config rather than in the defaults, which is the difference
that matters. Nothing here claims a note you did not name; the setting is yours, and it
leaves a trace you can look at.

What made it safe to switch back on is a fourth test. Three suites were green while the
homepage was blank, because none of them looked at what got rendered: the load test only
proved the plugin did not throw and that the settings page had content. `tests/render.test.js`
runs the three code blocks through their processors and requires that they produce DOM —
a clock with digits, the line you wrote, the hub links — and pins the boundary that matters
most, that the title tagging and forced reading mode touch the homepage leaf and no other.

It was checked against the real failure before being trusted: with the clock's `onload`
returning early, six cases fail. That is the 0.2.0 shape exactly.

Two stubs fixed while writing it, both of which would have misattributed themselves to the
plugin: `setAttribute("class", ...)` must reach `classList` or every SVG becomes invisible
to the test, and `Component.load()` must call `onload()` or nothing renders at all.

## 0.3.0

**Two things that were missing rather than broken: the clock could only tell time your way,
and nobody had looked at a phone.**

### The clock can be 12-hour now

It read 24-hour and nothing else. That is a plain gap for anyone who reads 2:05 PM, and
24-hour-only is the kind of default people notice daily and never mention.

Two decisions worth recording, because both could have gone the other way.

It **defaults to 24-hour**, keeping what the plugin has always shown. I did consider
following the system region, which would serve English-speaking users better, but it hands
something visible over to something invisible, and leaves no answer when someone asks why
their clock changed. The most important property of a default is that it can be explained.

The meridiem is **not translated**. It shares the clock line's monospace font, and that line
is held together by monospace alignment — pulling in CJK would bring a second typeface and
break it. It is a time notation, not a sentence, so it stays "AM"/"PM" in both languages. It
is also deliberately not handwriting: this stylesheet has one rule about that, and the
handwriting belongs to the stroke under the clock, not here.

In 12-hour mode the leading zero is dropped, so 09:05 PM never appears. The cost is that the
width changes by one character at 9:59 → 10:00, which happens exactly at the tick. Keeping it
is better than writing a zero that should not be there.

### Narrow screens

Nothing here was reproducible — I cannot run Obsidian on a phone from here, and saying
otherwise would be claiming a test I did not do. What was true is that no measurement had
been written with a narrow screen in mind.

The fix is a single variable. Every measurement in the stylesheet already derives from
`--pd-clock-size`, so between 320 px and 560 px that one value now scales continuously with
`clamp()` — digits, colon blocks and the drawn stroke all follow, without a breakpoint per
rule. Desktop is untouched. The floor of 36 px is where digits stop being readable; below
that the clock would just become body text.

### A test that was not testing part of the alphabet

Adding `settings.hourFormat.24` revealed that the i18n coverage test skipped keys whose last
segment starts with a digit. Those keys were neither counted nor reported missing — a
missing translation would have shipped as raw key text with the test passing. The regex
allowed `[a-zA-Z]` after each dot; it now allows digits. Key count went 95 → 100 with no
other change, which is the size of the hole.

### Docs

The settings tables still described the pre-0.2.1 defaults for the homepage path and
startup-opening, both of which changed when the homepage became opt-in. Fixed.

## 0.2.1

**A hotfix for 0.2.0, and it fixes a default rather than a line of logic.**

On a vault that already had this plugin, 0.2.0 left the homepage blank. The homepage
itself was fine; what was wrong was that the plugin had decided to own a note nobody
had asked it to own. `homePath` defaulted to `homepage.md`, so on first load after the
update the plugin took over that note — hid its title, forced reading mode, opened it at
startup — with no setting ever having been filled in. A default that claims one of your
notes is not a default, it is an assumption, and this one was wrong.

Three changes:

*The homepage is now opt-in.* `homePath` defaults to empty and `openOnStartup` to off,
so the homepage group stays off until you name a note. Empty makes `isHomePath()` false,
which is what lets the whole group switch off as one — that path was already there and
already tested, it just never got used by default.

*Code-block registration moved to the very top of `onload`.* It used to sit after the
status bar, the ticker and the stale-timer recovery. In the failure the registration was
never reached while the title-hiding tag, applied earlier, had already landed — so the
plugin looked half-loaded: title gone, nothing rendered. Registering first means nothing
downstream can take the blocks down with it.

*Two guards.* The status bar item is null-checked, since there is no status bar on mobile
and calling `addClass` on nothing would throw and abort `onload` — a small cosmetic
widget should not be able to stop your notes rendering. Forcing reading mode is now
gated against re-entry, because `setMode` is asynchronous and an event fired mid-change
can still read the old mode.

## 0.2.0

**The homepage, folded in.** Until now this was two plugins, and that was the wrong shape.
Both of them wrote to the same note and to the same view — one for the clock and the timer,
the other for opening the page, hiding its title and forcing reading mode. Two plugins
managing one page is two sources of truth, and for the person using it, two things to
install, enable, update and read about in order to get one homepage.

So `ym-homepage` is gone and everything lives here. Its id was never published, so nothing
external breaks. The three code-block languages keep their names (`clock`, `home-links`,
`home-note`), which means an existing homepage note needs no editing at all.

**Merging also removed a setting.** The two plugins each had their own handwriting font
setting, which is the clearest sign they should not have been separate — nobody wants to
choose the same font twice. One setting now covers both the timer's phase name and the
homepage line.

**The homepage can be switched off entirely.** Leaving the path empty disables opening it,
hiding its title and forcing reading mode as a group, leaving a clock and a timer that touch
no note of yours. This is the honest answer to the objection that bundling a homepage into a
clock plugin forces it on people who only wanted the clock.

What the homepage does, and why, is unchanged from the two-plugin version:

*The title.* Obsidian's switch for the inline filename title is global, so "no title on this
one note" is not expressible in the settings. The view currently showing the homepage is
tagged, and the rule is scoped to that tag — on the view rather than on `body`, which is
shared across a split and would hide the other pane's title too.

*The mode.* Arriving at the homepage always lands in reading mode, because the caret would
otherwise land inside a code block. Only on arrival: switching into editing deliberately is
not fought, so the page stays editable. Hooked on `file-open`, which fires when the active
file changes but not when toggling mode within one note.

*The line.* `home-note` shows what you write in it; one line is fixed, several rotate daily,
picked as `day-of-year % count` rather than at random — random repeats a sentence on
consecutive days often enough to look broken. It counts nothing.

*The links.* `home-links` builds from rules so the list never goes stale.

Tests: 41 -> 93 logic cases. One of them caught a mistake in itself — an assertion claimed
`hub*` would match `github`, which is wrong in both directions (it is a prefix rule, and
`github` does not start with `hub`). Assertions that cannot go red are not assertions.

## 0.1.0

First release.

**A clock block.** Write ```` ```clock ```` at the top of a note and it renders centred:
monospace digits, a colon made of two pixel squares that blinks once a second, and a
hand-drawn stroke underneath. Two details worth knowing:

- The squares are wrapped around a **hidden real colon**, so they occupy exactly one
  monospace character width. The digits therefore never shift, whatever monospace font you
  have configured.
- The digits only repaint on the minute boundary. The blinking is pure CSS, and its phase is
  pinned to the wall clock with a negative `animation-delay`, so it lands on the real second
  instead of drifting from whenever the note was opened. Honours
  `prefers-reduced-motion`.

**A pomodoro timer in the sidebar.** Focus → short break → long break, advancing on its own,
with start/pause, reset and skip. It stores the *start timestamp* rather than a remaining
count, so closing Obsidian mid-session does not lose the run. If a run finished while
Obsidian was closed, it is parked at the start of the next phase rather than back-filled —
there is no way to know whether that time was actually spent focusing, and inventing rounds
would be a false record.

**Colours follow the theme.** Ink is
`color-mix(in srgb, var(--text-normal) 92%, var(--interactive-accent) 8%)`, so it adapts to
your accent and stays legible in light and dark themes. Only geometry — square size, stroke
width, font size — is hard-coded.

**Handwriting font is a setting**, because Obsidian has no handwriting variable. It defaults
to a cross-platform stack and falls back to your body font when left empty.

**Settings cover everything worth changing.** Focus / short / long durations, rounds before a
long break, the two chaining switches (split apart on purpose — see the README), the
end-of-phase alert (notice or nothing), an optional completion tone with a preview button,
an optional status-bar countdown, a daily reset of the round count, and the handwriting font.

**The completed-round counter is off by default.** "How long is left" and "how much have I
done" are different things, and the second one is not something everyone wants on a page
they open every day.
