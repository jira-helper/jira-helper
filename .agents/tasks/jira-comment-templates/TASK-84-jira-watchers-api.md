# TASK-84: Jira Watchers API

**Status**: VERIFICATION
**Type**: api

**Parent**: [EPIC-5](./EPIC-5-jira-comment-templates.md)

---

## Описание

Расширить существующий Jira API/service методом добавления watcher к issue. Реализация должна использовать текущие Jira request conventions и возвращать `Result`, чтобы EditorModel мог агрегировать partial success.

## Файлы

```
src/infrastructure/jira/
├── jiraApi.ts          # изменение
├── jiraService.ts      # изменение
└── jiraService.test.ts # изменение / новый тестовый блок
```

## Что сделать

1. Добавить low-level helper `addWatcher(issueKey, username, options)` для `POST /rest/api/2/issue/{issueKey}/watchers`.
2. Отправлять body как JSON string username, например `"iv.petrov"`, по Jira Server contract.
3. Расширить `IJiraService` и `JiraService` методом `addWatcher(issueKey, username, signal?)`.
4. Сохранять существующее error mapping и добавить context issueKey/username в ошибку.
5. Покрыть unit tests success 2xx/204 и non-2xx/network error.
6. Обновить typed mocks/consumers `IJiraService`, чтобы TypeScript lint не падал после расширения интерфейса.

## Критерии приёмки

- [x] Watcher API реализован в существующей Jira infrastructure, без feature-local client.
- [x] `JiraService.addWatcher` возвращает `Result<void, Error>`.
- [x] Ошибка содержит достаточно context для notification details.
- [x] Existing typed `IJiraService` mocks/consumers обновлены под новый обязательный метод (включая Storybook `JiraServiceToken` в Board settings; проверены остальные полные `IJiraService` моки в gantt-тестах и helpers — уже с `addWatcher`; минимальные `@ts-expect-error` / `as any` DI моки не трогались).
- [x] Тесты проходят: `npm test`.
- [x] Нет ошибок линтера: `npm run lint:eslint -- --fix`.

## Зависимости

- Зависит от: нет.
- Референс: [target-design.md](./target-design.md)

---

## Результаты

**Дата**: 2026-04-30

**Агент**: Coder

**Статус**: VERIFICATION

**Что сделано**:

- В `jiraApi.ts` добавлен `addWatcher`: `POST` на `api/2/issue/{issueKey}/watchers` через `requestJiraViaFetch`, тело `JSON.stringify(username)`, заголовки с `Content-Type: application/json` и сохранением `EXTENSION_HEADERS` / опций вызывающего кода; поддержка `AbortSignal` через `RequestInit`.
- В `IJiraService` и `JiraService` добавлен `addWatcher(issueKey, username, signal?)` → `Promise<Result<void, Error>>`, вызов `jiraApiAddWatcher` с `{ signal }`, ошибки оборачиваются через `wrapUnknownError` с префиксом `addWatcher issueKey=… username=…`.
- `jiraService.test.ts`: мок `global.fetch`, сценарии 204 (в т.ч. `browser-plugin` с префиксом `jira-helper/` через `Headers`), отдельный кейс через `jiraApi.addWatcher` с кастомным заголовком (merge с `Content-Type` и extension header), 200, 400, сетевая ошибка.
- Типобезопасные моки `IJiraService`: gantt/helpers и тесты — `addWatcher`; после code review (**REVIEW-TASK-84**, finding **MISSED_SCENARIO**) добавлен `addWatcher: () => Promise.resolve(new Ok(undefined))` в Storybook mocks `BoardSettingsTabContent.stories.tsx` и `CustomGroupSettingsContainer.stories.tsx`.

**Проблемы и решения**:

- У `requestJiraViaFetch` второй аргумент `fetch` собирается как `{ headers: merged, ...options }`, поэтому при передаче `headers` в `options` итоговые заголовки берутся из `options`. В `addWatcher` заголовки задаются одним объектом с `...EXTENSION_HEADERS`, `Content-Type` и `...options.headers`, чтобы не потерять `browser-plugin` и корректно отправить JSON body.
- Review **MISSED_SCENARIO**: после расширения `IJiraService` два typed Storybook-регистратора не содержали `addWatcher`, из‑за этого падал `npm run lint:typescript` на этом контракте; исправлено добавлением поля в оба файла.

**Проверки**:

- `npm test -- --run src/infrastructure/jira/jiraService.test.ts` — OK (5 tests)
- `npm test -- --run` — OK (1541 tests)
- `npx eslint` на изменённые `.ts`/`.tsx` файлы — OK (только прежние warnings в legacy storybook)
- `npm run lint:typescript` — **падает** из‑за несвязанных ошибок в других in-progress файлах epic (список ниже совпадает с REVIEW-TASK-84); поверхность TASK-84 (jira infra + указанные story mocks) без новых ошибок `tsc`
