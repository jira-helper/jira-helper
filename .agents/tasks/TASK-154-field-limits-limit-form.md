# TASK-154: LimitForm (View) + stories

**Status**: DONE

**Parent**: [EPIC-16](./EPIC-16-field-limits-modernization.md)

---

## Описание

Создать View-компонент формы добавления/редактирования лимита. Заменяет HTML-шаблон из `src/field-limits/SettingsPage/htmlTemplates.ts`. Использует antd компоненты.

## Файлы

```
src/features/field-limits/SettingsPage/components/
├── LimitForm.tsx            # новый
└── LimitForm.stories.tsx    # новый
```

## Что сделать

1. Создать `LimitForm` с props:

```tsx
export interface LimitFormProps {
  fields: CardLayoutField[];
  columns: BoardColumn[];
  swimlanes: BoardSwimlane[];
  editingLimit: FieldLimit | null;
  onAdd: (input: LimitFormInput) => void;
  onEdit: (input: LimitFormInput) => void;
  onApplyColumns: (columnIds: string[]) => void;
  onApplySwimlanes: (swimlaneIds: string[]) => void;
  disabled?: boolean;
}
```

2. Элементы формы (заменяют legacy HTML template):
   - **Field** — `Select` с опциями из `fields` (fieldId + name)
   - **Field Value** — `Input` (текстовое поле)
   - **Visual Name** — `Input` (отображаемое имя на badge)
   - **WIP Limit** — `InputNumber` (min: 0)
   - **Columns** — `Select` mode="multiple" с опциями из `columns`
   - **Swimlanes** — `Select` mode="multiple" с опциями из `swimlanes`
   - **Кнопки**: "Add limit" (вызывает onAdd), "Edit limit" (вызывает onEdit, disabled когда нет editingLimit)
   - **"Apply columns for selected"** / **"Apply swimlanes for selected"** — кнопки массового применения

3. Когда `editingLimit` не null — предзаполнить форму значениями лимита

4. Storybook stories:
   - Default (пустая форма)
   - WithEditingLimit (форма в режиме редактирования)
   - Disabled

## Критерии приёмки

- [ ] Все элементы из legacy формы реализованы через antd
- [ ] Форма предзаполняется при editingLimit
- [ ] Storybook stories работают
- [ ] Тесты проходят: `npm test`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Зависит от: [TASK-148](./TASK-148-field-limits-types-tokens.md) (типы)
- Legacy код: `src/field-limits/SettingsPage/htmlTemplates.ts:27-129` (fieldLimitsTableTemplate)

---

## Результаты

**Дата**: 2025-03-13

**Агент**: Coder

**Статус**: DONE

**Что сделано**:

- Создан `src/features/field-limits/SettingsPage/components/LimitForm.tsx` — View-компонент формы с antd (Select, Input, InputNumber, Button, Space, Divider)
- Создан `src/features/field-limits/SettingsPage/components/LimitForm.stories.tsx` — stories: Default, WithEditingLimit, Disabled
- Форма предзаполняется при editingLimit через useEffect
- Исправлен порядок определения resetForm (no-use-before-define)

**Проблемы и решения**:

- ESLint `@typescript-eslint/no-use-before-define`: resetForm вызывался в useEffect до определения. Решение: перенесён resetForm выше useEffect.
