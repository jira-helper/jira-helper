# TASK-57: Написать BDD store тесты для SettingsPage

**Status**: DONE

**Parent**: [EPIC-6](./EPIC-6-column-limits-modernization.md)

---

## Описание

Написать vitest-cucumber BDD тесты для store логики SettingsPage column-limits. Тесты покрывают бизнес-логику без UI.

## Файлы

```
src/column-limits/SettingsPage/stores/
├── settingsUIStore.bdd.test.ts   # изменение - расширить
```

## Что сделать

1. **Расширить BDD тесты** для покрытия store-логики сценариев:

| Scenario | Store Test |
|----------|------------|
| SC-MODAL-1 | Initial state |
| SC-MODAL-2 | setData with groups |
| SC-ADD-1 | moveColumn creates new group |
| SC-ADD-3 | setGroupLimit |
| SC-ADD-4 | setGroupColor |
| SC-ADD-5 | setIssueTypeState |
| SC-DND-1 | moveColumn to existing group |
| SC-DND-2 | moveColumn between groups |
| SC-DND-3 | moveColumn to WITHOUT_GROUP |
| SC-EDIT-1 | setGroupLimit |
| SC-DELETE-1 | moveColumn removes empty group |

2. **Структура теста**:

```typescript
Feature(({ Scenario, Background }) => {
  Background(({ Given }) => {
    Given('I am on the Column WIP Limits settings page', () => {
      useColumnLimitsSettingsUIStore.getState().actions.reset();
    });
  });

  Scenario('SC-ADD-1: Create new group by dragging column to dropzone', ({ Given, When, Then }) => {
    Given('there is a column "Review" in "Without Group"', () => {
      useColumnLimitsSettingsUIStore.getState().actions.setData({
        withoutGroupColumns: [{ id: 'review', name: 'Review' }],
        groups: [],
      });
    });

    When('I drag "Review" column to "Create new group" dropzone', () => {
      useColumnLimitsSettingsUIStore.getState().actions.moveColumn(
        { id: 'review', name: 'Review' },
        WITHOUT_GROUP_ID,
        'new-group-id'
      );
    });

    Then('a new group should be created', () => {
      const { groups } = useColumnLimitsSettingsUIStore.getState().data;
      expect(groups).toHaveLength(1);
    });
  });
}, featureFile);
```

3. **Покрыть actions**:
   - `setData`
   - `setWithoutGroupColumns`
   - `setGroups`
   - `setGroupLimit`
   - `setGroupColor`
   - `setIssueTypeState`
   - `moveColumn`
   - `reset`

## Критерии приёмки

- [x] Все store actions покрыты тестами
- [x] BDD сценарии маппятся на .feature файл
- [x] Store reset в Background
- [x] `npm test` проходит
- [x] Нет ошибок линтера

## Зависимости

- Референс: `src/person-limits/SettingsPage/stores/settingsUIStore.bdd.test.ts`
- Feature: `src/column-limits/SettingsPage/SettingsPage.feature`
- Skill: `/.cursor/skills/vitest-bdd-testing/SKILL.md`

---

## Результаты

**Дата**: 2026-02-16

**Агент**: Coder

**Статус**: DONE

**Комментарии**:

```
Переписан файл settingsUIStore.bdd.test.ts с использованием vitest-cucumber.
Добавлены все сценарии из SettingsPage.feature:
- SC-MODAL-1, SC-MODAL-2, SC-MODAL-3, SC-MODAL-4, SC-MODAL-5
- SC-ADD-1, SC-ADD-2, SC-ADD-3, SC-ADD-4, SC-ADD-5
- SC-DND-1, SC-DND-2, SC-DND-3, SC-DND-4, SC-DND-5
- SC-EDIT-1, SC-EDIT-3, SC-EDIT-4, SC-EDIT-5
- SC-DELETE-1, SC-DELETE-2
- SC-VALID-1, SC-VALID-2, SC-VALID-3
- SC-EDGE-1, SC-EDGE-2, SC-EDGE-3

Всего 218 тестов проходят успешно.
```

**Проблемы и решения**:

```
1. Проблема: vitest-cucumber не поддерживает шаг "Or"
   Решение: Убрал шаги "Or" из тестов, так как они описывают альтернативное поведение UI, не относящееся к store логике.

2. Проблема: Неиспользуемые переменные в деструктуризации Scenario
   Решение: Убрал неиспользуемые параметры (When, UIGroup) из деструктуризации.

3. Проблема: Отсутствовал сценарий SC-MODAL-4
   Решение: Добавлен сценарий SC-MODAL-4 для тестирования сохранения изменений.
```
