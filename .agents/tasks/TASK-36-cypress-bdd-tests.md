# TASK-36: Cypress BDD тесты для компонентов на основе .feature файлов

## Описание

Написать Cypress component BDD тесты для React-компонентов `wiplimit-on-cells` на основе .feature файлов.

## Контекст

Есть 2 feature файла:
- `src/wiplimit-on-cells/SettingsPage/settings.feature` — 25 сценариев (UI взаимодействия)
- `src/wiplimit-on-cells/BoardPage/board.feature` — 20 сценариев (визуальное отображение)

Нужно покрыть UI-поведение компонентов Cypress BDD тестами.

## Референсы

- `src/person-limits/SettingsPage/SettingsPage.feature.cy.tsx` — пример Cypress BDD тестов
- `src/person-limits/SettingsPage/components/PersonalWipLimitContainer.cy.tsx` — пример component tests
- `.cursor/skills/cypress-bdd-testing/SKILL.md` — инструкция по Cypress BDD

## Файлы для создания

```
src/wiplimit-on-cells/SettingsPage/
├── SettingsPage.feature.cy.tsx              # BDD тесты Settings Page
└── components/
    ├── RangeTable/RangeTable.cy.tsx         # Component tests
    ├── RangeForm/RangeForm.cy.tsx           # Component tests
    └── SettingsModal/SettingsModal.cy.tsx   # Component tests

src/wiplimit-on-cells/BoardPage/
└── BoardPage.feature.cy.tsx                 # BDD тесты Board Page визуалов
```

## Scope SettingsPage.feature.cy.tsx

Из `settings.feature` покрыть UI-сценарии:
- SC1: Open settings popup
- SC2: Save and close popup
- SC3: Cancel closes popup without saving
- SC4: Add a new range with a cell (UI flow)
- SC5: Cannot add range without name (alert)
- SC11-12: Validation alerts
- SC16: Select range for editing via edit icon
- SC23-24: Show badge indicator toggle

## Scope BoardPage.feature.cy.tsx

Из `board.feature` покрыть визуальные сценарии:
- SC1: Show badge with issue count
- SC3-5: Badge colors (green/yellow/red)
- SC6-7: Cell background classes
- SC8-11: Dashed borders (через CSS classes)
- SC12-13: Disabled range styling

## Требования

1. Cypress component testing (`cy.mount()`)
2. Использовать `data-testid` для селекторов
3. Моки для stores где нужно
4. Visual assertions для цветов и классов

## Acceptance Criteria

- [ ] `SettingsPage.feature.cy.tsx` покрывает UI сценарии
- [ ] `BoardPage.feature.cy.tsx` покрывает визуальные сценарии  
- [ ] Component tests для RangeTable, RangeForm, SettingsModal
- [ ] Все тесты проходят: `npm run test:cypress:component`
- [ ] ESLint без ошибок

## Зависимости

- TASK-27 (RangeTable) — DONE
- TASK-28 (RangeForm) — DONE
- TASK-29 (SettingsModal) — DONE
- TASK-30 (SettingsButton) — DONE
- TASK-25 (BoardPage index) — DONE
