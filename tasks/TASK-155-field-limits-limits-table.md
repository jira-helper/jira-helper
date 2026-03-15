# TASK-155: LimitsTable (View) + stories

**Status**: DONE

**Parent**: [EPIC-16](./EPIC-16-field-limits-modernization.md)

---

## Описание

Создать View-компонент таблицы лимитов с операциями edit/delete и color picker. Заменяет рендеринг строк из legacy `renderRows` / `renderLimitRow` / `fieldRowTemplate`.

## Файлы

```
src/features/field-limits/SettingsPage/components/
├── LimitsTable.tsx            # новый
└── LimitsTable.stories.tsx    # новый
```

## Что сделать

1. Создать `LimitsTable` с props:

```tsx
export interface LimitsTableProps {
  limits: Record<string, FieldLimit>;
  columns: BoardColumn[];
  swimlanes: BoardSwimlane[];
  fields: CardLayoutField[];
  selectedKeys: string[];
  onSelect: (keys: string[]) => void;
  onEdit: (limitKey: string) => void;
  onDelete: (limitKey: string) => void;
  onColorChange: (limitKey: string, color: string) => void;
}
```

2. Использовать antd `Table` с колонками:
   - Checkbox (для массового выбора) — через `rowSelection`
   - Field Name (по fieldId из fields)
   - Field Value
   - Visual Name (с цветным бейджем, кликабельный для color picker)
   - Limit
   - Columns (имена колонок через запятую)
   - Swimlanes (имена swimlanes через запятую)
   - Actions: Edit, Delete (antd Button)

3. Color picker: использовать antd `ColorPicker` на Visual Name

4. Storybook stories:
   - Empty (нет лимитов)
   - WithLimits (3-4 лимита)
   - WithSelectedRows

## Критерии приёмки

- [ ] Все колонки из legacy таблицы реализованы
- [ ] Checkbox selection работает (selectedKeys/onSelect)
- [ ] Color picker меняет цвет через onColorChange
- [ ] Edit/Delete вызывают соответствующие callbacks
- [ ] Storybook stories работают
- [ ] Тесты проходят: `npm test`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Зависит от: [TASK-148](./TASK-148-field-limits-types-tokens.md) (типы)
- Legacy код: `src/field-limits/SettingsPage/htmlTemplates.ts:131-173` (fieldRowTemplate), `src/field-limits/SettingsPage/index.ts:356-413` (renderRows/renderLimitRow)

---

## Результаты

**Дата**: 2025-03-13

**Агент**: Coder

**Статус**: DONE

**Что сделано**:

- Создан `LimitsTable.tsx` — View-компонент таблицы с колонками Field, Value, Name (ColorPicker + Tag), Limit, Columns, Swimlanes, Actions (Edit/Delete)
- Создан `LimitsTable.cy.tsx` — 6 Cypress component тестов (TDD)
- Создан `LimitsTable.stories.tsx` — Empty, WithLimits, WithSelectedRows
- ColorPicker использует `value.toHexString()` (паттерн IssueLinkItem)

**Проблемы и решения**:

- Antd ColorPicker onChange: использован `value.toHexString()` вместо второго параметра — надёжнее для controlled mode
