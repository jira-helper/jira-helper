# QA: TASK-113 — Days in Column EN + RU docs (Jira prerequisite)

**Дата**: 2026-08-04
**TASK**: [TASK-113](./TASK-113-days-in-column-docs-en-ru.md)
**Вердикт**: PASS

## Scope

Docs-only: правки только в `website/docs/.../days-in-column.md` (EN) и `website/i18n/ru/.../days-in-column.md` (RU). UI/runtime (`src/`) не менялись.

## Автоматические проверки

| Проверка | Результат | Детали |
|----------|-----------|--------|
| ESLint | N/A | Docs-only; extension lint не запускался (вне scope задачи) |
| Tests | N/A | Docs-only; `npm test` репозитория не запускался (вне scope задачи) |
| Extension build | N/A | `src/` не изменён |
| Website build | pass | `cd website && npm run build` — exit code **0**. Лог: `.logs/qa-task-113-website-build.log` |
| `src/` unchanged | pass | `git diff --name-only HEAD -- 'src/'` — пусто |

## Содержимое документации

### EN — `website/docs/features/card-information/days-in-column.md`

| Критерий | Результат | Комментарий |
|----------|-----------|-------------|
| @SC-DOC-EN-1 Prerequisites | pass | `## Prerequisites` сразу после metadata table (стр. 14–18); **only if**, «Show days in column», путь Board configuration → Card layout → Show days in column |
| @SC-DOC-EN-2 Configure bullet | pass | Bullet **Jira board setting** (стр. 40) с «Show days in column», Board configuration → Card layout, пояснение про jira-helper badge |
| @SC-DOC-EN-3 Troubleshooting | pass | `## Troubleshooting` (стр. 63–68); **Badge missing** упоминает Jira «Show days in column» и Board configuration → Card layout |

### RU — `website/i18n/ru/.../days-in-column.md`

| Критерий | Результат | Комментарий |
|----------|-----------|-------------|
| @SC-DOC-RU-1 Требования | pass | `## Требования` сразу после metadata table (стр. 14–18); **только если**, «Показывать дни в колонке», путь Настройки доски → Макет карточки → Показывать дни в колонке |
| @SC-DOC-RU-2 Configure bullet | pass | Bullet **Настройка доски Jira** (стр. 40) с «Показывать дни в колонке», Настройки доски → Макет карточки |
| @SC-DOC-RU-3 Troubleshooting | pass | Новая секция `## Troubleshooting` (стр. 65–70); пункт про отсутствующий бейдж + 3 доп. пункта по target-design |

### Паритет docs ↔ UI (@SC-DOC-PARITY-1)

| Поле | Alert (`DaysInColumnSettings.tsx`) | Docs | Результат |
|------|-----------------------------------|------|-----------|
| EN label | Show days in column | Show days in column | pass |
| RU label | Показывать дни в колонке | Показывать дни в колонке | pass |
| EN path | board configuration → Card layout → Show days in column | Board configuration → Card layout → Show days in column | pass |
| RU path | настройки доски → Макет карточки → Показывать дни в колонке | Настройки доски → Макет карточки → Показывать дни в колонке | pass |

## Проектные требования

| Проверка | Результат | Комментарий |
|----------|-----------|-------------|
| i18n (extension) | N/A | Runtime не менялся |
| Accessibility | N/A | UI не менялся |
| Storybook | N/A | UI не менялся |
| Acceptance checklist (.feature) | pass | Все сценарии @SC-DOC-EN-1…3, @SC-DOC-RU-1…3, @SC-DOC-PARITY-1 выполнены вручную по markdown |

## Проблемы

Нет.

## Резюме

EN и RU user guide содержат требуемые секции Prerequisites/Требования, configure bullets и Troubleshooting с корректными лейблами и путями Jira UI. Website build проходит (exit 0), `src/` для этой фичи не изменён.
