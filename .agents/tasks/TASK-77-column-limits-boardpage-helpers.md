# TASK-77: Создать helpers.tsx для Column Limits BoardPage

**Status**: DONE

**Parent**: [EPIC-10](./EPIC-10-column-limits-bdd-refactoring.md)

---

## Описание

Создать файл helpers.tsx с fixtures, mock pageObject и setup функциями для BoardPage BDD тестов.

## Файлы

```
src/column-limits/BoardPage/features/
├── helpers.tsx                  # новый
└── steps/
    └── common.steps.ts          # новый (пустой, будет заполняться в след. задачах)
```

## Что сделать

### 1. Создать `helpers.tsx`

Содержимое:
- Fixtures для columns, swimlanes, issueTypes
- `createMockIssue()` — создание mock issue DOM элемента
- `setupBoardDOM()` — создание DOM структуры доски
- `addIssueToDOM()` — добавление issue в DOM
- `mockPageObjectRef` — ссылка на mock pageObject
- `setupBackground()` — сброс DI, stores, DOM
- `mountComponent()` — не нужен для BoardPage (работаем с DOM напрямую)

### 2. Создать пустой `common.steps.ts`

```typescript
/**
 * Common step definitions for Column Limits BoardPage tests.
 */
import { Given, When, Then } from '../../../../../cypress/support/bdd-runner';

// Steps will be added in subsequent tasks
```

## Референс

Взять за основу существующий `board-page.feature.cy.tsx`:
- `createMockIssue()` — строки 24-46
- `setupBoardDOM()` — строки 51-92
- `addIssueToDOM()` — строки 97-103

## Критерии приёмки

- [x] `helpers.tsx` создан с fixtures и функциями
- [x] `common.steps.ts` создан (пустой)
- [x] Файлы компилируются без ошибок
- [x] Нет ошибок линтера

## Зависимости

- Референс: `src/person-limits/BoardPage/features/helpers.tsx`
- Референс: `src/column-limits/BoardPage/board-page.feature.cy.tsx`

---

## Результаты

**Дата**: 2025-02-27

**Агент**: Coder

**Статус**: DONE

**Комментарии**:

Проверены и доработаны файлы:
- `src/column-limits/BoardPage/features/helpers.tsx` — fixtures (columns, swimlanes, issueTypes), createMockIssue, setupBoardDOM, addIssueToDOM, setupBackground, cleanupAfterScenario, resetIssueCounter, getNextIssueId. Исправлено: no-plusplus (issueCounter += 1).
- `src/column-limits/BoardPage/features/steps/common.steps.ts` — step definitions для Given/When/Then. Исправлено: hexToRgb перенесена выше использования, prefer-destructuring, prettier форматирование.
ESLint проходит без ошибок.
