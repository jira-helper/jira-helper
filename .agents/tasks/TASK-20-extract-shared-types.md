# TASK-20: Извлечь общие типы в types.ts

**Status**: TODO

**Parent**: [EPIC-3](./EPIC-3-wiplimit-on-cells-refactoring.md)

---

## Описание

Типы `Cell`, `Range`, `BoardData`, `WipLimitSettings` дублируются в `WipLimitOnCells.ts`, `WiplimitOnCellsSettingsPopup.ts` и `table.ts`. Нужно создать единый `types.ts` с общими типами и использовать их везде.

## Файлы

```
src/wiplimit-on-cells/
├── types.ts        # новый — общие типы
├── WipLimitOnCells.ts        # изменение — импорт из types.ts
├── WiplimitOnCellsSettingsPopup.ts  # изменение — импорт из types.ts
└── table.ts        # изменение — импорт из types.ts
```

## Что сделать

1. Создать `src/wiplimit-on-cells/types.ts` с типами:
   - `WipLimitCell` — ячейка (swimlane, column, showBadge)
   - `WipLimitRange` — диапазон (name, wipLimit, disable, cells, includedIssueTypes)
   - `BoardData` — данные доски (swimlanesConfig, rapidListConfig, canEdit)
2. Обновить импорты в `WipLimitOnCells.ts` — убрать локальные `Cell`, `Range` интерфейсы
3. Обновить импорты в `WiplimitOnCellsSettingsPopup.ts` — убрать локальные `BoardData`, `WipLimitSettings`
4. Обновить импорты в `table.ts` — убрать локальные `Cell`, `Range`

## Код до/после

```typescript
// До (WipLimitOnCells.ts):
interface Cell {
  column: string;
  showBadge: boolean;
  swimlane: string;
  DOM?: Element;
  x?: number;
  y?: number;
  notFoundOnBoard?: boolean;
  border?: string;
}

// После (types.ts):
export interface WipLimitCell {
  swimlane: string;
  column: string;
  showBadge: boolean;
}

// Runtime-поля остаются в BoardPage:
export interface WipLimitCellRuntime extends WipLimitCell {
  DOM?: Element;
  x?: number;
  y?: number;
  notFoundOnBoard?: boolean;
  border?: string;
}
```

## Критерии приёмки

- [ ] `types.ts` создан с JSDoc-комментариями
- [ ] Все 3 файла используют импорт из `types.ts`
- [ ] Нет дублирования типов
- [ ] Тесты проходят: `npm test`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Зависит от: нет
- Референс: `src/person-limits/types.ts`
