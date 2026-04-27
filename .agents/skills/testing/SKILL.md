---
name: testing
description: Best practices тестирования в jira-helper. AAA-паттерн, изоляция тестов, тестовая стратегия (юниты функций, юниты stores, тесты компонентов, Storybook). Используй при написании тестов или ревью тестового кода.
---

# Тестирование в jira-helper

## Тестовая стратегия

1. **Pure functions** — Vitest unit tests (`*.test.ts`)
2. **Models** — Vitest unit tests (`*.test.ts`)
3. **Components** — Cypress component tests (`*.cy.tsx`)
4. **BDD scenarios** — Cypress BDD tests (`*.feature.cy.tsx`)
5. **Storybook states** — Visual documentation (`*.stories.tsx`)
6. **Visual regression** — Storybook + Playwright visual tests (`tags: ['visual']`)

## Обязательный контекст

**Прочитай перед началом работы**:
- `docs/TESTING.md` — тестовая пирамида, best practices, антипаттерны
- `docs/testing-unit.md` — Vitest unit tests (pure functions, models)
- `docs/testing-cypress-component.md` — Cypress component tests
- `docs/testing-cypress-bdd.md` — Cypress BDD tests из .feature файлов
- `docs/testing-storybook.md` — Storybook stories
- `docs/testing-visual.md` — Visual regression testing (Storybook + Playwright)

## Чек-лист

- [ ] AAA-структура (Arrange-Act-Assert)
- [ ] Изоляция (beforeEach reset)
- [ ] Один тест — одно поведение
- [ ] Описательные имена тестов
- [ ] Edge cases покрыты
- [ ] Cypress BDD для .feature сценариев (если есть)
- [ ] Cypress для drag-n-drop / visual (если есть)
- [ ] Visual regression для UI components (если есть)
- [ ] НЕ используем RTL — только Cypress для компонентных тестов
- [ ] Тесты проходят: `npm test` и `npx cypress run --component`
- [ ] Visual tests проходят: `npm run visual:test`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`
