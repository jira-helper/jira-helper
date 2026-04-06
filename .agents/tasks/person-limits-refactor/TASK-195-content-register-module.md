# TASK-195: Регистрация personLimitsModule в content.ts

**Status**: TODO

**Parent**: [EPIC-20](./EPIC-20-person-limits-refactor.md)

---

## Описание

Подключить модуль person-limits к общему DI-контейнеру расширения: вызвать `personLimitsModule.ensure(container)` в `content.ts` рядом с другими feature-модулями, чтобы PropertyModel (и далее остальные модели) резолвились из контейнера на доске и в настройках. Соответствует сценарию [di-integration.feature](./di-integration.feature) (@SC-DI-7).

## Файлы

```
src/content.ts              # изменение: personLimitsModule.ensure(container)
src/person-limits/module.ts # при необходимости: публичный API уже экспортирован из TASK-193
```

## Что сделать

1. Импортировать `personLimitsModule` из `src/person-limits/module.ts` (или из barrel `index.ts`, если принято в проекте).
2. В точке инициализации контейнера (там же, где `columnLimitsModule` / другие модули) вызвать `personLimitsModule.ensure(container)`.
3. Убедиться, что порядок относительно регистрации `boardPagePageObjectToken` и других базовых сервисов корректен (при резолве BoardRuntimeModel в TASK-197).

## Критерии приёмки

- [ ] При загрузке content script модуль person-limits регистрируется на shared container.
- [ ] После регистрации `propertyModelToken` резолвится (проверка косвенно через существующие тесты или ручной smoke).
- [ ] Тесты проходят: `npm test`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Зависит от: [TASK-193](./TASK-193-infrastructure-tokens-module.md) (готовы `tokens.ts` + `module.ts` с PropertyModel).
- Связано с: [TASK-197](./TASK-197-board-runtime-model.md) — полная цепочка моделей в контейнере завершится там.
- BDD: [di-integration.feature](./di-integration.feature) — @SC-DI-7

---

## Результаты

**Дата**: {YYYY-MM-DD}

**Агент**: {Coder / Architect / Manual}

**Статус**: VERIFICATION

**Что сделано**:

{Заполняется при завершении}

**Проблемы и решения**:

{Заполняется при завершении}
