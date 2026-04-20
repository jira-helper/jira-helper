# TASK-31: Storybook — SettingsModal и CopyFromDialog

**Status**: TODO
**Type**: stories

**Parent**: [EPIC-1](./EPIC-1-gantt-chart.md)

---

## Описание

Stories для модалки настроек и диалога копирования scope (все основные состояния draft).

## Файлы

```
src/features/gantt-chart/SettingsModal/components/
├── GanttSettingsModal.stories.tsx
└── CopyFromDialog.stories.tsx
```

## Что сделать

1. Замокать `availableFields`, `draft`, колбэки.
2. Вариант с встроенным [TASK-30](./TASK-30-link-type-inclusion-ui.md) после его готовности.

## Критерии приёмки

- [ ] Storybook собирается.
- [ ] Тесты проходят: `npm test`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Зависит от: [TASK-27](./TASK-27-gantt-settings-modal.md), [TASK-28](./TASK-28-copy-from-dialog.md), [TASK-30](./TASK-30-link-type-inclusion-ui.md) (опционально для комбинированного story)

---

## Результаты

_(заполняется по завершении)_
