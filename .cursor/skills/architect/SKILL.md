---
name: architect
description: Проектирование и ревью архитектуры UI-компонентов в jira-helper. Используй при создании новых фич, рефакторинге, ревью кода или когда пользователь спрашивает про архитектуру, структуру, паттерны.
---

# Архитектор jira-helper

## Обязательный контекст

**Перед началом работы прочитай**: `@docs/architecture_guideline.md` — полное описание архитектуры с примерами и диаграммами.

---

## Ключевые принципы

### 1. Снижение зацепления (Low Coupling)

Компоненты системы должны быть максимально независимы друг от друга.

**Как достигаем:**
- **Разделение Stores**: Property Store, UI Store, Runtime Store — разный жизненный цикл = разные stores
- **Интерфейсы**: зависимость от абстракций, не от реализаций
- **DI (Dependency Injection)**: сервисы получаем через `this.di.inject(Token)`
- **Actions как посредники**: координация между stores через actions, не напрямую

```
PropertyStore ←─actions─→ UIStore ←─actions─→ RuntimeStore
      ↑                                              
   Services (DI)                                     
```

### 2. Отделение Model от View

**Model** (State + Logic) и **View** (React) — полностью разделены.

| Layer | Что делает | Где код |
|-------|-----------|---------|
| View | Рендеринг JSX | `components/*.tsx` |
| State | Хранение данных | `stores/*.ts` |
| Logic | Бизнес-логика | `actions/*.ts`, `utils/*.ts` |

**Правила:**
- React-компоненты НЕ содержат бизнес-логику
- `useState` — только для UI (hover, dropdown), НЕ для данных
- Все данные — в Zustand stores
- Container подписывается на store, Presentation получает props

### 3. Отделение Commands от Queries (CQS)

**Query** — чтение данных, не меняет состояние.  
**Command** — изменение состояния.

| Тип | Примеры | Характеристики |
|-----|---------|----------------|
| Query | `useStore(s => s.data)`, `getState()` | Чистые, идемпотентные |
| Command | `store.actions.setData()`, `saveProperty()` | Мутируют, могут иметь side effects |

**Паттерн в коде:**
```typescript
// Query — чистое чтение
const data = useMyStore(state => state.data);
const items = useMyStore(state => state.items.filter(isActive));

// Command — мутация через actions
const { setData, addItem } = useMyStore(state => state.actions);
```

**Не смешивай:**
```typescript
// ❌ ПЛОХО: query с side effect
const getData = () => {
  counter++;  // side effect в query!
  return data;
};

// ✅ ХОРОШО: query чистый
const getData = () => data;
const incrementCounter = () => { counter++; };
```

### 4. Тестируемость

Архитектура должна обеспечивать легкое тестирование каждого слоя.

**Что тестируем и как:**

| Слой | Тест | Файл |
|------|------|------|
| Store | Юнит-тест состояния и actions | `*.test.ts` |
| Pure Functions | Юнит-тест трансформаций | `utils/*.test.ts` |
| Components | Интеграционный тест UI | `*.test.tsx` |
| Visual | Storybook stories | `*.stories.tsx` |

**Обязательно:**
- `getInitialState()` в каждом store — для сброса в тестах
- Моки сервисов через DI tokens
- Изоляция stores между тестами

```typescript
// Паттерн теста store
beforeEach(() => {
  useMyStore.setState(getInitialState());
});

it('should update data', () => {
  const { actions } = useMyStore.getState();
  actions.setData({ value: 42 });
  expect(useMyStore.getState().data.value).toBe(42);
});
```

### 5. Наблюдаемость (Observability)

Система должна быть прозрачной для отладки и мониторинга.

**Средства:**
- **Логирование в Actions**: `createAction` автоматически логирует вызовы
- **Префиксный логгер**: `log = this.di.inject(loggerToken).getPrefixedLog('myAction')`
- **Result вместо throw**: ошибки явные в типах, не теряются
- **State inspection**: Zustand devtools, `getState()` в консоли

```typescript
export const loadFeature = createAction({
  name: 'loadFeature',
  async handler() {
    const log = this.di.inject(loggerToken).getPrefixedLog('loadFeature');
    
    log('Starting load...');
    
    const result = await service.fetchData();
    
    if (result.err) {
      log(`Failed: ${result.val.message}`, 'error');
      return;
    }
    
    log(`Loaded ${result.val.length} items`);
    store.actions.setData(result.val);
  },
});
```

### 6. DOM через PageObject + DI

**Все взаимодействие с DOM** должно быть вынесено в PageObject и инъектироваться через DI.

**Зачем:**
- **Тестируемость**: можно мокировать PageObject целиком в тестах, не требуется реальный DOM
- **Разделение ответственности**: бизнес-логика не знает о селекторах
- **Переиспользование**: PageObject можно использовать в разных частях фичи

**Структура:**

```
feature/
  pageObject/
    IFeaturePageObject.ts    # Интерфейс с Query и Command методами
    FeaturePageObject.ts     # Реализация с DOM-селекторами
    featurePageObjectToken.ts  # DI Token
    index.ts                 # Экспорт + registerInDI()
```

**Паттерн PageObject:**

```typescript
// Интерфейс
export interface IFeaturePageObject {
  selectors: {
    issue: string;
    column: string;
  };

  // Queries — чтение DOM
  getIssues(cssSelector: string): Element[];
  getColumnId(issue: Element): string | null;

  // Commands — мутация DOM
  setIssueBackgroundColor(issue: Element, color: string): void;
  setIssueVisibility(issue: Element, visible: boolean): void;
}

// Регистрация в DI
export const featurePageObjectToken = new Token<IFeaturePageObject>('featurePageObject');

export const registerFeaturePageObjectInDI = (container: Container) => {
  container.register({
    token: featurePageObjectToken,
    value: FeaturePageObject,
  });
};
```

**Использование в Actions:**

```typescript
export const applyChanges = createAction({
  name: 'applyChanges',
  handler() {
    const pageObject = this.di.inject(featurePageObjectToken);
    
    // Query DOM
    const issues = pageObject.getIssues('.ghx-issue');
    
    // Command DOM
    issues.forEach(issue => {
      pageObject.setIssueBackgroundColor(issue, '#ff5630');
    });
  },
});
```

**В тестах — мок PageObject:**

```typescript
const mockPageObject: IFeaturePageObject = {
  selectors: { issue: '.issue', column: '.column' },
  getIssues: vi.fn(() => [mockIssue1, mockIssue2]),
  getColumnId: vi.fn(() => 'col1'),
  setIssueBackgroundColor: vi.fn(),
  setIssueVisibility: vi.fn(),
};

globalContainer.register({
  token: featurePageObjectToken,
  value: mockPageObject,
});
```

**Правила:**
- React-компоненты НЕ обращаются к DOM напрямую (кроме своих refs)
- Actions работают с DOM ТОЛЬКО через PageObject
- PageObject регистрируется в DI в `PageModification.apply()`
- В тестах всегда используется мок PageObject

---

## Чек-лист при проектировании

При создании или ревью фичи проверь:

- [ ] **Coupling**: Stores разделены по жизненному циклу?
- [ ] **Model/View**: Вся логика вне React-компонентов?
- [ ] **CQS**: Queries не имеют side effects?
- [ ] **Testability**: Есть `getInitialState()`? Сервисы через DI?
- [ ] **Observability**: Actions логируют? Ошибки через Result?
- [ ] **PageObject**: Вся работа с DOM через PageObject + DI?

---

## Антипаттерны

- Бизнес-логика в React-компонентах
- `useState` для данных, которые должны быть в store
- Один store для property И UI состояния
- Прямые вызовы между stores без actions
- `throw/catch` вместо `Result<T, Error>`
- Store без `getInitialState()`
- Query-функции с side effects
- **Прямая работа с DOM** в actions/компонентах (без PageObject)

---

## Анализ существующей архитектуры

Для понимания структуры модуля используй скрипт `analyze-modules.mjs`:

```bash
# Вывод в консоль
npm run analyze -- src/person-limits

# Сохранение в файл
npm run analyze -- src/person-limits --output src/person-limits/ARCHITECTURE.md
```

**Скрипт находит:**
- 🟢 **Stores** — Zustand stores (`create<...>`)
- 🔵 **Actions** — функции в `/actions/` папках, `createAction`
- 🟠 **DI Tokens** — `new Token<...>`
- 🟣 **Containers** — `*Container.tsx` компоненты

**Скрипт показывает:**
- Сводную таблицу по модулям
- Зависимости между сущностями (кто кого использует)
- Mermaid диаграмму с цветовым кодированием

**Когда использовать:**
- Перед рефакторингом — понять текущую структуру
- При ревью — проверить связи между модулями
- При документировании — сгенерировать актуальную диаграмму

---

## При работе

1. **Новая фича** → читай `@docs/architecture_guideline.md`, следуй структуре
2. **Ревью** → проверяй по чек-листу выше
3. **Рефакторинг** → сначала `npm run analyze` для понимания структуры, потом выноси логику
4. **Документирование** → `npm run analyze -- src/feature -o src/feature/ARCHITECTURE.md`
