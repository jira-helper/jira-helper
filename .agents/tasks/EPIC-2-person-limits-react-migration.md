# EPIC-2: Миграция person-limits SettingsPage с htmlTemplates на React-компоненты

## Описание

Отказ от `htmlTemplates.tsx` в `src/person-limits/SettingsPage/` в пользу React-компонентов по паттерну Container/View, аналогично `column-limits/SettingsPage`.

**Target Design:** [target-design-person-limits-react-migration.md](./target-design-person-limits-react-migration.md)

**Референс:** `src/column-limits/SettingsPage/` — уже мигрирован на React.

## Задачи

| # | Задача | Описание | Статус |
|---|--------|----------|--------|
| 1 | [TASK-1](./TASK-1-extract-constants.md) | Извлечь `settingsJiraDOM` в `constants.ts` | DONE |
| 2 | [TASK-2](./TASK-2-create-settings-button-view.md) | Создать `SettingsButton` View компонент | DONE |
| 3 | [TASK-3](./TASK-3-create-settings-modal-view.md) | Создать `SettingsModal` View компонент | DONE |
| 4 | [TASK-4](./TASK-4-create-settings-modal-container.md) | Создать `SettingsModalContainer` | DONE |
| 5 | [TASK-5](./TASK-5-create-settings-button-container.md) | Создать `SettingsButtonContainer` | DONE |
| 6 | [TASK-6](./TASK-6-refactor-index-tsx.md) | Рефакторинг `index.tsx` — `createRoot` | DONE |
| 7 | [TASK-7](./TASK-7-rewrite-stories.md) | Переписать Stories на React-компоненты | DONE |
| 8 | [TASK-8](./TASK-8-delete-html-templates.md) | Удалить `htmlTemplates.tsx` | DONE |
| 10 | [TASK-10](./TASK-10-rewrite-container-tests-cypress.md) | Переписать тесты PersonalWipLimitContainer RTL → Cypress | DONE |
| 9 | [TASK-9](./TASK-9-verification.md) | Верификация: тесты + линтер | DONE |

## Граф зависимостей

```
TASK-1 (constants) ──────────────┐
                                 ├──> TASK-4 (ModalContainer) ──> TASK-5 (BtnContainer) ──> TASK-6 (index.tsx) ──┐
TASK-3 (SettingsModal View) ─────┘                                                                               ├──> TASK-8 (delete) ──> TASK-9 (verify)
TASK-2 (SettingsButton View) ────────────────────────────────────> TASK-5 (BtnContainer) ──> TASK-7 (stories) ───┘
```

## Параллелизация

- **Параллельно:** TASK-1, TASK-2, TASK-3
- **После TASK-1 + TASK-3:** TASK-4
- **После TASK-2 + TASK-4:** TASK-5
- **После TASK-5:** TASK-6, TASK-7 (параллельно)
- **После TASK-6 + TASK-7:** TASK-8
- **После TASK-8:** TASK-9
