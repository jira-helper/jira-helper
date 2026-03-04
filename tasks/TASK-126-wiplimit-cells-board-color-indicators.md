# TASK-126: color-indicators.feature для BoardPage

**Status**: DONE  
**Epic**: [EPIC-12](./EPIC-12-wiplimit-cells-bdd-refactoring.md)  
**Phase**: 2 - BoardPage Refactoring  
**Depends on**: TASK-124

---

## Цель

Создать `color-indicators.feature` для сценариев цветовых индикаторов.

## Создаваемые файлы

```
src/wiplimit-on-cells/BoardPage/features/
├── color-indicators.feature
└── color-indicators.feature.cy.tsx
```

## Сценарии (3)

### SC-COLOR-1: Green badge when within limit

```gherkin
@SC-COLOR-1
Scenario: Green badge when within limit
  Given there is a range "My Range" with:
    | wipLimit | disable |
    | 5        | false   |
  And the range "My Range" has cells:
    | swimlane | column      | showBadge |
    | Frontend | In Progress | true      |
  And there are 3 issues in cell "Frontend / In Progress"
  When the board is displayed
  Then the badge should have green background color "#1b855c"
```

### SC-COLOR-2: Yellow badge when at limit

```gherkin
@SC-COLOR-2
Scenario: Yellow badge when at limit
  Given there is a range "My Range" with:
    | wipLimit | disable |
    | 5        | false   |
  And the range "My Range" has cells:
    | swimlane | column      | showBadge |
    | Frontend | In Progress | true      |
  And there are 5 issues in cell "Frontend / In Progress"
  When the board is displayed
  Then the badge should have yellow background color "#ffd700"
```

### SC-COLOR-3: Red badge when exceeding limit

```gherkin
@SC-COLOR-3
Scenario: Red badge when exceeding limit
  Given there is a range "My Range" with:
    | wipLimit | disable |
    | 5        | false   |
  And the range "My Range" has cells:
    | swimlane | column      | showBadge |
    | Frontend | In Progress | true      |
  And there are 7 issues in cell "Frontend / In Progress"
  When the board is displayed
  Then the badge should have red background color "#ff5630"
```

## Acceptance Criteria

- [ ] Feature файл содержит 3 сценария
- [ ] cy.tsx файл использует `defineFeature` из bdd-runner
- [ ] Все сценарии проходят: `npx cypress run --component --spec "src/wiplimit-on-cells/BoardPage/features/color-indicators.feature.cy.tsx"`

---

## Результаты

**Дата**: 2026-03-04

**Агент**: Coder

**Статус**: DONE

**Что сделано**:

- Создан `color-indicators.feature` с 3 сценариями (SC-COLOR-1/2/3)
- Создан `color-indicators.feature.cy.tsx`
- Все тесты проходят (3 passing)

**Проблемы и решения**:

Проблем не возникло.
