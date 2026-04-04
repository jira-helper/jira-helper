# TASK-168: CalcType redesign + migrator + unit tests

**Status**: DONE

**Parent**: [EPIC-16](./EPIC-16-field-limits-modernization.md)

---

## Описание

Редизайн CalcType: вместо кодирования типа через магические префиксы в `fieldValue` (`∑`, `∑()`, `||`), тип подсчёта хранится явно в поле `calcType`. Создать миграцию старого формата в новый.

## Новые CalcType

```typescript
export const CalcType = {
  HAS_FIELD: 'has_field',
  EXACT_VALUE: 'exact_value',
  MULTIPLE_VALUES: 'multiple_values',
  SUM_NUMBERS: 'sum_numbers',
} as const;
```

## Изменение FieldLimit

```typescript
// БЫЛО (calcType определялся по fieldValue):
interface FieldLimit {
  fieldValue: string;  // "Pro", "∑Team", "∑(nums)", "Bug || Task"
  fieldId: string;
  limit: number;
  columns: string[];
  swimlanes: string[];
  bkgColor?: string;
  visualValue: string;
}

// СТАЛО (calcType явный):
interface FieldLimit {
  calcType: CalcType;  // НОВОЕ
  fieldValue: string;  // чистое значение без префиксов: "Pro", "Bug, Task", ""
  fieldId: string;
  limit: number;
  columns: string[];
  swimlanes: string[];
  bkgColor?: string;
  visualValue: string;
}
```

## Файлы

```
src/features/field-limits/
├── types.ts                                        # изменение
├── utils/
│   ├── migrateSettings.ts                          # новый
│   └── migrateSettings.test.ts                     # новый
```

## Что сделать

### 1. Обновить `types.ts`

- CalcType — строковые значения вместо числовых
- FieldLimit — добавить поле `calcType: CalcType`

### 2. Создать `migrateSettings.ts`

Функции:
- `migrateFieldLimit(oldLimit: OldFieldLimit): FieldLimit` — миграция одного лимита
- `migrateSettings(settings: unknown): FieldLimitsSettings` — миграция всех настроек
- `isOldFormat(limit: unknown): boolean` — определение старого формата (нет поля `calcType`)

Правила миграции:
| Старый fieldValue | Новый calcType | Новый fieldValue |
|-------------------|----------------|------------------|
| `"Pro"` (plain text) | `exact_value` | `"Pro"` |
| `"∑Team"` (∑ prefix) | `exact_value` | `"Team"` (fallback, BY_SUM_VALUE удалён) |
| `"∑(nums)"` (∑() pattern) | `sum_numbers` | `""` |
| `"Bug \|\| Task"` (\|\| separator) | `multiple_values` | `"Bug, Task"` |

### 3. Unit тесты `migrateSettings.test.ts`

- Миграция каждого старого формата
- Settings с несколькими лимитами разных типов
- Уже новый формат (с calcType) — возвращается as-is
- Пустые settings
- Edge cases: пустой fieldValue, только ∑, fieldValue с пробелами

## Критерии приёмки

- [ ] CalcType — строковые значения, FieldLimit содержит `calcType`
- [ ] `migrateSettings()` корректно мигрирует все старые форматы
- [ ] `isOldFormat()` надёжно отличает старый формат от нового
- [ ] Уже мигрированные settings не ломаются (идемпотентность)
- [ ] Unit тесты покрывают все варианты
- [ ] Тесты проходят: `npm test`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Зависит от: Phase 1-5 (types.ts, утилиты)
- После этой задачи: TASK-169 (update pure functions), TASK-171 (integrate into PropertyModel)

---

## Результаты

**Дата**: 2026-03-13

**Агент**: Coder

**Статус**: DONE
