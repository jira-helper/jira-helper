# TASK-76: Module Tokens Skeleton

**Status**: VERIFICATION
**Type**: types

**Parent**: [EPIC-5](./EPIC-5-jira-comment-templates.md)

---

## Описание

Создать DI tokens и module skeleton для `jira-comment-templates-module`. Задача фиксирует lifecycle моделей и PageModification token, но не подключает модуль в `content.ts`.

## Файлы

```
src/features/jira-comment-templates-module/
├── tokens.ts       # новый
├── module.ts       # новый
└── module.test.ts  # новый
```

## Что сделать

1. Добавить tokens для `TemplatesStorageModel`, `CommentTemplatesSettingsModel`, `CommentTemplatesEditorModel` и `CommentTemplatesPageModification`.
2. Описать JSDoc lifecycle/consumers для каждого token по правилам module boundaries.
3. Создать `module.ts` с lazy DI registration skeleton для моделей, используя существующий паттерн `modelEntry`.
4. В unit test проверить, что module registration резолвит tokens при подменённых dependencies.
5. Не регистрировать PageModification в content lifecycle в этой задаче.
6. `jiraCommentTemplatesPageModificationToken` должен быть типизирован существующим `PageModification<any, any>` contract, не `unknown`.

## Критерии приёмки

- [x] Tokens типизированы и не создают feature-local Jira/storage abstractions; PageModification token не использует `unknown`.
- [x] Module skeleton готов принимать infrastructure tokens из отдельных задач.
- [x] Unit test покрывает базовую регистрацию DI.
- [x] Тесты проходят: `npm test`.
- [x] Нет ошибок линтера: `npm run lint:eslint -- --fix`.

## Зависимости

- Зависит от: [TASK-75](./TASK-75-domain-types-and-constants.md)
- Референс: `docs/module-boundaries.md`

---

## Результаты

**Дата**: 2026-04-30

**Агент**: Coder

**Статус**: VERIFICATION

**Что сделано**:

- `tokens.ts`: model tokens как ранее; `jiraCommentTemplatesPageModificationToken` — `Token<PageModification<any, any>>` с type-only import из `src/infrastructure/page-modification/PageModification`; JSDoc про TASK-90 и контракт `PageModification`.
- `module.ts`: без изменений по scope (storage + TODO для TASK-81/87/90; без `content.ts`).
- `module.test.ts`: класс `TestCommentTemplatesPageModification extends PageModification`, регистрация под `jiraCommentTemplatesPageModificationToken` и резолв в том же контейнере после `ensure` — проверка assignability/contract на runtime.

**Проблемы и решения**:

- **REQUIREMENTS_GAP (review TASK-76)**: токен был `Token<unknown>`, слабая типизация для будущего bootstrap. Исправлено на `PageModification<any, any>`; добавлен unit-тест с dummy subclass.

**Проверки**:

- `npm test -- --run src/features/jira-comment-templates-module/module.test.ts`
- `npx eslint --fix src/features/jira-comment-templates-module/tokens.ts src/features/jira-comment-templates-module/module.ts src/features/jira-comment-templates-module/module.test.ts`
- `npm test -- --run` (полный прогон, если недорого)
