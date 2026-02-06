# Toast Notification Plan

## Goal
Create a simple toast system that supports both alerts and confirmations, then integrate it to replace `window.confirm()` usage across the app.

## Constraints
- No new dependencies.
- Keep changes within `src/` except this plan document.
- Keep UI responsive and accessible.

## Test Command
- `npq-hero run test`

## Tasks
1. **Inventory and scaffolding**
   - Locate all `confirm()` usages in `src/` and note their call sites.
   - Add a toast provider + context/hook (e.g., `useToast`) that exposes `toast.alert(...)` and `toast.confirm(...)` without yet wiring them into existing flows.
   - Add minimal toast container component and base CSS (hidden or passive) so the app builds without visual changes.
   - Run unit tests: `npq-hero run test`.

2. **Alert toast implementation**
   - Implement `toast.alert({ title, message, tone, duration })` to enqueue a dismissible toast.
   - Add keyboard and ARIA semantics (`role="status"`, close button with label), and ensure focus behavior is non-disruptive.
   - Add unit tests for enqueue/dismiss behavior.
   - Run unit tests: `npq-hero run test`.

3. **Confirm toast implementation**
   - Implement `toast.confirm({ title, message, confirmLabel, cancelLabel })` returning a `Promise<boolean>`.
   - Ensure only one confirm toast is active at a time (queue others or block until resolved).
   - Add UI for confirm/cancel actions and keyboard accessibility (`role="alertdialog"`, focus on primary action).
   - Add unit tests for confirm resolution and cancellation.
   - Run unit tests: `npq-hero run test`.

4. **Integration + cleanup**
   - Replace `window.confirm()` usages with `await toast.confirm(...)` (add `async` where needed), preserving existing behavior.
   - Verify edge cases (e.g., cancel path) match prior flow.
   - Update any tests that rely on `confirm()` to use the new toast API or mock it.
   - Run unit tests: `npq-hero run test`.

## Completion Criteria
- All confirm dialogs are replaced by toast confirmations.
- Toasts are accessible, dismissible, and visually consistent with the app.
- Unit tests pass after each task.
