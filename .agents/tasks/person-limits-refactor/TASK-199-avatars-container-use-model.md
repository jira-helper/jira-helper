# TASK-199: AvatarsContainer — useModel(boardRuntimeModelToken)

**Status**: TODO

**Parent**: [EPIC-20](./EPIC-20-person-limits-refactor.md)

---

## Описание

Обновить `AvatarsContainer.tsx`: заменить `useStore` (runtime store) на подписку к `BoardRuntimeModel` через `useModel()` с `boardRuntimeModelToken` (паттерн как в column-limits и в [di-integration.feature](./di-integration.feature) @SC-DI-5). Пропсы и View-компоненты (`AvatarBadge`) по возможности не менять; изменения в контейнере.

## Файлы

```
src/person-limits/BoardPage/components/AvatarsContainer.tsx   # изменение
```

## Что сделать

1. Использовать `useDi().inject(boardRuntimeModelToken)` и `useModel()` для чтения `stats`, `activeLimitId` и вызова `toggleActiveLimitId` / связанных команд.
2. Убрать импорты zustand store runtime.
3. Убедиться, что мемоизация и ключи списков не ломают обновление UI при изменении valtio state.

## Критерии приёмки

- [ ] Контейнер не использует legacy runtime store.
- [ ] Подписка на модель соответствует контракту @SC-DI-5.
- [ ] Тесты проходят: `npm test`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Зависит от: [TASK-198](./TASK-198-board-page-index-migration.md) (модель подключена к page flow)
- Связано с: [TASK-197](./TASK-197-board-runtime-model.md)

---

## Результаты

**Дата**: {YYYY-MM-DD}

**Агент**: {Coder / Architect / Manual}

**Статус**: VERIFICATION

**Что сделано**:

{Заполняется при завершении}

**Проблемы и решения**:

{Заполняется при завершении}
