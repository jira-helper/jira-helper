# TASK-27: GanttSettingsModal view

**Status**: TODO
**Type**: view

**Parent**: [EPIC-1](./EPIC-1-gantt-chart.md)

---

## Описание

Форма настроек: scope selector, start/end mapping (date field vs status transition), label field, hover fields, exclusion filter через `IssueSelectorByAttributes`, кнопки Save/Cancel. Часть полей FR-5 для связей может подключаться отдельным компонентом в [TASK-30](./TASK-30-link-type-inclusion-ui.md).

## Файлы

```
src/features/gantt-chart/SettingsModal/components/
├── GanttSettingsModal.tsx
├── GanttSettingsModal.module.css
└── GanttSettingsModal.test.tsx
```

## Что сделать

1. **TDD:** смена draft через колбэки; открытие CopyFrom по кнопке (мок дочернего диалога).
2. Реализовать props из [target-design.md](./target-design.md); переиспользовать `IssueSelectorByAttributes` из существующего кода проекта.
3. Подготовить место под [TASK-30](./TASK-30-link-type-inclusion-ui.md) (слот или пропсы).

## Критерии приёмки

- [ ] Соответствует wireframe в [requirements.md](./requirements.md) §10.
- [ ] Тесты проходят: `npm test`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Зависит от: [TASK-1](./TASK-1-types-and-tokens.md), [TASK-4](./TASK-4-gantt-settings-model.md) (контракт данных)
- Референс селектора: поиск `IssueSelectorByAttributes` в `src/`

---

## Результаты

_(заполняется по завершении)_
