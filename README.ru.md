![Build Status](https://github.com/pavelpower/jira-helper/workflows/Node%20CI/badge.svg) [![Coverage Status](https://coveralls.io/repos/github/jira-helper/jira-helper/badge.svg)](https://coveralls.io/github/jira-helper/jira-helper)

# Расширение для Google Chrome/Firefox

## Функционал расширения "jira-helper"

_version 2.30.0_

Браузерное расширение, которое расширяет возможности Jira: продвинутая визуализация, WIP-лимиты и инструменты управления потоком работ.

[Краткое описание всех функций](./docs/features-summary.ru.md) | [Подробная документация](./docs/index.ru.md)

### WIP-лимиты и управление потоком
- [WIP-limit для нескольких колонок (CONWIP)](./docs/index.ru.md#wip-limits-for-several-columns-conwip)
- [WIP-limit для Swimlane](./docs/index.ru.md#wip-limits-for-swimlanes)
- [Персональный WIP-limit](./docs/index.ru.md#wip-limit-for-person)
- [WIP-limit по значению поля](./docs/index.ru.md#wip-limit-for-field-value)
- [WIP-limit на ячейки](./docs/index.ru.md#wip-limit-on-cell)

### Визуализация доски
- [Card Colors - полная подсветка карточек](./docs/index.ru.md#card-colors-цвета-карточек)
- [Swimlane Chart Bar - визуализация количества задач](./docs/index.ru.md#swimlane-chart-bar)
- [Флажок на панели задачи](./docs/index.ru.md#flag-on-issue-panel)
- [Размытие секретных данных](./docs/index.ru.md#blurring-of-secret-data)

### Прогресс задач и связи
- [Sub-tasks Progress - прогресс-бар на карточках](./docs/index.ru.md#sub-tasks-progress-прогресс-подзадач)
- [Issue Links Display - отображение связей на карточках](./docs/index.ru.md#issue-links-display-отображение-связей)
- [Days in Column - отслеживание времени в колонке](./docs/index.ru.md#days-in-column-дни-в-колонке)
- [Days to Deadline - отслеживание дедлайнов](./docs/index.ru.md#days-to-deadline-дни-до-дедлайна)

### Аналитика
- [SLA-линия для Control Chart с процентилем](./docs/index.ru.md#sla-line-for-control-chart)
- [Линейка измерений на Control Chart](./docs/index.ru.md#ruler-of-measuring-for-control-chart)

### Шаблоны
- [Шаблон описания задачи](./docs/index.ru.md#template-for-description)

## Ведение задач проекта

Все задачи заводятся на [github issues](https://github.com/pavelpower/jira-helper/issues)

Перед добавлением задачи убедитесь, что подобной задачи еще не добавляли.
Обязательно проверьте закрытые задачи, возможно к готовящейся версии такая задача уже добавлена.


### Для добавления нового функционала

[Создайте новую задачу](https://github.com/pavelpower/jira-helper/issues/new)

После описание задачи, добавьте только такие атрибуты:

- Labels: `feature`
- Project: `jira-helper`


### Если необходимо добавить исправление

_Когда функционал работает не так, как ожидаете._

[Создайте новую задачу](https://github.com/pavelpower/jira-helper/issues/new)

После описание задачи, добавьте только такие атрибуты:

- Labels: `invalid`, [`cloud jira`, `jira 7`, `jira 8`] – укажите в каких версиях JIRA воспроизводится проблема.
- Project: `jira-helper`


### Добавить описание проблемы (бага)

[Создайте новую задачу](https://github.com/pavelpower/jira-helper/issues/new)

После описание задачи, добавьте только такие аттрибуты:

- Labels: `bug`, [`cloud jira`, `jira 7`, `jira 8`] – укажите в каких версиях JIRA воспроизводится проблема.
- Project: `jira-helper`


### Labels общий список используемых labels

|   labels     |    Значение                                                               |
|--------------|:--------------------------------------------------------------------------|
| `feature`    | новый функционал                                                          |
| `invalid`    | функционал работает не так как ожидается                                  |
| `bug`        | проблема, ошибка - обязательно указывать label версии где воспроизводится |
| `jira 7`     | воспроизводится в версии JIRA 7.x.x                                       |
| `jira 8`     | воспроизводится в версии JIRA 8.x.x                                       |
| `cloud jira` | воспроизводится в версии Cloud JIRA                                       |


## Установка расширения для разработки

- Установите Node.js 20+
- Установите зависимости: `npm ci`
- Для локальной разработки компонентов можно использовать Storybook: `npm run storybook`

### Chrome

Выполните сборку: `npm run build`

Откройте меню → "Дополнительные инструменты" → ["Расширения"](chrome://extensions/)

На панели ["Расширения"](chrome://extensions/) включите "Режим разработчика", затем нажмите "Загрузить распакованное расширение".

Выберите папку сборки `~/jira-helper/dist`.

### Firefox

Выполните сборку: `npm run prod:firefox`

Откройте url `about:debugging#/runtime/this-firefox` и нажмите "Загрузить временное дополнение".
В окне выберите `manifest.json` из директории `dist-firefox`.

### Во время разработки

После изменения кода выполните `npm run build`, затем на панели ["Расширения"](chrome://extensions/) нажмите "Обновить" и перезагрузите страницу с Jira (`F5`).

### Ведение ветки и commit-ов

Название ветки должно начинаться с номера задачи с которой она связана

Пример: `2-title-issue`, где префикс `2` – это номер задачи, обязателен.

В каждом `commit` обязательно добавляйте номер задачи с которым он связан

Пример: `[#15] rename *.feature to *.ru.feature`

Названия веток и commit-ы пишем на `english` языке.

## Публикация расширения

Официальное расширение публикуется в ["Chrome WebStore"](https://chrome.google.com/webstore/detail/jira-helper/egmbomekcmpieccamghfgjgnlllgbgdl)

Версия релиза совпадает с версией приложения в [package.json](./package.json)

_Минимальная версия Chrome: [>= 88](./src/manifest.json)_

### Автоматическая публикация (рекомендуется)

1. Обновите версию в `package.json`
2. Закоммитьте и запушьте изменения
3. Создайте новый [GitHub Release](https://github.com/jira-helper/jira-helper/releases/new) с тегом, соответствующим версии (например, `v2.30.0`)
4. GitHub Actions автоматически соберёт и опубликует расширение в Chrome Web Store

**Настройка (один раз):**
- Сконфигурируйте GitHub Secrets с учётными данными Chrome Web Store (см. [руководство по настройке](./docs/CHROME_WEBSTORE_PUBLISH.md))

### Ручная публикация

1. Обновите версию в `package.json`
2. Соберите расширение:
   ```bash
   npm run prod
   ```
3. Опубликуйте в Chrome Web Store:
   ```bash
   CHROME_WEBSTORE_CREDENTIALS_FILE=./path/to/credentials.json node tools/publish-chrome-webstore.js
   ```

Подробные инструкции: [Chrome Web Store Publishing Guide](./docs/CHROME_WEBSTORE_PUBLISH.md)
