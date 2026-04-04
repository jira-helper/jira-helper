# TASK-14-13: Types + tokens + HistogramModel

**Epic**: [EPIC-14](./EPIC-14-swimlane-antd-migration.md)
**Status**: DONE
**Depends on**: TASK-14-1

---

## Цель

Создать foundation для фичи swimlane-histogram: типы, DI-токены и HistogramModel.

---

## Файлы

| Файл | Действие |
|------|----------|
| `src/swimlane-histogram/types.ts` | Создание |
| `src/swimlane-histogram/tokens.ts` | Создание |
| `src/swimlane-histogram/models/HistogramModel.ts` | Создание |
| `src/swimlane-histogram/models/HistogramModel.test.ts` | Создание |
| `src/swimlane-histogram/models/index.ts` | Создание |

---

## Требуемые изменения

### 1. types.ts

```typescript
export interface ColumnStats {
  columnName: string;
  issueCount: number;
}

export interface SwimlaneHistogram {
  swimlaneId: string;
  totalIssues: number;
  columns: ColumnStats[];
}

export type LoadingState = 'initial' | 'loading' | 'loaded' | 'error';
```

### 2. tokens.ts

```typescript
import { Token } from 'dioma';
import { useSnapshot } from 'valtio';
import { useDi } from '@/shared/di/react';
import type { HistogramModel } from './models/HistogramModel';

export const histogramModelToken = new Token<{
  model: Readonly<HistogramModel>;
  useModel: () => Readonly<HistogramModel>;
}>('swimlane-histogram/histogramModel');
```

### 3. HistogramModel.ts

```typescript
import { proxy } from 'valtio';
import type { IBoardPagePageObject } from 'src/page-objects/BoardPage';
import type { ILogger } from '@/shared/Logger';
import type { SwimlaneHistogram, LoadingState } from '../types';

export class HistogramModel {
  histograms: Map<string, SwimlaneHistogram> = new Map();
  state: LoadingState = 'initial';
  error: string | null = null;

  constructor(
    private pageObject: IBoardPagePageObject,
    private logger: ILogger,
  ) {}

  /** Инициализация: рассчитать гистограммы для всех swimlanes */
  initialize(): void {
    this.state = 'loading';
    
    try {
      const swimlanes = this.pageObject.getSwimlanes();
      const columnHeaders = this.pageObject.getColumns();
      
      for (const swimlane of swimlanes) {
        const histogram = this.calculateHistogram(swimlane.id, columnHeaders);
        this.histograms.set(swimlane.id, histogram);
      }
      
      this.state = 'loaded';
    } catch (e) {
      this.error = e instanceof Error ? e.message : 'Unknown error';
      this.state = 'error';
    }
  }

  /** Рассчитать гистограмму для одного swimlane */
  calculateHistogram(swimlaneId: string, columnHeaders: string[]): SwimlaneHistogram {
    const counts = this.pageObject.getIssueCountByColumn(swimlaneId);
    
    const columns = columnHeaders.map((name, index) => ({
      columnName: name,
      issueCount: counts[index] ?? 0,
    }));
    
    const totalIssues = columns.reduce((sum, col) => sum + col.issueCount, 0);
    
    return {
      swimlaneId,
      totalIssues,
      columns,
    };
  }

  /** Обновить гистограммы (при изменении DOM) */
  refresh(): void {
    this.initialize();
  }

  /** Получить гистограмму для swimlane */
  getHistogram(swimlaneId: string): SwimlaneHistogram | undefined {
    return this.histograms.get(swimlaneId);
  }

  /** Cleanup */
  dispose(): void {
    this.histograms.clear();
    this.state = 'initial';
  }
}
```

---

## Acceptance Criteria

- [ ] Все типы созданы с JSDoc
- [ ] HistogramModel использует `boardPagePageObjectToken`
- [ ] `calculateHistogram()` возвращает корректные данные
- [ ] `refresh()` пересчитывает гистограммы
- [ ] Тесты с мокнутым PageObject
- [ ] `npm run lint:eslint` проходит

---

## Контекст

Смотри:
- `tasks/target-design-swimlane-v2.md` — спецификация HistogramModel
- `src/swimlane/SwimlaneStats.ts` — legacy логика

---

## Результаты

**Дата**: 2026-03-05

**Агент**: Coder

**Статус**: DONE

**Что сделано**:

- Создан `types.ts` с типами ColumnStats, SwimlaneHistogram, LoadingState
- Создан `tokens.ts` с histogramModelToken
- Создан `HistogramModel` с методами initialize, calculateHistogram, refresh, getHistogram, dispose
- 7 unit-тестов

**Проблемы и решения**:

Проблем не было.
