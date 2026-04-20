# TASK-11: Storybook — FirstRun, Empty, Error

**Status**: TODO
**Type**: stories

**Parent**: [EPIC-1](./EPIC-1-gantt-chart.md)

---

## Описание

Визуальные состояния для review и регрессии: `FirstRunState`, `EmptyState`, `ErrorState`.

## Файлы

```
src/features/gantt-chart/IssuePage/components/
├── FirstRunState.stories.tsx
├── EmptyState.stories.tsx
└── ErrorState.stories.tsx
```

## Что сделать

1. Добавить stories по [skill Storybook](../../../.cursor/skills/storybook/SKILL.md) и паттернам проекта.
2. Покрыть варианты: default, длинный текст ошибки, разные сообщения empty.

## Критерии приёмки

- [ ] Stories открываются в Storybook без ошибок.
- [ ] Тесты проходят: `npm test`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Зависит от: [TASK-8](./TASK-8-first-run-state-view.md), [TASK-9](./TASK-9-empty-state-view.md), [TASK-10](./TASK-10-error-state-view.md)
- Референс: соседние `*.stories.tsx` в `src/features/`

---

## Результаты

_(заполняется по завершении)_
