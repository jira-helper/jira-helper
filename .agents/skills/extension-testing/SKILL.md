---
name: extension-testing
description: Загрузка и обновление расширения jira-helper в реальном Chrome через playwright-cli. Используй когда нужно протестировать UI на живой Jira (jira.tcsbank.ru), снять скриншот, проверить DOM/console после изменений в коде, перезагрузить расширение после rebuild.
---

# Тестирование расширения jira-helper в реальном Chrome

Этот скилл описывает workflow ручного/полуавтоматического тестирования jira-helper в **настоящем Chrome** на **живой Jira Server** (`jira.tcsbank.ru`). Используется [`playwright-cli`](https://github.com/microsoft/playwright-cli) — он запускает Chrome с нашим unpacked extension, сохраняет SSO-логин между запусками и предоставляет CLI-команды для навигации, кликов, скриншотов, чтения консоли и т.п.

**Когда применять:**
- Нужно проверить, как фича выглядит/ведёт себя в реальной Jira после изменения в коде.
- Нужно снять скриншот / прочитать DOM конкретного элемента / собрать логи console для дебага.
- Storybook и Cypress component тестов недостаточно (они не покрывают взаимодействие с Jira).

**Когда НЕ применять:**
- Юнит-тесты функций/моделей → vitest.
- Изолированные UI-сценарии → Storybook / Cypress (см. `cypress-bdd-testing`).

---

## Однократная настройка окружения

Делается один раз на машине разработчика.

### 1. Установить playwright-cli

```bash
npm install -g @playwright/cli@latest
playwright-cli --version  # ≥ 0.1.5
```

### 2. Отключить browser-MCP в Cursor для этого репо

В репозитории уже лежит `.cursor/mcp.json`, который через workspace-merge выключает глобальные `playwright` и `chrome-devtools` MCP. Этого достаточно, дополнительно ничего делать не нужно.

**Важно:** встроенный в Cursor `cursor-ide-browser` (Browser tool) **per-workspace отключить нельзя** — у Cursor нет такого механизма. Если он мешает (запускает свой Chromium параллельно с нашим), отключите его руками **только для этого workspace**:

`Cmd+Shift+J` → **Tools & MCP** → найти **Browser** / **cursor-ide-browser** → выключить тоггл.

### 3. Залогиниться в Jira (один раз)

После первого `npm run jh:cli -- -s=jh open <url> --headed` в новом профиле Chrome откроется SSO. Залогиньтесь руками. Профиль персистентный (`.playwright/chrome-profile` внутри репозитория), сессия сохранится между всеми последующими запусками.

**Важно:** всегда вызывайте `playwright-cli` через `npm run jh:cli --` — обёртка подставляет `--config` с абсолютным путём к `dist/`. Без неё extension не загрузится.

---

## Базовый workflow: «изменил код → проверил в браузере»

```bash
# 1. Собрать новый bundle
npm run build

# 2. (Если Chrome уже запущен) перезагрузить с новой сборкой
npm run jh:cli -- -s=jh close

# 3. Открыть нужную задачу
npm run jh:cli -- -s=jh open https://jira.tcsbank.ru/browse/TTP-29174 --headed

# 4. Проверить, что наша фича в DOM
npm run jh:cli -- -s=jh eval "() => document.querySelectorAll('[data-jh-section], [data-jh-component]').length"

# 5. Снять скриншот
npm run jh:cli -- -s=jh screenshot --filename=after-fix.png

# 6. Прочитать ошибки
npm run jh:cli -- -s=jh console error
```

**Сессия `-s=jh`** — именованная сессия для jira-helper (`jh` = jira-helper). Обёртка `npm run jh:cli --` резолвит `.playwright/cli.config.json` → `.playwright/cli.config.resolved.json` с абсолютными путями.

---

## Как именно загружается extension

Конфиг-шаблон: `.playwright/cli.config.json`. Обёртка `tools/jh-playwright-cli.mjs` (`npm run jh:cli`) генерирует `.playwright/cli.config.resolved.json` с абсолютными путями и передаёт его в `playwright-cli --config=...`.

```json
{
  "browser": {
    "browserName": "chromium",
    "userDataDir": ".playwright/chrome-profile",
    "launchOptions": {
      "channel": "chrome",
      "headless": false,
      "args": [
        "--enable-unsafe-extension-debugging",
        "--load-extension=dist",
        "--no-first-run",
        "--no-default-browser-check"
      ],
      "ignoreDefaultArgs": [
        "--disable-extensions",
        "--disable-component-extensions-with-background-pages"
      ]
    }
  }
}
```

Ключевые тонкости (легко наступить, если этого не знать):

| Флаг / опция | Зачем |
|---|---|
| `channel: "chrome"` | используем системный Chrome, а не bundled chromium от Playwright (нужен MV3-совместимый, реальный Jira-стек требует именно его) |
| `--load-extension=/.../dist` | в Chrome ≥ M142 этот флаг **deprecated**, но **продолжает работать** при наличии `--enable-unsafe-extension-debugging` |
| `--enable-unsafe-extension-debugging` | разрешает загрузку unpacked extensions через CLI и доступ к домену CDP `Extensions.*` |
| `ignoreDefaultArgs: ["--disable-extensions"]` | Playwright по дефолту запускает Chrome с `--disable-extensions` — **обязательно убрать**, иначе extension не активируется (ID будет, но в DOM ничего не появится) |
| `ignoreDefaultArgs: ["--disable-component-extensions-with-background-pages"]` | то же самое для component extensions с SW |
| `userDataDir` | persistent профиль, чтобы SSO-логин в Jira сохранялся между перезапусками |
| `viewport: null` | используем размер окна Chrome, а не фиксированный playwright-viewport |

Если в скриншоте видно полностью пустую страницу или браузер ругается «Chrome не может проверить происхождение этого расширения» — это норма для unpacked + `--enable-unsafe-extension-debugging`, расширение всё равно работает.

---

## Перезагрузка extension после изменений

`chrome://extensions` reload через CDP **из `playwright-cli run-code` недоступен** (для persistent context Playwright не отдаёт browser-level CDP-сессию). Самый надёжный путь:

```bash
# 1. Пересобрать
npm run build

# 2. Закрыть Chrome (логин остаётся в профиле)
npm run jh:cli -- -s=jh close

# 3. Поднять снова — подхватит свежий dist
npm run jh:cli -- -s=jh open https://jira.tcsbank.ru/browse/TTP-{ISSUE} --headed
```

`close` + `open` ≈ 5 секунд, профиль/логин/cookies сохраняются.

---

## Полезные команды

### Навигация

```bash
npm run jh:cli -- -s=jh goto https://jira.tcsbank.ru/browse/TTP-29174
npm run jh:cli -- -s=jh reload
npm run jh:cli -- -s=jh tab-list
npm run jh:cli -- -s=jh tab-new https://jira.tcsbank.ru/browse/TTP-23422
```

### Проверка DOM

```bash
# чисто наличие наших маркеров
npm run jh:cli -- -s=jh eval "() => [...document.querySelectorAll('[data-jh-section], [data-jh-component]')].map(el => ({tag: el.tagName, attrs: Object.fromEntries([...el.attributes].filter(a => a.name.startsWith('data-jh')).map(a => [a.name, a.value]))}))"

# raw HTML конкретного блока
npm run jh:cli -- -s=jh eval "() => document.querySelector('[data-jh-section=gantt-chart]')?.outerHTML?.slice(0, 800)"
```

### Логи Jira/extension

```bash
npm run jh:cli -- -s=jh console            # все info+
npm run jh:cli -- -s=jh console error      # только error
npm run jh:cli -- -s=jh console warning    # warning+

# фильтр по подстроке через grep
npm run jh:cli -- -s=jh console | grep -E "jira-helper|gantt|GanttChart"
```

`console.error('jira-helper: ...')` из `runModifications.ts` появятся именно здесь — это первый признак, что PageModification упал на `loadData`/`apply`.

### Скриншоты

```bash
npm run jh:cli -- -s=jh screenshot                                # вся страница, авто-имя
npm run jh:cli -- -s=jh screenshot --filename=gantt-empty.png
npm run jh:cli -- -s=jh screenshot e34                            # конкретный элемент по ref из snapshot
```

Скриншоты сохраняются в `.playwright/output/`.

### Snapshot для интерактивных команд

```bash
# получить refs (e1, e2, ...) и прочитать структуру
npm run jh:cli -- -s=jh snapshot --filename=before-click.yml

# затем взаимодействовать
npm run jh:cli -- -s=jh click e15
npm run jh:cli -- -s=jh fill e7 "value"
```

### Управление сессиями

```bash
npm run jh:cli -- list           # все сессии (есть ли наша jh)
npm run jh:cli -- -s=jh close    # корректно закрыть
npm run jh:cli -- kill-all       # если зависло
```

---

## Чек-лист перед тем как начать тестировать

1. `node --version` → ≥ 18
2. `playwright-cli --version` → ≥ 0.1.5  (если нет — `npm i -g @playwright/cli@latest`)
3. `npm run build` прошёл, в `dist/manifest.json` версия совпадает с `package.json`
4. `dist/assets/content.ts-*.js` свежее, чем код, который вы изменили
5. Browser MCP в Cursor отключены (в этом workspace должны быть отключены `playwright` / `chrome-devtools` через `.cursor/mcp.json`; `cursor-ide-browser` — руками через `Cmd+Shift+J`)
6. Если есть `tools/jh-chrome-runner.mjs` — это **легаси** до перехода на `playwright-cli`, использовать не нужно

---

## Типичные проблемы

### `data-jh-*` нет в DOM, хотя content script загрузился

Симптом: в `playwright-cli console` есть `script loads!!!` и `Cannot bind shortcut "p..."` (это значит, что bootstrap content script отработал), но `[data-jh-section]` не появляется.

**Чек 1**: extension физически содержит код фичи?

```bash
grep -l "GanttChartIssuePage\|gantt-chart-issue-page" dist/assets/*.js
```

Если 0 совпадений — `dist/` собран не с этой ветки. `npm run build` и `close`+`open`.

**Чек 2**: модуль зарегистрирован в `src/content.ts` для нужного `Routes.*`? PageModification зовёт `shouldApply()`, и если он возвращает false — `apply()` не выполнится.

**Чек 3**: в `console error` есть `jira-helper: Load Data Failed: ...`? Это значит `loadData()` упал — смотрите stack.

### Build падает с `Could not load src/shared/...`

Часть кода обращается к старой структуре проекта. Перенесённые модули:

| Старый путь | Новый путь |
|---|---|
| `src/shared/PageModification` | `src/infrastructure/page-modification/PageModification` |
| `src/shared/diContext` | `src/infrastructure/di/diContext` |
| `src/shared/Logger` | `src/infrastructure/logging/Logger` |
| `src/shared/di/Module` | `src/infrastructure/di/Module` |
| `src/shared/di/routingTokens` | `src/infrastructure/di/routingTokens` |
| `src/routing` | `src/infrastructure/routing` |
| `src/shared/jira/jiraService` | `src/infrastructure/jira/jiraService` |
| `src/shared/jira/types` | `src/infrastructure/jira/types` |
| `src/shared/jira/testData` | `src/infrastructure/jira/testData` |
| `src/shared/jira/fields/jiraFieldsStore` | `src/infrastructure/jira/fields/jiraFieldsStore` |
| `src/shared/jira/fields/useGetFields` | `src/infrastructure/jira/fields/useGetFields` |
| `src/shared/jira/stores/jiraIssueLinkTypesStore` | `src/infrastructure/jira/stores/jiraIssueLinkTypesStore` |
| `src/shared/jira/stores/useGetIssueLinkTypes` | `src/infrastructure/jira/stores/useGetIssueLinkTypes` |

`src/shared/jira/stores/{jiraStatusesStore,useGetStatuses}` — остались в `shared`, не трогать.

### Chrome ругается «Chrome не может проверить происхождение»

Это безобидное предупреждение для unpacked-расширений с `--enable-unsafe-extension-debugging`. Расширение работает.

### `playwright-cli list` показывает `(no browsers)` после `open`

Скорее всего Chrome аварийно закрылся (например, профиль занят другим Chrome). Проверьте:

```bash
pgrep -fla "jira-helper-chrome-profile"
playwright-cli kill-all
```

И стартуйте заново.

### Хочу видеть, что делает агент

```bash
playwright-cli show
```

Открывает дашборд со всеми сессиями и live-screencast — удобно, когда AI-агент гоняет команды в фоне.

---

## Что в репозитории относится к этому скиллу

- `.playwright/cli.config.json` — шаблон конфига (относительные пути)
- `tools/jh-playwright-cli.mjs` — обёртка, генерирует resolved-конфиг и вызывает playwright-cli
- `.playwright/cli.config.resolved.json` — generated, gitignored
- `.cursor/mcp.json` — отключение браузерных MCP в этом workspace
- `.agents/skills/playwright-cli/SKILL.md` — авто-сгенерированный референс по командам `playwright-cli` (создан `playwright-cli install --skills=agents`)
- `.cursor/skills/extension-testing/SKILL.md` — этот файл

Артефакты от запусков:
- `.playwright/output/` — screenshots, snapshots, console-dump'ы (в `.gitignore`)

---

## TL;DR для AI-агента

```bash
# первый запуск
npm run jh:cli -- -s=jh open https://jira.tcsbank.ru/browse/TTP-29174 --headed
# (один раз руками логинимся в Jira SSO)

# изменили код → проверяем
npm run build && npm run jh:cli -- -s=jh close && npm run jh:cli -- -s=jh open https://jira.tcsbank.ru/browse/TTP-29174 --headed

# смотрим что получилось
npm run jh:cli -- -s=jh eval "() => [...document.querySelectorAll('[data-jh-section]')].map(e => e.getAttribute('data-jh-section'))"
npm run jh:cli -- -s=jh screenshot --filename=after.png
npm run jh:cli -- -s=jh console error
```
