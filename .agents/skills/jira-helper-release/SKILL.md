---
name: jira-helper-release
description: >-
  Релиз jira-helper: версия в манифесте, тег vM.m.p, публикация GitHub Release,
  что делает CI (сборка zip, заливка ассетов на релиз, Chrome Web Store),
  проверки и перезапуск. Используй при подготовке релиза, вопросах про теги
  и workflow, почему не стартовал job после пуша тега, пересоздании релиза.
---

# Релиз jira-helper

## Итоговый воркфлоу агента

Выполняй **по порядку**:

1. **Версия** — **одинаковая** в `package.json` и `manifest.json` (`"version": "M.m.p"`). Сборка падает, если не совпадают (`vite.config.ts` проверяет консистентность). Для магазинов важен манифест; `package.json` — часть релизного бампа. Обычно один коммит «chore: bump version to M.m.p» + пуш в `master`.
2. **Проверка кода** — `npm ci`, `npm run lint`, `npm test` (и при желании `npm run prod` + `npm run prod:firefox`, чтобы убедиться, что zip собираются локально).
3. **Тег** — аннотированный тег **`vM.m.p`** (с буквой `v`) на коммите, где `package.json` и `manifest.json` уже на **этой** версии:  
   `git tag -a vM.m.p -m "vM.m.p" && git push origin vM.m.p`
4. **GitHub Release** — **опубликовать** релиз на этот тег (UI или `gh release create vM.m.p --title "vM.m.p" --notes "..."`).  
   **Ассеты на релиз вручную не прикладывать** — workflow сам соберёт Chrome и Firefox, зальёт `jira-helper-<VER>-chrome.zip` и `jira-helper-<VER>-firefox.zip` (`VER` = без `v`), опубликует Chrome-zip в Chrome Web Store.
5. **Дождаться** успешного run **Publish to Chrome Web Store** в Actions.
6. **Проверить** — на странице релиза появились два zip; в консоли Chrome Web Store — новая версия (модерация может задержать). Firefox (AMO) в репозитории не публикуется — при необходимости взять `jira-helper-<VER>-firefox.zip` с релиза и залить вручную.

**Важно:** пуш **только тега** без шага 4 **не** запускает публикацию — нужно событие **published** у GitHub Release. Перепривязка тега к другому коммиту (`-f` + push) **без** новой публикации релиза workflow **не** перезапустит.

---

## Триггер CI

- Workflow: `.github/workflows/publish-chrome.yml` — только `release: types: [published]`.
- Раннер: **тот коммит, на который указывает тег** релиза; локальные zip на машине релизера не используются.

---

## Перезапуск публикации (тот же тег, тот же код)

- **Повторить без нового `published`:** в Actions — **Re-run** последнего run (для повторной попытки CWS, если сборка уже была ок).
- **Снова получить событие `published`:** `gh release delete vM.m.p -R <org>/<repo> --yes` (тег остаётся), затем `gh release create vM.m.p ...` — CI снова соберёт и зальёт ассеты.
- **Не полагаться** на перепуш тега с тем же именем.

---

## Цепочка шагов в `publish-chrome.yml` (справка)

1. `npm ci` → `npm run lint` → `npm test`  
2. `npm run prod` → проверка `jira-helper.zip`  
3. `npm run prod:firefox` → проверка `jira-helper-firefox.zip`  
4. `gh release upload` — `jira-helper-$VER-chrome.zip`, `jira-helper-$VER-firefox.zip` (`--clobber`)  
5. `node tools/publish-chrome-webstore.js` (`EXTENSION_ZIP_PATH=./jira-helper.zip`)  
6. `actions/upload-artifact` — оба неименованных zip (артефакты run)

**Секреты:** `CHROME_WEBSTORE_CREDENTIALS` обязателен для шага 5. Для `gh release` используется `GITHUB_TOKEN` (нужен `contents: write` в job).

