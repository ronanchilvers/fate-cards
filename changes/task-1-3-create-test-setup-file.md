# Task 1.3: Create Test Setup File

**Completed**: 2026-01-27 21:06:30

## Task Summary

Create a test setup file with common test utilities, browser API mocks, and configuration that runs before each test.

## Implementation

### File Created: `src/test/setup.js`

Created a new test directory and setup file with the following components:

#### 1. Testing Library Integration

```javascript
import '@testing-library/jest-dom'
```

Imports custom Jest DOM matchers (e.g., `toBeInTheDocument`, `toHaveClass`) for more expressive assertions.

#### 2. localStorage Mock

```javascript
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
global.localStorage = localStorageMock
```

Mocks the browser's localStorage API, which is heavily used in the Fate Cards app for persistence. Each method is a Vitest spy that can be tracked and controlled in tests.

#### 3. crypto.randomUUID Mock

```javascript
global.crypto = {
  randomUUID: vi.fn(() => 'test-uuid-' + Math.random().toString(36).substr(2, 9))
}
```

Mocks the browser's `crypto.randomUUID()` function used for generating card IDs. Returns predictable test UUIDs while maintaining uniqueness.

#### 4. Before Each Hook

```javascript
beforeEach(() => {
  vi.clearAllMocks()
  localStorageMock.getItem.mockReturnValue(null)
})
```

Runs before each test to:
- Clear all mock call history to prevent test pollution
- Reset localStorage.getItem to return null (empty state)

### Why These Mocks?

- **localStorage**: The app persists cards, categories, and settings to localStorage. Mocking it allows tests to run in isolation without side effects.
- **crypto.randomUUID**: Ensures deterministic behavior in tests while still allowing unique IDs to be generated.
- **Reset before each test**: Prevents tests from affecting each other, ensuring clean slate and reliable results.

### Directory Structure Created

```
src/
└── test/
    └── setup.js
```

### Next Steps

- Task 1.4: Add test scripts to `package.json` to enable running tests via `npm test`
- Begin Phase 2: Write actual test files for utility modules

## Status

✅ **Completed** - Test setup file successfully created at `src/test/setup.js` with localStorage and crypto mocks.