# TASK-23: Создать Board PageObject + DI

**Status**: TODO

**Parent**: [EPIC-3](./EPIC-3-wiplimit-on-cells-refactoring.md)

---

## Описание

Создать PageObject для Board Page, инкапсулирующий все DOM-операции: получение ячеек, подсчёт issues, добавление CSS-классов, вставка badges, установка background color. Зарегистрировать через DI token для тестируемости.

## Файлы

```
src/wiplimit-on-cells/BoardPage/pageObject/
├── IBoardPageObject.ts             # новый — интерфейс
├── BoardPageObject.ts              # новый — реализация
├── boardPageObjectToken.ts         # новый — DI Token
└── index.ts                        # новый — экспорт + registerInDI()
```

## Что сделать

1. Создать `IBoardPageObject.ts` с интерфейсом:
   - **Queries**: `getAllCells()`, `getCellElement()`, `getIssuesInCell()`
   - **Commands**: `addCellClass()`, `removeCellClass()`, `setCellBackgroundColor()`, `insertBadge()`
2. Создать `BoardPageObject.ts` — реализация с DOM-селекторами из `WipLimitOnCells.ts`:
   - `.ghx-swimlane` — swimlanes
   - `.ghx-column` — columns
   - `[swimlane-id='...'] [data-column-id='...']` — конкретная ячейка
3. Создать `boardPageObjectToken.ts` — DI Token
4. Создать `index.ts` — `registerWipLimitCellsBoardPageObjectInDI()`

## Код после

```typescript
// IBoardPageObject.ts
export interface IWipLimitCellsBoardPageObject {
  selectors: {
    swimlane: string;
    column: string;
  };

  // Queries — чтение DOM
  getAllCells(): Element[][];
  getCellElement(swimlaneId: string, columnId: string): Element | null;
  getIssuesInCell(cell: Element, cssSelector: string): Element[];

  // Commands — мутация DOM
  addCellClass(cell: Element, className: string): void;
  setCellBackgroundColor(cell: Element, color: string): void;
  insertBadge(cell: Element, html: string): void;
}
```

## Критерии приёмки

- [ ] Интерфейс разделён на Queries и Commands (CQS)
- [ ] Все DOM-селекторы из `WipLimitOnCells.ts` перенесены в PageObject
- [ ] DI token создан и экспортирован
- [ ] `registerInDI()` функция реализована
- [ ] Тесты проходят: `npm test`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Зависит от: нет
- Референс: `src/person-limits/BoardPage/pageObject/`
