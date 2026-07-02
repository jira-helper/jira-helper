# QA: TASK-93 — Cypress BDD QA

**Дата**: 2026-04-30
**TASK**: [TASK-93](./TASK-93-cypress-bdd-qa.md)
**Вердикт**: PASS

## Автоматические проверки

| Проверка | Результат | Детали |
|----------|-----------|--------|
| ESLint | pass | `npm run lint:eslint -- --fix` |
| Tests | pass | `npm test` — 149 files, 1623 tests passed |
| Build | pass | `npm run build:dev` — build completed |
| Cypress BDD (task spec) | pass | `npx cypress run --component --spec "src/features/jira-comment-templates-module/CommentTemplates.cy.tsx"` — 15 scenarios passed |
| Cypress component suite | non-blocking fail | `npx cypress run --component` failed in existing Gantt/Column Limits specs. Isolated reruns of those specs reproduce the same failures without the new CommentTemplates spec. |

## Проектные требования

| Проверка | Результат | Комментарий |
|----------|-----------|-------------|
| i18n | pass | Harness reuses feature texts for UI labels; scenario text remains in `.feature`. |
| Accessibility | pass | Assertions interact through visible buttons, toolbar role and alert/status regions. |
| Storybook | N/A | TASK-93 is Cypress BDD/QA; Storybook was covered in TASK-92. |

## Проблемы

- Full Cypress component suite has unrelated existing failures:
  - `src/features/gantt-chart/IssuePage/features/gantt-chart-display.feature.cy.tsx` — 3 failing scenarios.
  - `src/features/gantt-chart/IssuePage/features/gantt-chart-settings.feature.cy.tsx` — 4 failing scenarios in the full run.
  - `src/features/column-limits-module/SettingsPage/features/swimlane-selector.feature.cy.tsx` — 4 failing scenarios, reproduced in isolated run.

## Резюме

Comment Templates acceptance coverage is green in isolation and covers MVP scenarios from `comment-templates.feature`. Live Jira smoke is still recommended as a manual follow-up because the Cypress harness intentionally uses mocked Jira/PageObject boundaries.
