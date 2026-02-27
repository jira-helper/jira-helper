# TASK-39: Создать Cypress BDD тесты для wiplimit-on-cells BoardPage

## Описание

Создать отсутствующий файл Cypress тестов для `src/wiplimit-on-cells/BoardPage/board.feature`.

## Проблема

Валидация показала:
```
ERROR: Test file not found: src/wiplimit-on-cells/BoardPage/board.feature.cy.tsx
```

## Feature файл

`src/wiplimit-on-cells/BoardPage/board.feature` — 20 сценариев визуального отображения WIP limits на ячейках доски.

## Файл для создания

`src/wiplimit-on-cells/BoardPage/board.feature.cy.tsx`

## Сценарии для покрытия

- SC1-SC2: Badge display
- SC3-SC5: Badge colors (green/yellow/red)
- SC6-SC7: Cell background classes
- SC8-SC11: Dashed borders
- SC12-SC13: Disabled range styling
- SC14-SC15: Issue type filter
- SC16: Multiple ranges
- SC17-SC18: Dynamic updates
- SC19: Cell not found handling
- SC20: No settings state

## Требования

1. Cypress component tests для BoardPage
2. Mock PageObject для DOM
3. Проверки CSS классов и стилей

## Acceptance Criteria

- [ ] Файл `board.feature.cy.tsx` создан
- [ ] Все 20 сценариев покрыты
- [ ] `node scripts/validate-feature-tests.mjs` проходит для wiplimit-on-cells/BoardPage
- [ ] Тесты проходят
