# ADR-0002: Audio, playback, track and confetti stay imperative modules in refs

**Status:** accepted (2026-06-11)

## Context

The original game drives Web Audio scheduling, a rAF playhead, a CSS ball-roll animation and a canvas particle loop directly against the DOM. During the React port the tempting "idiomatic" move was to model these as React state. But: playhead/label updates run per animation frame; re-rendering mid-roll *cancels the ball animation* (a bug the prototype already fought and fixed — HANDOFF §7); and Web Audio node graphs are inherently imperative objects with lifecycles React state can't express.

## Decision

`src/lib/anthem/engine/` (playback controller, synth, track geometry, confetti) are plain classes held in `useRef`, writing directly to DOM nodes. React renders those nodes with **constant props/children** so reconciliation never overwrites engine writes. React owns everything else (game state, picker, modals, end panel).

## Consequences

- The boundary is a contract: adding React-rendered dynamic content inside the track/label/play-button nodes will break playback UI — don't.
- Engine behavior is tested through the headless suites (real browser), not vitest.
- Anyone "cleaning this up" into hooks/state will reintroduce the cancelled-animation and frame-rate-render bugs. The cleanup is intentionally not wanted.
