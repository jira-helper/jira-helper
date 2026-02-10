# TASK-1: Создать BDD сценарий

**Status**: DONE

**Parent**: [EPIC-1](./EPIC-1-fix-closing-group-limits.md)

**Target Design**: [target-design.md](./target-design.md)

---

## Описание

Создать BDD сценарий, описывающий требование: кнопка Cancel должна закрывать модалку без сохранения изменений.

## Файл

`src/column-limits/SettingsPage/settings-page.feature`

## Что сделать

1. Создать файл `settings-page.feature`
2. Добавить Feature с описанием
3. Добавить Background
4. Добавить Scenario @SC1 для Cancel button

## Содержимое

```gherkin
Feature: Group Column WIP Limits Settings
  As a board administrator
  I want to manage group WIP limits for columns
  So that I can control workload distribution across column groups

  Background:
    Given I am on the Column WIP Limits settings page
    And there are columns "To Do, In Progress, Review, Done" on the board

  # === MODAL CANCEL ===

  @SC1
  Scenario: SC1: Cancel button closes the modal without saving
    Given I have opened the "Limits for groups" modal
    And I have made some changes to the group limits
    When I click "Cancel"
    Then the modal should close
    And the changes should not be saved
```

## Критерии приёмки

- [x] Файл `settings-page.feature` создан
- [x] Формат Gherkin корректный
- [x] Сценарий описывает поведение Cancel кнопки
- [x] Тесты проходят: `npm test`
- [x] Нет ошибок линтера: `npm run lint:eslint`

---

## Результаты

**Дата**: 2026-02-10

**Агент**: Coder subagent

**Статус**: Выполнено успешно

**Комментарии**:
- Файл создан по образцу `src/person-limits/SettingsPage/settings-page.feature`
- Формат Gherkin валидный
