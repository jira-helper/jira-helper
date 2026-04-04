# TASK-21: Извлечь чистые утилиты (matrix, borders, badge)

**Status**: TODO

**Parent**: [EPIC-3](./EPIC-3-wiplimit-on-cells-refactoring.md)

---

## Описание

В `WipLimitOnCells.ts` есть чистые функции, замешанные с DOM-логикой класса: `getEmptyMartix`, `arrayClone`, `invertMatrix`, `excludeCells`, `setBorderString`, `getGetRengeDOM`, `cellAddClasses`. Нужно выделить чистую логику в отдельные утилиты с unit-тестами.

## Файлы

```
src/wiplimit-on-cells/BoardPage/utils/
├── matrix.ts           # новый — матричные утилиты
├── matrix.test.ts      # новый — тесты матричных утилит
├── borders.ts          # новый — вычисление borders
├── borders.test.ts     # новый — тесты border-логики
├── badge.ts            # новый — badge цвет и HTML
└── badge.test.ts       # новый — тесты badge-утилит
```

## Что сделать

1. Создать `matrix.ts`:
   - `getEmptyMatrix(rows: number, cols: number): number[][]` — из `getEmptyMartix`
   - `cloneMatrix<T>(matrix: T[][]): T[][]` — из `arrayClone`
   - `markCellInMatrix(cellsGrid: Element[][], matrix: number[][], targetCell: Element): { row: number; col: number }` — из `excludeCells`
   - `invertMatrix(cellsGrid: Element[][], markedMatrix: number[][], emptyMatrix: number[][]): any[][]` — из `invertMatrix`

2. Создать `borders.ts`:
   - `calculateBorders(row: number, col: number, matrix: number[][]): string` — из `setBorderString`

3. Создать `badge.ts`:
   - `getBadgeColor(issueCount: number, wipLimit: number): string` — из логики в `renderWipLimitCells`
   - `getBadgeHtml(issueCount: number, wipLimit: number, color: string): string` — из `getGetRengeDOM`

4. Написать unit-тесты для каждой утилиты (AAA-паттерн)

## Код до/после

```typescript
// До (метод класса в WipLimitOnCells.ts):
setBorderString(cell: Cell, matrixRange: any[]): string {
  let borderString = '';
  if (cell.x !== undefined && cell.x !== 0) {
    if (matrixRange[cell.x - 1][cell.y!] === 0) borderString += 'T';
  } else { borderString += 'T'; }
  // ...
}

// После (чистая функция в borders.ts):
export function calculateBorders(row: number, col: number, matrix: number[][]): string {
  let borders = '';
  // Top
  if (row === 0 || matrix[row - 1][col] === 0) borders += 'T';
  // Bottom
  if (row === matrix.length - 1 || matrix[row + 1][col] === 0) borders += 'B';
  // Left
  if (col === 0 || matrix[row][col - 1] === 0) borders += 'L';
  // Right
  if (col === matrix[row].length - 1 || matrix[row][col + 1] === 0) borders += 'R';
  return borders;
}
```

## Критерии приёмки

- [ ] Все чистые функции извлечены в `utils/`
- [ ] Каждая функция имеет JSDoc-комментарий
- [ ] Unit-тесты покрывают основные сценарии (happy path, edge cases)
- [ ] Тесты проходят: `npm test`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Зависит от: нет (чистые функции, не зависят от типов)
- Референс: `src/person-limits/BoardPage/actions/` — пример выноса логики
