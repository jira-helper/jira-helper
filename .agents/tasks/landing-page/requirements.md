# Requirements: Landing page and documentation site

**Feature folder**: `.agents/tasks/landing-page/`
**Связанный request**: [request.md](./request.md)
**Дата**: 2026-05-09
**Статус**: agreed
**Has UI**: yes

## 1. Цель и мотивация

**Проблема**: У jira-helper нет собственного сайта. README в GitHub выполняет роль одновременно маркетинга и документации, но:
- Потенциальные пользователи не видят фичи в привлекательном формате
- Документация по фичам размазана по README, issues и исходникам
- Нет единой точки входа для установки, изучения и поддержки
- Нет SEO — расширение не находится через поиск по Kanban/Jira инструментам

**Цель**: Создать статический сайт на GitHub Pages (Docusaurus), совмещающий:
1. **Маркетинговый лендинг** — Hero, Features Grid, Social Proof, CTA
2. **Полноценную документацию** — по каждой фиче: описание, скриншоты, юзер-джобы

**Критерии успеха**:
- Сайт опубликован на `https://jira-helper.github.io` (или аналог)
- Лендинг показывает все ключевые фичи с гифками/скриншотами
- Документация покрывает все фичи с пошаговыми инструкциями
- Работает RU/EN локализация с переключателем
- CI/CD: сборка и деплой при пуше в main

---

## 2. Пользователи и контекст

**Роли**:
- **Новые пользователи** — приходят с Chrome Web Store / GitHub, хотят понять, что делает расширение и как установить
- **Существующие пользователи** — ищут документацию по конкретной фиче, примеры настройки
- **Team leads / Agile Coaches** — оценивают, подходит ли расширение для команды, сравнивают возможности
- **Контрибьюторы** — через docs могут понять архитектуру фич (но это не primary target)

**Jira-страницы, к которым относится**: N/A — это внешний сайт, не расширение

**Точки входа**:
- Прямой переход на `jira-helper.github.io`
- Редирект с Chrome Web Store страницы
- Ссылка из README репозитория
- Поисковые системы (SEO)

---

## 3. Функциональные требования

### FR-1: Лендинг

**FR-1.1**: Hero-секция
- Крупный заголовок с ценностным предложением ("Turn Jira into a real Kanban system")
- Подзаголовок с коротким USP (WIP-лимиты, визуализация, аналитика)
- Две CTA-кнопки: "Install from Chrome Web Store", "Documentation"
- Фоновый скриншот доски с включённым jira-helper
- Бейджи: версия, кол-во установок, звёзды GitHub

**FR-1.2**: Features Grid
- 6-8 карточек ключевых фич с заголовком, коротким описанием и гифкой/скриншотом
- Каждая карточка кликабельна → ведёт в соответствующую страницу документации
- Сетка адаптивная (3 колонки на десктопе, 2 на планшете, 1 на мобилке)
- Выбор фич для показа (какие именно — на этапе дизайна):
  - Column WIP Limits
  - Personal WIP Limits
  - Gantt Chart
  - Card Colors
  - Days in Column / Days to Deadline
  - Sub-tasks Progress
  - Control Chart SLA
  - Issue Links Display

**FR-1.3**: Stats / Social Proof
- Крупные цифры: установки, звёзды GitHub, кол-во фич, версия
- Опционально: логотипы компаний-пользователей (если появятся)

**FR-1.4**: CTA Block
- Повторные кнопки установки
- Ссылки: GitHub, Chrome Web Store, Firefox Add-ons, Documentation

### FR-2: Документация

**FR-2.1**: Сайдбар-навигация
- Группировка по разделам (Getting Started, Features, Settings, Advanced)
- Подразделы фичей (WIP Limits, Board Visualization, Card Information и т.д.)
- Поиск по документации

**FR-2.2**: Getting Started
- Страница установки: Chrome Web Store, Firefox Add-ons
- Быстрый старт: включить первую фичу, открыть настройки доски
- Системные требования: Chrome 88+, Firefox 58+

**FR-2.3**: Страница фичи — общая структура (каждая фича)

Каждая страница фичи состоит из двух блоков:

**Блок 1 — Overview**
- Заголовок фичи
- Одно предложение — суть
- Скриншот/гифка "в действии"
- Зачем это нужно (сценарий использования)
- Где появляется (Board / Issue Page / Reports / Settings)

**Блок 2 — User Jobs**

По подзаголовку на каждую юзер-джобу. Каждая джоба содержит:
- Цель (что пользователь хочет сделать)
- Пошаговая инструкция
- Скриншот интерфейса настройки (где это находится)
- Описание опциональных параметров

Ниже — полный список фич и их user jobs.

**FR-2.3.1: Column Group WIP Limits (CONWIP)**

User Jobs:
- **Создать группу колонок** — перетащить колонки, задать лимит
- **Настроить scope по свимлейнам** — ограничить лимит конкретными свимлейнами
- **Настроить фильтр по типам задач** — включить только определённые Issue Types
- **Настроить цвет группы** — кастомный hex-цвет заголовка
- **Удалить / редактировать группу**
- **Board view** — как выглядят бейджи `current/limit` и подсветка при превышении

**FR-2.3.2: Swimlane WIP Limits**

User Jobs:
- **Задать лимит для свимлейна** — выбрать свимлейн, ввести число
- **Выбрать колонки для подсчёта** — в каких колонках считать задачи
- **Отфильтровать по типам задач**
- **Board view** — бейдж `count/limit` на заголовке свимлейна, красная подсветка

**FR-2.3.3: Personal WIP Limits**

User Jobs:
- **Добавить лимит для человека** — поиск пользователя, ввод лимита
- **Настроить scope** — колонки, свимлейны, типы задач
- **Создать общий лимит (shared limit)** — несколько человек в один счётчик
- **Отфильтровать доску по человеку** — клик по аватар-бейджу
- **Board view** — аватар-бейджи с `current/limit`, зелёный/жёлтый/красный, подсветка карточек

**FR-2.3.4: Field Value WIP Limits (Capacity Allocation)**

User Jobs:
- **Добавить правило** — выбор поля, режим расчёта (filled / one value / any value / sum numbers)
- **Настроить отображение** — label, цвет бейджа
- **Указать scope** — колонки, свимлейны
- **Board view** — строка бейджей в тулбаре, подсветка карточек при превышении

**FR-2.3.5: Cell WIP Limits**

User Jobs:
- **Определить диапазон ячеек** — выбор свимлейн + колонка
- **Задать лимит**
- **Отфильтровать по типам задач**
- **Отключить диапазон** (disable)
- **Board view** — пунктирные границы, цветные бейджи, красный фон при превышении

**FR-2.3.6: Card Colors**

User Jobs:
- **Включить/выключить фичу**
- **Board view** — полная заливка карточки цветом (не только левая полоска)
- *Примечание: простая фича, умещается в Overview + Board view*

**FR-2.3.7: Swimlane Histogram (Chart Bar)**

User Jobs:
- **Zero-config** — фича не имеет настроек, работает автоматически
- **Board view** — компактная гистограмма у заголовка свимлейна, тултип с цифрами
- *Примечание: простая фича, умещается в Overview + Board view*

**FR-2.3.8: Days in Column**

User Jobs:
- **Включить фичу и выбрать колонки** — на каких колонках показывать бейджи
- **Настроить глобальные пороги** — warning (жёлтый), danger (красный) кол-во дней
- **Настроить пороги по колонкам** — per-column thresholds
- **Board view** — цветные бейджи (синий/жёлтый/красный) на карточке

**FR-2.3.9: Days to Deadline**

User Jobs:
- **Выбрать поле дедлайна** — какое Jira-поле содержит дату
- **Выбрать режим отображения** — always / lessThanOrOverdue / overdueOnly
- **Настроить пороги** — warning threshold (жёлтый)
- **Board view** — бейдж ⏰ с цветом (красный/жёлтый/синий)

**FR-2.3.10: Issue Links Display**

User Jobs:
- **Добавить конфигурацию ссылок** — имя, тип связи, направление
- **Настроить фильтр задач-источников** — JQL или поле
- **Настроить фильтр связанных задач** — JQL, поле
- **Настроить отображение** — цвет, многострочный summary
- **Включить отображение в бэклоге**
- **Включить кликабельные epic links**
- **Board view** — цветные бейджи связанных задач на карточке

**FR-2.3.11: Issue Condition Checks**

User Jobs:
- **Добавить условие** — имя, JQL, иконка (30+ вариантов), цвет, тултип
- **Настроить subtask awareness** — проверять подзадачи/epic children/linked
- **Выбрать анимацию** — pulse, breathe, blink, shake
- **Board view** — иконки-бейджи на карточках

**FR-2.3.12: Sub-Tasks Progress**

User Jobs:
- **Включить фичу**
- **Настроить колонки для отображения**
- **Выбрать источники** — subtasks, epic children, linked issues
- **Настроить маппинг статус → прогресс** — todo / inProgress / done
- **Настроить группировку** — по полю (Assignee, Project), игнор-группы
- **Board view** — компактный progress bar на карточке

**FR-2.3.13: Gantt Chart**

User Jobs:
- **Открыть Gantt на странице задачи** — где находится, как запускается
- **Навигация по диаграмме** — zoom (колесо), pan, hover-тултипы, клик по бару
- **Настройка маппингов дат** — start/end mapping с ordered fallbacks
- **Настройка цветовых правил** — field/JQL → цвет бара
- **Выбор источников** — include subtasks, epic children, linked issues, link types
- **Exclusion filters** — исключение по полю или JQL
- **Быстрые фильтры** — встроенные + кастомные, text/JQL режимы
- **Каскад настроек** — global → project → project+issueType
- **Status breakdown** — переключение, отображение сегментов статусов
- **Issue view** — полная страница с описанием взаимодействия

**FR-2.3.14: Control Chart SLA Line**

User Jobs:
- **Задать SLA в днях**
- **Сохранить SLA для доски**
- **Reports view** — горизонтальная линия SLA, процентиль, легенда

**FR-2.3.15: Control Chart Grid (Scale Ruler)**

User Jobs:
- **Включить сетку**
- **Выбрать пресет** — Fibonacci (1,2,3,5 / 1,2,3,5,8) или Linear
- **Настроить положение** — drag/resize оверлея
- **Reports view** — направляющие линии с подписями SP/days

**FR-2.3.16: Flag on Issue Panel**

User Jobs:
- **Zero-config** — автоматически подсвечивает задачи с флагом
- **Issue view** — иконка флага, жёлтый фон для связанных задач

**FR-2.3.17: Comment Templates**

User Jobs:
- **Управлять шаблонами** — add, edit, delete
- **Импорт/экспорт** — JSON
- **Вставить шаблон из тулбара редактора**

**FR-2.3.18: Data Blurring**

User Jobs:
- **Включить/выключить через контекстное меню**
- **All pages view** — размытый текст и изображения

**FR-2.3.19: Local Settings (Language)**

User Jobs:
- **Сменить язык** — Auto / English / Russian

### FR-3: i18n

**FR-3.1**: Весь контент сайта на двух языках: RU и EN
**FR-3.2**: Переключатель языков в хедере сайта
**FR-3.3**: Docusaurus i18n — каждая страница имеет `index.ru.md` и `index.en.md`
**FR-3.4**: Дефолтный язык определяется из `Accept-Language` браузера
**FR-3.5**: URL-схема: `jira-helper.github.io/ru/`, `jira-helper.github.io/en/`

### FR-4: Инфраструктура и CI/CD

**FR-4.1**: Сайт публикуется на GitHub Pages
**FR-4.2**: Сборка через GitHub Actions при пуше в `main`
**FR-4.3**: Артефакты сборки могут быть задеплоены в `gh-pages` ветку или через GitHub Pages Deploy action
**FR-4.4**: Docusaurus — версия 3.x (latest)

---

## 4. Сценарии

### S1: Новый пользователь находит и устанавливает расширение

1. Пользователь ищет "jira kanban wip limits" в Google
2. Переходит на лендинг jira-helper.github.io
3. Видит Hero: заголовок, скриншот доски, CTA "Install"
4. Скроллит Features Grid, видит WIP Limits, Gantt, Card Colors
5. Нажимает "Install" → переходит в Chrome Web Store
6. Устанавливает расширение

### S2: Пользователь изучает документацию по Personal WIP Limits

1. Пользователь уже использует расширение, хочет настроить Personal WIP Limits
2. Открывает `/docs/features/wip-limits/personal-limits`
3. Читает Overview: что даёт фича, видит скриншот аватар-бейджей
4. В разделе "Добавить лимит для человека" — пошаговая инструкция со скриншотом модалки
5. В разделе "Board view" — как выглядят бейджи на доске
6. Применяет настройку на своей доске

### S3: Переключение языка

1. Пользователь из России открывает сайт
2. Автоматически видит русскую версию (Accept-Language)
3. Хочет посмотреть английскую документацию
4. Нажимает EN в переключателе языков
5. Контент переключается, URL меняется на `/en/...`

### S4: Поиск по документации

1. Пользователь ищет "Gantt chart settings cascade"
2. Вводит запрос в поисковую строку Docusaurus
3. Получает результат: страница Gantt Chart, раздел "Каскад настроек"
4. Переходит по ссылке

---

## 5. Данные и миграции

**Источники данных**:
- Маркетинговый контент (тексты для Hero, Feature Cards) — пишется вручную
- Скриншоты/гифки — берутся из существующих ассетов (`src/assets/`, `docs/`, `images` branch)
- Структура документации определяется в этом документе

**Формат хранения**:
- Docusaurus: `docs/` директория с MDX-файлами
- i18n: файлы в `i18n/ru/` и `i18n/en/` (или директории внутри docs)
- Sidebar: `sidebars.js` конфигурация

**Миграций нет** — сайт создаётся с нуля.

---

## 6. Нефункциональные требования

**Performance**:
- Статический экспорт (pre-rendered HTML)
- Минимальный JS бандл (Docusaurus core + минимальные плагины)
- Оптимизированные изображения (WebP, lazy loading)
- Time to Interactive < 2s

**SEO**:
- Open Graph и Twitter Card мета-теги
- Структурированные данные (Product schema)
- Кастомный alt/title для каждой страницы
- robots.txt, sitemap.xml

**Error handling**:
- 404 страница с навигацией на лендинг
- Редирект с `/` на язык пользователя

---

## 7. Вне scope

- Живые React-компоненты на лендинге или в документации (будут во второй итерации)
- Блог / Changelog
- Страница для контрибьюторов
- Видео-демонстрации / видео-туториалы
- Система комментариев / feedback
- Аналитика (можно добавить позже)
- Сбор email'ов / waitlist
- Страница тарифов / monetization (проект open-source)

---

## 8. Открытые вопросы

- [x] SSG: Docusaurus — решено
- [x] Платформа: GitHub Pages — решено
- [x] i18n: RU/EN — решено
- [x] Живые компоненты: не в первой версии — решено
- [ ] Домен: `jira-helper.github.io` или кастомный?
- [ ] Docusaurus тема: default Classic или кастомная через swizzling?
- [ ] Кастомный домен или поддомен GitHub Pages?
- [ ] Ассеты: откуда брать скриншоты/гифки — переиспользовать из `images` ветки pavelpower/jira-helper или делать новые под лендинг?
- [ ] Порядок фич в Features Grid и в сайдбаре документации
- [ ] Какой контент для Hero — существующие скриншоты или нужны новые?

---

## 9. Черновик критериев приёмки (для EPIC)

- [ ] Сайт опубликован на GitHub Pages
- [ ] Лендинг: Hero, Features Grid (6-8 карточек с гифками), Stats, CTA
- [ ] Документация: Getting Started + все фичи с Overview и User Jobs
- [ ] RU/EN локализация с переключателем
- [ ] Поиск по документации работает
- [ ] Адаптивная вёрстка (десктоп, планшет, мобилка)
- [ ] SEO: мета-теги, Open Graph, sitemap
- [ ] CI/CD: GitHub Actions сборка и деплой
- [ ] 404 страница
- [ ] Все ссылки на Chrome Web Store / Firefox Add-ons / GitHub работают

---

## 10. Структура директорий сайта (target)

```
/
├── src/
│   ├── pages/
│   │   ├── index.tsx              # Лендинг
│   │   ├── index.ru.tsx           # Лендинг (RU)
│   │   └── 404.tsx
│   ├── components/
│   │   ├── Hero.tsx
│   │   ├── FeaturesGrid.tsx
│   │   ├── StatsBlock.tsx
│   │   └── CtaBlock.tsx
│   ├── css/
│   │   └── custom.css             # Кастомные стили
│   └── data/
│       └── features.ts            # Данные для Features Grid
│
├── docs/
│   ├── getting-started/
│   │   ├── installation.md
│   │   └── quick-start.md
│   ├── features/
│   │   ├── wip-limits/
│   │   │   ├── column-limits.md
│   │   │   ├── swimlane-limits.md
│   │   │   ├── personal-limits.md
│   │   │   ├── field-limits.md
│   │   │   └── cell-limits.md
│   │   ├── board-visualization/
│   │   │   ├── card-colors.md
│   │   │   └── swimlane-histogram.md
│   │   ├── card-information/
│   │   │   ├── days-in-column.md
│   │   │   ├── days-to-deadline.md
│   │   │   ├── issue-links-display.md
│   │   │   └── issue-condition-checks.md
│   │   ├── sub-tasks-progress.md
│   │   ├── gantt-chart.md
│   │   ├── control-chart/
│   │   │   ├── sla-line.md
│   │   │   └── scale-ruler.md
│   │   ├── flag-issue.md
│   │   ├── issue-templates/
│   │   │   └── comment-templates.md
│   │   ├── data-blurring.md
│   │   └── local-settings.md
│   ├── settings.md
│   └── advanced/
│       ├── jql-reference.md
│       └── faq.md
│
├── i18n/
│   ├── ru/
│   │   ├── docusaurus-plugin-content-docs/
│   │   └── docusaurus-plugin-content-pages/
│   └── en/
│       ├── docusaurus-plugin-content-docs/
│       └── docusaurus-plugin-content-pages/
│
├── static/
│   ├── img/
│   │   ├── hero-screenshot.png
│   │   ├── features/
│   │   │   ├── column-limits.gif
│   │   │   ├── personal-limits.gif
│   │   │   └── ... (гифки/скриншоты)
│   │   ├── logo.svg
│   │   └── favicon.ico
│   └── cta/
│       ├── chrome-web-store.png
│       └── github.png
│
├── docusaurus.config.ts
├── sidebars.ts
├── package.json
└── tsconfig.json
```

---

## Changelog

- **2026-05-09**: Документ создан по результатам brainstorming
