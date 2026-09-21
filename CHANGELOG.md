# Changelog

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
