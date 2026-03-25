# TASK-175: getIssueTypesFromDOM → DI (PageObject)

**Status**: DONE (удалено как мёртвый код)

**Parent**: [EPIC-17](./EPIC-17-shared-di-refactoring.md)

---

## Результат

При анализе выяснилось, что `getIssueTypesFromDOM` и весь императивный API `issueTypeSelector.ts` — мёртвый код:

- `getIssueTypesFromDOM()` использовалась только в `loadIssueTypes()` как DOM-фолбек
- `loadIssueTypes()` не вызывалась ни из одного продакшн-файла (только stories и тесты)
- React-компонент `IssueTypeSelector.tsx` использовал только `loadIssueTypesForProject()` напрямую через API, без DOM-фолбека

**Решение**: вместо вынесения в DI — удалено как мёртвый код.

## Что удалено

- `src/shared/utils/getIssueTypesFromDOM.ts` — DOM-фолбек
- `src/shared/utils/getIssueTypesFromDOM.test.ts` — тесты
- `src/shared/utils/issueTypeSelector.stories.tsx` — stories для мёртвого API
- Из `issueTypeSelector.ts` удалены: `loadIssueTypes`, `generateIssueTypeSelectorHTML`, `getSelectedIssueTypes`, `isCountAllTypesChecked`, `getProjectKeyFromInput`, `initIssueTypeSelector`

## Что создано взамен

`issueTypeSelector.ts` → `src/shared/issueType/IssueTypeService.ts` — полноценный DI-сервис:
- `IIssueTypeService` интерфейс
- `IssueTypeService` класс с constructor injection и instance-кешом
- `issueTypeServiceToken` токен
- `registerIssueTypeServiceInDI` регистрация

## Критерии приёмки

- [x] Нет прямых импортов `getIssueTypesFromDOM` — файл удалён
- [x] `issueTypeSelector` заменён на DI-сервис `IssueTypeService`
- [x] Тесты проходят: `npm test`
- [x] Нет ошибок линтера
