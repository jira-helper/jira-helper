# TASK-43: Исправить закрытие модала wiplimit-on-cells (Cancel, крестик)

## Описание

Кнопки Cancel и крестик в модале wiplimit-on-cells не закрывают модал. Исправить через обновление feature файла и Cypress тестов.

## Проблема

При нажатии:
- Кнопка "Cancel" — модал не закрывается
- Крестик (X) — модал не закрывается

## Feature файл

`src/wiplimit-on-cells/SettingsPage/SettingsPage.feature`

Соответствующие сценарии:
- SC2: Save and close popup
- SC3: Cancel closes popup without saving

## Шаги исправления

1. **Обновить feature файл** — добавить/уточнить сценарий для крестика:
   ```gherkin
   @SC26
   Scenario: SC26: Close button (X) closes popup without saving
     Given I have opened the "Edit WipLimit on cells" popup
     And I have made some changes
     When I click the close button (X)
     Then the popup should close
     And the changes should not be saved
   ```

2. **Написать/обновить Cypress тест** для SC3 и SC26

3. **Исправить компоненты**:
   - `SettingsButtonContainer.tsx` — проверить `handleClose`
   - `SettingsModal.tsx` — проверить `onCancel` prop
   - `SettingsModalContainer.tsx` — проверить передачу `onClose`

4. **Запустить тесты** — убедиться что SC3 и SC26 проходят

## Acceptance Criteria

- [ ] Feature файл обновлён (SC26 для крестика)
- [ ] Cypress тесты для SC3 и SC26 проходят
- [ ] Cancel закрывает модал
- [ ] Крестик закрывает модал
- [ ] Изменения отменяются при закрытии
- [ ] `node scripts/validate-feature-tests.mjs` проходит
