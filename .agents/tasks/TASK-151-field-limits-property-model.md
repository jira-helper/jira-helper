# TASK-151: PropertyModel + тесты

**Status**: DONE

**Parent**: [EPIC-16](./EPIC-16-field-limits-modernization.md)

---

## Описание

Создать PropertyModel — Valtio-модель для загрузки и сохранения field limits из Jira Board Property. Заменяет прямые вызовы `getBoardProperty(BOARD_PROPERTIES.FIELD_LIMITS)` и `updateBoardProperty`.

## Файлы

```
src/features/field-limits/property/
├── PropertyModel.ts        # новый
└── PropertyModel.test.ts   # новый
```

## Что сделать

1. Создать `PropertyModel` с API из Target Design:
   - `settings: FieldLimitsSettings` — текущие настройки
   - `state: LoadingState` — состояние загрузки
   - `error: string | null`
   - `load()` → `Result<FieldLimitsSettings, Error>` — загружает из board property
   - `save(settings)` → `Result<void, Error>` — сохраняет в board property
   - `reset()` — сброс состояния

2. Конструктор: `(boardPropertyService: BoardPropertyServiceI, logger: Logger)`

3. Использует `BOARD_PROPERTIES.FIELD_LIMITS` из `src/shared/constants.ts`

4. При загрузке: если property не существует — вернуть `{ limits: {} }`

5. Написать unit-тесты:
   - `load()` — успешная загрузка, пустые данные, ошибка API
   - `save()` — успешное сохранение, ошибка
   - `reset()` — сброс в начальное состояние
   - Проверить смену `state`: initial → loading → loaded / error

## Критерии приёмки

- [ ] PropertyModel реализует все методы из Target Design
- [ ] Использует `Result<T, Error>` из `ts-results`
- [ ] Все async методы обрабатывают ошибки через Result
- [ ] Unit-тесты покрывают happy path и error cases
- [ ] Тесты проходят: `npm test`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Зависит от: [TASK-148](./TASK-148-field-limits-types-tokens.md)
- Референс: `src/swimlane-wip-limits/property/PropertyModel.ts`
- Legacy код: `src/field-limits/SettingsPage/index.ts:111` (loadData), `src/field-limits/SettingsPage/index.ts:340-342` (save)

---

## Результаты

**Дата**: 2025-03-13

**Агент**: Coder

**Статус**: DONE

**Что сделано**:

- Создан `src/features/field-limits/property/PropertyModel.ts` — Valtio-модель для загрузки/сохранения field limits из Jira Board Property
- Создан `src/features/field-limits/property/PropertyModel.test.ts` — 7 unit-тестов (load success, empty property, load error, skip when loading, save success, save error, reset)
- Использует `Result<T, Error>` из ts-results
- `npm test` — 703 теста passed
- `npm run lint:eslint -- --fix` — без ошибок

**Проблемы и решения**:

Нет
