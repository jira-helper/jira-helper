# TASK-148: Types + Tokens

**Status**: DONE

**Parent**: [EPIC-16](./EPIC-16-field-limits-modernization.md)

---

## Описание

Создать доменные типы и DI-токены для фичи Field WIP Limits. Это базовая инфраструктура, от которой зависят все остальные задачи.

## Файлы

```
src/features/field-limits/
├── types.ts        # новый
└── tokens.ts       # новый
```

## Что сделать

1. Создать `types.ts` с типами из Target Design (секция "State Changes → types.ts"):
   - `CalcType` (const + type)
   - `FieldLimit`, `FieldLimitsSettings`
   - `FieldLimitStats`
   - `CardLayoutField`, `BoardColumn`, `BoardSwimlane`
   - `LimitFormInput`, `BoardEditData`
   - `LoadingState`
   - Все типы с JSDoc комментариями

2. Создать `tokens.ts` с DI-токенами из Target Design (секция "State Changes → tokens.ts"):
   - `propertyModelToken`
   - `settingsUIModelToken`
   - `boardRuntimeModelToken`
   - `fieldLimitsBoardPageObjectToken`

## Критерии приёмки

- [ ] Все типы из Target Design созданы с JSDoc
- [ ] Все 4 DI-токена созданы
- [ ] Тесты проходят: `npm test`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Зависит от: нет
- Референс: `src/swimlane-wip-limits/types.ts`, `src/swimlane-wip-limits/tokens.ts`
- Target Design: [target-design-field-limits.md](./target-design-field-limits.md) → секции "State Changes"

---

## Результаты

**Дата**: 2025-03-13

**Агент**: Coder

**Статус**: DONE

**Что сделано**:

- Создан `src/features/field-limits/types.ts` с типами: CalcType, FieldLimit, FieldLimitsSettings, FieldLimitStats, CardLayoutField, BoardColumn, BoardSwimlane, LimitFormInput, BoardEditData, LoadingState
- Создан `src/features/field-limits/tokens.ts` с 4 DI-токенами: propertyModelToken, settingsUIModelToken, boardRuntimeModelToken, fieldLimitsBoardPageObjectToken
- `npm test` — 662 тестов пройдено
- `npm run lint:eslint -- --fix` — без ошибок
- `npm run build:dev` — успешно

**Проблемы и решения**:

Нет.
