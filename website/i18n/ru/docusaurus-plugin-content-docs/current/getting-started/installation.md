---
sidebar_position: 1
---

# Установка

Jira Helper — это браузерное расширение, добавляющее WIP-лимиты, раскраску карточек, диаграмму Ганта и другие профессиональные возможности Kanban в Jira. Работает с Jira Cloud и Jira Server/Data Center.

**Приватность:** Никакие данные не передаются третьим лицам. Расширение взаимодействует только с вашим экземпляром Jira через его существующий API. Никакой аналитики, телеметрии, внешних серверов.

## Требования

- **Chrome 88+**, **Firefox 58+** или **Edge 88+** (на базе Chromium)
- Экземпляр Jira с доступом к доске (Cloud или Server/Data Center)
- Никакого дополнительного ПО или учётных записей не требуется

<!-- SCREENSHOT: Chrome Web Store listing page with "Add to Chrome" button highlighted -->

## Chrome / Chromium / Edge

1. Откройте [страницу в Chrome Web Store](https://chrome.google.com/webstore/detail/jira-helper/egmbomekcmpieccamghfgjgnlllgbgdl)
2. Нажмите **Добавить в Chrome**
3. Нажмите **Добавить расширение** в диалоге подтверждения
4. (Опционально) Закрепите расширение: нажмите значок расширений (пазл) на панели инструментов, затем значок закрепления рядом с **Jira Helper**
5. Перейдите на свою Jira-доску — расширение активируется автоматически

## Firefox

1. Откройте [страницу дополнений Firefox](https://addons.mozilla.org/firefox/addon/jira-helper/)
2. Нажмите **Добавить в Firefox**
3. Нажмите **Добавить** в диалоге подтверждения
4. Перейдите на свою Jira-доску — расширение активируется автоматически

## Edge

Microsoft Edge поддерживает расширения Chrome напрямую из Chrome Web Store. Нажмите **Разрешить расширения из других магазинов** в баннере Edge при появлении запроса, затем следуйте инструкциям для Chrome выше.

## Проверка установки

1. Откройте любую Jira-доску (Scrum или Kanban)
2. Найдите кнопку **Jira Helper** — квадратную кнопку с надписью «Jira Helper» на панели инструментов доски, обычно справа от родного значка шестерёнки Jira
3. Если вы её не видите, раскройте панель расширений и убедитесь, что расширение закреплено

<!-- SCREENSHOT: Jira board with Jira Helper button visible in the toolbar, circled -->

## Устранение неполадок

### Расширение не появляется после установки

- **Обновите** страницу Jira (F5)
- Убедитесь, что расширение **включено** в `chrome://extensions` / `about:addons`
- Убедитесь, что вы находитесь на поддерживаемой странице: **вид доски** (не бэклог, не поиск задач)
- Проверьте совместимость браузера: минимум Chrome 88, Firefox 58, Edge 88

### Корпоративный Chrome блокирует расширение

Если ваша организация блокирует установку расширений:
1. Попросите IT-администратора **принудительно установить** расширение через групповую политику
2. ID расширения: `egombomekcmpieccamghfgjgnlllgbgdl`
3. Либо запросите добавление расширения в белый список вашей организации

### Расширение установлено, но функции не работают

Некоторым функциям требуются права **администратора доски** для сохранения конфигурации. К ним относятся: Column Group WIP Limits, Swimlane WIP Limits, Personal WIP Limits, Field Value WIP Limits, Cell WIP Limits, Card Colors, Sub-tasks Progress, Days in Column, Days to Deadline, Issue Links Display, Issue Condition Checks и SLA Line — все функции, хранящие настройки в свойствах доски Jira.

Функции только для просмотра (Swimlane Histogram, Flag on Issue Panel, Scale Ruler, Data Blurring) и личные функции (Gantt Chart, Comment Templates, Local Settings) работают без прав администратора доски.

См. [Board Properties & Local Storage](/docs/settings#board-properties-team-shared) для полной разбивки.

## Дальнейшие шаги

- **[Быстрый старт](/docs/getting-started/quick-start)** — настройте свой первый WIP-лимит менее чем за 2 минуты
- **[Обзор функций](/docs/intro)** — всё, что умеет Jira Helper
- **[FAQ](/docs/advanced/faq)** — частые вопросы и устранение неполадок
- **[Board Properties & Local Storage](/docs/settings)** — где хранятся настройки
