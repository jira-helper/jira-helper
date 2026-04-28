# TASK-54: Resolve Progress Bucket Utility

**Status**: DONE
**Type**: model

**Parent**: [EPIC-3](./EPIC-3-progress-status-mapping.md)

---

## Описание

Реализовать чистый resolver, который выбирает progress bucket по custom mapping с matching только по `statusId`, а при отсутствии настройки использует Jira `statusCategory`. Утилита будет общей точкой для Gantt и sub-tasks runtime.

## Файлы

```text
src/shared/status-progress-mapping/utils/
├── resolveProgressBucket.ts       # новый
└── resolveProgressBucket.test.ts  # новый
```

## BDD Scenarios

- `@SC-PSM-DEFAULT-1` Missing settings block uses default Jira statusCategory mapping
- `@SC-PSM-AUTO-4` Missing Jira status shows fallback label but matching remains id-only
- `@SC-PSM-SUB-2` Sub-tasks progress mapping matches by status id, not status name

## Тесты

- Vitest: custom `statusId` mapping wins over Jira category.
- Vitest: missing/empty mapping falls back to `new -> todo`, `indeterminate -> inProgress`, `done -> done`.
- Vitest: fallback `statusName` is ignored and does not match another status with the same name.
- Vitest: invalid/unknown categories return conservative fallback used by existing callers, or require caller handling if existing code already does so.

## Что сделать

1. Импортировать типы из [TASK-53](./TASK-53-status-progress-types.md).
2. Реализовать resolver с input: `statusId`, Jira `statusCategory`, optional `StatusProgressMapping`.
3. Не добавлять logic для `blocked`; blocked остаётся feature-specific runtime override.
4. Покрыть resolver unit-тестами.

## Критерии приёмки

- [ ] Matching выполняется только по `statusId`.
- [ ] `statusName` не используется в resolver.
- [ ] Default Jira categories дают ожидаемые buckets.
- [ ] Тесты проходят: `npm test -- resolveProgressBucket`.
- [ ] Нет ошибок линтера для новых файлов.

## Зависимости

- Зависит от: [TASK-53](./TASK-53-status-progress-types.md).
- Блокирует: [TASK-61](./TASK-61-gantt-progress-mapping-runtime.md), [TASK-66](./TASK-66-subtasks-runtime-progress-mapping.md).

---

## Результаты

**Дата**: 2026-04-28

**Агент**: Coder

**Статус**: DONE

**Что сделано**:

- Создан pure resolver `resolveProgressBucket` для custom mapping по `statusId`.
- Добавлен fallback Jira `statusCategory`: `new -> todo`, `indeterminate -> inProgress`, `done -> done`.
- Добавлены unit-тесты на id-only matching, игнорирование `statusName`, пустой/отсутствующий mapping и unknown category fallback.
- Пройдены review и QA: `REVIEW-TASK-54.md`, `QA-TASK-54.md`.

**Проблемы и решения**:

Нет.
