# TASK-56: Написать Cypress тесты для SettingsPage

**Status**: DONE

**Parent**: [EPIC-6](./EPIC-6-column-limits-modernization.md)

---

## Описание

Написать Cypress component тесты для SettingsPage column-limits по расширенному feature файлу (30+ сценариев).

## Файлы

```
src/column-limits/SettingsPage/
├── SettingsPage.feature.cy.tsx   # изменение - расширить
```

## Что сделать

1. **Расширить существующие тесты** для покрытия всех сценариев:

| Группа | Сценарии | Кол-во |
|--------|----------|--------|
| MODAL LIFECYCLE | SC-MODAL-1..4 | 4 |
| ADD GROUP | SC-ADD-1..5 | 5 |
| DRAG AND DROP | SC-DND-1..5 | 5 |
| EDIT GROUP | SC-EDIT-1, SC-EDIT-3..5 | 4 |
| DELETE GROUP | SC-DELETE-1..2 | 2 |
| VALIDATION | SC-VALID-1..3 | 3 |
| EDGE CASES | SC-EDGE-1..3 | 3 |
| **Итого** | | **26** |

2. **Структура тестов**:

```typescript
describe('Column Limits Settings Page', () => {
  describe('MODAL LIFECYCLE', () => {
    it('SC-MODAL-1: Open modal with empty state', () => { ... });
    it('SC-MODAL-2: Open modal with pre-configured groups', () => { ... });
    // ...
  });

  describe('ADD GROUP', () => {
    it('SC-ADD-1: Create new group by dragging column to dropzone', () => { ... });
    // ...
  });

  describe('DRAG AND DROP', () => {
    // Тесты drag-n-drop операций
  });

  // ... остальные группы
});
```

3. **DI setup в beforeEach**:
   - Регистрация моков для jiraApiTokens
   - Reset stores

4. **Drag-n-drop тестирование**:
   - Использовать `cy.get().trigger('dragstart')` / `trigger('drop')`
   - Или react-dnd-test-utils если подключено

## Критерии приёмки

- [x] Все сценарии покрыты тестами
- [x] Тесты используют DI для моков (без cy.on('uncaught:exception'))
- [x] Drag-n-drop тесты работают стабильно
- [x] `npm run cy:run` проходит
- [x] Нет ошибок линтера

## Зависимости

- Референс: `src/person-limits/SettingsPage/SettingsPage.feature.cy.tsx`
- Feature: `src/column-limits/SettingsPage/SettingsPage.feature`
- Skill: `/.cursor/skills/cypress-bdd-testing/SKILL.md`

---

## Результаты

**Дата**: 2026-02-16

**Агент**: Coder

**Статус**: DONE

**Комментарии**:

```
Все 27 сценариев покрыты Cypress тестами:
- MODAL LIFECYCLE: 5 сценариев (SC-MODAL-1..5)
- ADD GROUP: 5 сценариев (SC-ADD-1..5)
- DRAG AND DROP: 5 сценариев (SC-DND-1..5)
- EDIT GROUP: 4 сценария (SC-EDIT-1, SC-EDIT-3..5)
- DELETE GROUP: 2 сценария (SC-DELETE-1..2)
- VALIDATION: 3 сценария (SC-VALID-1..3)
- EDGE CASES: 3 сценария (SC-EDGE-1..3)

Все тесты проходят успешно.
```

**Проблемы и решения**:

```
1. Проблема с моком getColumns - нужно было создавать реальные DOM элементы с dataset.columnId
   Решение: Использовал document.createElement и setAttribute для создания моков

2. Проблема с blur() - элемент не был сфокусирован перед вызовом blur()
   Решение: Использовал click() перед blur() или клик по body для blur

3. Проблема с вводом значений в InputNumber - значения добавлялись к существующим
   Решение: Использовал {selectall}{backspace} перед вводом нового значения

4. Проблема с поиском color picker кнопки - несколько элементов с data-group-id
   Решение: Использовал селектор button[data-group-id="group-1"] для точного поиска

5. Проблема с проверкой undefined - ESLint ошибка no-unused-expressions
   Решение: Заменил expect().to.equal(undefined) на expect().to.be.undefined
```
