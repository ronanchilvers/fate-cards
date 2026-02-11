# Task 2.3 - Auto-dismissing Toast with Progress Bar

## Objective
Implement an alternative alert toast that automatically vanishes after a specified timeout, with a visual progress bar indicating time remaining.

## Requirements
- Toast should auto-dismiss after a configurable timeout
- Progress bar at the bottom of the toast
- Progress bar should be thin and red
- Progress bar fills up as the timeout approaches (0% → 100%)
- Should work alongside existing alert toasts (with 'Ok' button)

## Current Implementation Analysis

### Toast Provider (`src/components/toast/ToastProvider.jsx`)
- Already handles `duration` parameter in `alert()` method
- Uses `setTimeout` to auto-dismiss toasts after duration
- Stores timers in `timersRef` for cleanup
- Default duration is 5000ms if not specified
- If `duration > 0`, toast auto-dismisses; otherwise persists

### Toast Container (`src/components/toast/ToastContainer.jsx`)
- Renders alert toasts in `.toast-viewport`
- Currently shows 'Ok' button for all alert toasts
- No progress bar implementation

### Current Behavior
- Dice result toasts already use `duration: 30000` for auto-dismiss
- They still show an 'Ok' button for manual dismissal
- No visual indicator of remaining time

## Proposed Solution

### 1. Add Progress Bar to Auto-dismissing Toasts
**File:** `src/components/toast/ToastContainer.jsx`

- Identify alert toasts with `duration` property
- For toasts with duration > 0, add a progress bar element
- Use CSS animation or JavaScript interval to animate progress
- Keep 'Ok' button for manual dismissal (user can still close early)

### 2. Progress Bar Implementation Approach
**Option A: CSS Animation (Preferred)**
- Add `duration` to toast object passed to container
- Use CSS `animation` with dynamic duration
- Simpler, more performant
- No additional timers needed

**Option B: JavaScript Interval**
- Track elapsed time with `setInterval`
- Update progress state
- More complex, requires additional state management

**Decision:** Use CSS animation for simplicity and performance

### 3. Changes Required

#### ToastProvider.jsx
- Pass `duration` to toast object when creating alert toasts
- Only include `duration` if it's > 0 (auto-dismissing)

```javascript
setToasts(prev => ([
  ...prev,
  { id, kind: 'alert', title, message, tone, onDismiss, duration: duration > 0 ? duration : null }
]))
```

#### ToastContainer.jsx
- Check if toast has `duration` property
- Render progress bar for auto-dismissing toasts
- Add wrapper div for progress bar at bottom of toast

```jsx
{toast?.duration > 0 ? (
  <div className="toast-progress-bar" style={{ animationDuration: `${toast.duration}ms` }} />
) : null}
```

#### Toast.css
- Add `.toast-progress-bar` styles
- Position at bottom of toast
- Thin height (2-3px)
- Red background (#ef4444 or similar)
- Use `@keyframes` to animate width from 0% to 100%

```css
.toast-progress-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  background: #ef4444;
  width: 0;
  animation: toast-progress linear forwards;
}

@keyframes toast-progress {
  from { width: 0%; }
  to { width: 100%; }
}
```

#### Toast Item Positioning
- Ensure `.toast-item` has `position: relative` for absolute positioning of progress bar
- Consider if progress bar should be inside padding or extend full width
  - **Decision:** Extend full width (more visible, standard UX pattern)

### 4. Edge Cases to Handle
- Toast dismissed manually before timeout: animation stops (handled by toast removal)
- Multiple auto-dismissing toasts: each has independent progress bar
- Duration of 0 or not specified: no progress bar shown
- Very short durations (<1000ms): progress bar still works (CSS handles it)

### 5. Styling Details
- Progress bar color: `#ef4444` (red-500)
- Height: `3px`
- Position: bottom of toast, full width
- Border radius: inherit bottom corners from toast (if toast has `border-radius: 5px`)
- Ensure progress bar doesn't overlap toast content

### 6. Files to Modify
1. `src/components/toast/ToastProvider.jsx` - pass duration to toast object
2. `src/components/toast/ToastContainer.jsx` - render progress bar conditionally
3. `src/components/toast/Toast.css` - add progress bar styles and animation

### 7. Testing Considerations
- Test with dice roll (30 second duration)
- Test with short duration (2-3 seconds)
- Test manual dismissal during progress
- Test multiple concurrent auto-dismissing toasts
- Verify progress bar doesn't appear on confirm toasts
- Verify progress bar doesn't appear on alerts without duration

## Implementation Steps
1. Update `ToastProvider.jsx` to include duration in toast object
2. Add progress bar rendering logic to `ToastContainer.jsx`
3. Add CSS styles and animation for progress bar
4. Test with existing dice roll functionality
5. Verify responsive behavior on mobile

## Notes
- This enhances existing functionality without breaking changes
- All existing toasts continue to work as before
- Progress bar only appears for toasts with explicit duration
- User can still manually dismiss auto-dismissing toasts