# TASK-34: Верификация: тесты + линтер

**Status**: TODO

**Parent**: [EPIC-3](./EPIC-3-wiplimit-on-cells-refactoring.md)

---

## Описание

Финальная верификация всего рефакторинга: запуск тестов, линтера, сборки. Убедиться что фича работает корректно после миграции.

## Что сделать

1. Запустить unit-тесты:
   ```bash
   npm test
   ```

2. Запустить линтер:
   ```bash
   npm run lint:eslint -- --fix
   ```

3. Запустить сборку:
   ```bash
   npm run build
   ```

4. Запустить Storybook:
   ```bash
   npm run storybook
   ```

5. Проверить чек-лист архитектуры:
   - [ ] **Coupling**: Stores разделены по жизненному циклу (Property / UI / Runtime)?
   - [ ] **Model/View**: Вся логика вне React-компонентов?
   - [ ] **CQS**: Queries не имеют side effects?
   - [ ] **Testability**: Есть `getInitialState()`? Сервисы через DI?
   - [ ] **Observability**: Actions логируют?
   - [ ] **PageObject**: Вся работа с DOM через PageObject + DI?

## Критерии приёмки

- [ ] Все unit-тесты проходят
- [ ] Нет ошибок линтера
- [ ] Сборка проходит без ошибок
- [ ] Storybook рендерится корректно
- [ ] Архитектурный чек-лист выполнен

## Зависимости

- Зависит от: все предыдущие задачи (TASK-20 — TASK-33)
