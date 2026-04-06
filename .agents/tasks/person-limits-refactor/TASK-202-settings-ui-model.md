# TASK-202: SettingsUIModel + SettingsUIModel.test.ts

**Status**: TODO

**Parent**: [EPIC-20](./EPIC-20-person-limits-refactor.md)

---

## Описание

Реализовать valtio `SettingsUIModel` — замену `useSettingsUIStore` и логики `initFromProperty` / `saveToProperty` (как методы модели). Constructor DI: `PropertyModel`, `Logger`. Метод `isDuplicate` — метод модели, читающий `this.limits`. Добавить `settingsUIModelToken` в `tokens.ts` и регистрацию в `module.ts`. Тесты: миграция с `initFromProperty.test.ts`, `saveToProperty.test.ts`, `personalWipLimitsStore.test.ts` и др.

Импорты чистых функций до переноса в utils могут указывать на `actions/`; [TASK-203](./TASK-203-settings-utils-pure-functions.md) выровняет пути.

## Файлы

```
src/person-limits/
├── tokens.ts                      # добавить settingsUIModelToken
├── module.ts                      # зарегистрировать SettingsUIModel
└── SettingsPage/models/
    ├── SettingsUIModel.ts         # новый
    └── SettingsUIModel.test.ts    # новый
```

## Что сделать

1. Реализовать `SettingsUIModel` по контракту [target-design.md](./target-design.md) (секция SettingsUIModel): `initFromProperty`, `save` → `propertyModel.setLimits` + `persist`, CRUD, `isDuplicate`, `reset`.
2. `save()` возвращает `Result<void, Error>` согласно requirements (ошибки persist пробрасываются как Result).
3. Добавить третий токен в `tokens.ts` и wiring в `PersonLimitsModule`.
4. Unit-тесты по сценариям [settings-ui.feature](./settings-ui.feature) и миграция существующих тестов actions/store.

## Критерии приёмки

- [ ] `SettingsUIModel` соответствует target-design; нет чтения zustand getState.
- [ ] `settingsUIModelToken` зарегистрирован; модель получает `PropertyModel` из DI.
- [ ] Unit-тесты покрывают CRUD, duplicate, save Ok/Err.
- [ ] Тесты проходят: `npm test`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Зависит от: [TASK-201](./TASK-201-board-page-delete-legacy.md) (рекомендуется завершить миграцию Board, чтобы снизить конфликты; при необходимости допускается параллельно после TASK-197 с осторожностью в `module.ts`)
- Обязательно: [TASK-194](./TASK-194-property-model.md), [TASK-193](./TASK-193-infrastructure-tokens-module.md)
- BDD: [settings-ui.feature](./settings-ui.feature), [di-integration.feature](./di-integration.feature) (@SC-DI-4, @SC-DI-6)

---

## Результаты

**Дата**: {YYYY-MM-DD}

**Агент**: {Coder / Architect / Manual}

**Статус**: VERIFICATION

**Что сделано**:

{Заполняется при завершении}

**Проблемы и решения**:

{Заполняется при завершении}
