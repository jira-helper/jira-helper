# TASK-29: GanttSettingsContainer

**Status**: TODO
**Type**: container

**Parent**: [EPIC-1](./EPIC-1-gantt-chart.md)

---

## Описание

Связка `GanttSettingsModel` с `GanttSettingsModal` и `CopyFromDialog`: открытие/закрытие, draft, save, copy from flow.

## Файлы

```
src/features/gantt-chart/SettingsModal/
├── GanttSettingsContainer.tsx
└── GanttSettingsContainer.test.tsx
```

*Примечание:* `GanttSettingsContainer.cy.tsx` и Cypress — в [TASK-33](./TASK-33-cypress-bdd-settings.md).

## Что сделать

1. **TDD:** с моком модели — сценарии save/cancel, copy from, смена scope.
2. Реализовать props `onClose` и подключение к токену настроек.

## Критерии приёмки

- [ ] После Save вызывается persist модели и перезагрузка данных графика (через колбэк/событие контейнера графика).
- [ ] Тесты проходят: `npm test`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Зависит от: [TASK-4](./TASK-4-gantt-settings-model.md), [TASK-27](./TASK-27-gantt-settings-modal.md), [TASK-28](./TASK-28-copy-from-dialog.md)

---

## Результаты

_(заполняется по завершении)_
