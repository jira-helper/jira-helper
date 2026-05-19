# Developer guide: регистрация diagnostic data

Документ для разработчиков и агентов jira-helper. Описывает, как подключить фичу к механизму сбора диагностики.

Связанные артефакты: [requirements.md](./requirements.md) §5–§5.4, [target-design.md](./target-design.md).

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

В существующей DI/init-функции, рядом с текущим bootstrap:

```ts
export function registerBlurSensitiveFeatureInDI(container: Container): void {
  // ... существующая регистрация

  const { model: diagnosticModel } = container.inject(diagnosticModelToken);
  diagnosticModel.registerDiagnosticData('blur-for-sensitive', () =>
    Ok({
      settings: {
        boardProperty: null,
        localStorage: { blurSensitive: localStorage.getItem('blurSensitive') },
      },
      runtime: null,
    })
  );
}
```

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

- `diagnosticModelToken` из `src/features/diagnostic-module/tokens`
- `import type { FeatureDiagnosticCallback, FeatureDiagnosticData } from '.../types'`

Запрещено импортировать реализации (`DiagnosticModel`, internal utils) — см. `docs/module-boundaries.md`.

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
