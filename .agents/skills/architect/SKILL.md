---
name: architect
description: Проектирование и ревью архитектуры UI-компонентов в jira-helper. Используй при создании новых фич, рефакторинге, ревью кода или когда пользователь спрашивает про архитектуру, структуру, паттерны.
---

# Архитектор jira-helper

## Обязательный контекст

**Перед началом работы прочитай**:
- `@docs/architecture_guideline.md` — **единый источник истины** по архитектуре, сущностям, принципам
- `@docs/state-valtio.md` (новые фичи) или `@docs/state-zustand.md` (legacy) — best practices state management

---

## Уникальный контент: DOM через PageObject + DI

**Все взаимодействие с DOM** должно быть вынесено в PageObject и инъектироваться через DI.

**Зачем:**
- **Тестируемость**: можно мокировать PageObject целиком в тестах, не требуется реальный DOM
- **Разделение ответственности**: бизнес-логика не знает о селекторах
- **Переиспользование**: PageObject можно использовать в разных частях фичи

**Структура:**

```
feature/
  page-objects/
    IFeaturePageObject.ts    # Интерфейс с Query и Command методами
    FeaturePageObject.ts     # Реализация с DOM-селекторами
```

**Паттерн PageObject:**

```typescript
export interface IFeaturePageObject {
  selectors: { issue: string; column: string; };

  getIssues(cssSelector: string): Element[];
  getColumnId(issue: Element): string | null;

  setIssueBackgroundColor(issue: Element, color: string): void;
  setIssueVisibility(issue: Element, visible: boolean): void;
}

export const featurePageObjectToken = new Token<IFeaturePageObject>('featurePageObject');
```

**Регистрация PageObject — через Module:**

```typescript
// module.ts
class MyFeatureModule extends Module {
  register(container: Container): void {
    this.lazy(container, featurePageObjectToken, () =>
      new FeaturePageObject(),
    );
    // ...модели
  }
}
```

**Использование в Model:**

```typescript
export class RuntimeModel {
  constructor(
    private pageObject: IFeaturePageObject,  // DI
    private logger: Logger
  ) {}

  apply(): void {
    const issues = this.pageObject.getIssues('.ghx-issue');
    issues.forEach(issue => {
      this.pageObject.setIssueBackgroundColor(issue, '#ff5630');
    });
  }
}
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

container.register({
  token: featurePageObjectToken,
  value: mockPageObject,
});
```

**Правила:**
- React-компоненты НЕ обращаются к DOM напрямую (кроме своих refs)
- Models работают с DOM ТОЛЬКО через PageObject (через constructor DI)
- PageObject регистрируется в Module через `lazy()`, модуль — в `content.ts`
- В тестах всегда используется мок PageObject

---

## Анализ существующей архитектуры

```bash
npm run analyze -- src/person-limits
npm run analyze -- src/person-limits --output src/person-limits/ARCHITECTURE.md
```

Скрипт `analyze-modules.mjs` находит Models, Stores, Actions, DI Tokens, Containers и показывает зависимости + Mermaid-диаграмму.

---

## Чек-лист при проектировании

> Принципы и антипаттерны — см. `docs/architecture_guideline.md`

- [ ] **Coupling**: State разделён по жизненному циклу (property / UI / runtime)?
- [ ] **State/View**: Вся логика вне React-компонентов?
- [ ] **CQS**: Queries не имеют side effects?
- [ ] **Testability**: Есть `reset()` / `getInitialState()`? DI для зависимостей?
- [ ] **Observability**: Логирование и Result для async?
- [ ] **PageObject**: Вся работа с DOM через PageObject + DI?

---

## При работе

1. **Новая фича** → читай `@docs/architecture_guideline.md`, следуй структуре
2. **Ревью** → проверяй по чек-листу выше
3. **Рефакторинг** → сначала `npm run analyze` для понимания структуры
4. **Документирование** → `npm run analyze -- src/feature -o src/feature/ARCHITECTURE.md`
