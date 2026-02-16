# Dice Modifier Flexibility - Implementation Plan

## Goal
Rework rolling so players can toggle multiple modifiers (skills and aspects) from any card, review stacked modifiers above the roll control, roll once, see a full toast breakdown, and then clear selected modifiers after the roll cycle.

## Scope
- Replace single pending skill bonus flow with multi-modifier selection.
- Remove direct click-to-roll from the skill rating badge.
- Add toggleable modifiers from these card elements: `High Concept`, `Trouble`, `Aspects`, and `Skills`.
- Add stacked modifier UI above the floating roll control (`"<thing> <modifier>"` format).
- Preserve existing dice simulation and toast system behavior.

## Assumptions
- All selected modifiers use a fixed value of `+2` for this implementation stage (no per-item custom values).  
- Modifier toggles are intended for gameplay/read-only interaction paths (locked card presentation), while edit behavior remains unchanged.

## Step-by-step Tasks

1. Introduce a shared modifier model in app state
- Files: `src/App.jsx` (and optionally `src/constants.js` for aspect bonus constant).
- Add `selectedRollModifiers` state (array of objects with stable id, label, value, source metadata).
- Add helper functions:
  - toggle modifier on/off by id
  - clear all selected modifiers
  - compute modifier total
  - format signed values (`+2`, `-1`, `0`)
- Keep a ref snapshot of selected modifiers for async dice result handling.
- Enforce fixed modifier value (`+2`) when creating modifier payloads.
- Exit criteria: App can hold multiple active modifiers without triggering a roll.

2. Refactor roll trigger/result flow for multi-modifier support
- Files: `src/App.jsx`.
- Replace `pendingSkillBonus`/`pendingSkillBonusRef` with roll snapshot of selected modifiers.
- `handleRollDice` should:
  - no-op when already rolling
  - snapshot current selected modifiers for the in-flight roll
  - trigger dice roll id increment
- `handleDiceResult` should:
  - combine dice value + summed modifier values
  - build breakdown including dice result plus each selected modifier entry
  - call existing `toast.diceResult` with updated breakdown/total
  - clear in-flight snapshot and selected modifiers after result lifecycle completes
- Exit criteria: rolling supports any number of modifiers and resets selection after roll completion.

3. Rewire card/element callback contract from “roll now” to “toggle modifier”
- Files: `src/components/Card.jsx`, `src/App.jsx`.
- Replace `onRollDice` prop threading with:
  - `onToggleRollModifier(modifierPayload)`
  - `isModifierActive(modifierId)` (or equivalent active-id set lookup)
- Continue passing `skills` and `skillLevels` unchanged.
- Exit criteria: element components can toggle modifier selection without directly rolling.

4. Update `SkillsElement` locked view interaction
- Files: `src/components/elements/SkillsElement.jsx`, `src/components/Card.css`, `src/App.css` (cleanup old clickable rating styles).
- Remove click action from `.skill-level-rating`.
- Make individual skills in locked view toggleable as modifiers with fixed `+2`.
- Each skill toggle should produce stable id + label + value and active visual state.
- Preserve current unlocked/editor behavior.
- Exit criteria: clicking a locked-view skill toggles its modifier; rating badge is display-only.

5. Update `AspectsElement` interaction for modifier toggling
- Files: `src/components/elements/AspectsElement.jsx`, `src/components/Card.css`.
- In locked view, allow clicking each non-empty aspect to toggle `+2` modifier.
- Provide active/selected styling and accessible pressed semantics.
- Preserve unlocked editing UX (input fields + add/remove controls).
- Exit criteria: aspect entries can be toggled on/off and reflected in app-level selection state.

6. Add `High Concept` and `Trouble` as modifier sources
- Files: `src/components/elements/HighConceptElement.jsx`, `src/components/elements/TroubleElement.jsx`, plus related tests and styles.
- In locked view, make non-empty high concept and trouble values toggleable as `+2` modifiers.
- Use stable ids, active styling, and accessible pressed semantics consistent with aspects/skills.
- Preserve unlocked editing behavior for both elements.
- Exit criteria: high concept and trouble can be toggled on/off and appear in app-level selected modifiers.

7. Build modifier stack UI above roll control
- Files: `src/components/FloatingDiceButton.jsx`, `src/components/FloatingDiceButton.css`, `src/App.jsx`.
- Extend floating roll control to accept and render selected modifiers as a vertical stack.
- Render each entry in `"<thing> <modifier>"` format with truncation/fallback for long names.
- Keep roll button disabled behavior tied to `isDiceRolling`.
- Ensure mobile-safe spacing and z-index with current layout.
- Exit criteria: selected modifiers visibly stack above the roll control and update live.

8. Keep toast output format compatible while including all modifiers
- Files: `src/App.jsx` (plus tests in toast/App suites if needed).
- Maintain existing dice-result toast usage (`breakdown`, `total`, duration, dismiss callback).
- Expand breakdown string construction to include each selected modifier contribution.
- Exit criteria: toast shows dice roll, each selected modifier, and final total in one result notification.

9. Update and add tests for new behavior
- Files:
  - `src/components/elements/SkillsElement.test.jsx`
  - `src/components/elements/AspectsElement.test.jsx`
  - `src/components/elements/HighConceptElement.test.jsx`
  - `src/components/elements/TroubleElement.test.jsx`
  - `src/components/FloatingDiceButton.test.jsx`
  - `src/App.test.jsx`
  - (optional) `src/components/toast/ToastContainer.test.jsx` if rendering expectations change
- Add assertions for:
  - high concept/trouble/aspect/skill toggle on/off
  - removal of skill-rating click-to-roll behavior
  - modifier stack rendering in floating control
  - multi-modifier roll breakdown + final total
  - selection reset after roll result completes
- Exit criteria: tests cover new interaction paths and pass.

10. Verification run
- Commands:
  - `npq-hero run test`
- Exit criteria: full test suite passes with no regressions.

## Risks and Mitigations
- Risk: Modifier identity collisions across cards/elements.
  - Mitigation: Use compound ids (`cardId + elementId + itemIndex + sourceType`) for toggles.
- Risk: Locked/unlocked view divergence creates inconsistent click targets.
  - Mitigation: Restrict gameplay toggles to locked view and keep editor paths unchanged.
- Risk: Future transition to variable modifier values creates churn.
  - Mitigation: Keep modifier payload schema extensible (`value` field retained) even while currently fixed at `+2`.
- Risk: Toast breakdown string gets noisy with many modifiers.
  - Mitigation: Keep concise signed formatting and deterministic ordering by selection order.

## Definition of Done
- Multi-source modifiers (`High Concept`, `Trouble`, `Aspects`, `Skills`) can be toggled from cards.
- Floating roll control displays stacked selected modifiers.
- Roll result toast includes dice, each modifier, and final total.
- Skill rating click-to-roll path is removed.
- Selected modifiers clear after roll completion.
- Tests are updated and passing.
