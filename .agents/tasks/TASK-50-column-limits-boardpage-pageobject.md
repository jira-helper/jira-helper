# TASK-50: Создать PageObject и DI token для BoardPage

**Status**: DONE

**Parent**: [EPIC-6](./EPIC-6-column-limits-modernization.md)

---

## Описание

Создать PageObject для инкапсуляции DOM-операций BoardPage column-limits. PageObject абстрагирует работу с DOM от бизнес-логики и позволяет мокать DOM-зависимости в тестах через DI.

## Файлы

```
src/column-limits/BoardPage/
├── pageObject/
│   ├── IColumnLimitsBoardPageObject.ts   # новый - интерфейс
│   ├── ColumnLimitsBoardPageObject.ts    # новый - реализация
│   ├── columnLimitsBoardPageObjectToken.ts # новый - DI token
│   └── index.ts                          # новый - exports
```

## Что сделать

1. Создать интерфейс `IColumnLimitsBoardPageObject` с методами:
   - `getOrderedColumnIds(): string[]` - получить упорядоченный список column id
   - `getColumnElement(columnId: string): HTMLElement | null` - получить элемент колонки
   - `getIssuesInColumn(columnId: string, ignoredSwimlanes: string[], includedIssueTypes?: string[]): number` - подсчёт задач
   - `styleColumn(columnId: string, styles: Partial<CSSStyleDeclaration>): void` - применить стили
   - `insertBadge(columnId: string, html: string): void` - вставить бейдж лимита
   - `getSwimlaneIds(): string[]` - получить ID свимлейнов

2. Создать реализацию `ColumnLimitsBoardPageObject` implements `IColumnLimitsBoardPageObject`
   - Вынести логику из текущего `index.ts`:
     - `getOrderedColumns()` → `getOrderedColumnIds()`
     - `getIssuesInColumn()` → перенести
     - Логика `styleColumnHeaders()` → `styleColumn()`

3. Создать DI token `columnLimitsBoardPageObjectToken`

4. Создать `index.ts` с экспортами

## Критерии приёмки

- [x] Интерфейс покрывает все DOM-операции BoardPage
- [x] Реализация не зависит от stores/actions
- [x] DI token зарегистрирован корректно
- [ ] Тесты проходят: `npm test` (не требуется на этом этапе)
- [x] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Референс: `src/person-limits/BoardPage/pageObject/`
- Референс интерфейса: `src/person-limits/BoardPage/pageObject/IPersonLimitsBoardPageObject.ts`

---

## Результаты

**Дата**: 2026-02-16

**Агент**: Coder

**Статус**: DONE

**Комментарии**:

```
Создан PageObject для column-limits BoardPage:

1. Интерфейс IColumnLimitsBoardPageObject:
   - getOrderedColumnIds() - получение упорядоченных ID колонок
   - getColumnElement() - получение элемента колонки
   - getIssuesInColumn() - подсчёт задач с фильтрацией по swimlanes и типам
   - styleColumn() - применение стилей к колонке
   - insertBadge() - вставка badge в колонку
   - getSwimlaneIds() - получение всех ID swimlanes
   - shouldCountIssue() - проверка, нужно ли считать задачу

2. Реализация ColumnLimitsBoardPageObject:
   - Вынесена логика из BoardPage/index.ts:
     - getOrderedColumns() → getOrderedColumnIds()
     - getIssuesInColumn() → перенесён полностью с поддержкой cssNotIssueSubTask
     - shouldCountIssue() → перенесён с логикой парсинга типа задачи
   - Добавлен приватный метод getIssueTypeFromCard() для парсинга типа задачи
   - Все методы работают с DOM напрямую, без зависимостей от stores/actions

3. DI token columnLimitsBoardPageObjectToken создан и экспортирован

4. Функция registerColumnLimitsBoardPageObjectInDI() регистрирует PageObject в DI контейнере через factory функцию

Код компилируется без ошибок, линтер не находит проблем в новых файлах.
```

**Проблемы и решения**:

```
1. В задаче указано использовать @Scoped(Scope.Singleton), но в проекте этот декоратор не используется.
   Решение: Использован factory pattern для регистрации в DI, как в других PageObject проекте.

2. В задаче указан параметр cssNotIssueSubTask для getIssuesInColumn(), но он не был в интерфейсе.
   Решение: Добавлен опциональный параметр cssNotIssueSubTask в интерфейс и реализацию.
```
