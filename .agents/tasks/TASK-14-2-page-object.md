# TASK-14-2: PageObject реализация

**Status**: TODO

**Parent**: [EPIC-14](./EPIC-14-swimlane-antd-migration.md)

---

## Описание

Реализовать `SwimlanePageObject` на основе интерфейса из TASK-14-1. Зарегистрировать в DI.

## Файлы

```
src/swimlane/v2/pageObject/
├── ISwimlanePageObject.ts           # из TASK-14-1
├── SwimlanePageObject.ts            # новый
├── swimlanePageObjectToken.ts       # новый
└── index.ts                         # новый
```

## Что сделать

### 1. Создать `SwimlanePageObject.ts`

Реализовать интерфейс `ISwimlanePageObject`:

```typescript
import type { ISwimlanePageObject } from './ISwimlanePageObject';

export class SwimlanePageObject implements ISwimlanePageObject {
  selectors = {
    swimlane: '.ghx-swimlane',
    swimlaneHeader: '.ghx-heading',
    swimlaneHeading: '.ghx-heading *:nth-child(2)',
    swimlaneDescription: '.ghx-description',
    swimlaneInnerHeader: '.ghx-swimlane-header',
    columns: '.ghx-columns',
    issue: '.ghx-issue',
    stalker: '#ghx-swimlane-header-stalker',
  };

  // Queries
  getSwimlanes(): Element[] {
    return Array.from(document.querySelectorAll(this.selectors.swimlane));
  }

  getSwimlaneId(swimlane: Element): string | null {
    return swimlane.getAttribute('swimlane-id');
  }

  // ... остальные методы
}
```

### 2. Создать `swimlanePageObjectToken.ts`

```typescript
import { Token } from 'dioma';
import type { ISwimlanePageObject } from './ISwimlanePageObject';

export const swimlanePageObjectToken = new Token<ISwimlanePageObject>('swimlanePageObject');
```

### 3. Создать `index.ts`

```typescript
import { Container } from 'dioma';
import { swimlanePageObjectToken } from './swimlanePageObjectToken';
import { SwimlanePageObject } from './SwimlanePageObject';

export { swimlanePageObjectToken } from './swimlanePageObjectToken';
export type { ISwimlanePageObject } from './ISwimlanePageObject';

export const registerSwimlanePageObjectInDI = (container: Container) => {
  container.register({
    token: swimlanePageObjectToken,
    value: new SwimlanePageObject(),
  });
};
```

## Селекторы (из legacy кода)

| Селектор | Назначение |
|----------|------------|
| `.ghx-swimlane` | Контейнер swimlane |
| `swimlane-id` attr | ID swimlane |
| `.ghx-heading` | Header swimlane |
| `.ghx-description` | Описание swimlane |
| `.ghx-swimlane-header` | Inner header (для bg color) |
| `.ghx-columns` | Контейнер колонок |
| `.ghx-issue` | Issue card |
| `.ghx-done` | Issue в done колонке |
| `.ghx-issue-subtask` | Subtask issue |
| `#ghx-swimlane-header-stalker` | Sticky header |

## Критерии приёмки

- [ ] Реализованы все методы интерфейса
- [ ] DI token создан и экспортируется
- [ ] `registerSwimlanePageObjectInDI` регистрирует в контейнере
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Зависит от: TASK-14-1
- Референс селекторов: `src/swimlane/constants.ts`
- Референс логики: `src/swimlane/SwimlaneLimits.ts:56-91`
