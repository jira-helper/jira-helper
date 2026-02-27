# TASK-25: Рефакторинг BoardPage index.ts

**Status**: TODO

**Parent**: [EPIC-3](./EPIC-3-wiplimit-on-cells-refactoring.md)

---

## Описание

Рефакторинг `WipLimitOnCells.ts` (Board Page): убрать всю бизнес-логику и DOM-операции из класса, делегировать в actions, PageObject и утилиты. Класс должен содержать только lifecycle методы PageModification.

## Файлы

```
src/wiplimit-on-cells/BoardPage/
├── index.ts                        # новый (переименован из WipLimitOnCells.ts)
└── actions/
    ├── applyLimits.ts              # новый — основная логика
    └── renderWipLimitCells.ts      # новый — рендер на доске
```

## Что сделать

1. Создать `BoardPage/actions/applyLimits.ts`:
   - Инжектить PageObject через DI
   - Использовать утилиты из `utils/`
   - Читать настройки из Property Store
   - Сохранять runtime-состояние в Runtime Store

2. Создать `BoardPage/actions/renderWipLimitCells.ts`:
   - Перенести логику из `renderWipLimitCells()` метода
   - Использовать PageObject для DOM-операций
   - Использовать чистые утилиты для вычислений

3. Создать `BoardPage/index.ts`:
   - Lifecycle: `shouldApply()`, `waitForLoading()`, `loadData()`, `apply()`
   - В `apply()`: зарегистрировать PageObject в DI, инициализировать stores, вызвать action
   - `onDOMChange` → вызов action
   - Стили вынести в отдельный CSS-файл

## Код до/после

```typescript
// До (WipLimitOnCells.ts — 300 строк):
export default class extends PageModification<any, Element> {
  private wip: Range[] = [];
  private counterCssSelector: string = '';

  apply(data) {
    this.wip = WipLimitSetting;
    this.counterCssSelector = this.getCssSelectorOfIssues(editData);
    this.renderWipLimitCells();
    // ... 200 строк бизнес-логики
  }
}

// После (BoardPage/index.ts — ~50 строк):
export default class extends PageModification<[any, WipLimitRange[]], Element> {
  apply(data: [any, WipLimitRange[]]) {
    const [editData, settings] = data;
    if (!settings) return;

    registerWipLimitCellsBoardPageObjectInDI(globalContainer);

    const { actions } = useWipLimitCellsRuntimeStore.getState();
    actions.setCssSelectorOfIssues(this.getCssSelectorOfIssues(editData));

    applyLimits(settings);
    this.onDOMChange('#ghx-pool', () => applyLimits(settings));
  }
}
```

## Критерии приёмки

- [ ] Класс PageModification содержит только lifecycle методы
- [ ] Вся бизнес-логика в actions
- [ ] Все DOM-операции через PageObject
- [ ] Все вычисления через чистые утилиты
- [ ] Стили в отдельном CSS-файле
- [ ] Тесты проходят: `npm test`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Зависит от: [TASK-20](./TASK-20-extract-shared-types.md), [TASK-21](./TASK-21-extract-pure-utils.md), [TASK-22](./TASK-22-create-property-store.md), [TASK-23](./TASK-23-create-board-pageobject.md), [TASK-24](./TASK-24-create-runtime-store.md)
- Референс: `src/person-limits/BoardPage/index.ts`
