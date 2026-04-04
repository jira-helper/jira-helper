# TASK-38: Создать Cypress BDD тесты для person-limits BoardPage

## Описание

Создать отсутствующий файл Cypress тестов для `src/person-limits/BoardPage/board-page.feature`.

## Проблема

Валидация показала:
```
ERROR: Test file not found: src/person-limits/BoardPage/board-page.feature.cy.tsx
```

## Feature файл

`src/person-limits/BoardPage/board-page.feature` — содержит сценарии визуального отображения person limits на доске.

## Файл для создания

`src/person-limits/BoardPage/board-page.feature.cy.tsx`

## Референс

- `src/person-limits/SettingsPage/SettingsPage.feature.cy.tsx` — пример Cypress BDD тестов
- `src/wiplimit-on-cells/SettingsPage/SettingsPage.feature.cy.tsx` — ещё пример

## Требования

1. Прочитать `board-page.feature` и создать тесты для всех сценариев
2. Component mount для BoardPage компонентов
3. Проверки: CSS классы, badge отображение, hover эффекты

## Acceptance Criteria

- [ ] Файл `board-page.feature.cy.tsx` создан
- [ ] Все сценарии из feature файла покрыты
- [ ] `node scripts/validate-feature-tests.mjs` проходит для person-limits/BoardPage
- [ ] Тесты проходят
