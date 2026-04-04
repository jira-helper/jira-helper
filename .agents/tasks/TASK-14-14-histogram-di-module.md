# TASK-14-14: DI Module для Histogram

**Epic**: [EPIC-14](./EPIC-14-swimlane-antd-migration.md)
**Status**: DONE
**Depends on**: TASK-14-13

---

## Цель

Создать DI module для регистрации HistogramModel.

---

## Файлы

| Файл | Действие |
|------|----------|
| `src/swimlane-histogram/module.ts` | Создание |
| `src/swimlane-histogram/module.test.ts` | Создание |
| `src/swimlane-histogram/index.ts` | Создание |

---

## Требуемые изменения

### 1. module.ts

```typescript
import { proxy } from 'valtio';
import { useSnapshot } from 'valtio';
import { globalContainer } from '@/shared/di';
import { useDi } from '@/shared/di/react';
import { histogramModelToken } from './tokens';
import { HistogramModel } from './models/HistogramModel';
import { boardPagePageObjectToken } from 'src/page-objects/BoardPage';
import { loggerToken } from '@/shared/Logger';

export function registerSwimlaneHistogramModule(container = globalContainer) {
  container.register({
    token: histogramModelToken,
    factory: () => {
      const pageObject = container.inject(boardPagePageObjectToken);
      const logger = container.inject(loggerToken);
      
      const model = proxy(new HistogramModel(pageObject, logger));
      
      return {
        model,
        useModel: () => {
          useSnapshot(model);
          return model;
        },
      };
    },
    scope: 'singleton',
  });
}
```

### 2. index.ts

```typescript
export { registerSwimlaneHistogramModule } from './module';
export { HistogramModification } from './HistogramModification';
export { histogramModelToken } from './tokens';
export type { SwimlaneHistogram, ColumnStats } from './types';
```

---

## Acceptance Criteria

- [ ] `registerSwimlaneHistogramModule()` регистрирует HistogramModel
- [ ] Использует паттерн `{ model, useModel }`
- [ ] Integration тест
- [ ] `npm run lint:eslint` проходит

---

## Контекст

Смотри:
- `tasks/target-design-swimlane-v2.md` — секция DI Registration
- TASK-14-7 — аналогичный module для WIP Limits

---

## Результаты

**Дата**: 2025-03-05

**Агент**: Coder

**Статус**: DONE

**Что сделано**:

- Создан `src/swimlane-histogram/module.ts` с `registerSwimlaneHistogramModule()`
- Создан `src/swimlane-histogram/module.test.ts` с 3 integration тестами
- Создан `src/swimlane-histogram/index.ts` с экспортами

**Проблемы и решения**:

Проблем не было.
