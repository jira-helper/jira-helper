# TASK-92: Storybook States

**Status**: VERIFICATION
**Type**: stories

**Parent**: [EPIC-5](./EPIC-5-jira-comment-templates.md)

---

## Описание

Добавить Storybook stories для визуальной проверки toolbar, settings и combined states фичи. Stories должны использовать mocked props/models и не требовать live Jira DOM или реального `localStorage`.

## Файлы

```
src/features/jira-comment-templates-module/
├── CommentTemplates.stories.tsx                              # новый
├── Editor/components/CommentTemplatesToolbar.stories.tsx     # новый
└── Settings/components/CommentTemplatesSettings.stories.tsx  # новый
```

## Что сделать

1. Добавить toolbar stories: default templates, много шаблонов, pending state, success/warning/error notification.
2. Добавить settings stories: default draft, validation errors, import error, dirty state.
3. Добавить cross-area composition story для toolbar + settings tab без Jira DOM.
4. Использовать mocked handlers и fixture templates из domain types/constants.
5. Проверить accessibility-oriented states: focusable buttons, long text, empty watchers.

## Критерии приёмки

- [ ] Stories отделены от реализации View/Container задач.
- [ ] Stories не требуют live Jira, PageObject или real `localStorage`.
- [ ] Визуально покрыты happy path и error/warning states.
- [ ] Тесты проходят: `npm test`.
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`.

## Зависимости

- Зависит от: [TASK-82](./TASK-82-settings-ui-views.md)
- Зависит от: [TASK-94](./TASK-94-settings-import-export-controls.md)
- Зависит от: [TASK-88](./TASK-88-toolbar-ui.md)
- Зависит от: [TASK-95](./TASK-95-toolbar-notification-view.md)
- Зависит от: [TASK-89](./TASK-89-toolbar-container.md)
- Референс: [target-design.md](./target-design.md)

---

## Результаты

**Дата**: 2026-04-30

**Агент**: GPT-5.5

**Статус**: VERIFICATION

**Что сделано**:

- Добавлены toolbar stories: default templates, many templates, pending state, success/warning/error notification states.
- Добавлены settings stories: default draft, dirty draft, validation errors, import error, saving state.
- Добавлен cross-area composition story для toolbar + settings без Jira DOM, PageObject и real `localStorage`.
- Stories используют deterministic fixtures и mocked handlers.
- Review: [REVIEW-TASK-92](./REVIEW-TASK-92.md) — APPROVED.
- QA: [QA-TASK-92](./QA-TASK-92.md) — PASS.

**Проблемы и решения**:

- `visual` tags не добавлены, чтобы не расширять существующий Playwright visual snapshot guard и не требовать новые baseline PNG без отдельного запроса.
