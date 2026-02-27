# TASK-59: Исправить пропущенный тест SC-DISPLAY-2

**Status**: DONE

**Parent**: [EPIC-6](./EPIC-6-column-limits-modernization.md)

---

## Описание

Тест SC-DISPLAY-2 в `board-page.feature.cy.tsx` пропущен с `it.skip`. Нужно разобраться в причине падения и исправить.

## Симптомы

Тест проверяет обновление бейджа при добавлении новой задачи:
1. Создаётся группа с лимитом 3
2. Добавляются 2 задачи, вызывается `applyLimits()` — ожидается бейдж "2/3"
3. Добавляется ещё 1 задача, вызывается `applyLimits()` — ожидается бейдж "3/3"

**Проблема**: Бейдж показывает неправильное значение после первого `applyLimits()`.

## Файлы

```
src/column-limits/BoardPage/
├── board-page.feature.cy.tsx        # тест SC-DISPLAY-2 (строка 178)
├── pageObject/
│   └── ColumnLimitsBoardPageObject.ts  # метод getIssuesInColumn
└── actions/
    └── calculateGroupStats.ts       # подсчёт задач
```

## Возможные причины

1. **Селектор `getIssuesInColumn`** не находит задачи созданные через `createMockIssue`
2. **Бейдж не пересчитывается** корректно при повторном вызове `applyLimits`
3. **Старый бейдж не удаляется** перед вставкой нового (хотя `removeBadges` был добавлен)
4. **Проблема с порядком вызовов** — assertions Cypress могут выполняться до завершения DOM операций

## Что сделать

1. Запустить тест в интерактивном режиме Cypress:
   ```bash
   npx cypress open --component
   ```

2. Отладить пошагово:
   - Проверить что задачи добавляются в DOM (inspect элементы)
   - Проверить что `getIssuesInColumn` находит их (console.log)
   - Проверить какое значение показывает бейдж

3. Исправить root cause

4. Убрать `it.skip` и убедиться что тест проходит

## Критерии приёмки

- [ ] Тест SC-DISPLAY-2 проходит
- [ ] `it.skip` убран
- [ ] Все 13 BoardPage тестов проходят
- [ ] `npm run cy:run -- --spec "src/column-limits/BoardPage/*.cy.tsx"` без ошибок

## Зависимости

- Контекст: задача создана после TASK-58 верификации
- Файл: `src/column-limits/BoardPage/board-page.feature.cy.tsx:178`

---

## Результаты

**Дата**: 2026-02-15

**Агент**: Manual

**Статус**: DONE

**Комментарии**:

```
Тест проходил, но агент оставил debug throw new Error(...) в коде.
Убран debug код, исправлен порядок вызовов (addIssueToDOM внутри cy.then()).
Все 13 тестов проходят.
```

**Проблемы и решения**:

```
Проблема: Агент добавил throw new Error(...) для дебага и забыл убрать
Решение: Убран debug код, упрощён тест
```
