# TASK-179: tokens.ts + module.ts (инфраструктура DI)

**Status**: VERIFICATION

**Parent**: [EPIC-18](./EPIC-18-column-limits-refactor.md)

---

## Описание

Добавить `tokens.ts` и `registerColumnLimitsModule(container)` по образцу `swimlane-wip-limits` / `field-limits`. На этапе Phase 1 в `tokens.ts` объявляется **`propertyModelToken`**; `boardRuntimeModelToken` и `settingsUIModelToken` дописываются в **TASK-182** и **TASK-184**, когда появятся классы `BoardRuntimeModel` и `SettingsUIModel` (так избегаем пустых заглушек и циклических импортов). В `module.ts` регистрируется **только** `PropertyModel` через `proxy()` + `container.register()`.

Итоговое содержимое `tokens.ts` со всеми тремя токенами — в [target-design.md](./target-design.md); к концу EPIC файл должен совпасть с этим контрактом.

## Файлы

```
src/column-limits/
├── tokens.ts    # новый (минимум: propertyModelToken; дополнить в TASK-182/184)
├── module.ts    # новый (регистрация PropertyModel)
└── module.test.ts  # новый — по аналогии с swimlane-wip-limits (опционально, но желательно)
```

## Контракт tokens.ts (Phase 1 — минимум)

```typescript
import { Token } from 'dioma';
import type { PropertyModel } from './property/PropertyModel';

export const propertyModelToken = new Token<{
  model: Readonly<PropertyModel>;
  useModel: () => Readonly<PropertyModel>;
}>('column-limits/propertyModel');
```

**Полный вариант** (после TASK-182 и TASK-184) — как в target-design: добавить `boardRuntimeModelToken`, `settingsUIModelToken` с `import type` от `BoardPage/models/BoardRuntimeModel` и `SettingsPage/models/SettingsUIModel`.

## Контракт module.ts (из target-design)

```typescript
import type { Container } from 'dioma';

export function registerColumnLimitsModule(container: Container): void;
```

**Внутри (Phase 1):**

- Инжектить `BoardPropertyServiceToken`, `loggerToken` из DI (как в референсах).
- Создать `proxy(new PropertyModel(...))`, зарегистрировать в `propertyModelToken` с `useModel: () => useSnapshot(propertyModel) as PropertyModel`.
- **Не** регистрировать `BoardRuntimeModel` / `SettingsUIModel` до соответствующих задач.

## Что сделать

1. Создать `tokens.ts` с `propertyModelToken` (полный triple-token — в TASK-182/184).
2. Реализовать `registerColumnLimitsModule` с регистрацией только `PropertyModel`.
3. Добавить `module.test.ts` по образцу `src/swimlane-wip-limits/module.test.ts`.
4. При необходимости обновить `src/column-limits/index.ts` для реэкспорта `registerColumnLimitsModule` / токенов (без массового рефакторинга потребителей до следующих задач).

## Критерии приёмки

- [ ] DI регистрирует `PropertyModel` через `proxy` + `container.register` с корректным токеном.
- [ ] Публичный API `registerColumnLimitsModule` совместим с дальнейшим расширением (TASK-182, TASK-184).
- [ ] Тесты проходят: `npm test`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Зависит от: [TASK-180](./TASK-180-property-model.md) (нужен класс `PropertyModel` и стабильные импорты).
- Референсы:
  - `src/swimlane-wip-limits/tokens.ts`
  - `src/swimlane-wip-limits/module.ts`
  - `src/swimlane-wip-limits/module.test.ts`
  - `src/features/field-limits/tokens.ts`
  - `src/features/field-limits/module.ts`

---

## Результаты

**Дата**: {YYYY-MM-DD}

**Агент**: {Coder / Architect / Manual}

**Статус**: VERIFICATION

**Что сделано**:

{Заполняется при завершении}

**Проблемы и решения**:

{Заполняется при завершении}
