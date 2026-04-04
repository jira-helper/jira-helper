# TASK-27: Создать RangeTable React-компоненты (замена table.ts)

**Status**: TODO

**Parent**: [EPIC-3](./EPIC-3-wiplimit-on-cells-refactoring.md)

---

## Описание

Создать React-компоненты для отображения таблицы ranges (замена 300-строчного `table.ts` с императивным DOM-кодом). Компоненты: `RangeTable` (таблица), `RangeRow` (строка), `CellBadge` (badge ячейки).

## Файлы

```
src/wiplimit-on-cells/SettingsPage/components/RangeTable/
├── RangeTable.tsx              # новый — View: таблица ranges
├── RangeRow.tsx                # новый — View: строка range
├── CellBadge.tsx               # новый — View: badge ячейки
└── RangeTable.stories.tsx      # новый — Storybook stories
```

## Что сделать

1. Создать `RangeTable.tsx` — View-компонент:
   - Отображает `<table>` с заголовками: "", Range name, WIP limit, Disable, Cells
   - Рендерит `<RangeRow>` для каждого range
   - Props: `ranges`, `onDeleteRange`, `onDeleteCell`, `onChangeField`, `onSelectRange`, `getNameLabel`

2. Создать `RangeRow.tsx` — View-компонент:
   - Inline editing: name (input text + blur), wipLimit (input number + blur), disable (checkbox)
   - Кнопки: select (edit icon), delete (trash icon)
   - Рендерит `<CellBadge>` для каждой ячейки

3. Создать `CellBadge.tsx` — View-компонент:
   - Отображает label ячейки (swimlane/column)
   - Иконка info если `showBadge`
   - Кнопка delete (trash icon)

4. Создать `RangeTable.stories.tsx`:
   - Empty state, Single range, Multiple ranges, With cells

## Код после

```typescript
// RangeTable.tsx
export const RangeTable: React.FC<RangeTableProps> = ({
  ranges, onDeleteRange, onDeleteCell, onChangeField, onSelectRange, getNameLabel
}) => (
  <table className="aui aui-table-list">
    <thead>
      <tr>
        <th style={{ width: '2%' }}></th>
        <th style={{ width: '30%' }}>Range name</th>
        <th style={{ width: '10%' }}>WIP limit</th>
        <th style={{ width: '3%' }}>Disable</th>
        <th style={{ width: '50%' }}>Cells (swimlane/column)</th>
      </tr>
    </thead>
    <tbody>
      {ranges.map(range => (
        <RangeRow
          key={range.name}
          range={range}
          onDelete={() => onDeleteRange(range.name)}
          onDeleteCell={(sw, col) => onDeleteCell(range.name, sw, col)}
          onChangeField={(field, value) => onChangeField(range.name, field, value)}
          onSelect={() => onSelectRange(range.name)}
          getNameLabel={getNameLabel}
        />
      ))}
    </tbody>
  </table>
);
```

## Критерии приёмки

- [ ] `RangeTable`, `RangeRow`, `CellBadge` — чистые View-компоненты (только props, нет useStore)
- [ ] Inline editing работает (name, wipLimit, disable)
- [ ] Delete range/cell через callbacks
- [ ] Storybook stories показывают все состояния
- [ ] Тесты проходят: `npm test`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Зависит от: [TASK-20](./TASK-20-extract-shared-types.md) (типы)
- Референс: `src/person-limits/SettingsPage/components/PersonalWipLimitTable.tsx`
