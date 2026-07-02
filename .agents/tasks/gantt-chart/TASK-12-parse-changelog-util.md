# TASK-12: parseChangelog (status transitions)

**Status**: VERIFICATION
**Type**: utils

**Parent**: [EPIC-1](./EPIC-1-gantt-chart.md)

---

## Описание

Парсинг Jira changelog: извлечение переходов по полю `status`, сортировка, вспомогательная `findFirstTransitionTo` для mapping по статусу.

## Файлы

```
src/features/gantt-chart/utils/
├── parseChangelog.ts
└── parseChangelog.test.ts
```

## Что сделать

1. **TDD:** фикстуры changelog → ожидаемые `StatusTransition[]`; кейсы без status, пустой changelog, несколько переходов в один статус.
2. Реализовать функции по [target-design.md](./target-design.md) (секция parseChangelog).

## Критерии приёмки

- [ ] Покрыты edge cases пустого/битого changelog.
- [ ] Тесты проходят: `npm test`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Зависит от: [TASK-1](./TASK-1-types-and-tokens.md)
- Референс типов Jira issue: `src/shared/jira/types.ts`

---

## Результаты

_(заполняется по завершении)_
