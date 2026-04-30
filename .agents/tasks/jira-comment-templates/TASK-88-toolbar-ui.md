# TASK-88: Toolbar Button Views

**Status**: VERIFICATION
**Type**: view

**Parent**: [EPIC-5](./EPIC-5-jira-comment-templates.md)

---

## Описание

Создать presentation-компоненты toolbar для списка шаблонов и кнопок шаблонов. Компоненты должны быть controlled через props и не вызывать модели, Jira API или PageObject напрямую.

## Файлы

```
src/features/jira-comment-templates-module/Editor/components/
├── CommentTemplatesToolbar.tsx       # новый
├── TemplateButton.tsx                # новый
└── CommentTemplatesToolbar.test.tsx  # новый
```

## Что сделать

1. Реализовать `CommentTemplatesToolbar` с кнопками templates и manage button.
2. Реализовать `TemplateButton` с цветом шаблона, disabled state и accessible label.
3. Передавать все actions наружу через props: `onTemplateSelect`, `onOpenSettings`.
4. Не хранить timeout/auto-hide state и не читать templates из model в View.
5. Покрыть test rendering templates, disabled state, template select и manage button callbacks.

## Критерии приёмки

- [x] Toolbar View не зависит от DI, PageObject и Valtio.
- [x] Template buttons отображают label/color и доступны с клавиатуры.
- [x] Notification вынесен в отдельную задачу [TASK-95](./TASK-95-toolbar-notification-view.md).
- [x] Тесты проходят: `npm test`.
- [x] Нет ошибок линтера: `npm run lint:eslint -- --fix`.

### Semantics: manage button vs `isDisabled`

В дизайне только один флаг `isDisabled`. Консервативно: **кнопки шаблонов** получают `disabled={isDisabled}` и не вызывают `onTemplateSelect`; **кнопка manage** остаётся активной при `isDisabled`, чтобы пользователь мог открыть настройки. Покрыто тестом `keeps manage enabled when toolbar is disabled so settings stay reachable`.

## Зависимости

- Зависит от: [TASK-87](./TASK-87-editor-model.md)
- Референс: [target-design.md](./target-design.md)

---

## Результаты

**Дата**: 2026-04-30

**Агент**: Coder

**Статус**: VERIFICATION

**Что сделано**:

- Добавлены `TemplateButton.tsx`, `CommentTemplatesToolbar.tsx`, `comment-templates-toolbar.module.css` (акцент цвета через `border-left-color: var(--jh-template-accent)`).
- Динамический цвет шаблона задаётся минимальным inline `style` с `--jh-template-accent` и точечным `eslint-disable-next-line local/no-inline-styles` (цвет из данных пользователя).
- `CommentTemplatesToolbar` реализует toolbar keyboard pattern: ArrowLeft/ArrowRight/Home/End перемещают фокус между enabled-кнопками.
- `CommentTemplatesToolbar.test.tsx`: Vitest + RTL — рендер label/цвет, disabled и блокировка select, клики по шаблону и manage, пустой список шаблонов, manage остаётся доступной при `isDisabled`, toolbar arrow navigation.

**Проблемы и решения**:

- Расхождение target-design (`templates: CommentTemplate[]`) и контракта задачи (`CommentTemplateSummary[]`): реализовано как в TASK-88 / пользовательском запросе (`CommentTemplateSummary[]`).
- Code review: [REVIEW-TASK-88](./REVIEW-TASK-88.md) — APPROVED без findings после фикса toolbar keyboard warning.
- QA: [QA-TASK-88](./QA-TASK-88.md) — PASS.
- Проверки: `npm run lint:eslint -- --fix`, `npm test` (143 files, 1585 tests), `npm run build:dev`.
