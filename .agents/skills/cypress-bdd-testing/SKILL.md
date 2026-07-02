---
name: cypress-bdd-testing
description: BDD component тесты с Cypress в jira-helper. Используй при написании .cy.tsx тестов на основе .feature сценариев, тестировании drag-n-drop, visual feedback, или когда нужно проверить UI поведение в реальном браузере.
---

# Cypress BDD Testing

## Обязательный контекст

**Прочитай перед началом работы**:
- `docs/testing-cypress-bdd.md` — полное руководство: BDD runner, step definitions, helpers, configurable mocks

## Чек-лист

- [ ] Первая строка: `/// <reference types="cypress" />`
- [ ] Импорт feature через `?raw`: `import featureText from './x.feature?raw'`
- [ ] Импорт глобальных степов: `import 'cypress/support/gherkin-steps/common'` (ESLint добавит автоматически)
- [ ] Импорт общих степов: `import './steps/common.steps'`
- [ ] `defineFeature` с `Background(() => setupBackground())`
- [ ] Step definitions в отдельном файле `steps/common.steps.ts`
- [ ] Степы универсальные (с параметрами, не hardcoded)
- [ ] Then-степы проверяют через UI
- [ ] Given степы настраивают store до открытия UI
- [ ] Моки API через DI, не через cy.intercept
- [ ] setupBackground сбрасывает stores и моки
- [ ] Тесты проходят: `npx cypress run --component`
