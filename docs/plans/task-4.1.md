# Task 4.1 - Dark Mode Toggle Positioning

## Objective
Move the dark mode toggle out of the hamburger menu and keep it visible at all times in the header, with proper sizing and positioning.

## Requirements
- Dark mode toggle should NOT be absorbed into the hamburger menu
- Icon size: 24x24px (currently 16px)
- Position: Left end of header bar (stays visible at all times)
- On mobile: Stays on left, hamburger menu trigger appears to its right
- Dark mode toggle should be to the left of the hamburger menu when visible

## Current Implementation Analysis

### Header Structure (App.jsx)
```jsx
<header className="app-header">
  <h1>Fate RPG Cards</h1>
  <button className="hamburger-btn">...</button>
  <div className="app-actions">
    <!-- All action buttons including dark mode -->
  </div>
</header>
```

**Current behavior:**
- Dark mode toggle is inside `.app-actions`
- On mobile (<1024px), `.app-actions` becomes a slide-out menu
- Dark mode toggle is hidden behind hamburger menu
- Icon is 16px (via `.action-icon` class)

### CSS Layout (App.css)
- `.app-header` uses flexbox with space-between
- `.hamburger-btn` hidden on desktop, visible on mobile
- `.app-actions` becomes fixed slide-out panel on mobile

## Proposed Solution

### 1. Restructure Header HTML
**File:** `src/App.jsx`

Move dark mode button outside of `.app-actions`:

```jsx
<header className="app-header">
  <div className="header-left">
    <h1>Fate RPG Cards</h1>
  </div>
  <div className="header-right">
    <button className="darkmode-toggle-btn">
      <Icon name={theme.getThemeIcon()} size={24} />
    </button>
    <button className="hamburger-btn">...</button>
    <div className="app-actions">
      <!-- Other action buttons, NO dark mode -->
    </div>
  </div>
</header>
```

**Alternative approach (simpler):**
```jsx
<header className="app-header">
  <h1>Fate RPG Cards</h1>
  <div className="header-controls">
    <button className="darkmode-toggle-btn">
      <Icon name={theme.getThemeIcon()} size={24} />
    </button>
    <button className="hamburger-btn">...</button>
  </div>
  <div className="app-actions">
    <!-- Other action buttons, NO dark mode -->
  </div>
</header>
```

### 2. Update CSS Styles
**File:** `src/App.css`

Add new styles:
```css
.header-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.darkmode-toggle-btn {
  padding: 0.4rem;
  border: none;
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--slate-700);
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
}

.dark-mode .darkmode-toggle-btn {
  color: var(--slate-200);
}

.darkmode-toggle-btn:hover {
  background: #CCC;
}

.dark-mode .darkmode-toggle-btn:hover {
  background: var(--slate-700);
}

@media (max-width: 1024px) {
  .header-controls {
    order: 2; /* Ensure it stays on the right */
  }
}
```

Remove dark mode button from `.app-actions` on mobile.

### 3. Icon Size Update
- Pass `size={24}` to Icon component for dark mode toggle
- Remove from `.app-actions` so it's not part of mobile menu

## Implementation Steps

1. **Extract dark mode button from `.app-actions`**
   - Move button outside the actions div in JSX
   - Create wrapper div for hamburger + dark mode toggle

2. **Update button styling**
   - Create `.darkmode-toggle-btn` class
   - Set icon size to 24px
   - Ensure proper padding/sizing (40x40px hit target)

3. **Update header layout**
   - Ensure dark mode toggle is always visible
   - Position hamburger to left of dark mode toggle
   - Maintain responsive behavior

4. **Remove dark mode from mobile menu**
   - Keep other actions in slide-out menu
   - Only hamburger and dark mode visible in header on mobile

## Layout Behavior

### Desktop (>1024px)
```
[Title]                    [Dark Mode] [Hamburger Hidden] [Actions Menu Hidden]
```

### Mobile (<1024px)
```
[Title]                    [Dark Mode] [Hamburger]
                           [Actions Menu - Slide Out]
```

## Design Considerations

- **Icon size:** 24x24px makes it more prominent and easier to tap
- **Always visible:** No need to open menu to change theme
- **Positioning:** Left of hamburger keeps it visible and accessible
- **Accessibility:** Larger tap target, always accessible
- **Consistency:** Still uses same styling patterns as other buttons

## Edge Cases

1. **Very narrow screens (<450px):** Ensure title doesn't collide with controls
2. **Title overflow:** May need to truncate title on very small screens
3. **Icon color:** Ensure visibility in both light and dark modes

## Files to Modify

1. `src/App.jsx` - Move dark mode button out of `.app-actions`
2. `src/App.css` - Add `.darkmode-toggle-btn` styles, adjust header layout

## Testing Checklist

- [ ] Dark mode toggle visible on desktop
- [ ] Dark mode toggle visible on mobile
- [ ] Hamburger menu appears on mobile (<1024px)
- [ ] Dark mode toggle is to the left of hamburger
- [ ] Icon is 24x24px
- [ ] Toggle works in both positions
- [ ] Hover states work correctly
- [ ] Dark mode styling applies correctly
- [ ] No layout issues on narrow screens
- [ ] Other action buttons still in hamburger menu

## Notes

- This improves UX by making theme switching always accessible
- Reduces clicks needed to change theme on mobile
- Follows common pattern of keeping theme toggle in header
- Maintains existing functionality for all other actions