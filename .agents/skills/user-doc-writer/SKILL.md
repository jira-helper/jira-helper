---
name: user-doc-writer
description: Написание user-guide.md для фичи jira-helper. Используй когда нужно создать или обновить пользовательскую документацию фичи в формате единого шаблона.
---

# User Doc Writer

## Назначение

Создать файлы `user-guide.md` (EN) и `user-guide.ru.md` (RU) в директории `docs/` внутри модуля фичи (`src/features/<module>/docs/`). Документация следует фиксированному формату.

## Где создавать

```
src/features/<module>/
├── docs/
│   ├── user-guide.md      # EN
│   └── user-guide.ru.md   # RU
```

## Формат

Каждый файл начинается с таблицы характеристик, затем идут фиксированные секции в строгом порядке:

**`user-guide.md` (EN)** — заголовки и таблица на английском:

```md
# Feature name

| | |
|---|---|
| Where configured | Board Settings → tab → exact path |
| Where visible | Board (detail view) / Issue Page / Reports |
| Settings apply to | For the whole team / Only for you |

## Purpose

One or two sentences: what the feature does and why it matters.

## How to configure

### Where to find settings

Numbered steps to open the settings UI.

### How to configure

Bullets for each option, save/cancel behaviour.

## How to use

What appears on the board or issue page; how to read badges, colours, bars.

## Usage scenarios

Concrete examples (e.g. «I want to…»).

## Troubleshooting

Optional if the feature has common failure modes; otherwise omit or keep very short.
```

**`user-guide.ru.md` (RU)** — полный перевод EN-версии; те же секции, но строки таблицы: **Где настраивается**, **Где видно**, **Настройки действуют**; заголовки **Цель**, **Как настроить**, **Как использовать**, **Сценарии использования**, **Устранение неполадок** (если есть в EN).

## Правила

### Таблица характеристик

- 3 строки, всегда в начале
- В **EN** (`user-guide.md`): первая колонка — **Where configured**, **Where visible**, **Settings apply to**
- В **RU** (`user-guide.ru.md`): **Где настраивается**, **Где видно**, **Настройки действуют**
- **Хранилище**: Для всей команды (Jira Board Property) ИЛИ Только для вас (localStorage)

### Язык

- EN: простой технический английский; **без русских заголовков и русского текста в теле**
- RU: полный перевод EN. Не сокращать. Профессиональный технический русский.
- Названия пунктов UI как в Jira (Board Settings, Columns, Save)

### Секции

- Порядок фиксированный; не добавлять произвольные секции
- Если фича zero-config — в «How to configure» указать, что настройки не требуются

### Сценарии

- Минимум 1, максимум 3 сценария
- Каждый начинается с «Я хочу...» (в RU: «Я хочу...», в EN: «I want to...»)
- Описывать конкретную ситуацию и ожидаемый результат

## Процесс

1. Прочитай код фичи: `module.ts`, `types.ts`, `tokens.ts`, settings components — чтобы понять точные UI-пути и ключи хранилища
2. Если в модуле есть `feature.md` / `feature.ru.md` — используй их как источник
3. Напиши `docs/user-guide.md` (EN)
4. Напиши `docs/user-guide.ru.md` (RU) — полный перевод
