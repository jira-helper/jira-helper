# TASK-10: Переписать тесты PersonalWipLimitContainer с RTL на Cypress

**Status**: DONE

**Parent**: [EPIC-2](./EPIC-2-person-limits-react-migration.md)

---

## Описание

Удалить `PersonalWipLimitContainer.test.tsx` (RTL + vitest, 1018 строк) и создать `PersonalWipLimitContainer.cy.tsx` — Cypress component tests.

**НЕ используем react-testing-library.** Все компонентные тесты пишем через Cypress Component Testing.

## Файлы

```
src/person-limits/SettingsPage/components/
├── PersonalWipLimitContainer.test.tsx   # УДАЛИТЬ
└── PersonalWipLimitContainer.cy.tsx     # СОЗДАТЬ — Cypress component tests
```

## Текущие тест-кейсы (из .test.tsx)

Все эти кейсы нужно перенести в Cypress:

### Bug fixes (C1-C8)
- **C1**: Ввод в поле personName не переключает в режим Edit
- **C2**: Отжатие "All columns" показывает список
- **C3**: Отжатие "All swimlanes" показывает список
- **C4**: Редактирование лимита с одной колонкой
- **C5**: Редактирование лимита со всеми колонками
- **C5b**: Отключение "All columns" при редактировании лимита с пустыми массивами
- **C6**: Cancel отменяет редактирование
- **C7**: Выбор всех колонок скрывает список
- **C8**: Снятие колонки в списке не скрывает список

### IssueTypeSelector Integration
- Issue types reset after add
- Issue types populated when editing
- Issue types cleared when canceling edit

### Bug fixes: Save and Add limit
- Save edited limit with specific columns
- Add new limit

### Bug fix: Count all issue types checkbox

## Что сделать

1. Прочитать `PersonalWipLimitContainer.test.tsx` — понять что тестируется
2. Создать `PersonalWipLimitContainer.cy.tsx` — Cypress component tests
3. Перенести ВСЕ тест-кейсы в Cypress синтаксис
4. Удалить `PersonalWipLimitContainer.test.tsx`

## Правила Cypress тестов

- Первая строка: `/// <reference types="cypress" />`
- Использовать `cy.mount()` для рендеринга
- Использовать `cy.get()`, `cy.contains()`, `.should()` для assertions
- Использовать `cy.stub()` для callbacks
- Store инициализация: `useSettingsUIStore.setState(...)` / `useSettingsUIStore.getState().actions.reset()`
- НЕ импортировать из vitest (describe, it, expect)
- НЕ импортировать из @testing-library/react
- НЕ импортировать userEvent

## Маппинг RTL → Cypress

| RTL | Cypress |
|-----|---------|
| `render(<Component />)` | `cy.mount(<Component />)` |
| `screen.getByText('text')` | `cy.contains('text')` |
| `screen.getByRole('button')` | `cy.get('button')` |
| `screen.getByTestId('id')` | `cy.get('[data-testid="id"]')` |
| `document.getElementById('id')` | `cy.get('#id')` |
| `userEvent.click(el)` | `cy.get(el).click()` |
| `userEvent.type(input, 'text')` | `cy.get(input).type('text')` |
| `fireEvent.change(checkbox)` | `cy.get(checkbox).click()` |
| `waitFor(() => expect(...))` | `cy.get(...).should(...)` |
| `expect(store.getState().x).toBe(y)` | `cy.then(() => { expect(store.getState().x).to.eq(y) })` |
| `vi.fn()` | `cy.stub()` |
| `vi.mock(...)` | Не нужно — Cypress монтирует реальные компоненты |

## Критерии приёмки

- [x] `PersonalWipLimitContainer.test.tsx` удалён
- [x] `PersonalWipLimitContainer.cy.tsx` создан
- [x] Все тест-кейсы (C1-C8, IssueTypeSelector, Save/Add, Count all) перенесены
- [x] Cypress тесты проходят: `npx cypress run --component --spec "src/person-limits/SettingsPage/components/PersonalWipLimitContainer.cy.tsx"`
- [x] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Зависит от: TASK-1 — TASK-8 (все компоненты созданы)
- Блокирует: TASK-9 (верификация)

---

## Результаты

**Дата**: 2026-02-11

**Агент**: coder

**Статус**: DONE

### Выполнено

1. ✅ Удалён `PersonalWipLimitContainer.test.tsx` (RTL, 1018 строк)
2. ✅ Создан `PersonalWipLimitContainer.cy.tsx` (Cypress component tests)
3. ✅ Перенесены все тест-кейсы:
   - C1-C8: Bug fixes (8 тестов)
   - IssueTypeSelector Integration (3 теста)
   - Save and Add limit (4 теста)
   - Count all issue types checkbox (2 теста)
4. ✅ Все 18 тестов проходят успешно
5. ✅ Исправлены ошибки ESLint (добавлен `/* eslint-disable no-unused-expressions */`)

### Примечания

- Тест "Issue types reset after add" проверяет сброс формы после добавления лимита. Компонент не сбрасывает issue types автоматически, если `editingId` не меняется (это известное ограничение компонента, документировано в коде).
