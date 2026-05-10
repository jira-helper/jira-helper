---
sidebar_position: 2
---

# Быстрый старт

Настройте свой первый WIP-лимит менее чем за 2 минуты.

> **Кратко** — Установите расширение → откройте любую Jira-доску → нажмите кнопку **Jira Helper** на панели инструментов доски (квадратная кнопка с надписью «Jira Helper», справа от значка шестерёнки Jira) → вкладка **Columns** → прокрутите до **Column group WIP limits** → перетащите колонки из панели в слот группы, установите лимит, сохраните. Готово.

## Предварительные требования

- [Jira Helper установлен](/docs/getting-started/installation) и включён в браузере
- Права **администратора доски** хотя бы на одной Jira-доске
- Доска Scrum или Kanban (не service desk / JSM)

## 1. Откройте доску

Перейдите на любую Scrum- или Kanban-доску в Jira. Расширение активируется автоматически — вы увидите кнопку **Jira Helper** на панели инструментов доски, квадратную кнопку с надписью «Jira Helper», обычно расположенную справа от родного значка шестерёнки Jira.

<!-- SCREENSHOT: The Jira Helper button in the board toolbar (top-right area, near the native Jira gear icon), with a red circle around it -->

## 2. Откройте панель Jira Helper

Нажмите кнопку **Jira Helper** на панели инструментов доски, чтобы открыть панель настроек расширения. У каждой функции своя вкладка: **Columns**, **Swimlanes**, **Card Colors**, **Gantt Chart** и другие.

<!-- SCREENSHOT: The Jira Helper settings dialog open to the Columns tab, showing the "Column group WIP limits" section -->

## 3. Настройте первую функцию

### Пример: Column Group WIP Limits

1. В панели настроек перейдите на вкладку **Columns**
2. Прокрутите до раздела **Column group WIP limits**
3. Перетащите колонки из правой панели в слот группы (например, перетащите «In Progress» и «Review» вместе в одну группу)
4. Установите число **Max issues** (например, `5`)
5. Нажмите **Save**

Доска обновляется мгновенно. Вы увидите значок **текущее / лимит** на заголовке первой колонки группы.

## 4. Проверьте работу

- Найдите **значок-счётчик** на первой колонке каждой группы (например, `3 / 5`)
- Когда группа превышает лимит, область колонки становится **красной**

<!-- SCREENSHOT: A board view showing a column group with "3 / 5" badge and red background on an overloaded group -->

## Дальнейшие шаги

- **[Column Group WIP Limits](/docs/features/wip-limits/column-limits)** — полная документация с ограничением по swimlane, фильтрацией по типам задач и настройкой цветов
- **[Обзор функций](/docs/intro)** — изучите все возможности Jira Helper
- **[Руководство по настройкам](/docs/settings)** — узнайте, где хранятся настройки (общие для команды и личные)
- **[Установка](/docs/getting-started/installation)** — установка и поддержка браузеров
- **[FAQ](/docs/advanced/faq)** — частые вопросы и устранение неполадок
