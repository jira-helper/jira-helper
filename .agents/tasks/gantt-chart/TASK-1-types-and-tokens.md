# TASK-1: Типы домена и DI-токены Gantt

**Status**: VERIFICATION
**Type**: types

**Parent**: [EPIC-1](./EPIC-1-gantt-chart.md)

---

## Описание

Зафиксировать доменные типы (`GanttScopeSettings`, `GanttBar`, transitions, scope keys, интервалы времени) и DI-токены для моделей Gantt по образцу других фич. Без типов нельзя писать utils и модели.

## Файлы

```
src/features/gantt-chart/
├── types.ts       # новый — доменные типы + JSDoc (см. target-design)
└── tokens.ts      # новый — createModelToken для Settings/Data/Viewport models
```

## Что сделать

1. **TDD / контракты:** определить типы так, чтобы они покрывали FR из [requirements.md](./requirements.md) (mapping, exclusion, каскад scopes, link inclusion — переиспользовать `IssueLinkTypeSelection` из sub-tasks-progress).
2. Реализовать `types.ts`: минимум перечисленное в [target-design.md](./target-design.md) (секция types.ts); расширить `GanttScopeSettings` полями включения связей (subtasks, epic children, issue links + granular link types) по FR-5.
3. Реализовать `tokens.ts`: `ganttSettingsModelToken`, `ganttDataModelToken`, `ganttViewportModelToken` через `createModelToken` (как в `src/features/field-limits/tokens.ts`).
4. Проверить импорты типов без циклов (типы не импортируют модели).

## Критерии приёмки

- [x] `types.ts` и `tokens.ts` добавлены, ESLint/ts проходят для новых файлов.
- [x] Токены именованы по соглашению `gantt-chart/...`.
- [x] Тесты проходят: `npm test`
- [x] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Зависит от: нет
- Референс типов связей: `src/features/sub-tasks-progress/types.ts` (`IssueLinkTypeSelection`)
- Референс токенов: `src/features/field-limits/tokens.ts`
- Референс цветовой схемы статусов: `src/features/sub-tasks-progress/colorSchemas.ts` (для комментариев / типов категорий)

---

## Результаты

**Дата**: 2026-04-13

**Агент**: Coder

**Статус**: VERIFICATION

**Что сделано**:

- Добавлен `src/features/gantt-chart/types.ts`: доменные типы из target-design + JSDoc; `GanttScopeSettings` с полями FR-5 (`includeSubtasks`, `includeEpicChildren`, `includeIssueLinks`, `issueLinkTypesToInclude`); `IssueLinkTypeSelection` импортируется из `sub-tasks-progress` и реэкспортируется для удобства.
- Добавлен `src/features/gantt-chart/tokens.ts`: три токена через `createModelToken`; плейсхолдер-интерфейсы моделей экспортированы до появления реализаций.
- Циклов импорта нет: `types.ts` только тянет тип из sub-tasks-progress; `tokens.ts` только `Module`.

**Проблемы и решения**:

- Нет.
