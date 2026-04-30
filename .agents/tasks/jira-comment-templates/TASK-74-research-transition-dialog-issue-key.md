# TASK-74: Research transition dialog issue key

**Status**: TODO
**Type**: research

**Parent**: Standalone

---

## Описание

Нужно вручную исследовать, откуда надёжно брать issue key для comment editor внутри workflow/transition dialog в Jira. До завершения этого исследования MVP фичи comment templates не поддерживает watchers для modal/transition comment forms.

## Файлы

```text
.agents/tasks/jira-comment-templates/
└── TASK-74-research-transition-dialog-issue-key.md
```

## Что сделать

1. Открыть workflow/transition dialog на live Jira issue.
2. Проверить, есть ли issue key в DOM рядом с dialog/comment editor, в route, data-атрибутах, hidden fields или другом стабильном источнике.
3. Зафиксировать стабильный способ получения issue key или подтвердить, что watchers для transition dialog нужно пропускать.
4. Вернуться к `target-design.md` и обновить контракт `CommentsEditorPageObject`, если modal support добавляется.

## Критерии приёмки

- [ ] Найден и описан стабильный источник issue key для transition dialog или принято решение watchers там не поддерживать.
- [ ] Обновлён `target-design.md` с выбранным решением.
- [ ] Перед реализацией агент попросил пользователя подтвердить результаты исследования.

## Зависимости

- Зависит от: `.agents/tasks/jira-comment-templates/target-design.md`
