# TASK-114: Verify website build & deploy checklist

**Status**: VERIFICATION
**Type**: other

**Parent**: [EPIC-8](./EPIC-8-days-in-column-jira-prerequisite.md)

---

## Описание

После правок EN/RU markdown убедиться, что Docusaurus-сборка проходит локально, содержимое соответствует acceptance checklist из `.feature`, и задокументировать шаги post-merge deploy через существующий CI (`website.yml` → GitHub Pages). Runtime и UI расширения не затрагиваются.

## Файлы

```
website/                                 # только npm run build (без правок, если TASK-113 завершён)
.agents/tasks/days-in-column-jira-prerequisite/
└── days-in-column-jira-prerequisite-docs.feature   # acceptance checklist (read-only)
```

## Что сделать

1. Выполнить `cd website && npm ci && npm run build` — сборка без ошибок.
2. Пройти сценарии из [days-in-column-jira-prerequisite-docs.feature](./days-in-column-jira-prerequisite-docs.feature) по markdown-файлам (ручная проверка; Cypress не нужен).
3. Убедиться, что diff не затрагивает `src/`, i18n расширения, другие страницы `website/docs/**`.
4. Зафиксировать deploy notes в разделе «Результаты» этой задачи:
   - merge PR в `master` триггерит `.github/workflows/website.yml`;
   - job `deploy-pages` публикует на `https://jira-helper.github.io/jira-helper/`;
   - после deploy — ручной просмотр EN и RU страниц Days in Column на live site (S4 из requirements).

## Критерии приёмки

- [x] `cd website && npm run build` — exit 0
- [x] Все сценарии @SC-DOC-EN-1 … @SC-DOC-PARITY-1 из `.feature` пройдены по markdown
- [x] `src/` и i18n расширения не изменены в рамках EPIC
- [x] Deploy notes записаны в «Результаты» (workflow, URL, что проверить после merge)
- [ ] После merge в `master` — live Pages обновлены (ручная проверка пользователем → EPIC DONE)

## Зависимости

- Зависит от: [TASK-113](./TASK-113-days-in-column-docs-en-ru.md)
- CI reference: `.github/workflows/website.yml`
- Requirements S4: [requirements.md](./requirements.md) § «S4: Деплой документации»

---

## Результаты

**Дата**: 2026-08-04

**Агент**: QA

**Статус**: VERIFICATION

**Что сделано**:

- Website build: переиспользован `.logs/qa-task-113-website-build.log` — exit **0** (EN + RU locales, без пересборки).
- Все сценарии `@SC-DOC-EN-1` … `@SC-DOC-PARITY-1` пройдены вручную по markdown EN/RU (grep/read).
- `git diff --name-only` по EPIC-scope: изменены только `website/docs/.../days-in-column.md` и `website/i18n/ru/.../days-in-column.md`; `src/` — без изменений.
- Deploy notes и live URLs задокументированы ниже; live Pages **ещё без prerequisite** (изменения не в `master`).

**Deploy notes**:

| Шаг | Действие |
|-----|----------|
| 1 | Merge PR с TASK-113/TASK-114 в `master` |
| 2 | CI [`.github/workflows/website.yml`](../../../../.github/workflows/website.yml): `npm ci` + `npm run build` в `website/` |
| 3 | Job `deploy` → `upload-pages-artifact` → `deploy-pages` → GitHub Pages |
| 4 | Проверить EN: [days-in-column (EN)](https://jira-helper.github.io/jira-helper/docs/features/card-information/days-in-column/) — секция **Prerequisites** после metadata table |
| 5 | Проверить RU: [days-in-column (RU)](https://jira-helper.github.io/jira-helper/ru/docs/features/card-information/days-in-column/) — секция **Требования**, Troubleshooting с пунктом про бейдж |

**Live URLs** (проверить после merge):

| Locale | URL |
|--------|-----|
| EN | https://jira-helper.github.io/jira-helper/docs/features/card-information/days-in-column/ |
| RU | https://jira-helper.github.io/jira-helper/ru/docs/features/card-information/days-in-column/ |

**Pre-merge live check** (2026-08-04): на обеих страницах секций Prerequisites / Требования **нет** (0 совпадений в HTML) — ожидаемо до merge.

**Проблемы и решения**:

Нет. В рабочем дереве есть несвязанные изменения visual snapshots (`tests/visual/...`) — вне scope EPIC-8, в diff фичи не включены.
