---
sidebar_position: 3
---

# Обзор возможностей

На этой странице собраны **все функции** Jira Helper со ссылками на подробные инструкции. Каждая функция **необязательна**: её можно включить на уровне доски (или задачи, где указано) и настроить в панели **Jira Helper** или в настройках доски Jira.

> **Первый раз здесь?** Установите расширение по [инструкции](/docs/getting-started/installation), затем пройдите [быстрый старт](/docs/getting-started/quick-start).

## WIP-лимиты

Ограничения незавершённой работы и правила загрузки на доске.

- **[Групповые лимиты колонок (CONWIP)](/docs/features/wip-limits/column-limits)** — общий лимит на группу колонок
- **[Лимиты по swimlane](/docs/features/wip-limits/swimlane-limits)** — лимит задач в swimlane
- **[Персональные WIP-лимиты](/docs/features/wip-limits/personal-limits)** — лимиты на человека с аватар-бейджами
- **[Лимиты по значению поля](/docs/features/wip-limits/field-limits)** — «ёмкость» по полю
- **[Лимиты по ячейкам](/docs/features/wip-limits/cell-limits)** — лимит для пары swimlane × колонка

## Визуализация доски

Как доска выглядит и читается.

- **[Цвета карточек](/docs/features/board-visualization/card-colors)** — заливка карточки по правилам Card Colors Jira
- **[Гистограмма по swimlane](/docs/features/board-visualization/swimlane-histogram)** — столбики распределения по колонкам (без настроек)

## Информация на карточках

Дополнительные бейджи и контекст на карточках (обычно в детальном виде доски).

- **[Дни в колонке](/docs/features/card-information/days-in-column)** — сколько дней задача в колонке, пороги warning/danger
- **[Дни до дедлайна](/docs/features/card-information/days-to-deadline)** — обратный отсчёт / просрочка по полю даты
- **[Отображение связей](/docs/features/card-information/issue-links-display)** — связанные задачи чипами на карточке
- **[Проверки условий (JQL)](/docs/features/card-information/issue-condition-checks)** — иконки по JQL и подзадачам

## Прогресс и планирование

- **[Прогресс подзадач](/docs/features/sub-tasks-progress)** — полосы и счётчики по подзадачам, дочерним эпика, связям
- **[Диаграмма Ганта](/docs/features/gantt-chart)** — временная шкала на странице задачи (классический вид)

## Контрольная диаграмма (отчёты)

На отчёте Jira **Control Chart**.

- **[Линия SLA](/docs/features/control-chart/sla-line)** — горизонтальная SLA с зоной процентиля (сохраняется на доске)
- **[Измерительная сетка](/docs/features/control-chart/scale-ruler)** — перетаскиваемая сетка (только сессия; в Firefox не поддерживается)

## Прочие инструменты

- **[Флаг на панели задачи](/docs/features/flag-issue)** — подсветка помеченных флагом задач в иерархии и панелях (без настроек)
- **[Шаблоны комментариев](/docs/features/issue-templates/comment-templates)** — вставка текста из тулбара редактора комментария
- **[Размытие данных](/docs/features/data-blurring)** — размытие текста и картинок для демонстрации экрана (контекстное меню)
- **[Локальные настройки](/docs/features/local-settings)** — язык интерфейса расширения (Auto / EN / RU)

## Дополнительно

- **[Справка по JQL](/docs/advanced/jql-reference)** — советы по запросам в настройках
- **[FAQ](/docs/advanced/faq)** — частые вопросы

---

**Совместимость:** только **Jira Server** и **Jira Data Center**; **Jira Cloud** не поддерживается. **Браузеры:** Chrome, Edge и другие на Chromium (минимум Chrome **88**), Firefox (**58+**). **Safari** не поддерживается.

Где хранятся настройки (свойства доски Jira или только ваш браузер) — в разделе [Свойства доски и локальное хранилище](/docs/settings).
