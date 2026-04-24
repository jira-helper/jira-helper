---
name: jira-helper-release
description: >-
  Пошаговый релиз jira-helper: версия в манифесте, тег, GitHub Release, что делает
  CI, проверка артефактов и перезапуск публикации в Chrome Web Store. Используй
  при подготовке релиза, публикации тега, вопросах про Chrome store workflow,
  пересоздании релиза и загрузке zip.
---

# Релиз jira-helper

## Ключевое

- **Публикация в Chrome Web Store** в CI запускается **только** событием `release: types: [published]` (см. `.github/workflows/publish-chrome.yml`), **не** с пушем тега.
- **Перезаписать ref тега** (`git tag -f` + push) **без** новой публикации релиза — workflow **не** перезапустит.
- В воркфлоу: сборка `jira-helper.zip` и `jira-helper-firefox.zip` на **том коммите, на который указывает тег** релиза; затем заливка в GitHub Release и публикация в CWS. Ручной zip в релизе **не** обязателен: job сам заливает/перезаписывает ассеты (`--clobber`).

---

## 1. Подготовка версии

1. **Версия в `manifest.json`** (`version`) должна совпадать с планируемым релизом (см. поле `"version"`). Chrome Web Store ожидает новую версию относительно прошлой публикации.
2. **Коммит** с актуальным `manifest.json` (и сопутствующие изменения) — в `master` (или ветка релиза, затем merge), как принято в команде.
3. Опция: обновить `release-notes.md` / описание релиза на GitHub.

---

## 2. Локальная проверка (до тега)

Выполни в корне репозитория (как и CI перед сборкой):

```bash
npm ci
npm run lint
npm test
```

Сборка артефактов (то же, что в CI — см. `package.json`):

```bash
npm run prod
npm run prod:firefox
```

**Ожидаемые файлы** в корне:

| Файл | Назначение |
|------|------------|
| `jira-helper.zip` | Chrome (прод) |
| `jira-helper-firefox.zip` | Firefox (прод) |

**Проверь:** оба zip существуют, размер разумный, при необходимости установи пакет вручную в Chrome/Firefox.

**Быстрый барьер:** `npm run precommit` (если используется в проекте) — полный набор крючков линт+тест.

---

## 3. Тег

Формат тега: **`vM.m.p`** (пример: `v2.30.3`) — **с префиксом `v`**, тогда `VER` в воркфлоу = `2.30.3` (отрезается `v`).

```bash
git tag -a vM.m.p -m "vM.m.p"
git push origin vM.m.p
```

Убедись, что тег на **нужном коммите** (с актуальным `manifest.json`).

---

## 4. GitHub Release и триггер CI

1. **Создай** релиз на GitHub, привязанный к тегу `vM.m.p`, **опубликуй** (не оставляй вечным драфтом), заполни notes.

   Через CLI (при наличии `gh` и прав):

   ```bash
   gh release create vM.m.p --title "vM.m.p" --notes "..." -R <org>/jira-helper
   ```

   Можно приложить **любой** набор ассетов или не приложить: после старта релизный job **перезальёт** `jira-helper-${VER}-chrome.zip` и `jira-helper-${VER}-firefox.zip` с тем, что **собрал** раннер.

2. В Actions появится **«Publish to Chrome Web Store»**; дождись **success** по job **Publish to Chrome Web Store** (и шаги lint/test/build/publish).

3. **Секреты** в репозитории: `CHROME_WEBSTORE_CREDENTIALS` (для `node tools/publish-chrome-webstore.js`). Без валидных учётных данных публикация в store упадёт (сборка и артефакты — могут пройти).

---

## 5. Что проверить после зелёного CI

| Проверка | Как |
|----------|-----|
| GitHub Release | На странице релиза есть `jira-helper-<VER>-chrome.zip` и `jira-helper-<VER>-firefox.zip` |
| Chrome Web Store | В консоли разработчика — новая версия расширения (модерация Google может задерживать) |
| Артефакты workflow | В summary run — **Upload build artifacts** (копия zip на 30 дней) |
| Провал публикации | Логи шага **Publish to Chrome Web Store** |

**Firefox (AMO):** отдельного job публикации в репо нет; готовый пакет — `jira-helper-${VER}-firefox.zip` в релизе (и артефакт), загрузка в Mozilla Add-ons — по процессу команды, вручную.

---

## 6. Перезапустить публикацию без нового кода

Если нужен **тот же** тег, но **повтор** события `published` (после фикса секретов, сбоя store и т.д.):

- **Не** надеясь на перепуш тега:  
  `gh release delete vM.m.p -R <org>/jira-helper --yes` (тег **не** удаляет),  
  затем `gh release create vM.m.p` с notes/title, снова вложи при необходимости свои zips *или* дай CI залить — как в шаге 4.

- Либо **Re-run** последнего успешного/неуспешного run в UI Actions (если достаточно повторной попытки с тем же коммитом, без нового `published` — только re-run, без новой публикации релиза).

---

## 7. Справка: цепочка в `publish-chrome.yml`

1. `npm ci` → `npm run lint` → `npm test`  
2. `npm run prod` → проверка `jira-helper.zip`  
3. `npm run prod:firefox` → проверка `jira-helper-firefox.zip`  
4. `gh release upload` с именами `jira-helper-$VER-*.zip`  
5. `node tools/publish-chrome-webstore.js` (zip: `./jira-helper.zip`)  
6. `actions/upload-artifact` — оба zip

---

## Когда читать агенту этот skill

- «Делаю релиз / выкат / тег / Chrome store»
- «Почему не запустился воркфлоу после пуша тега»
- «Как залить zip / пересобрать ассеты релиза»
- «Какие команды прогнать перед релизом»
