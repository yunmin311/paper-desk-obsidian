# Changelog

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
