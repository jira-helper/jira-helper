# System Patterns

## System architecture
- Modular React components for board UI, group settings, and progress display.
- State management for settings and progress (likely using hooks and context).
- JQL parser and matcher as a standalone utility module.

## Key technical decisions
- Use a custom, simple JQL parser for group matching (not relying on external libraries).
- All field matching is case-insensitive and supports arrays.
- UI components are decoupled from matching logic for testability.

## Design patterns in use
- Container/pure component separation for testability and DI.
- Hooks for state and effect management.
- Utility functions for field value extraction and matching.
- DOM-first anchor insertion for Jira cards:
  - Prefer inserting UI into stable Jira anchors (e.g. `.ghx-card-footer`) to blend with native layout
  - When possible, insert relative to existing elements (e.g. before `.ghx-days`) with safe fallbacks

## Component relationships
- Board UI integrates group settings and progress/counter displays.
- Settings panels interact with board property store and actions.

## Best Practices Learned (Recent Session)
- **Board property management:**
  - Use a single, typed board property object for all settings, extending it as new features are added.
  - Store only minimal, necessary data (e.g., link type id and direction) for user selections.
  - Use local state for UI, but always sync to the board property for persistence.
- **Type safety:**
  - Define and import types at the top of files for clarity and maintainability.
  - Use union types and enums for settings/options to prevent invalid values.
- **UI/UX for dynamic settings:**
  - Show advanced options (like link type selection) only when relevant toggles are enabled.
  - Use grid/flex layouts for large, dynamic lists to keep the UI clean and readable.
  - Group related settings in visually distinct panels or cards.
- **State synchronization:**
  - Use zustand with immer for predictable, immutable state updates.
  - Provide clear actions for each setting, and keep action signatures type-safe.
  - Always update both local UI state and board property state when user changes settings.
- **New Best Practices (Latest Iteration):**
  - Always move user-facing texts to a localization object for maintainability and i18n.
  - Use local state only for UI toggles (e.g., showing/hiding granular controls), not for duplicating store state.
  - Keep the store as the single source of truth for selections and persist changes directly.
  - Show granular UI if any selection is made or the user explicitly requests it.
  - Avoid unnecessary syncing between store and local state; prefer clear, event-driven transitions.
  - Place all application logic in actions, even if the action is only a few lines. This allows logic changes without UI changes and supports better separation of concerns.

## Specification Writing Rules

1. **Structure around features, not screens**
   - ❌ Bad: Sections like "Settings", "Board", "Backlog"
   - ✅ Good: Sections like "Feature: Issue Links", "Feature: Days in Column"
   - Each feature is described in one place: from user story to testing.

2. **Don't write implementation code**
   - ❌ Bad: Full component/hook/function implementations
   - ✅ Good: Verbal description of architecture and layer responsibilities
   - Use simple diagrams: `Container → FeatureComponent → useHook → Badge`

3. **Data types are part of the spec**
   - TypeScript interfaces belong in the specification
   - They define the contract, not the implementation

4. **Describe component architecture inside each feature**
   - Architecture is part of the feature, not a separate section
   - Each feature contains: User Story → Data Types → Settings → Architecture → Integration → Testing

5. **Default values: explicitly state "not set"**
   - ❌ Bad: `warningThreshold: 3` (unclear if mandatory)
   - ✅ Good: `warningThreshold?: number` + "default is empty, user must explicitly set"

## Issue Condition Checks Patterns

### Tooltip with Clickable Links
- Для отображения ссылок в тултипе Ant Design Tooltip принимает ReactNode
- Ссылки на подзадачи формируются через `window.location.origin + '/browse/' + key`
- `onClick={e => e.stopPropagation()}` предотвращает клик по карточке при клике на ссылку

### Subtask Match Modes
- `any` — условие выполнено при наличии хотя бы одной подходящей подзадачи
- `all` — условие выполнено только если ВСЕ подзадачи подходят (и есть хотя бы одна)
- Режим `all` с пустым списком подзадач = false (требуется минимум одна подзадача)

### CSS Animations
- Анимации определены через `@keyframes` в CSS Module
- Классы анимаций применяются динамически через `getAnimationClass()`
- `blink` — медленный (2.5s), `blinkFast` — быстрый (1.5s)

### ColorPicker Integration
- Ant Design ColorPicker с `allowClear` для опционального цвета
- `presets` для быстрого выбора рекомендованных цветов
- `color?: string` (hex) или `undefined` (без фона)
- Inline styles для применения цвета: `style={{ backgroundColor: color }}`
