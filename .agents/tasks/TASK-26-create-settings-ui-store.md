# TASK-26: Создать Settings UI Store

**Status**: TODO

**Parent**: [EPIC-3](./EPIC-3-wiplimit-on-cells-refactoring.md)

---

## Описание

Создать Zustand store для UI-состояния Settings Page: редактирование ranges, swimlanes/columns списки, текущее состояние формы. Заменяет поля класса `this.data`, `this.swimlane`, `this.column` и всю логику `TableRangeWipLimit`.

## Файлы

```
src/wiplimit-on-cells/SettingsPage/stores/
├── settingsUIStore.ts      # новый
└── types.ts                # новый
```

## Что сделать

1. Создать `types.ts` с `SettingsUIStoreState`
2. Создать `settingsUIStore.ts`:
   - `data.ranges: WipLimitRange[]` — текущие ranges
   - `data.swimlanes`, `data.columns` — списки для формы
   - Actions: `addRange`, `deleteRange`, `addCells`, `deleteCells`, `changeField`, `setRanges`, `reset`
   - `getInitialState()` для тестов
3. Логика actions из `table.ts`: `addRange()` (валидация имени), `addCells()` (проверка уникальности), `deleteCells()`, `changeField()`, `findRange()`

## Код после

```typescript
// settingsUIStore.ts
export const useWipLimitCellsSettingsUIStore = create<SettingsUIStoreState>()(set => ({
  data: {
    ranges: [],
    swimlanes: [],
    columns: [],
  },
  state: 'initial',
  actions: {
    setRanges: (ranges) => set(produce(state => { state.data.ranges = ranges; })),
    setSwimlanes: (swimlanes) => set(produce(state => { state.data.swimlanes = swimlanes; })),
    setColumns: (columns) => set(produce(state => { state.data.columns = columns; })),
    addRange: (name) => set(produce(state => {
      if (!name) return;
      const exists = state.data.ranges.some(r => r.name === name);
      if (exists) return;
      state.data.ranges.push({ name, wipLimit: 0, cells: [] });
    })),
    deleteRange: (name) => set(produce(state => {
      state.data.ranges = state.data.ranges.filter(r => r.name !== name);
    })),
    addCells: (rangeName, cell) => set(produce(state => {
      const range = state.data.ranges.find(r => r.name.toLowerCase() === rangeName.toLowerCase());
      if (!range) return;
      const exists = range.cells.some(c => c.swimlane === cell.swimlane && c.column === cell.column);
      if (!exists) range.cells.push(cell);
    })),
    deleteCells: (rangeName, swimlane, column) => set(produce(state => {
      const range = state.data.ranges.find(r => r.name === rangeName);
      if (!range) return;
      range.cells = range.cells.filter(c => !(c.swimlane === swimlane && c.column === column));
    })),
    changeField: (name, field, value) => set(produce(state => {
      const range = state.data.ranges.find(r => r.name === name);
      if (range) range[field] = value;
    })),
    reset: () => set({ data: { ranges: [], swimlanes: [], columns: [] }, state: 'initial' }),
  },
}));
```

## Критерии приёмки

- [ ] Вся логика из `TableRangeWipLimit` перенесена в store actions
- [ ] Валидации (пустое имя, уникальность) сохранены
- [ ] `getInitialState()` реализован
- [ ] Store протестирован unit-тестами
- [ ] Тесты проходят: `npm test`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Зависит от: [TASK-20](./TASK-20-extract-shared-types.md) (типы `WipLimitRange`, `WipLimitCell`)
- Референс: `src/person-limits/SettingsPage/stores/settingsUIStore.ts`
