# TASK-19: Написать .feature файлы для wiplimit-on-cells

**Status**: DONE

**Parent**: [EPIC-3](./EPIC-3-wiplimit-on-cells-refactoring.md)

---

## Описание

Описать функциональность wiplimit-on-cells в формате Gherkin (.feature файлы). Два файла: Settings Page (настройка ranges, ячеек, лимитов) и Board Page (отображение лимитов на доске). Это документация + acceptance criteria для рефакторинга.

## Файлы

```
src/wiplimit-on-cells/
├── SettingsPage/
│   └── settings.feature    # новый — сценарии настроек
└── BoardPage/
    └── board.feature       # новый — сценарии на доске
```

## Что сделать

1. Создать `SettingsPage/settings.feature`:
   - Background: settings page, columns, swimlanes
   - ADD RANGE: создание нового range с именем
   - ADD CELL: добавление ячейки (swimlane/column) в существующий range
   - EDIT RANGE: изменение имени, WIP limit, disable
   - DELETE RANGE: удаление range
   - DELETE CELL: удаление ячейки из range
   - CLEAR ALL: очистка всех настроек
   - SAVE: сохранение в Jira board property
   - CANCEL: отмена изменений
   - VALIDATION: пустое имя, дублирование, не выбран swimlane/column

2. Создать `BoardPage/board.feature`:
   - Background: board loaded, ranges configured
   - DISPLAY: badge с count/limit
   - COLORS: зелёный (в пределах), жёлтый (на лимите), красный (превышен)
   - BORDERS: dashed border вокруг range ячеек
   - DISABLE: заблокированный range (diagonal stripe)
   - ISSUE TYPE FILTER: подсчёт только определённых типов
   - DYNAMIC UPDATE: обновление при изменении доски

## Критерии приёмки

- [ ] Все сценарии пронумерованы (@SC1, @SC2, ...)
- [ ] Сценарии сгруппированы по функциональности
- [ ] Background содержит общие предусловия
- [ ] Покрыты CRUD операции для ranges и cells
- [ ] Покрыта валидация
- [ ] Покрыты edge cases (пустое состояние, отмена)
- [ ] Board сценарии покрывают все визуальные индикаторы
- [ ] Язык согласован (Given/When/Then)
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Зависит от: нет (первая задача в EPIC)
- Референс: `src/person-limits/SettingsPage/SettingsPage.feature`, `src/person-limits/BoardPage/board-page.feature`

---

## Результаты

**Дата**: 2025-02-12

**Агент**: Coder

**Статус**: DONE

**Комментарии**:

```
Созданы два .feature файла:
- src/wiplimit-on-cells/SettingsPage/settings.feature — 25 сценариев (SC1-SC25):
  open/close popup, add range, add cell, validation, edit inline, delete, clear all,
  persistence, backward compatibility, show badge, empty state
- src/wiplimit-on-cells/BoardPage/board.feature — 20 сценариев (SC1-SC20):
  badge display, color indicators (green/yellow/red), cell background,
  dashed borders (single/adjacent/L-shape), disabled range, issue type filter,
  multiple ranges, dynamic update, cell not found, no settings
```
