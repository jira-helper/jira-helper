# TASK-204: Settings containers — useModel(settingsUIModelToken)

**Status**: TODO

**Parent**: [EPIC-20](./EPIC-20-person-limits-refactor.md)

---

## Описание

Обновить контейнеры настроек: `SettingsButtonContainer`, `SettingsModalContainer`, `PersonalWipLimitContainer` — заменить вызовы legacy actions / `useSettingsUIStore` на `SettingsUIModel` через `useModel()` и `settingsUIModelToken`. Согласовать с @SC-DI-6 в [di-integration.feature](./di-integration.feature). При необходимости адаптировать связанные `*.cy.tsx` минимально (полная адаптация BDD — [TASK-206](./TASK-206-settings-page-bdd-tests.md)).

## Файлы

```
src/person-limits/SettingsPage/components/
├── SettingsButton/SettingsButtonContainer.tsx
├── SettingsModal/SettingsModalContainer.tsx
└── PersonalWipLimitContainer.tsx

src/person-limits/SettingsPage/components/**/*.cy.tsx   # точечно при необходимости
```

## Что сделать

1. Внедрить `useDi().inject(settingsUIModelToken)` + `useModel()` для состояния и команд (`initFromProperty` → метод модели при открытии, `save` — при сохранении и т.д.).
2. Убрать прямые импорты `initFromProperty` / `saveToProperty` action-файлов.
3. View-компоненты не рефакторить без необходимости.

## Критерии приёмки

- [ ] Три контейнера не используют `useSettingsUIStore` и удаляемые actions.
- [ ] Подписка на модель соответствует архитектурному контракту (di-integration).
- [ ] Тесты проходят: `npm test`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Зависит от: [TASK-202](./TASK-202-settings-ui-model.md), [TASK-203](./TASK-203-settings-utils-pure-functions.md)

---

## Результаты

**Дата**: {YYYY-MM-DD}

**Агент**: {Coder / Architect / Manual}

**Статус**: VERIFICATION

**Что сделано**:

{Заполняется при завершении}

**Проблемы и решения**:

{Заполняется при завершении}
