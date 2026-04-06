# TASK-180: PropertyModel + PropertyModel.test.ts

**Status**: VERIFICATION

**Parent**: [EPIC-18](./EPIC-18-column-limits-refactor.md)

---

## Описание

Ввести valtio `PropertyModel` как замену `useColumnLimitsPropertyStore` и action-ов `loadProperty` / `saveProperty`. Модель отвечает за загрузку и сохранение `WipLimitsProperty` в Jira Board Property `WIP_LIMITS_SETTINGS`. На этом шаге **не** подключаем `module.ts` и **не** удаляем legacy `property/store.ts` — параллельное сосуществование допустимо до финальной фазы.

## Файлы

```
src/column-limits/property/
├── PropertyModel.ts        # новый
├── PropertyModel.test.ts   # новый (миграция сценариев из property/store.test.ts где применимо)
└── index.ts                # изменить экспорты (+ PropertyModel)
```

**Удалять в этой задаче ничего не нужно.**

## Интерфейс (из target-design)

Скопируйте контракт в реализацию; допускаются уточнения импортов путей (`BoardPropertyServiceI`, `Logger`), если в проекте они отличаются.

```typescript
import type { Result } from 'ts-results';
import type { WipLimitsProperty } from '../types';
import type { BoardPropertyServiceI } from 'src/shared/boardPropertyService';
import type { Logger } from 'src/shared/Logger';

export class PropertyModel {
  // === State ===
  data: WipLimitsProperty = {};
  state: 'initial' | 'loading' | 'loaded' = 'initial';
  error: string | null = null;

  constructor(
    private boardPropertyService: BoardPropertyServiceI,
    private logger: Logger
  ) {}

  // === Commands ===

  /** Load property from Jira. Idempotent (skips if already loading). */
  async load(): Promise<Result<WipLimitsProperty, Error>>;

  /** Save current data to Jira Board Property. */
  async persist(): Promise<Result<void, Error>>;

  /** Set data directly (used when data loaded by PageModification). */
  setData(data: WipLimitsProperty): void;

  /** Reset to initial state. */
  reset(): void;
}
```

## Что сделать

1. Реализовать `PropertyModel` с `proxy(valtio)` по образцу референсов (см. ниже): публичное состояние, методы `load` / `persist` / `setData` / `reset`, обработка ошибок через `logger`.
2. Добавить unit-тесты: успешная загрузка/сохранение, `setData`, `reset`, idempotent `load`, ошибки сервиса (mock `BoardPropertyServiceI`).
3. Обновить `src/column-limits/property/index.ts`: экспортировать `PropertyModel` (и при необходимости типы), не ломая существующие экспорты legacy-store до TASK-186.

## Критерии приёмки

- [ ] `PropertyModel` соответствует контракту выше и использует те же ключи property, что и текущий `property/store.ts` / actions.
- [ ] `PropertyModel.test.ts` покрывает основные ветки (happy path + ошибки).
- [ ] `property/index.ts` экспортирует новую модель без поломки текущих импортов в модуле.
- [ ] Тесты проходят: `npm test`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Зависит от: нет (первая задача Phase 1 по смыслу; выполняется **до** [TASK-179](./TASK-179-infrastructure.md)).
- Референсы:
  - `src/swimlane-wip-limits/property/PropertyModel.ts`
  - `src/swimlane-wip-limits/property/PropertyModel.test.ts`
  - `src/features/field-limits/property/PropertyModel.ts`
  - `src/features/field-limits/property/PropertyModel.test.ts`
  - Текущий код: `src/column-limits/property/store.ts`, `src/column-limits/property/actions/loadProperty.ts`, `src/column-limits/property/actions/saveProperty.ts`

---

## Результаты

**Дата**: 2026-04-05

**Агент**: Coder

**Статус**: VERIFICATION

**Что сделано**:

- Добавлен `src/column-limits/property/PropertyModel.ts`: `load` / `persist` / `setData` / `reset`, `BOARD_PROPERTIES.WIP_LIMITS_SETTINGS`, обработка `undefined` как `{}`, отказ `getBoardProperty` с сообщением `no board id` как успешная пустая загрузка (как в `loadColumnLimitsProperty`).
- Добавлен `PropertyModel.test.ts` (9 сценариев): happy path, пустое property, no board id, ошибка загрузки, idempotent load при `loading`, persist и ошибка persist, setData, reset.
- В `property/index.ts` экспортирован `PropertyModel` без изменения legacy-экспортов.

**Проблемы и решения**:

- Нет.
