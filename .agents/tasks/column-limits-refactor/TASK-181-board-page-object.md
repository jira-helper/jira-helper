# TASK-181: Расширение IBoardPagePageObject / BoardPagePageObject

**Status**: VERIFICATION

**Parent**: [EPIC-18](./EPIC-18-column-limits-refactor.md)

---

## Описание

Перенести обобщаемую DOM-логику из `ColumnLimitsBoardPageObject` в общий `BoardPagePageObject` (`src/page-objects/BoardPage.tsx`): 9 новых методов и тип `ColumnIssueCountOptions`. Это устраняет дублирование и подготавливает `BoardRuntimeModel` (TASK-182) к работе только через `IBoardPagePageObject`.

## Файлы

```
src/page-objects/
└── BoardPage.tsx    # изменить: IBoardPagePageObject + реализация BoardPagePageObject

src/column-limits/BoardPage/pageObject/
├── ColumnLimitsBoardPageObject.ts   # источник логики для переноса (удаление — TASK-183)
└── ...
```

## Тип и интерфейс (из target-design)

```typescript
/** Опции подсчёта issues в колонке (across swimlanes). */
export type ColumnIssueCountOptions = {
  /** Swimlane IDs to exclude from counting */
  ignoredSwimlanes?: string[];
  /** Only count issues of these types (empty/undefined = all) */
  includedIssueTypes?: string[];
  /** Additional CSS :not() filter, e.g. ':not(.ghx-issue-subtask)' */
  cssFilter?: string;
};

export interface IBoardPagePageObject {
  // ... existing methods ...

  /**
   * Ordered column IDs from the board header row.
   * Reads from `.ghx-first ul.ghx-columns > li.ghx-column` elements.
   */
  getOrderedColumnIds(): string[];

  /**
   * Column header element by column ID.
   * Looks in `.ghx-column-header-group` or `ul.ghx-columns`.
   */
  getColumnHeaderElement(columnId: string): HTMLElement | null;

  /**
   * All swimlane IDs from the board (convenience over getSwimlanes().map(s => s.id)).
   */
  getSwimlaneIds(): string[];

  /**
   * Count issues in a specific column across swimlanes.
   * Supports filtering by ignored swimlanes, issue types, and CSS selector.
   */
  getIssueCountInColumn(columnId: string, options?: ColumnIssueCountOptions): number;

  /**
   * Apply inline styles to a column header element.
   */
  styleColumnHeader(columnId: string, styles: Partial<CSSStyleDeclaration>): void;

  /**
   * Insert HTML at the end of a column header element (beforeend).
   */
  insertColumnHeaderHtml(columnId: string, html: string): void;

  /**
   * Remove elements matching selector from a column header element.
   */
  removeColumnHeaderElements(columnId: string, selector: string): void;

  /**
   * Set background color on column cells across swimlanes.
   * @param excludedSwimlaneIds — swimlanes to skip (e.g. not part of the group)
   */
  highlightColumnCells(columnId: string, color: string, excludedSwimlaneIds?: string[]): void;

  /**
   * Clear inline background color from column cells across all swimlanes.
   */
  resetColumnCellStyles(columnId: string): void;
}
```

## Что сделать

1. Добавить `ColumnIssueCountOptions` и методы в `IBoardPagePageObject` в `BoardPage.tsx`.
2. Реализовать методы на объекте `BoardPagePageObject`, перенеся поведение из `src/column-limits/BoardPage/pageObject/ColumnLimitsBoardPageObject.ts` (и связанных helper-ов), сохранив селекторы и edge cases.
3. Убедиться, что существующие тесты page-objects / потребители `boardPagePageObjectToken` не сломаны.
4. **Не** удалять `ColumnLimitsBoardPageObject` в этой задаче — удаление в [TASK-183](./TASK-183-board-page-migration.md).

## Критерии приёмки

- [x] Все 9 методов и тип `ColumnIssueCountOptions` доступны через `boardPagePageObjectToken`.
- [x] Поведение согласовано с прежним `ColumnLimitsBoardPageObject` для сценариев column-limits.
- [x] Тесты проходят: `npm test`
- [x] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Зависит от: нет (можно параллельно с Phase 1 после появления контекста в коде).
- Референсы:
  - Источник переноса: `src/column-limits/BoardPage/pageObject/ColumnLimitsBoardPageObject.ts`, `IColumnLimitsBoardPageObject.ts`
  - Другие фичи с board PO: `src/features/field-limits/BoardPage/page-objects/FieldLimitsBoardPageObject.ts` (паттерны DOM)
  - `src/swimlane-wip-limits/BoardPage/models/BoardRuntimeModel.ts` (как модель использует PO)

---

## Результаты

**Дата**: 2026-04-05

**Агент**: Coder

**Статус**: VERIFICATION

**Что сделано**:

- В `src/page-objects/BoardPage.tsx` добавлены тип `ColumnIssueCountOptions`, девять методов в `IBoardPagePageObject` и реализация на `BoardPagePageObject` (логика перенесена из `ColumnLimitsBoardPageObject` и `styleColumnsWithLimits`).
- Расширены unit-тесты в `src/page-objects/BoardPage.test.ts` (колонки, счётчики, заголовки, подсветка ячеек).
- Обновлены моки `IBoardPagePageObject`: `BoardPage.mock.ts`, `DaysInColumnSettings.stories.tsx`, `DaysInColumnSettings.test.tsx`.
- Прогнаны `npm test` и `npm run lint:eslint -- --fix` — успешно.

**Проблемы и решения**:

- В процессе правки тестового файла в документ попала порча фрагмента; восстановлено скриптом. Ожидание цвета в jsdom для `highlightColumnCells`: хранится как `#ff5630`, не `rgb(...)` — assertion приведён к фактическому значению.
