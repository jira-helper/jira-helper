# Unit Testing (Vitest)

Юнит-тесты для чистых функций и моделей.

## Когда использовать

- Чистые функции (трансформации, валидация, парсинг)
- Классы
- Утилиты без DOM-зависимостей

**Файлы:** `*.test.ts`

## Запуск

```bash
npm test                                     # все тесты
npm test -- --run src/path/to/file.test.ts   # конкретный файл
```

## Тестирование чистых функций

```typescript
import { describe, it, expect } from 'vitest';
import { parseCalcType } from './parseCalcType';
import { CalcType } from '../types';

describe('parseCalcType', () => {
  it('returns BY_SUM_NUMBERS for "∑(numbers)" pattern', () => {
    expect(parseCalcType('∑(Story Points)')).toBe(CalcType.BY_SUM_NUMBERS);
  });

  it('returns BY_CARD for plain values', () => {
    expect(parseCalcType('Pro')).toBe(CalcType.BY_CARD);
  });
});
```

## Тестирование Valtio Models

Создавай новый экземпляр модели в каждом тесте:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { createSettingsUIModel } from './SettingsUIModel';
import type { SettingsUIModel } from './SettingsUIModel';

describe('SettingsUIModel', () => {
  let model: SettingsUIModel;

  beforeEach(() => {
    model = createSettingsUIModel();
  });

  it('adds a limit', () => {
    model.addLimit({ name: 'John', value: 5 });

    expect(model.limits).toHaveLength(1);
    expect(model.limits[0].name).toBe('John');
  });

  it('resets to initial state', () => {
    model.addLimit({ name: 'John', value: 5 });

    model.reset();

    expect(model.limits).toHaveLength(0);
  });
});
```

Паттерны создания экземпляров для Valtio и Zustand — см. `docs/state-valtio.md` и `docs/state-zustand.md`.

## Моки зависимостей

Предпочтительный порядок подстановки мок-реализаций:

1. **Аргументы / конструктор** — передать мок через параметр функции или конструктор класса
2. **DI токен** — зарегистрировать мок-реализацию через `globalContainer.register()`
3. **vi.mock** — крайний случай, когда нет возможности прокинуть зависимость иначе

### Аргументы / конструктор (предпочтительно)

```typescript
it('counts by card', () => {
  const texts = ['Pro', 'Pro', 'Team'];

  const result = calculateFieldValue(texts, 'Pro', CalcType.BY_CARD);

  expect(result).toBe(2);
});
```

### DI токен (предпочтительно)

```typescript
import { globalContainer } from 'dioma';

beforeEach(() => {
  globalContainer.reset();

  globalContainer.register({
    token: getBoardIdFromURLToken,
    value: () => 'test-board-123',
  });

  globalContainer.register({
    token: updateBoardPropertyToken,
    value: vi.fn(),
  });
});
```

### vi.mock (не рекомендуется)

> `vi.mock` подменяет модуль целиком, что делает тест хрупким и скрывает реальные зависимости.
> Используй только когда зависимость невозможно прокинуть через аргументы или DI.

```typescript
import { vi } from 'vitest';

vi.mock('src/shared/texts', () => ({
  useGetTextsByLocale: (texts: Record<string, { en: string }>) =>
    Object.fromEntries(Object.entries(texts).map(([key, value]) => [key, value.en])),
}));
```

## Очистка

```typescript
beforeEach(() => {
  vi.clearAllMocks();
});
```

## Чек-лист

- [ ] Файл `*.test.ts`
- [ ] AAA-структура (Arrange-Act-Assert)
- [ ] Изоляция (`beforeEach` с новым экземпляром / reset)
- [ ] Один тест — одно поведение
- [ ] Описательные имена тестов
- [ ] Edge cases покрыты
- [ ] Моки минимальны (только внешние зависимости)
- [ ] Тесты проходят: `npm test`
