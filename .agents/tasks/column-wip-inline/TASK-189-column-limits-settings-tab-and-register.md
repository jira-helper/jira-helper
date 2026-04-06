# TASK-189: ColumnLimitsSettingsTab + registerSettings в BoardPage

**Status**: TODO

**Parent**: [EPIC-19](./EPIC-19-column-wip-inline-board-tab.md)

---

## Описание

Добавить контейнер таба `ColumnLimitsSettingsTab`, рендерящий переиспользуемый `ColumnLimitsForm` с Save/Cancel, инициализацию через `boardPagePO.getOrderedColumns()` + `buildInitDataFromColumns()` + `SettingsUIModel.initFromProperty`, сохранение с `boardRuntimeModel.apply()`. Зарегистрировать таб через `registerSettings` в `ColumnLimitsBoardPage.apply()` при `canEdit`, передать swimlanes из `EditData`. Добавить ключи `tabTitle` в `texts.ts` для заголовка таба.

## Файлы

```
src/column-limits/
├── SettingsTab/
│   ├── index.ts
│   └── ColumnLimitsSettingsTab.tsx
├── BoardPage/index.ts              # EditData, registerSettings
└── SettingsPage/texts.ts           # tabTitle
```

## Что сделать

1. Создать папку `SettingsTab`, экспорт из `index.ts`, реализация по [target-design.md](./target-design.md) (DI: `settingsUIModelToken`, `propertyModelToken`, `boardRuntimeModelToken`, `boardPagePageObjectToken`).
2. Расширить `EditData` в `BoardPage/index.ts`: `canEdit`, `swimlanesConfig`; в `apply()` вызвать `registerSettings` с компонентом-обёрткой и локализованным title из `COLUMN_LIMITS_TEXTS` / `useGetTextsByLocale` по паттерну проекта.
3. Добавить `tabTitle` в `COLUMN_LIMITS_TEXTS` (en/ru).
4. Проверить id формы/dropzone для таба (`jh-tab-column-dropzone` и др. по target design) для согласованности с будущими Cypress-тестами.

## Критерии приёмки

- [ ] При `canEdit` таб появляется в панели JH; без прав — не регистрируется.
- [ ] Save пишет property и вызывает `boardRuntimeModel.apply()`; Cancel сбрасывает и переинициализирует из текущего property и колонок доски.
- [ ] Тексты таба локализуемы через существующий механизм.
- [ ] Тесты проходят: `npm test`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Зависит от: [TASK-187](./TASK-187-board-page-get-ordered-columns.md), [TASK-188](./TASK-188-build-init-data-from-columns.md)
- Референс: `DiagnosticBoardPage` / `LocalSettingsBoardPage` — паттерн `registerSettings`; [requirements.md](./requirements.md) FR-1–FR-6

---

## Результаты

**Дата**: {YYYY-MM-DD}

**Агент**: {Coder / Architect / Manual}

**Статус**: VERIFICATION

**Что сделано**:

{Заполняется при завершении}

**Проблемы и решения**:

{ОБЯЗАТЕЛЬНО при завершении}
