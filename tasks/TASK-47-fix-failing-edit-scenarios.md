# TASK-47: Исправить падающие EDIT сценарии в Cypress тестах

**Status**: DONE

**Parent**: [EPIC-4](./EPIC-4-feature-tests-coverage.md)

---

## Описание

После рефакторинга сценариев (TASK-46) 5 Cypress тестов падают. Нужно исправить реализацию тестов или добавить недостающую функциональность в компоненты.

## Падающие тесты

| ID | Описание | Вероятная причина |
|----|----------|-------------------|
| SC-EDIT-3 | Change person name | Тест не находит способ изменить имя или ожидает неправильный результат |
| SC-EDIT-7 | Expand columns to all | Нет чекбокса "All columns" или тест неправильно его ищет |
| SC-EDIT-8 | Expand swimlanes to all | Нет чекбокса "All swimlanes" или тест неправильно его ищет |
| SC-EDIT-9 | Expand issue types to all | Нет чекбокса "Count all issue types" или тест неправильно его ищет |
| SC-EDIT-12 | Cannot save with zero value | Валидация не срабатывает или тест неправильно проверяет |

## Файлы

```
src/person-limits/SettingsPage/
├── SettingsPage.feature.cy.tsx              # тесты для исправления
└── components/
    └── PersonalWipLimitContainer.tsx        # возможно нужна доработка
```

## Что сделать

1. Запустить падающие тесты и изучить скриншоты/логи:
   ```bash
   npm run cy:run -- --spec "src/person-limits/SettingsPage/SettingsPage.feature.cy.tsx"
   ```

2. Для каждого падающего теста:
   - Понять причину падения (неправильный селектор, отсутствующий UI элемент, неправильная логика)
   - Исправить тест или добавить функциональность в компонент

3. Убедиться что все 26 тестов проходят

## Критерии приёмки

- [x] SC-EDIT-3 проходит
- [x] SC-EDIT-7 проходит
- [x] SC-EDIT-8 проходит
- [x] SC-EDIT-9 проходит
- [x] SC-EDIT-12 проходит
- [x] Все 26 Cypress тестов проходят
- [x] Vitest тесты проходят: `npm test -- --run src/person-limits`

---

## Результаты

**Дата**: 2026-02-15

**Агент**: Coder

**Статус**: DONE

**Комментарии**:

```
Исправлены все 5 падающих Cypress тестов:
- SC-EDIT-3: Исправлено обновление имени при редактировании - updatePersonLimit теперь обновляет person.name из formData.personName
- SC-EDIT-7: Добавлено действие для проверки чекбокса "All columns" в тесте, исправлена проверка результата (пустой массив означает "все")
- SC-EDIT-8: Добавлено действие для проверки чекбокса "All swimlanes" в тесте, исправлена проверка результата (пустой массив означает "все")
- SC-EDIT-9: Добавлено действие для проверки чекбокса "Count all issue types" в тесте
- SC-EDIT-12: Исправлена проблема с форматированием InputNumber (использован {selectall} вместо clear().type())

Все 26 Cypress тестов проходят успешно.
Все 380 Vitest тестов проходят успешно.
```

**Проблемы и решения**:

```
1. SC-EDIT-3: Проблема - updatePersonLimit не обновлял person.name при редактировании
   Решение: Обновлена функция updatePersonLimit для обновления person.name из formData.personName
   Также обновлен мок onAddLimit в тесте для правильной обработки редактирования через updatePersonLimit

2. SC-EDIT-7 и SC-EDIT-8: Проблема - тесты не делали действий для проверки чекбоксов "All columns" и "All swimlanes"
   Решение: Добавлены действия cy.contains('label', 'All columns').find('input[type="checkbox"]').check()
   Также исправлена проверка результата - пустой массив [] означает "все", а не массив с длиной равной количеству элементов

3. SC-EDIT-9: Проблема - тест не делал действия для проверки чекбокса "Count all issue types"
   Решение: Добавлено действие cy.contains('label', 'Count all issue types').find('input[type="checkbox"]').check()

4. SC-EDIT-12: Проблема - InputNumber показывал '00' вместо '0' при использовании clear().type('0')
   Решение: Заменено на .type('{selectall}0') для правильного форматирования

5. Общая проблема - мок onAddLimit не обновлял store при редактировании
   Решение: Обновлен mountComponent для использования реальной логики обновления через updatePersonLimit и store.actions.updateLimit
```
