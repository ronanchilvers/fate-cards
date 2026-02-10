# Task 2.1 + 2.2 - Toast Styling and Alert Positioning Plan

## Scope
Implement the remaining toast UI requirements in `docs/Tasks.md`:
- 2.1 Toast appearance updates
- 2.2 Alert-toast viewport positioning updates
- Refinement: toast colors must be identical in light and dark mode, always using Task 2.1 values (`#333333` background, `#FEFEFE` text)

No behavior changes are planned for toast queueing, dismiss logic, or confirmation flow.

## Review Summary (Current State)

### What already matches
- Toasts are already rendered via dedicated containers:
  - Alert toasts: `.toast-viewport`
  - Confirm toasts: `.toast-overlay` + `.toast-confirm-viewport`
- Toast text in dark mode is already light (`.dark-mode .toast-item { color: var(--slate-100) }`).

### Gaps against Task 2.1
- Border radius is currently `var(--radius-md)` (6px), not `5px`.
- Background/text colors are theme-based, not fixed to `#333333` and `#FEFEFE`.
- Left tone accent borders are still present through:
  - `.toast-item[data-tone='danger']`
  - `.toast-item[data-tone='warning']`
  - `.toast-item[data-tone='info']`
  - `.toast-item[data-tone='success']`

### Gaps against Task 2.2 (alert toasts only)
- `.toast-viewport` is currently `right: 20px; bottom: 20px;` instead of ~`1rem` right and `2rem` bottom.
- No `<450px` rule currently sets alert toasts to full width minus `1rem` margins.

## Implementation Plan

### 1) Update shared toast appearance (Task 2.1)
File: `src/components/toast/Toast.css`

Planned changes:
- In `.toast-item`:
  - Set `border-radius: 5px`
  - Set `background: #333333`
  - Set `color: #FEFEFE`
  - Set border to a neutral dark tone (for visual separation without accent behavior)
- Keep the same values in both light and dark mode (no theme-based overrides for toast background/text).
- Remove tone-specific left accent border rules (`data-tone` selectors).
- Remove or simplify `.dark-mode .toast-item` overrides that would conflict with the fixed appearance.

Rationale:
- Ensures a consistent toast look across themes.
- Removes left accent without touching alert/confirm logic.

### 2) Reposition alert viewport (Task 2.2)
File: `src/components/toast/Toast.css`

Planned changes:
- In `.toast-viewport`:
  - Change to `right: 1rem`
  - Change to `bottom: 2rem`
- Add responsive rule for small screens:
  - `@media (max-width: 449px)`:
    - `.toast-viewport { left: 1rem; right: 1rem; }`
    - `.toast-viewport .toast-item { width: 100%; max-width: none; min-width: 0; }`

Rationale:
- Applies only to alert toasts because confirm toasts use the overlay container.
- Matches the requested mobile full-width behavior while preserving spacing.

### 3) Validation

Automated:
- Run `npq-hero run test` to confirm no functional regressions.

Manual UI checks:
- Trigger an alert toast:
  - Desktop: appears near bottom-right at ~`2rem` bottom and `1rem` right.
  - Mobile (<450px): spans available width with `1rem` left/right margins.
- Trigger a confirm toast:
  - Confirm overlay behavior remains unchanged.
  - Updated appearance (radius/background/text) applies correctly.
- Toggle light/dark mode while toast is visible:
  - Verify background remains `#333333` and text remains `#FEFEFE` in both modes.
- Verify no left accent border appears for any toast tone.

## Risk Notes
- Removing tone accent borders reduces visual differentiation by tone.
  - Acceptable because Task 2.1 explicitly requests removing the left accent.
- Fixed dark styling may reduce contrast with some dark UI surfaces.
  - Mitigated via existing shadow and border.

## Files Planned for Edit
- `src/components/toast/Toast.css`

## Out of Scope
- Toast API changes (`ToastProvider.jsx`)
- Markup changes in `ToastContainer.jsx`
- Task checkbox/timestamp updates in `docs/Tasks.md` (to be done only after implementation completion)
