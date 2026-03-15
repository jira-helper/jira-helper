# TASK-149: Pure Functions + тесты

**Status**: DONE

**Parent**: [EPIC-16](./EPIC-16-field-limits-modernization.md)

---

## Описание

Вынести расчётную логику из legacy `src/field-limits/BoardPage/index.ts` в чистые функции с полным покрытием тестами. Это критически важная бизнес-логика, которая определяет как считаются WIP-лимиты.

## Файлы

```
src/features/field-limits/utils/
├── parseCalcType.ts             # новый
├── parseCalcType.test.ts        # новый
├── calculateFieldValue.ts       # новый
├── calculateFieldValue.test.ts  # новый
├── createLimitKey.ts            # новый
└── createLimitKey.test.ts       # новый
```

## Что сделать

### 1. `parseCalcType.ts`

Определение типа подсчёта по строке `fieldValue`. Логика из legacy:

```typescript
// Legacy код из src/field-limits/BoardPage/index.ts:276-299
// "∑(numbers)" → BY_SUM_NUMBERS
// fieldValue начинается с "∑" → BY_SUM_VALUE
// "val1 || val2" → BY_MULTIPLE_VALUES
// иначе → BY_CARD
```

Сигнатура:
```typescript
import { CalcType } from '../types';
export function parseCalcType(fieldValue: string): CalcType;
```

### 2. `calculateFieldValue.ts`

Подсчёт значений из extra-field DOM-элемента. Вынести 4 метода из legacy:

| Legacy метод | Новая функция | CalcType |
|---|---|---|
| `getHasValueFromExtraField` | `countByCard` | BY_CARD |
| `getCountValuesFromExtraField` | `countBySumValue` | BY_SUM_VALUE |
| `getSumNumberValueFromExtraField` | `countBySumNumbers` | BY_SUM_NUMBERS |
| `getHasOneOfValuesFromExtraField` | `countByMultipleValues` | BY_MULTIPLE_VALUES |

Плюс общая функция-диспетчер:
```typescript
export function calculateFieldValue(
  texts: string[],
  fieldValue: string,
  calcType: CalcType
): number;
```

**Важно:** Функции принимают `string[]` (тексты из DOM), а не DOM-элементы. Извлечение текста — ответственность PageObject.

### 3. `createLimitKey.ts`

Из `src/field-limits/shared.ts`:
```typescript
export function createLimitKey(params: { fieldValue: string; fieldId: string }): string;
```

Формат: `${timestamp}@@${fieldId}@@${fieldValue}`

### 4. Тесты

Для каждой функции написать unit-тесты. Особенно важно покрыть edge cases:
- `parseCalcType`: "∑Pro", "∑(Story Points)", "Bug || Task", "Pro", пустая строка
- `calculateFieldValue`: "Team^2" → 2, "Team" → 1, числовые значения, пустые, "val1 || val2"
- `createLimitKey`: формат, уникальность

## Критерии приёмки

- [ ] 3 файла с чистыми функциями
- [ ] 3 файла с тестами
- [ ] Все edge cases из legacy кода покрыты
- [ ] Тесты проходят: `npm test`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Зависит от: [TASK-148](./TASK-148-field-limits-types-tokens.md) (CalcType)
- Legacy код: `src/field-limits/BoardPage/index.ts:216-274`, `src/field-limits/shared.ts:4-5`

---

## Результаты

**Дата**: 2025-03-13

**Агент**: Coder

**Статус**: DONE

**Что сделано**:

- Созданы 3 файла с чистыми функциями: `parseCalcType.ts`, `calculateFieldValue.ts`, `createLimitKey.ts`
- Созданы 3 файла с тестами: 34 теста, все проходят
- Исправлен баг в регулярке legacy: `∑\([A-Za-z0-9]]*\)` → `∑\([A-Za-z0-9]*\)` (убрана лишняя `]`)

**Проблемы и решения**:

Нет
