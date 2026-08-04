# Requirements: Days in Column — prerequisite в документации

**Feature folder**: `.agents/tasks/days-in-column-jira-prerequisite/`
**Связанный request**: [request.md](./request.md)
**Дата**: 2026-08-04
**Статус**: agreed
**Has UI**: no

## 1. Цель и мотивация

Фича «Days in Column» / «Дни в колонке» в jira-helper зависит от встроенной настройки доски Jira: на доске должно быть включено «Days in column» / «Дни в колонке». Без этого бейдж расширения не работает корректно.

В UI настроек расширения уже есть `Alert` (`data-testid="days-in-column-jira-settings-required"`, текст `jiraSettingsRequired`), который показывается при включённом бейдже. Этого достаточно — **UI не меняем**.

Проблема: в пользовательской документации (`website/docs/.../days-in-column.md` и RU-локаль) это prerequisite **не выделено явно**. Пользователь может включить фичу в jira-helper и не понять, почему бейдж не появляется или не работает.

Критерий успеха: в EN и RU доке фичи явно указано, что фича работает **только если** в настройках доски Jira включено «Days in column» / «Дни в колонке»; сайт с документацией обновлён через существующий CI (`website.yml` → GitHub Pages).

## 2. Пользователи и контекст

- Роли / контекст использования: администраторы / настройки доски и пользователи, включающие бейдж «Days in Column» в jira-helper; читатели user-facing docs на сайте.
- Страницы Jira и точки входа: **не применимо к изменению UI** в этой итерации. Документация описывает существующую точку входа: настройки доски jira-helper → «Additional Card Elements» → «Days in Column Badge», плюс prerequisite в настройках самой доски Jira.
- Изоляция по board/project: не затрагивается (документация, без изменения настроек/данных).

## 3. Функциональные требования

1. **FR-1**: В английской документации фичи (`website/docs/features/card-information/days-in-column.md`) явно указать prerequisite: фича работает **только если** в настройках доски Jira включено **«Days in column»**.
2. **FR-2**: В русской документации фичи (`website/i18n/ru/docusaurus-plugin-content-docs/current/features/card-information/days-in-column.md`) явно указать тот же prerequisite с формулировкой **«Дни в колонке»**.
3. **FR-3**: Формулировка заметная: отдельный блок **Prerequisites / Требования** сразу после таблицы метаданных (до Purpose), плюс шаг в How to configure / Как настроить, плюс пункт в Troubleshooting.
4. **FR-4**: Путь в UI Jira (как в Alert расширения): Board Settings → Columns → Days in column / Настройки доски → Колонки → Дни в колонке.
5. **FR-5**: После мержа в `master` сайт с докой обновляется через CI `website.yml` → GitHub Pages (`https://jira-helper.github.io/jira-helper/`).

## 4. Сценарии (happy path + важные края)

### S1: Читатель EN-доки узнаёт про prerequisite Jira
- Given пользователь открыл страницу Days in Column на сайте документации (EN)
- When он читает раздел Prerequisites
- Then он видит явное указание, что в настройках доски Jira должно быть включено «Days in column»
- And понимает путь: Board Settings → Columns → Days in column

### S2: Читатель RU-доки узнаёт про prerequisite Jira
- Given пользователь открыл страницу «Дни в колонке» на сайте документации (RU)
- When он читает раздел «Требования»
- Then он видит явное указание про «Дни в колонке» и путь «Настройки доски → Колонки → …»

### S3: Troubleshooting
- Given в EN-доке есть Troubleshooting; в RU — добавить аналогичный раздел при необходимости
- When документация обновлена
- Then пункт про отсутствующий бейдж упоминает выключенную настройку Jira «Days in column» / «Дни в колонке»

### S4: Деплой документации
- Given изменения EN + RU docs смержены в `master`
- When отработал CI `website.yml`
- Then обновлённая страница Days in Column доступна на GitHub Pages

## 5. Данные и миграции

- Источник истины данных: не применимо (только markdown/docs).
- Миграции / совместимость: не применимо. UI Alert и i18n расширения не меняются.

## 6. Нефункциональные требования

- Тестирование: docs-only. Без новых Cypress/Vitest под текст доки.
- Проверки: `npm run build` в `website/` не ломается; ручной просмотр EN + RU после деплоя.
- Не раздувать scope: без Storybook, без Netlify HTML-отчёта.

## 7. Вне scope

- Изменение UI настроек (иконка/тултип не добавляем; Alert оставляем).
- Runtime-поведение фичи, stores, board properties.
- i18n-строки расширения.
- Netlify HTML-отчёт со скриншотом.
- Документация других фич.

## 8. Открытые вопросы

- [x] Секция: **Prerequisites / Требования** + шаг в configure + Troubleshooting.
- [x] Путь UI Jira: как в Alert — Board Settings → Columns → Days in column.
- [x] Troubleshooting дополняем.
- [x] Отдельный markdown-lint не обязателен; достаточно `website` build + CI deploy.

## 9. Черновик критериев приёмки (для EPIC / BDD)

- [ ] В EN `days-in-column.md` есть блок Prerequisites про «Days in column».
- [ ] В RU `days-in-column.md` есть блок «Требования» про «Дни в колонке».
- [ ] Troubleshooting (EN + RU) упоминает эту настройку Jira при missing badge.
- [ ] UI расширения не изменён.
- [ ] После мержа в `master` сайт обновлён через `website.yml`.

## 10. UI Wireframe

Секция удалена: **Has UI = no**.

## Changelog

- **2026-08-04** — scope сужен до docs-only (триггер: пользователь в чате «UI уже ок»). Статус → agreed. Закрыты open questions.
- **2026-08-04** — путь UI Jira исправлен: Card layout / Макет карточки → **Columns / Колонки** (триггер: пользователь). Категория: requirements change. Затронуто: docs EN/RU + Alert `jiraSettingsRequired`.

- **2026-08-04** — точный путь EN: Board Settings → Columns → Days in column (триггер: пользователь, AskForm).
