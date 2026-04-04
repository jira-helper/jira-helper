# EPIC-7: wiplimit-on-cells DI Consistency

## Описание

Приведение `src/wiplimit-on-cells/` к единому стандарту DI, аналогично `person-limits` и `column-limits`. 

EPIC-3 выполнил основной рефакторинг, но property actions и BoardPage action остались с прямыми импортами вместо DI токенов.

**Референсы:**
- `src/column-limits/property/actions/saveProperty.ts` — createAction + DI
- `src/person-limits/BoardPage/actions/` — createAction pattern

## Проблемы

1. **property/saveProperty.ts** — прямые импорты `getBoardIdFromURL`, `updateBoardProperty`
2. **BoardPage/actions/renderWipLimitCells.ts** — обычная функция, зависимости через параметры
3. **Feature файлы** — нумерация SC1, SC2 вместо семантических ID

## Задачи

| # | Задача | Описание | Приоритет | Статус |
|---|--------|----------|-----------|--------|
| 61 | [TASK-61](./TASK-61-wiplimit-property-di-refactor.md) | Рефакторинг saveWipLimitCellsProperty на createAction + DI | High | DONE |
| 62 | [TASK-62](./TASK-62-wiplimit-render-action-di.md) | Рефакторинг renderWipLimitCells на createAction | Medium | DONE |
| 63 | [TASK-63](./TASK-63-wiplimit-feature-semantic-ids.md) | Семантические ID в feature файлах | Low | DONE |

## Граф зависимостей

```
TASK-61 (property DI) ──┐
                        ├──> Независимые, можно параллельно
TASK-62 (render DI) ────┤
                        │
TASK-63 (semantic IDs) ─┘
```

## Критерии завершения EPIC

- [x] Все property actions используют createAction + DI токены
- [x] BoardPage actions используют createAction + DI
- [x] Feature файлы используют семантические ID (SC-{GROUP}-{N})
- [x] Тесты проходят
- [x] ARCHITECTURE.md обновлён
