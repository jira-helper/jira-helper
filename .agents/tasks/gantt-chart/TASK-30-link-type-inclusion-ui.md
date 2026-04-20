# TASK-30: Link type inclusion UI

**Status**: TODO
**Type**: view

**Parent**: [EPIC-1](./EPIC-1-gantt-chart.md)

---

## Описание

UI для FR-5: чекбоксы direct subtasks, epic children, issue links; при включённых links — granular picker направления и типов (`IssueLinkTypeSelection`). Пустой список типов = все типы. Интеграция в форму настроек.

## Файлы

```
src/features/gantt-chart/SettingsModal/components/
├── GanttLinkInclusionFields.tsx
├── GanttLinkInclusionFields.test.tsx
└── GanttSettingsModal.tsx   # изменение — вставка секции и пропсов
```

## Что сделать

1. **TDD:** переключение чекбоксов обновляет значения; список link types.
2. Расширить `GanttScopeSettings` / draft в [TASK-4](./TASK-4-gantt-settings-model.md) при необходимости полями inclusion (если ещё не в [TASK-1](./TASK-1-types-and-tokens.md)).
3. Встроить компонент в [TASK-27](./TASK-27-gantt-settings-modal.md).

## Критерии приёмки

- [ ] Поведение соответствует [gantt-chart-settings.feature](./gantt-chart-settings.feature) (включение по типам связи).
- [ ] Тесты проходят: `npm test`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Зависит от: [TASK-1](./TASK-1-types-and-tokens.md), [TASK-27](./TASK-27-gantt-settings-modal.md)
- Референс: `src/features/sub-tasks-progress/types.ts`, UI прогресса сабтасков в `src/features/sub-tasks-progress/`

---

## Результаты

_(заполняется по завершении)_
