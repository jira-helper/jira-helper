# TASK-22: Создать Property Store (Zustand)

**Status**: TODO

**Parent**: [EPIC-3](./EPIC-3-wiplimit-on-cells-refactoring.md)

---

## Описание

Создать Zustand store для синхронизации WIP limit settings с Jira board property (`BOARD_PROPERTIES.WIP_LIMITS_CELLS`). Включает actions для загрузки и сохранения из/в Jira, с обработкой backward compatibility (swimline → swimlane).

## Файлы

```
src/wiplimit-on-cells/property/
├── store.ts            # новый — useWipLimitCellsPropertyStore
├── types.ts            # новый — PropertyStoreState
└── actions/
    ├── loadProperty.ts   # новый — loadWipLimitCellsProperty
    └── saveProperty.ts   # новый — saveWipLimitCellsProperty
```

## Что сделать

1. Создать `property/types.ts` с `WipLimitCellsPropertyStoreState`
2. Создать `property/store.ts`:
   - Zustand store с `data: WipLimitRange[]`, `state`, `actions`
   - `getInitialState()` для тестов
   - Использовать `produce` из immer
3. Создать `property/actions/loadProperty.ts`:
   - Загрузка из `getBoardProperty(BOARD_PROPERTIES.WIP_LIMITS_CELLS)`
   - Backward compatibility: `swimline` → `swimlane`
4. Создать `property/actions/saveProperty.ts`:
   - Сохранение через `updateBoardProperty(BOARD_PROPERTIES.WIP_LIMITS_CELLS, data)`

## Код после

```typescript
// property/store.ts
export const useWipLimitCellsPropertyStore = create<WipLimitCellsPropertyStoreState>()(set => ({
  data: [],
  state: 'initial',
  actions: {
    setData: (data) => set(produce(state => { state.data = data; })),
    setState: (newState) => set({ state: newState }),
    reset: () => set({ data: [], state: 'initial' }),
  },
}));

useWipLimitCellsPropertyStore.getInitialState = () => ({
  data: [],
  state: 'initial',
  actions: useWipLimitCellsPropertyStore.getState().actions,
});
```

## Критерии приёмки

- [ ] Store создан по паттерну `person-limits/property/store.ts`
- [ ] `getInitialState()` реализован
- [ ] Backward compatibility `swimline` → `swimlane` обработана в `loadProperty`
- [ ] Тесты проходят: `npm test`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Зависит от: [TASK-20](./TASK-20-extract-shared-types.md) (типы `WipLimitRange`)
- Референс: `src/person-limits/property/store.ts`
