# TASK-8: FirstRunState view

**Status**: TODO
**Type**: view

**Parent**: [EPIC-1](./EPIC-1-gantt-chart.md)

---

## Описание

Экран первого запуска (FR-3, S1): сообщение о необходимости настроить параметры и кнопка открытия настроек. Presentation-only.

## Файлы

```
src/features/gantt-chart/IssuePage/components/
├── FirstRunState.tsx
└── FirstRunState.test.tsx
```

## Что сделать

1. **TDD:** снимок/рендер-тест props: `onOpenSettings` вызывается по клику; текст соответствует сценарию [gantt-chart-settings.feature](./gantt-chart-settings.feature) (@SC-GANTT-SET-1).
2. Реализовать компонент по контракту из [target-design.md](./target-design.md) (`FirstRunStateProps`).
3. i18n: использовать существующий механизм проекта для строк (если принят в репозитории).

## Критерии приёмки

- [ ] Юнит-тесты проходят.
- [ ] Тесты проходят: `npm test`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Зависит от: [TASK-1](./TASK-1-types-and-tokens.md) (типы props при необходимости)
- Референс view: другие `*State.tsx` / пустые состояния в `src/features/`

---

## Результаты

_(заполняется по завершении)_
