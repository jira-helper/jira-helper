# Request: Поддержка Jira Cloud (person-limits)

**Дата**: 2025-04-07 (обновлено 2025-04-07)
**Slug**: `jira-cloud-support`

## Описание запроса

Расширение должно работать и для Jira Server, и для Jira Cloud с максимальным переиспользованием кода.

### Скоуп первой итерации (уменьшен):

1. **Только person-limits** — column-limits пока не переносим
2. **SettingsPage** (страница настроек доски) — НЕ модифицируем для Cloud, в Cloud это не нужно
3. **SettingsTab** (вкладка настроек на доске) — переносим. Т.е. вставка настроек + таб настроек + реализация на доске
4. **Минимум изменений внутри модуля** — все внешние зависимости закрыты через DI-токены. Нужно реализовать Cloud-версии внешних зависимостей (PageObject, API), не меняя сам модуль
5. **Отдельная точка входа** в манифесте для Cloud (`content-cloud.ts`)
6. **DI-токен окружения** для определения Server/Cloud
7. **Отдельный Jira Client** для Cloud API (если API отличается)

### Ключевые данные из анализа DI-зависимостей:

Модуль person-limits использует следующие внешние DI-токены:
- `boardPagePageObjectToken` (IBoardPagePageObject) — ~15 методов работы с DOM доски
- `BoardPropertyServiceToken` — getBoardProperty, updateBoardProperty
- `loggerToken` — getPrefixedLog
- `localeProviderToken` — getJiraLocale
- `searchUsersToken` — поиск пользователей Jira
- `buildAvatarUrlToken` — URL аватара
- `getBoardEditDataToken` — метаданные доски (через PageModification)
- `getBoardPropertyToken` — свойства доски (через PageModification)
- `routingServiceToken` — getBoardIdFromURL, getSearchParam
- `issueTypeServiceToken` — загрузка типов задач (через IssueTypeSelector)

Из них для Cloud нужно заменить/адаптировать: PageObject, возможно getBoardEditData.
