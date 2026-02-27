# TASK-24: Создать Runtime Store

**Status**: TODO

**Parent**: [EPIC-3](./EPIC-3-wiplimit-on-cells-refactoring.md)

---

## Описание

Создать Zustand store для runtime-состояния Board Page: CSS-селектор для подсчёта issues. Сейчас это поле `this.counterCssSelector` в классе `WipLimitOnCells`.

## Файлы

```
src/wiplimit-on-cells/BoardPage/stores/
├── runtimeStore.ts     # новый
└── types.ts            # новый
```

## Что сделать

1. Создать `types.ts` с `WipLimitCellsRuntimeStoreState`
2. Создать `runtimeStore.ts`:
   - `cssSelectorOfIssues: string` — CSS-селектор для issues
   - `actions.setCssSelectorOfIssues(selector)` — установить селектор
   - `getInitialState()` для тестов

## Код после

```typescript
// runtimeStore.ts
interface WipLimitCellsRuntimeStoreState {
  cssSelectorOfIssues: string;
  actions: {
    setCssSelectorOfIssues: (selector: string) => void;
  };
}

export const useWipLimitCellsRuntimeStore = create<WipLimitCellsRuntimeStoreState>()(set => ({
  cssSelectorOfIssues: '',
  actions: {
    setCssSelectorOfIssues: (selector) => set({ cssSelectorOfIssues: selector }),
  },
}));
```

## Критерии приёмки

- [ ] Store создан по паттерну проекта
- [ ] `getInitialState()` реализован
- [ ] Тесты проходят: `npm test`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Зависит от: нет
- Референс: `src/person-limits/BoardPage/stores/runtimeStore.ts`
