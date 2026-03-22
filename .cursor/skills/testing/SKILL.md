---
name: testing
description: Best practices тестирования в jira-helper. AAA-паттерн, изоляция тестов, тестовая стратегия (юниты функций, юниты stores, тесты компонентов, Storybook). Используй при написании тестов или ревью тестового кода.
---

# Тестирование в jira-helper

## Обязательный контекст

**Прочитай перед началом работы**:
- `docs/TESTING.md` — тестовая пирамида, best practices, антипаттерны
- `docs/testing-unit.md` — Vitest unit tests (pure functions, models)
- `docs/testing-cypress-component.md` — Cypress component tests
- `docs/testing-cypress-bdd.md` — Cypress BDD tests из .feature файлов
- `docs/testing-storybook.md` — Storybook stories

## Чек-лист

- [ ] AAA-структура (Arrange-Act-Assert)
- [ ] Изоляция (beforeEach reset)
- [ ] Один тест — одно поведение
- [ ] Описательные имена тестов
- [ ] Edge cases покрыты
- [ ] Cypress BDD для .feature сценариев (если есть)
- [ ] Cypress для drag-n-drop / visual (если есть)
- [ ] НЕ используем RTL — только Cypress для компонентных тестов
- [ ] Тесты проходят: `npm test` и `npx cypress run --component`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`
