# TASK-135: Settings Modal Fixes

**Status**: DONE  
**Epic**: [EPIC-12](./EPIC-12-wiplimit-cells-bdd-refactoring.md)  
**Phase**: Post-refactoring improvements

---

## Цель

Три исправления для SettingsModal:
1. Удалить кнопку "Clear and save all data"
2. Исправить баг: данные не сохраняются при повторном открытии модалки
3. Добавить ограничения для длинных названий (ellipsis + tooltip + maxLength)

---

## Детали

### 1. Удаление кнопки "Clear and save all data"

**Файлы для изменения:**
- `src/wiplimit-on-cells/SettingsPage/components/SettingsModal/SettingsModal.tsx` — убрать кнопку и prop `onClear`
- `src/wiplimit-on-cells/SettingsPage/components/SettingsModal/SettingsModalContainer.tsx` — убрать `handleClear` и передачу `onClear`
- `src/wiplimit-on-cells/SettingsPage/components/SettingsModal/SettingsModal.cy.tsx` — убрать тесты для Clear button
- `src/wiplimit-on-cells/SettingsPage/components/SettingsModal/SettingsModal.stories.tsx` — убрать `onClear` из stories
- `src/wiplimit-on-cells/SettingsPage/features/delete.feature` — убрать сценарий `@SC-CLEAR-1`
- `src/wiplimit-on-cells/SettingsPage/features/delete.feature.cy.tsx` — обновить если нужно

### 2. Баг сохранения

**Проблема:** 
`SettingsButtonContainer` получает `initialRanges` как prop. При `handleOpen` загружает их в store. После `handleSave` данные сохраняются в Jira property, но `initialRanges` prop остаётся старым. При следующем открытии — старые данные.

**Решение:**
В `SettingsButtonContainer` хранить актуальные ranges в `useState` и обновлять после успешного `onSaveToProperty`.

**Файлы:**
- `src/wiplimit-on-cells/SettingsPage/components/SettingsButton/SettingsButtonContainer.tsx`

**Добавить тест:**
- `src/wiplimit-on-cells/SettingsPage/features/persistence.feature` — добавить сценарий `@SC-PERSIST-3`

```gherkin
@SC-PERSIST-3
Scenario: Changes persist after reopening modal
  Given I add a range "Test Range"
  When I click "Save" button
  And I reopen the modal
  Then I should see range "Test Range" in the table
```

### 3. Ограничения для длинных названий

**A. Range name Input — maxLength:**
- `src/wiplimit-on-cells/SettingsPage/components/RangeTable/RangeRow.tsx` — добавить `maxLength={30}` к Input
- `src/wiplimit-on-cells/SettingsPage/components/RangeForm/RangeForm.tsx` — добавить `maxLength={30}` к Input для нового range name

**B. Ellipsis + Tooltip для CellBadge:**
- `src/wiplimit-on-cells/SettingsPage/components/RangeTable/CellBadge.tsx` — добавить `text-overflow: ellipsis`, `overflow: hidden`, `max-width` и Tooltip при hover

**C. Ellipsis для колонок таблицы:**
- `src/wiplimit-on-cells/SettingsPage/components/RangeTable/RangeRow.tsx` — добавить стили для overflow в ячейках

---

## Acceptance Criteria

- [ ] Кнопка "Clear and save all data" удалена
- [ ] Тесты для Clear button удалены
- [ ] Сценарий `@SC-CLEAR-1` удален из feature файла
- [ ] После сохранения и повторного открытия модалки данные отображаются корректно
- [ ] Тест `@SC-PERSIST-3` добавлен и проходит
- [ ] Range name Input имеет maxLength=30
- [ ] Длинные названия ячеек показываются с ellipsis и tooltip
- [ ] Все существующие тесты проходят
- [ ] ESLint без ошибок

---

## Результаты

**Дата**: 2025-03-04

**Агент**: Coder

**Статус**: DONE

**Что сделано**:
1. Удалена кнопка "Clear and save all data" и prop `onClear` из SettingsModal, SettingsModalContainer, stories и тестов. Удалён сценарий @SC-CLEAR-1 из delete.feature.
2. Исправлен баг сохранения в SettingsButtonContainer: добавлен `currentRanges` state, обновляемый после успешного save; при reopen модалки используются актуальные данные.
3. Добавлен maxLength=30 для Range name в RangeRow и RangeForm.
4. Добавлены ellipsis + Tooltip для CellBadge (max-width: 200px, overflow: hidden, text-overflow: ellipsis).
5. Добавлен сценарий @SC-PERSIST-3 "Changes persist after reopening modal" и step definitions: "I add a range", "I reopen the modal", "I should see range X in the table".
6. Обновлены тесты RangeForm.cy.tsx: validation тесты переведены с alert() на проверку inline-сообщений ("Select swimlane", "Select Column").

**Файлы изменены**:
- SettingsModal.tsx, SettingsModalContainer.tsx, SettingsModal.cy.tsx, SettingsModal.stories.tsx
- SettingsButtonContainer.tsx
- RangeRow.tsx, RangeForm.tsx, CellBadge.tsx
- delete.feature, persistence.feature, common.steps.ts
- RangeForm.cy.tsx

**Тесты**: 52 passing (Cypress component tests)
