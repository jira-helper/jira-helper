# TASK-3: resolveSettings и buildScopeKey

**Status**: TODO
**Type**: utils

**Parent**: [EPIC-1](./EPIC-1-gantt-chart.md)

---

## Описание

Чистые функции разрешения каскадных настроек (`PROJECT:IssueType` > `PROJECT` > `_global`) и построения ключа scope. Без побочных эффектов — покрываются unit-тестами без моков.

## Файлы

```
src/features/gantt-chart/utils/
├── resolveSettings.ts
└── resolveSettings.test.ts
```

## Что сделать

1. **TDD:** тест-кейсы для `buildScopeKey`, `resolveSettings` — отсутствие `_global`, только global, override проекта, override project+issueType, неполные ключи.
2. Реализовать `resolveSettings(storage, projectKey, issueType)` и `buildScopeKey` согласно [target-design.md](./target-design.md) и FR-10 [requirements.md](./requirements.md).
3. Экспортировать только утилиты (без доступа к `localStorage`).

## Критерии приёмки

- [ ] Все сценарии разрешения scope покрыты тестами.
- [ ] Тесты проходят: `npm test`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Зависит от: [TASK-1](./TASK-1-types-and-tokens.md) (`GanttSettingsStorage`, `GanttScopeSettings`, `ScopeKey`)
- Референс чистых утилит: другие `utils/*.test.ts` в репозитории

---

## Результаты

_(заполняется по завершении)_
