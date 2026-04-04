# TASK-165: Feature Files (Gherkin) для SettingsPage

**Status**: DONE

**Parent**: [EPIC-16](./EPIC-16-field-limits-modernization.md)

---

## Описание

Написать .feature файлы (Gherkin сценарии) для acceptance tests модалки настроек Field WIP Limits. Файлы разбиваются по функциональным областям (user jobs). Это чисто текстовые файлы с описанием поведения — без кода.

## Файлы

```
src/features/field-limits/SettingsPage/features/
├── add-limit.feature           # новый
├── edit-limit.feature          # новый
├── delete-limit.feature        # новый
├── modal-lifecycle.feature     # новый
└── mass-operations.feature     # новый
```

## Что сделать

### 1. `add-limit.feature` — Добавление лимитов

Сценарии:
- @SC-ADD-1: Добавить лимит с базовыми параметрами (field, value, limit)
- @SC-ADD-2: Добавить лимит с фильтром по колонкам
- @SC-ADD-3: Добавить лимит с фильтром по swimlanes
- @SC-ADD-4: Добавить лимит с колонками И swimlanes
- @SC-ADD-5: Добавить лимит с visual name отличным от field value
- @SC-ADD-6: Добавить лимит с ∑ префиксом (SUM_VALUE)
- @SC-ADD-7: Добавить лимит с || разделителем (MULTIPLE_VALUES)
- @SC-ADD-8: Форма сбрасывается после добавления
- @SC-ADD-9: Нельзя добавить без выбора поля (кнопка disabled)
- @SC-ADD-10: Нельзя добавить без field value (кнопка disabled)
- @SC-ADD-11: Нельзя добавить с limit = 0 (кнопка disabled)

Формат степов:
```gherkin
# Given: настройка начального состояния
Given there are fields "Priority, Team, Component" on the board
Given there are columns "To Do, In Progress, Done" on the board
Given there are swimlanes "Frontend, Backend" on the board
Given a field limit: field "Priority" value "Pro" visualName "Pro" limit 5 columns "all" swimlanes "all"

# When: действия пользователя
When I open the settings modal
When I select field "Priority"
When I type "Pro" in field value input
When I type "Professional" in visual name input
When I set the limit to 5
When I select columns "To Do, In Progress"
When I select swimlanes "Frontend"
When I click "Add limit"

# Then: проверки через UI
Then I should see limit: field "Priority" value "Pro" limit 5 columns "all" swimlanes "all"
Then I should see 1 limit in the table
Then the form should be reset
Then the "Add limit" button should be disabled
```

### 2. `edit-limit.feature` — Редактирование лимитов

Сценарии:
- @SC-EDIT-1: Клик Edit заполняет форму значениями лимита
- @SC-EDIT-2: Обновить значение лимита
- @SC-EDIT-3: Изменить field value
- @SC-EDIT-4: Добавить фильтр по колонкам
- @SC-EDIT-5: Убрать фильтр по swimlanes (сделать "все")
- @SC-EDIT-6: Изменить visual name
- @SC-EDIT-7: Кнопка "Edit limit" активна только в режиме редактирования

### 3. `delete-limit.feature` — Удаление лимитов

Сценарии:
- @SC-DEL-1: Удалить лимит
- @SC-DEL-2: Удалить единственный лимит → пустая таблица
- @SC-DEL-3: Удалить один из нескольких лимитов
- @SC-DEL-4: Удалённый лимит возвращается после Cancel и повторного открытия

### 4. `modal-lifecycle.feature` — Жизненный цикл модалки

Сценарии:
- @SC-MODAL-1: Открыть модалку — пустое состояние, форма по умолчанию
- @SC-MODAL-2: Открыть модалку с предварительно настроенными лимитами
- @SC-MODAL-3: Save сохраняет изменения и закрывает модалку
- @SC-MODAL-4: Cancel отменяет изменения и закрывает модалку
- @SC-MODAL-5: Повторное открытие после Cancel — данные не изменились

### 5. `mass-operations.feature` — Массовые операции

Сценарии:
- @SC-MASS-1: Применить колонки к выбранным лимитам
- @SC-MASS-2: Применить swimlanes к выбранным лимитам
- @SC-MASS-3: Операция не затрагивает невыбранные лимиты
- @SC-MASS-4: Применить к одному из трёх

## Критерии приёмки

- [ ] 5 файлов .feature по функциональным областям
- [ ] Семантические теги (@SC-ADD-1, @SC-EDIT-1, etc.)
- [ ] Степы атомарные и переиспользуемые
- [ ] Then-степы проверяют через UI
- [ ] Нет дублирования бизнес-логики в степах
- [ ] Покрыты CRUD, валидация, edge cases, массовые операции

## Зависимости

- Зависит от: Phase 1-5 (компоненты уже созданы)
- Референс: `src/person-limits/SettingsPage/features/*.feature`
- Скиллы: `.cursor/skills/bdd-feature-files-writer/SKILL.md`

---

## Результаты

**Дата**: 2026-03-13

**Агент**: Coder

**Статус**: DONE

**Что сделано**:

{Заполняется после выполнения задачи}

**Проблемы и решения**:

{Документируй ВСЕ проблемы, с которыми столкнулся, и как их решил}
