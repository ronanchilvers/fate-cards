# Implementation Plan: Custom Skill Entry in Skills Element

## Summary
Add a “Custom” entry to the Skills element that allows users to type a custom skill name.

## Goals
- Provide a clear UX for entering custom skill text.
- Preserve existing behavior for standard skill selection.
- Ensure state updates and persistence remain correct.

## Non-Goals
- Redesign of the Skills element UI.
- Changes to skill ladder logic or dice rolling behavior.

## Open Questions
- None (requirements clarified):
  - Custom skills are stored as free text only and are not added to the global skills list.
  - Custom skills can be empty (user discretion).

## Proposed Approach
- Add a `Custom` option to the skill name selector in `SkillsElement`.
- When `Custom` is chosen, swap the select control for a text input so the user can type a custom skill name.
- Treat a skill as “custom” when its name is not present in the `skills` array; render the text input pre-filled with that value.
- Validation: allow empty custom values (no blocking or filtering).
- Persist custom skills as the `name` string only (no separate list or global skill addition).
- Ensure locked view renders custom skill names the same way as standard skills.

## Testing Plan
- Verify `Custom` appears in the skill name dropdown.
- Custom skills render a text input for entering a custom name.
- Empty custom names are allowed and persisted.
- Custom names are stored in `element.items` and remain after reload (name-only persistence).
- Locked view shows custom skill names correctly.

## Rollout / Migration
- None expected.