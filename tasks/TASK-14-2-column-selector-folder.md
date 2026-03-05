# TASK-14-2: Рефакторинг ColumnSelector в папку

**Epic**: [EPIC-14](./EPIC-14-swimlane-antd-migration.md)
**Status**: DONE
**Depends on**: —

---

## Цель

Вынести `ColumnSelector.tsx` в папку `ColumnSelector/` по аналогии с `SwimlaneSelector/`.

---

## Файлы

| Файл | Действие |
|------|----------|
| `src/shared/components/ColumnSelector.tsx` | Удаление |
| `src/shared/components/ColumnSelector/ColumnSelector.tsx` | Создание |
| `src/shared/components/ColumnSelector/ColumnSelector.stories.tsx` | Создание |
| `src/shared/components/ColumnSelector/ColumnSelector.cy.tsx` | Создание |
| `src/shared/components/ColumnSelector/index.ts` | Создание |
| `src/shared/components/index.ts` | Изменение |

---

## Требуемые изменения

### 1. Структура папки

```
src/shared/components/ColumnSelector/
├── ColumnSelector.tsx         # Переместить из ColumnSelector.tsx
├── ColumnSelector.stories.tsx # Создать Storybook
├── ColumnSelector.cy.tsx      # Создать Cypress тесты
└── index.ts                   # Re-export
```

### 2. index.ts

```typescript
export { ColumnSelectorPure, ColumnSelectorContainer } from './ColumnSelector';
export type { ColumnSelectorProps, ColumnSelectorContainerProps } from './ColumnSelector';
```

### 3. Storybook

По аналогии с `SwimlaneSelector.stories.tsx`:
- Story с пустыми колонками
- Story с заполненными колонками
- Story с disabled состоянием

### 4. Cypress тесты

Базовые тесты:
- Отображение списка колонок
- Включение/выключение колонки
- Состояние disabled

### 5. Обновить импорты

В `src/shared/components/index.ts` обновить экспорт:

```typescript
// Было
export * from './ColumnSelector';

// Стало
export * from './ColumnSelector';  // теперь из папки
```

---

## Acceptance Criteria

- [ ] `ColumnSelector.tsx` перемещён в папку
- [ ] Создан `index.ts` с re-exports
- [ ] Создан Storybook с 3+ stories
- [ ] Создан Cypress тест
- [ ] Все импорты в проекте работают
- [ ] `npm run lint:eslint` проходит
- [ ] `npm run test` проходит

---

## Контекст

Смотри существующую структуру:
- `src/shared/components/SwimlaneSelector/` — паттерн папки

---

## Результаты

**Дата**: 2026-03-05

**Агент**: Coder

**Статус**: DONE

**Что сделано**:

- Создана структура папки `src/shared/components/ColumnSelector/`
- Перемещён `ColumnSelector.tsx` в папку
- Создан `index.ts` с re-exports всех компонентов и типов
- Создан Storybook с 6 stories (Default, WithColumns, Disabled, NoWarning, WithExtraContent, EmptyColumns)
- Создан Cypress тест с 4 test cases

**Проблемы и решения**:

Проблем не было. Для Cypress-тестов настроен `globalContainer` с `MockLocaleProvider` по аналогии с существующими тестами.
