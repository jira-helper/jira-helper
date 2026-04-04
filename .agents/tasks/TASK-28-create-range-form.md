# TASK-28: Создать RangeForm React-компонент

**Status**: TODO

**Parent**: [EPIC-3](./EPIC-3-wiplimit-on-cells-refactoring.md)

---

## Описание

Создать React View-компонент формы для добавления range или cell в существующий range. Заменяет HTML-шаблоны `RangeName()` и `cellsAdd()` из `constants.ts`.

## Файлы

```
src/wiplimit-on-cells/SettingsPage/components/RangeForm/
├── RangeForm.tsx               # новый — View: форма добавления
└── RangeForm.stories.tsx       # новый — Storybook stories
```

## Что сделать

1. Создать `RangeForm.tsx` — View-компонент:
   - Input: "Range name" text input
   - Select: swimlane dropdown
   - Select: column dropdown
   - Checkbox: "show indicator"
   - Button: "Add range" / "Add cell" (динамический текст)
   - Логика переключения Add range ↔ Add cell: если имя совпадает с существующим range — "Add cell"

2. Создать `RangeForm.stories.tsx`:
   - Empty form, With swimlanes/columns, Add range mode, Add cell mode

## Код до/после

```typescript
// До (constants.ts — HTML строки):
export const RangeName = (): string => `
  <form class="aui">
    <div class="field-group">
      <label for="WIP_inputRange">Add range</label>
      <input class="text" id="WIP_inputRange" />
      <button id="WIP_buttonRange" class="aui-button">Add range</button>
    </div>
  </form>`;

// После (RangeForm.tsx — React):
export const RangeForm: React.FC<RangeFormProps> = ({
  swimlanes, columns, onAddRange, onAddCell, existingRangeNames
}) => {
  const [name, setName] = useState('');
  const [swimlane, setSwimlane] = useState('-');
  const [column, setColumn] = useState('-');
  const [showBadge, setShowBadge] = useState(false);

  const isExistingRange = existingRangeNames.some(
    n => n.toLowerCase() === name.toLowerCase()
  );

  const handleSubmit = () => {
    if (swimlane === '-' || column === '-') {
      alert('need choose swimlane and column and try again.');
      return;
    }
    if (isExistingRange) {
      onAddCell(name, { swimlane, column, showBadge });
    } else {
      onAddRange(name);
      onAddCell(name, { swimlane, column, showBadge });
    }
  };

  return (/* JSX form */);
};
```

## Критерии приёмки

- [ ] Чистый View-компонент (только props + local useState для формы)
- [ ] Динамическое переключение "Add range" / "Add cell"
- [ ] Валидация: swimlane и column выбраны
- [ ] Storybook stories
- [ ] Тесты проходят: `npm test`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Зависит от: [TASK-20](./TASK-20-extract-shared-types.md) (типы)
- Референс: HTML-шаблоны в `src/wiplimit-on-cells/constants.ts`
