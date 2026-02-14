# Fate Cards — Agents Instructions

## Commands (run early when relevant)
Some important points first:
- Use of `npq-hero` instead of `npm` is preferred
- Both `npq-hero` and `npm` may have been installed using `asdf`. The `asdf` binary can be found in the `bin` directory in the user's home directory.
- If the `npq-hero` or `npm` binaries are not found, it may be necessary to query `asdf` for the correct location and run them directly.

Common commands:
- Install deps: `npq-hero ci`
- Dev server: `npq-hero run dev`
- Build: `npq-hero run build`
- Preview build: `npq-hero run preview`
- Run tests: `npq-hero run test`
- Run tests (watch mode): `npq-hero run test:watch`
- Run tests (coverage): `npq-hero run test:coverage`
- Deploy to GitHub Pages: `npq-hero run deploy`

## Project knowledge

### Project Memory
Follow these guidelines if the project-memory skill is available:
- When investigating, analyzing or reviewing the project use the project-memory skill to persist discovered project knowledge with brief memory entries
- When working on the project use the project-memory skill to recall relevant project context before making changes
- Also when making concrete decisions about the codebase, write a brief memory (decision, rationale and pointers)

### Tech stack
- **React 18** with **Vite 7** (JavaScript, ESM)
- **Vitest 4** + **@testing-library/react** + **jsdom** for testing
- **Three.js** / **cannon-es** / **three-stdlib** for the 3D Fate dice roller
- **Lucide React** for icons
- **GitHub Pages** deployment via GitHub Actions (`.github/workflows/deploy.yml`)
- **CI tests** on pull requests via GitHub Actions (`.github/workflows/tests.yml`)

### Project structure
```
src/
├── App.jsx                  — Top-level state, import/export, routing, layout
├── App.css                  — Global app styles
├── App.test.jsx             — App-level tests
├── App.import.test.jsx      — Import validation tests for App module
├── index.css                — Base/reset styles
├── main.jsx                 — React entry point
├── constants.js             — Shared constants (storage keys, element types, theme modes)
├── components/
│   ├── Card.jsx / Card.css / Card.test.jsx  — Card editor and element rendering
│   ├── ErrorBoundary.jsx / .test.jsx        — React error boundary
│   ├── FateDiceRoller.jsx / .css / .test.jsx  — 3D Fate dice roller (Three.js + cannon-es)
│   ├── FloatingDiceButton.jsx / .css / .test.jsx — Floating button to trigger dice rolls
│   ├── elements/            — Individual card element components (each has a .test.jsx)
│   │   ├── index.js         — Barrel export + element type→component registry
│   │   ├── ElementWrapper.jsx / .test.jsx
│   │   ├── HighConceptElement.jsx / .test.jsx
│   │   ├── TroubleElement.jsx / .test.jsx
│   │   ├── AspectsElement.jsx / .test.jsx
│   │   ├── SkillsElement.jsx / .test.jsx
│   │   ├── InventoryElement.jsx / .test.jsx
│   │   ├── StressTracksElement.jsx / .test.jsx
│   │   ├── ConsequencesElement.jsx / .test.jsx
│   │   ├── NoteElement.jsx / .test.jsx
│   │   └── FatePointsElement.jsx / .test.jsx
│   ├── icons/               — Custom icon component and icon map (lucide-react)
│   │   ├── Icon.jsx / Icon.test.jsx
│   │   └── iconMap.js / iconMap.test.js
│   ├── modals/              — Modal dialogs
│   │   ├── index.js         — Barrel export
│   │   ├── ModalBase.css
│   │   ├── TemplateModal.jsx / .css / .test.jsx
│   │   ├── CategoryModal.jsx / .test.jsx
│   │   ├── SkillsAdminModal.jsx / .test.jsx
│   │   └── SkillLevelsAdminModal.jsx / .test.jsx
│   └── toast/               — Toast notification system
│       ├── Toast.css
│       ├── ToastContainer.jsx / .test.jsx
│       └── ToastProvider.jsx / .test.jsx
├── hooks/                   — Custom React hooks (all state management)
│   ├── index.js             — Barrel export
│   ├── integration.test.js  — Cross-hook integration tests
│   ├── useLocalStorage.js / .test.js   — localStorage persistence
│   ├── useTheme.js / .test.js          — Dark/light/auto theme
│   ├── useCards.js / .test.js          — Card CRUD and ordering
│   ├── useCategories.js / .test.js     — Category management
│   ├── useSkills.js / .test.js         — Skill definitions
│   ├── useSkillLevels.js / .test.js    — Skill level (ladder) management
│   └── useToast.js / .test.jsx         — Toast notification hook
├── utils/                   — Pure utility functions
│   ├── cardSchema.js / .test.js        — Card validation and normalization
│   ├── colors.js / .test.js            — Color utilities (category colors)
│   └── storage.js / .test.js           — Safe JSON localStorage helpers
├── data/                    — Default data and factories
│   ├── __snapshots__/        — Snapshot test outputs
│   ├── defaults.js / defaults.test.js / defaults.snapshot.test.js
│   ├── cardTemplates.js / cardTemplates.test.js
│   └── elementFactories.js / elementFactories.test.js
└── test/                    — Test infrastructure
    ├── setup.js             — Vitest setup (jsdom, Testing Library matchers)
    └── importValidation.test.js — Cross-module import validation tests

docs/                        — Documentation
├── Tasks.md                 — Task tracking with completion timestamps
├── plans/                   — Implementation plans (created before work begins)
├── changes/                 — Change logs for completed work
└── review/                  — Code quality and security review documents

example-designs/             — Reference screenshots (do not edit unless asked)
public/                      — Static assets
dist/                        — Build output (generated)
.github/workflows/           — CI/CD pipelines
├── deploy.yml               — GitHub Pages deployment (pushes to master)
└── tests.yml                — Unit tests on pull requests
AGENTS.md                    — Agent instructions for this repo
DEPLOY.md                    — Deployment notes
index.html                   — App HTML shell + CSP
package.json                 — Project metadata and scripts
package-lock.json            — NPM lockfile
vite.config.js               — Vite and Vitest config
```

### Key conventions
- **State management** lives in `src/hooks/` — each domain (cards, categories, skills, etc.) has its own hook.
- **Element components** are registered in `src/components/elements/index.js` via the `ELEMENT_COMPONENTS` map, keyed by constants from `src/constants.js`.
- **Constants** (localStorage keys, element types, theme modes, file constraints) are centralized in `src/constants.js`.
- **Tests** live alongside source files with `.test.js` / `.test.jsx` extensions. Snapshot tests are in `src/data/__snapshots__/`.
- **Barrel exports** (`index.js`) are used in `hooks/`, `components/elements/`, and `components/modals/`.
- **Vitest** is configured in `vite.config.js` with jsdom environment and globals enabled.
- **Content Security Policy** is set in `index.html` — only `'self'` sources are allowed (plus `'unsafe-inline'` for styles).

### Task workflow
- Before starting a task, create an implementation plan in `docs/plans/` with a filename matching the task.
- Do not begin implementation until the user has approved the plan.
- When a task is completed, check it off in `docs/Tasks.md` and add a completion timestamp (format `Y-m-d h:m`).


## Your role
- Build or modify UI features for Fate Cards.
- Keep the UI responsive and accessible.
- Prefer small, focused changes and preserve existing behavior.
- Write tests for new functionality; update existing tests when behavior changes.


## Coding style (examples)
✅ Prefer small helpers and clear names:
```jsx
const updateCard = (updates) => {
  onUpdate(card.id, { ...card, ...updates })
}
```

✅ Guard user input before mutating state:
```jsx
if (!newCategoryName.trim()) return
```

✅ Use constants instead of magic strings:
```jsx
import { ELEMENT_TYPES } from '../constants'
// ...
if (element.type === ELEMENT_TYPES.SKILLS) { ... }
```

✅ Co-locate tests with their source files:
```
src/utils/cardSchema.js
src/utils/cardSchema.test.js
```

❌ Avoid large inline state blocks without grouping or helper functions.

❌ Avoid hardcoded localStorage keys or element type strings — use `STORAGE_KEYS` and `ELEMENT_TYPES` from `constants.js`.


## Defensive coding expectations
- Validate and normalize any imported or persisted data before use.
- Guard for missing/null fields before rendering arrays or accessing properties.
- Prefer non-throwing fallbacks when data is malformed.
- Use `cardSchema.js` utilities for card data validation on import.


## Boundaries
- ✅ **Always:** Keep changes in `src/` unless explicitly asked otherwise.
- ✅ **Always:** Update or add tests when changing behavior.
- ⚠️ **Ask first:** Adding dependencies, changing Vite config, or large UI refactors.
- ⚠️ **Ask first:** Modifying GitHub Actions workflows or deployment configuration.
- 🚫 **Never:** Edit `node_modules/`, delete user data, or introduce secrets.
- 🚫 **Never:** Edit files in `example-designs/` unless explicitly asked.


## Git workflow
- No commits unless explicitly requested.
- Describe what changed and why; list follow-up steps when relevant.
