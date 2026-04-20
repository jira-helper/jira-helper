# Jira Helper — Claude Code

Browser extension (Chrome 88+, Firefox 58+) enhancing Jira with WIP-limits, visualization, and workflow management.

## Tech Stack

TypeScript 5 (strict), React 18, Vite 5 + @crxjs/vite-plugin, Ant Design 5, Valtio (new) / Zustand (legacy), dioma DI, Vitest, Cypress, Storybook.

## Key Directories

- `src/content.ts` — extension entry point, DI bootstrap, feature registration
- `src/background/` — service worker entrypoint that delegates to infrastructure
- `src/infrastructure/page-modification/` — base class for all Jira page modifications
- `src/infrastructure/di/` — DI tokens and Module base class
- `src/infrastructure/jira/` — Jira API client
- `src/infrastructure/page-objects/` — BoardPage, SettingsPage
- `src/features/` — feature modules (column-limits, card-colors, swimlane-wip-limits, etc.)
- `cypress/` — Cypress component tests with Gherkin BDD

## Commands

```
npm run build       # Build Chrome extension → dist/
npm run prod:firefox # Build Firefox → dist-firefox/
npm run storybook   # Storybook on :6006
npm test            # Vitest unit tests
npm run cy:open     # Cypress component testing UI
npm run cy:run      # Cypress headless
npm run lint:eslint && npm run lint:typescript
npm run precommit   # Full lint + test (husky hook)
```

## Architecture Patterns

- **PageModification<T>** — base class for DOM modifications; each feature implements `shouldApply → preloadData → loadData → apply → clear`
- **Module + DI** — new features: `tokens.ts` (createModelToken) + `module.ts` (extend Module, use `this.lazy()` + `modelEntry()`), registered in `content.ts` via `module.ensure(container)`
- **Valtio `ModelEntry`** — в React читай state через **`useModel()`**, вызывай методы модели только у **`model`** из того же entry (`docs/state-valtio.md`)
- **Settings vs Runtime** — settings persisted to Jira board properties; runtime state calculated per board view
- **ts-results** — Ok/Err for error handling, not throw/catch

## Routes

`BOARD`, `BOARD_BACKLOG`, `SETTINGS`, `ISSUE`, `SEARCH`, `REPORTS`, `ALL` — used to determine which PageModifications to run.

## Feature Isolation

Each feature (e.g. `column-limits/`, `card-colors/`) has its own `module.ts`, `tokens.ts`, `BoardPage/`, `SettingsPage/` subdirectories.
