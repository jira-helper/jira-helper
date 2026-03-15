# TASK-150: Module Registration

**Status**: DONE

**Parent**: [EPIC-16](./EPIC-16-field-limits-modernization.md)

---

## Описание

Создать `module.ts` — функцию регистрации всех моделей фичи в DI-контейнере. Изначально файл будет заглушкой, модели подключаются по мере их создания в последующих задачах.

## Файлы

```
src/features/field-limits/
└── module.ts       # новый
```

## Что сделать

1. Создать `registerFieldLimitsModule(container)` по образцу из Target Design (секция "State Changes → module.ts")
2. Зарегистрировать все модели и PageObject:
   - `fieldLimitsBoardPageObjectToken` → `FieldLimitsBoardPageObject`
   - `propertyModelToken` → `PropertyModel` (proxy + useSnapshot)
   - `settingsUIModelToken` → `SettingsUIModel` (proxy + useSnapshot)
   - `boardRuntimeModelToken` → `BoardRuntimeModel` (proxy + useSnapshot)
3. Внедрить зависимости через DI:
   - `BoardPropertyServiceToken` → для PropertyModel
   - `boardPagePageObjectToken` → для BoardRuntimeModel
   - `loggerToken` → для всех моделей

**Примечание:** Так как модели ещё не созданы, этот файл будет обновляться в задачах TASK-151, TASK-152, TASK-158, TASK-159. На этом шаге можно создать заглушки или создать полный файл, если все зависимости готовы.

## Критерии приёмки

- [ ] `registerFieldLimitsModule` экспортируется
- [ ] Паттерн идентичен `src/swimlane-wip-limits/module.ts`
- [ ] Тесты проходят: `npm test`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Зависит от: [TASK-148](./TASK-148-field-limits-types-tokens.md)
- Референс: `src/swimlane-wip-limits/module.ts`

---

## Результаты

**Дата**: 2025-03-13

**Агент**: Coder

**Статус**: DONE

**Что сделано**:

- Создан `src/features/field-limits/module.ts` — заглушка с `registerFieldLimitsModule(container)`
- Добавлены TODO-блоки для TASK-151, 152, 158, 159
- `npm test` — 696 passed
- `npm run lint:eslint -- --fix` — без ошибок
- `npm run build:dev` — успешно

**Проблемы и решения**:

- ESLint ругался на неиспользуемый параметр `_container` — заменён на `container` с `void container` для удовлетворения линтера до добавления регистраций
