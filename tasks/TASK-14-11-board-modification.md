# TASK-14-11: BoardPageModification

**Epic**: [EPIC-14](./EPIC-14-swimlane-antd-migration.md)
**Status**: DONE
**Depends on**: TASK-14-5, TASK-14-7, TASK-14-8

---

## Цель

Создать `BoardPageModification` — entry point для отображения WIP-лимитов на BoardPage.

---

## Файлы

| Файл | Действие |
|------|----------|
| `src/swimlane-wip-limits/BoardPage/BoardPageModification.ts` | Создание |
| `src/swimlane-wip-limits/BoardPage/index.ts` | Создание |

---

## Требуемые изменения

### 1. BoardPageModification.ts

```typescript
import { PageModification } from '@/shared/PageModification';
import { boardRuntimeModelToken } from '../tokens';
import { boardPagePageObjectToken } from 'src/page-objects/BoardPage';
import type { BoardRuntimeModel } from './models/BoardRuntimeModel';

export class BoardPageModification extends PageModification<void, Element> {
  private runtimeModel: BoardRuntimeModel | null = null;
  private unsubscribe: (() => void) | null = null;

  shouldApply(): boolean {
    const view = this.getSearchParam('view');
    return !view || view === 'detail';
  }

  getModificationId(): string {
    return `swimlane-wip-limits-board-${this.getBoardId()}`;
  }

  waitForLoading(): Promise<Element> {
    return this.waitForElement('.ghx-swimlane');
  }

  async apply(): Promise<void> {
    const { model } = this.container.inject(boardRuntimeModelToken);
    this.runtimeModel = model as BoardRuntimeModel;
    
    await this.runtimeModel.initialize();
    
    // Подписка на изменения DOM
    const pageObject = this.container.inject(boardPagePageObjectToken);
    this.unsubscribe = this.onDOMChange('#ghx-pool', () => {
      this.runtimeModel?.render();
    });
  }

  onDestroy(): void {
    this.unsubscribe?.();
    this.runtimeModel?.dispose();
    this.runtimeModel = null;
  }
}
```

### 2. index.ts

```typescript
export { BoardPageModification } from './BoardPageModification';
export { BoardRuntimeModel } from './models/BoardRuntimeModel';
export * from './components';
```

---

## Acceptance Criteria

- [ ] Extends `PageModification`
- [ ] Инициализирует `BoardRuntimeModel` при apply
- [ ] Подписывается на изменения DOM через `onDOMChange`
- [ ] Cleanup в `onDestroy`
- [ ] `shouldApply()` проверяет view=detail
- [ ] `npm run lint:eslint` проходит

---

## Контекст

Смотри:
- `src/swimlane/SwimlaneLimits.ts` — legacy реализация
- `src/column-limits/BoardPage/ColumnLimitsBoardModification.ts` — пример

---

## Результаты

**Дата**: 2026-03-05

**Агент**: Coder

**Статус**: DONE

**Что сделано**:

- Создан `BoardPageModification` extends `PageModification`
- `shouldApply()` проверяет view=detail
- `apply()` инициализирует BoardRuntimeModel и подписывается на DOM
- Cleanup через sideEffects с вызовом `runtimeModel.destroy()`

**Проблемы и решения**:

**Проблема 1: PageModification без container**

Контекст: PageModification не имеет поля container

Решение: Использование globalContainer из dioma

**Проблема 2: Дублирование LimitBadgeProps**

Контекст: LimitBadgeProps был в types.ts и в компоненте

Решение: Удалён из types.ts, оставлен только в компоненте
