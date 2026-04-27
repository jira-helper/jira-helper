# Component Containers

Этот документ уточняет правило из `docs/architecture_guideline.md`: **Container подключает state и команды к View, но не владеет бизнес-логикой**.

## Назначение Container

ComponentContainer — тонкий React-слой между DI/Model и View-компонентами.

Container может:

- получать зависимости через DI (`useDi().inject(...)` / `container.inject(...)`);
- читать reactive snapshot через `useModel()` / `useStore(...)`;
- держать локальный UI-only state: открыта ли модалка, hover target, активный tab, позиция tooltip;
- вызывать методы модели из event handlers и effects;
- адаптировать данные к props View без доменных решений;
- выбирать UI state: loading / error / empty / content.

Container не должен:

- парсить доменные данные (`changelog`, `JQL`, статусы, Jira payload);
- фильтровать, сортировать или группировать domain collections по бизнес-правилам;
- объединять built-in и custom сущности, если это правило продукта;
- вычислять warning/recommendation списки;
- знать shape persisted storage или cascade resolution;
- читать raw maps из модели и на их основе принимать domain decisions;
- содержать `reduce` / сложный `map` / `filter` над domain entities;
- импортировать domain utilities (`compute*`, `parse*`, `resolve*`, `match*`, `apply*`) ради бизнес-вычислений.

## Где должна жить логика

| Логика | Владелец | Тест |
|---|---|---|
| Persisted settings, cascade, draft lifecycle | Settings/Property Model | Vitest model tests |
| Runtime domain state and derived warnings | Runtime/Data Model | Vitest model tests |
| Stateless domain transform | `utils/` pure function | Vitest util tests |
| UI-only interaction state | Container | Component/Cypress tests |
| Presentation layout | View component | Storybook / component tests |
| DOM integration with Jira page | PageObject | Vitest PageObject tests |

## Allowed `useMemo` / `useEffect`

`useMemo` в Container допустим, если он:

- собирает простые props без бизнес-решения;
- мемоизирует event handlers / UI-only arrays;
- не импортирует domain helpers;
- не парсит и не фильтрует domain data.

`useEffect` в Container допустим, если он:

- запускает загрузку данных через метод модели;
- синхронизирует UI lifecycle с моделью;
- очищает UI-only ресурсы;
- не содержит правил продукта внутри callback.

Если `useMemo` / `useEffect` содержит доменное правило, оно должно переехать в Model или pure utility.

## Examples

### Bad: domain merge in Container

```tsx
const customQuickFilters = resolved?.quickFilters ?? [];
const allQuickFilters = useMemo(
  () => [...BUILT_IN_QUICK_FILTERS, ...customQuickFilters],
  [customQuickFilters]
);
```

Почему плохо: Container знает продуктовый инвариант “built-ins always first”. Это ответственность Settings/QuickFilters Model.

Лучше:

```tsx
const quickFilters = settingsSnap.availableQuickFilters;
```

### Bad: derived warning model in Container

```tsx
const tasksWithoutStatusHistory = useMemo(() => {
  const byKey = dataModel.getIssuesByKey();
  return bars
    .filter(bar => parseChangelog(byKey.get(bar.issueKey)?.changelog).length === 0)
    .map(bar => ({ key: bar.issueKey, summary: summaryFromLabel(bar.label) }));
}, [bars, dataModel]);
```

Почему плохо: Container парсит changelog и вычисляет business warning.

Лучше:

```tsx
const { tasksWithoutStatusHistory } = dataSnap;
```

### Good: UI-only state in Container

```tsx
const [settingsVisible, setSettingsVisible] = useState(false);
const [hoveredBar, setHoveredBar] = useState<GanttBar | null>(null);

return (
  <ChartView
    bars={dataSnap.visibleBars}
    onBarHover={setHoveredBar}
    onOpenSettings={() => setSettingsVisible(true)}
  />
);
```

## Review Checklist

Для каждого `*Container.tsx` проверь:

- [ ] imports: нет domain utilities ради бизнес-вычислений;
- [ ] `useMemo`: нет parsing/filtering/sorting/grouping domain entities;
- [ ] `useEffect`: только orchestration, не продуктовые правила;
- [ ] callbacks: вызывают методы модели, а не реализуют доменную логику inline;
- [ ] local state: только UI-only, не persisted/runtime domain state;
- [ ] все derived domain values покрыты unit-тестами модели или pure utils.

Если есть сомнение, задавай вопрос: **это изменение влияет на бизнес-результат или только на отображение?**

- Бизнес-результат -> Model / utils.
- Отображение / browser interaction -> Container / View.
