# Developer guide: регистрация diagnostic data

Документ для разработчиков и агентов jira-helper. Описывает, как подключить фичу к механизму сбора диагностики.

**Эпик:** [EPIC-7: Diagnostic data collection](./EPIC-7-diagnostic-data-collection.md)

Связанные артефакты: [requirements.md](./requirements.md) §5–§5.4, [target-design.md](./target-design.md). Public API types: `src/features/diagnostic-module/types.ts` (JSDoc + links сюда).

## Быстрый чеклист

1. Выбери canonical `featureName` (requirements §5.4).
2. Зарегистрируй callback в bootstrap фичи (`module.register()` или legacy DI/init).
3. Callback — синхронный, side-effect free, только read-only snapshot.
4. Payload следует convention `{ settings: { boardProperty, localStorage }, runtime }` (requirements §5.3).
5. Добавь unit-тест: callback фичи возвращает ожидаемый diagnostic snapshot.

## Canonical `featureName`

| Тип фичи | Правило | Пример |
|----------|---------|--------|
| Папка под `src/features/` | имя папки as-is | `column-limits-module`, `gantt-chart` |
| Файл в подпапке | `{subdir}-{file-base}` kebab-case | `charts-add-sla-line` |

Ключ попадает в `featureDiagnostics[featureName]` экспортируемого JSON.

### v1: зарегистрированные `featureName` (requirements §5)

| `featureName` | Источники (§5) | Где регистрируется |
|---------------|------------------|-------------------|
| `column-limits-module` | boardProperty, runtime | `column-limits-module/module.ts` |
| `person-limits-module` | boardProperty, runtime | `person-limits-module/module.ts` |
| `swimlane-wip-limits-module` | boardProperty, runtime | `swimlane-wip-limits-module/module.ts` |
| `field-limits-module` | boardProperty, runtime | `field-limits-module/module.ts` |
| `card-colors-module` | boardProperty, runtime | `card-colors-module/module.ts` |
| `sub-tasks-progress` | boardProperty, localStorage | `sub-tasks-progress/diagnosticRegistration.ts` → `content.ts` |
| `additional-card-elements` | boardProperty | `additional-card-elements/diagnosticRegistration.ts` → `content.ts` |
| `wiplimit-on-cells` | boardProperty | `wiplimit-on-cells/diagnosticRegistration.ts` → `content.ts` |
| `charts-add-sla-line` | boardProperty | `charts/diagnosticRegistration.ts` → `content.ts` |
| `gantt-chart` | localStorage, runtime | `gantt-chart/module.ts` |
| `jira-comment-templates-module` | localStorage | `jira-comment-templates-module/module.ts` |
| `local-settings` | localStorage | `local-settings/diagnosticRegistration.ts` → `content.ts` |
| `blur-for-sensitive` | localStorage | `blur-for-sensitive/diagnosticRegistration.ts` → `BlurSensitiveFeature.ts` |
| `bug-template` | localStorage | `bug-template/diagnosticRegistration.ts` → `content.ts` |

Фича без строки в таблице — out of scope v1 (ключа в export не будет).

## Где регистрировать

### Feature module (`*-module` с `module.ts`)

В **конце** `register()`, после регистрации моделей фичи:

```ts
import { Ok, type Result } from 'ts-results';
import { diagnosticModelToken } from 'src/features/diagnostic-module/tokens';
import type { FeatureDiagnosticData } from 'src/features/diagnostic-module/types';

class ColumnLimitsModule extends Module {
  register(container: Container): void {
    // ... this.lazy(...) для моделей фичи

    const { model: diagnosticModel } = container.inject(diagnosticModelToken);
    const { model: propertyModel } = container.inject(propertyModelToken);
    const { model: boardRuntimeModel } = container.inject(boardRuntimeModelToken);

    diagnosticModel.registerDiagnosticData('column-limits-module', (): Result<FeatureDiagnosticData, Error> =>
      Ok({
        settings: {
          boardProperty: propertyModel.data,
          localStorage: null,
        },
        runtime: {
          groupStats: boardRuntimeModel.groupStats,
        },
      })
    );
  }
}
```

Callback — **closure** над моделями, inject'нутыми в том же `register()`. Не вызывай `load()`, `recalculate()`, `render()` и т.п.

**Порядок в `content.ts`:** `diagnosticModule.ensure(container)` — первым среди feature-модулей (requirements §5.5).

### Legacy-фича (без `module.ts`)

Вынеси сбор snapshot и регистрацию в `diagnosticRegistration.ts` (тестируемый `collect*DiagnosticData` + `register*DiagnosticData(container)`), вызови register-функцию из существующего DI/init **после** inject зависимостей фичи и **после** `diagnosticModule.ensure(container)`.

Пример (`blur-for-sensitive/diagnosticRegistration.ts`):

```ts
import type { Container } from 'dioma';
import { Ok, type Result } from 'ts-results';
import { diagnosticModelToken } from 'src/features/diagnostic-module/tokens';
import type { FeatureDiagnosticData } from 'src/features/diagnostic-module/types';

export function collectBlurForSensitiveDiagnosticData(): Result<FeatureDiagnosticData, Error> {
  return Ok({
    settings: {
      boardProperty: null,
      localStorage: { blurSensitive: localStorage.getItem('blurSensitive') },
    },
    runtime: null,
  });
}

export function registerBlurForSensitiveDiagnosticData(container: Container): void {
  const { model: diagnosticModel } = container.inject(diagnosticModelToken);
  diagnosticModel.registerDiagnosticData('blur-for-sensitive', collectBlurForSensitiveDiagnosticData);
}
```

В `BlurSensitiveFeature.ts` / `content.ts` — один вызов `registerBlurForSensitiveDiagnosticData(container)` рядом с остальным bootstrap.

## Правила callback (обязательно)

- Синхронный: `() => Result<FeatureDiagnosticData, Error>`.
- Side-effect free: без `await`, I/O, мутаций state/DOM/storage.
- Только read: state моделей, zustand/valtio snapshot, read-only cache.
- Если нет безопасного read API — добавь `getDiagnosticSnapshot(): FeatureDiagnosticData` на модель (без DOM, без командных методов).

## Рекомендованный payload

```ts
{
  settings: {
    boardProperty: <snapshot | null>,
    localStorage: <snapshot | null>,
  },
  runtime: <snapshot | null>,  // null если runtime в v1 не собираем
}
```

Отсутствующий источник → `null`, ключ не опускаем. Детали по полям — requirements §5 для каждой фичи.

## Межмодульные импорты

Из других модулей допустимо:

- `diagnosticModelToken` из `src/features/diagnostic-module/tokens` (`createModelToken`, inject → `{ model }`)
- `import type { FeatureDiagnosticCallback, FeatureDiagnosticData, FeatureDiagnosticError, DiagnosticReport } from 'src/features/diagnostic-module/types'`

Запрещено импортировать реализации (`DiagnosticModel`, `DiagnosticModule`, internal utils) — см. `docs/module-boundaries.md`.

## Тестирование

Для **каждой** фичи — unit-тест, что diagnostic callback корректно собирает snapshot модуля:

- Arrange: mock/inject моделей с известным state.
- Act: вызов callback (напрямую или через `DiagnosticModel.collectDiagnosticReport()` после регистрации).
- Assert: payload соответствует convention §5.3 и полям из requirements §5; `JSON.stringify` проходит.

Ядро `DiagnosticModel` (registry, fault tolerance, serialization fallback) — отдельные unit-тесты в `diagnostic-module`.

## Что не попадает в отчёт

- Фича не вызвала `registerDiagnosticData` → **ключа нет** в `featureDiagnostics` (не ошибка).
- Фичи вне requirements §5 (swimlane-histogram-module, board-settings, …) — out of scope v1.

## Export до загрузки данных

Если property ещё не loaded — callback возвращает **текущий state as-is** (`state: 'initial'`, `data: null`). Это нормально, не возвращай `{ error }` только из-за незагруженного state.

## Onboarding новой фичи (после v1)

1. Добавь секцию в requirements §5 (источники данных).
2. Зарегистрируй callback по этому guide.
3. Добавь unit-тест diagnostic callback.
4. Проверь export: ключ появляется в `featureDiagnostics`, payload JSON-serializable.
