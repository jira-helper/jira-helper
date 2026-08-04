# QA: TASK-114 — Verify website build & deploy

**Дата**: 2026-08-04  
**TASK**: [TASK-114](./TASK-114-verify-website-build-deploy.md)  
**Вердикт**: **PASS** (pre-merge); live deploy — **PENDING** merge в `master`

## Автоматические проверки

| Проверка | Результат | Детали |
|----------|-----------|--------|
| Website build | pass | Переиспользован `.logs/qa-task-113-website-build.log` — exit **0** |
| EPIC diff scope | pass | Только `website/docs/.../days-in-column.md` + RU i18n counterpart; `src/` — 0 файлов |
| Extension / i18n runtime | pass | `src/` не изменён |

## Acceptance checklist (.feature)

| Scenario | Результат | Комментарий |
|----------|-----------|-------------|
| @SC-DOC-EN-1 | pass | `## Prerequisites` после metadata table; only if + Show days in column + full UI path |
| @SC-DOC-EN-2 | pass | Bullet «Jira board setting» в How to configure |
| @SC-DOC-EN-3 | pass | Troubleshooting «Badge missing» + Jira setting + path |
| @SC-DOC-RU-1 | pass | `## Требования` после metadata table; только если + Показывать дни в колонке + path |
| @SC-DOC-RU-2 | pass | Bullet «Настройка доски Jira» в Как настроить |
| @SC-DOC-RU-3 | pass | Troubleshooting «Бейдж не отображается» + Jira setting + path |
| @SC-DOC-PARITY-1 | pass | Labels/paths совпадают с `jiraSettingsRequired` в `DaysInColumnSettings.tsx` |

## Live GitHub Pages (post-merge)

| Locale | URL | Pre-merge |
|--------|-----|-----------|
| EN | https://jira-helper.github.io/jira-helper/docs/features/card-information/days-in-column/ | Prerequisites **отсутствует** (ожидаемо) |
| RU | https://jira-helper.github.io/jira-helper/ru/docs/features/card-information/days-in-column/ | Требования **отсутствует** (ожидаемо) |

После merge: убедиться, что на live EN/RU появились секции Prerequisites / Требования и обновлённые Troubleshooting.

## Deploy workflow

Push/merge в `master` → `.github/workflows/website.yml` → `npm ci` + `npm run build` → `deploy-pages` → https://jira-helper.github.io/jira-helper/

## Резюме

Pre-merge verification пройдена: build OK, markdown соответствует `.feature`, scope чистый. Live Pages обновятся после merge; финальный EPIC DONE — после ручной проверки пользователем на live.
