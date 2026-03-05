# TASK-14-16: HistogramModification

**Epic**: [EPIC-14](./EPIC-14-swimlane-antd-migration.md)
**Status**: DONE
**Depends on**: TASK-14-14, TASK-14-15

---

## Цель

Создать `HistogramModification` — entry point для отображения гистограмм на BoardPage.

---

## Файлы

| Файл | Действие |
|------|----------|
| `src/swimlane-histogram/HistogramModification.ts` | Создание |
| `src/swimlane-histogram/index.ts` | Изменение |

---

## Требуемые изменения

### 1. HistogramModification.ts

```typescript
import React from 'react';
import { PageModification } from '@/shared/PageModification';
import { histogramModelToken } from './tokens';
import { boardPagePageObjectToken } from 'src/page-objects/BoardPage';
import { Histogram } from './components/Histogram';
import type { HistogramModel } from './models/HistogramModel';

export class HistogramModification extends PageModification<void, Element> {
  private histogramModel: HistogramModel | null = null;
  private unsubscribe: (() => void) | null = null;

  shouldApply(): boolean {
    const view = this.getSearchParam('view');
    return !view || view === 'detail';
  }

  getModificationId(): string {
    return `swimlane-histogram-${this.getBoardId()}`;
  }

  waitForLoading(): Promise<Element> {
    return this.waitForElement('.ghx-swimlane');
  }

  async apply(): Promise<void> {
    const { model } = this.container.inject(histogramModelToken);
    this.histogramModel = model as HistogramModel;
    
    this.histogramModel.initialize();
    this.renderHistograms();
    
    // Подписка на изменения DOM
    this.unsubscribe = this.onDOMChange('#ghx-pool', () => {
      this.histogramModel?.refresh();
      this.renderHistograms();
    });
  }

  private renderHistograms(): void {
    if (!this.histogramModel) return;
    
    const pageObject = this.container.inject(boardPagePageObjectToken);
    const swimlanes = pageObject.getSwimlanes();
    
    for (const swimlane of swimlanes) {
      const histogram = this.histogramModel.getHistogram(swimlane.id);
      if (!histogram) continue;
      
      pageObject.insertSwimlaneComponent(
        swimlane.header,
        <Histogram data={histogram} />,
        'histogram',
      );
    }
  }

  onDestroy(): void {
    this.unsubscribe?.();
    this.histogramModel?.dispose();
    this.histogramModel = null;
    
    // Cleanup React components
    const pageObject = this.container.inject(boardPagePageObjectToken);
    const swimlanes = pageObject.getSwimlanes();
    for (const swimlane of swimlanes) {
      pageObject.removeSwimlaneComponent(swimlane.header, 'histogram');
    }
  }
}
```

### 2. Обновить index.ts

```typescript
export { registerSwimlaneHistogramModule } from './module';
export { HistogramModification } from './HistogramModification';
export { histogramModelToken } from './tokens';
export { Histogram } from './components/Histogram';
export type { SwimlaneHistogram, ColumnStats } from './types';
```

---

## Acceptance Criteria

- [ ] Extends `PageModification`
- [ ] Инициализирует `HistogramModel` при apply
- [ ] Вставляет `Histogram` компоненты через PageObject
- [ ] Подписывается на изменения DOM
- [ ] Cleanup в `onDestroy`
- [ ] `npm run lint:eslint` проходит

---

## Контекст

Смотри:
- `src/swimlane/SwimlaneStats.ts` — legacy реализация
- TASK-14-11 — аналогичный BoardPageModification для WIP Limits

---

## Результаты

**Дата**: 2026-03-05

**Агент**: Coder

**Статус**: DONE

**Что сделано**:

- Создан `HistogramModification` extends PageModification
- `shouldApply()` проверяет view=detail
- `apply()` регистрирует модуль и инициализирует HistogramModel
- `renderHistograms()` вставляет компоненты через PageObject
- Cleanup через sideEffects

**Проблемы и решения**:

**Проблема 1: insertSwimlaneComponent не обновляет существующие компоненты**

Контекст: При наличии контейнера insertSwimlaneComponent сразу выходит

Решение: Вызов removeSwimlaneComponent перед insertSwimlaneComponent для обновления
