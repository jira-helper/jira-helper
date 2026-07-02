# TASK-55: Gantt Changelog Status Ids

**Status**: DONE
**Type**: model

**Parent**: [EPIC-3](./EPIC-3-progress-status-mapping.md)

---

## Описание

Исправить слой парсинга Gantt changelog: `from` / `to` должны сохраняться как status ids, а `fromString` / `toString` как display labels. Это отдельный bug fix от новой настройки progress mapping.

## Файлы

```text
src/features/gantt-chart/
├── types.ts                         # изменение
└── utils/
    ├── parseChangelog.ts            # изменение
    └── parseChangelog.test.ts       # изменение
```

## BDD Scenarios

- `@SC-PSM-GANTT-2` Gantt status transition mapping matches changelog from and to ids
- `@SC-PSM-GANTT-3` Legacy status transition name is fallback metadata only

## Тесты

- Vitest: `parseChangelog` сохраняет `fromStatusId` / `toStatusId` из changelog item `from` / `to`.
- Vitest: `fromStatusName` / `toStatusName` сохраняются из `fromString` / `toString`.
- Vitest: display names не подменяют ids при пустых/отсутствующих id, если такой edge уже есть в fixture.

## Что сделать

1. Расширить `StatusTransition` в `types.ts` полями `fromStatusId`, `toStatusId`, `fromStatusName`, `toStatusName`.
2. Обновить `parseChangelog.ts`, чтобы status ids брались из Jira changelog `from` / `to`.
3. Сохранить display labels только для UI/debug/fallback metadata.
4. Обновить unit-тесты парсинга.

## Критерии приёмки

- [ ] Changelog ids и display labels представлены отдельными полями.
- [ ] `parseChangelog` больше не считает `toString` canonical transition value.
- [ ] Тесты проходят: `npm test -- parseChangelog`.
- [ ] Нет ошибок TypeScript в зависящих Gantt utils.

## Зависимости

- Зависит от: нет.
- Блокирует: [TASK-56](./TASK-56-gantt-date-mapping-id-lookup.md), [TASK-57](./TASK-57-gantt-date-mapping-status-select.md), [TASK-61](./TASK-61-gantt-progress-mapping-runtime.md).

---

## Результаты

**Дата**: 2026-04-28

**Агент**: Coder

**Статус**: DONE

**Что сделано**:

- Added explicit Vitest coverage for empty-string changelog `from` / `to` ids.
- Confirmed `parseChangelog` keeps display labels in `fromStatusName` / `toStatusName` without replacing empty ids.
- Re-ran review and QA; both passed.

**Проблемы и решения**:

Approved MISSED_SCENARIO was handled as a local unit-test gap. No blockers.
