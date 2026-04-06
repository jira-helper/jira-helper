# QA: TASK-190 — Cypress BDD — column WIP inline (board tab)

**Дата**: 2026-04-06  
**TASK**: [TASK-190](./TASK-190-column-wip-inline-cypress-bdd.md)  
**Вердикт**: PASS

## Автоматические проверки

| Проверка | Результат | Детали |
|----------|-----------|--------|
| ESLint (`npm run lint:eslint -- --fix`) | pass | Exit code 0, без ошибок после fix |
| Tests (`npm test`) | pass | Vitest: 89 files, 862 tests; exit code 0 (в stderr — ожидаемые предупреждения из других тестов: antd/rc-collapse/act) |
| Build (`npm run build:dev`) | pass | Exit code 0 |
| Cypress component (`npx cypress run --component --spec "src/column-limits/SettingsTab/features/*.feature.cy.tsx"`) | pass | 2 spec-файла, 8 тестов, все зелёные; предупреждение `Opening /dev/tty failed` — типично для headless, на результат не влияет |

## Проектные требования

| Проверка | Результат | Комментарий |
|----------|-----------|-------------|
| i18n | pass | В step definitions (`board-tab.steps.ts`) для UI используются ключи `COLUMN_LIMITS_TEXTS` (`.en` в связке с `MockLocaleProvider('en')`). Хардкод пользовательских строк в прод-компонентах в scope тестов не добавлялся. В harness `helpers.tsx` строки модалки Board Settings берутся из `BOARD_SETTINGS_TEXTS` через `useGetTextsByLocale`. В fallback ErrorBoundary остаётся английская строка `Failed to render tab content` — только тестовый harness, не продуктовый UI. |
| Accessibility | pass | Для задачи добавлены в основном тесты и harness: декоративное изображение с `alt=""`; сценарии кликают по стабильным селекторам/ролям (`role="dialog"`, `.ant-tabs-tab`). Интерактивный UI — существующие компоненты column-limits/antd. |
| Storybook | N/A | TASK-190 добавляет Cypress BDD и harness; отдельных новых View-компонентов под stories в рамках этой задачи нет. |

## Проблемы

- В файле [TASK-190](./TASK-190-column-wip-inline-cypress-bdd.md) таблица «Покрытие (Scenario → Cypress)» по-прежнему с плейсхолдерами (`{заполнить при реализации}` и пустые ячейки). По критериям приёмки задачи таблицу стоит заполнить ссылками на describe/файлы (реализация тестами покрывает сценарии lifecycle и access-and-sync).

## Резюме

Автоматический контур (ESLint, unit-тесты, `build:dev`, указанный запуск Cypress component для `SettingsTab/features`) проходит без ошибок. Проектные требования i18n и базовый a11y для добавленного кода соблюдены; Storybook для этой задачи не требуется. Остаётся косметическое несоответствие документации задачи: не обновлена таблица покрытия в TASK-190.
