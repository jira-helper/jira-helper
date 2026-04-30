# TASK-93: Cypress BDD QA

**Status**: VERIFICATION
**Type**: bdd-tests

**Parent**: [EPIC-5](./EPIC-5-jira-comment-templates.md)

---

## Описание

Добавить Cypress BDD/QA coverage по согласованным сценариям `comment-templates.feature`. Эта задача проверяет acceptance behavior после wiring: toolbar на issue/board comment forms, вставка, watchers, import/export и отсутствие дублей.

## Файлы

```
.agents/tasks/jira-comment-templates/
├── comment-templates.feature        # существующий источник сценариев
src/features/jira-comment-templates-module/
├── CommentTemplates.cy.tsx          # новый / acceptance component harness
└── CommentTemplates.steps.ts        # новый / BDD steps если используется step layer
```

## Что сделать

1. Сопоставить сценарии из `comment-templates.feature` с Cypress tests: issue view toolbar, board detail toolbar, insert, watchers, skipped watchers.
2. Проверить settings flows: add/edit/delete/save, legacy import draft-only, invalid import, export, reset defaults.
3. Проверить idempotency: repeated DOM mutations не создают duplicate toolbar.
4. Замокать Jira REST watcher calls и PageObject issue-key states без live Jira dependency.
5. Описать ручной QA smoke для live Jira только как доп. проверку, не как requirement для unit/component suite.

## Критерии приёмки

- [ ] Acceptance tests покрывают все MVP-сценарии из `comment-templates.feature`.
- [ ] Transition dialog scenario явно зафиксирован как outside MVP и не блокирует suite.
- [ ] Watcher success/partial/skipped states проверены через mocked Jira service.
- [ ] Тесты проходят: `npm test`.
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`.

## Зависимости

- Зависит от: [TASK-91](./TASK-91-content-di-integration.md)
- Зависит от: [TASK-92](./TASK-92-storybook-states.md)
- Референс: [comment-templates.feature](./comment-templates.feature)

---

## Результаты

**Дата**: 2026-04-30

**Агент**: GPT-5.5

**Статус**: VERIFICATION

**Что сделано**:

- Добавлен Cypress BDD harness `CommentTemplates.cy.tsx`, который выполняет все сценарии из `comment-templates.feature`.
- Добавлены step definitions `CommentTemplates.steps.ts` с mocked Jira/PageObject/storage boundaries без live Jira dependency.
- Покрыты toolbar на issue/board, insert, watcher success/skipped, settings save/delete/validation, legacy/current import, invalid import, export, defaults/reset, corrupted storage fallback и transition dialog outside MVP.
- Review: [REVIEW-TASK-93](./REVIEW-TASK-93.md) — APPROVED.
- QA: [QA-TASK-93](./QA-TASK-93.md) — PASS.

**Проблемы и решения**:

- Targeted Comment Templates Cypress spec проходит: 15/15 scenarios.
- Полный `npx cypress run --component` падает на существующих Gantt/Column Limits specs; изолированные reruns подтвердили, что эти failures воспроизводятся без Comment Templates spec и не являются blocker для TASK-93.
