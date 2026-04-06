# TASK-187: BoardPagePageObject — getOrderedColumns()

**Status**: TODO

**Parent**: [EPIC-19](./EPIC-19-column-wip-inline-board-tab.md)

---

## Описание

Расширить `IBoardPagePageObject` методом `getOrderedColumns()`, возвращающим упорядоченные колонки (id + имя из заголовка). Реализация комбинирует существующий `getOrderedColumnIds()` с чтением текста из `.ghx-column-title`. Обновить мок для тестов. Это основа для инициализации таба column limits на board page.

## Файлы

```
src/page-objects/
├── BoardPage.tsx           # интерфейс + реализация getOrderedColumns
├── BoardPage.test.ts       # тесты метода
└── BoardPage.mock.ts       # мок getOrderedColumns
```

## Что сделать

1. Добавить в `IBoardPagePageObject` сигнатуру `getOrderedColumns(): Array<{ id: string; name: string }>` (см. [target-design.md](./target-design.md)).
2. В `BoardPagePageObject` реализовать: для каждого id из `getOrderedColumnIds()` найти header, извлечь имя через селектор колонки title (как в target design).
3. Покрыть unit-тестами граничные случаи (пустой список, наличие текста).
4. Добавить в `BoardPage.mock.ts` заглушку `getOrderedColumns` (например `vi.fn(() => [])`).

## Критерии приёмки

- [ ] `getOrderedColumns()` соответствует контракту и согласован с `getOrderedColumnIds()` по порядку.
- [ ] Мок обновлён; существующие тесты не ломаются.
- [ ] Тесты проходят: `npm test`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Зависит от: нет (первая задача EPIC по цепочке к табу)
- Референс: [target-design.md](./target-design.md) (раздел Phase 1, diff для `BoardPage.tsx`)

---

## Результаты

**Дата**: {YYYY-MM-DD}

**Агент**: {Coder / Architect / Manual}

**Статус**: VERIFICATION

**Что сделано**:

{Заполняется при завершении}

**Проблемы и решения**:

{ОБЯЗАТЕЛЬНО при завершении}
