# TASK-196: BoardPagePageObject — методы из PersonLimitsBoardPageObject

**Status**: TODO

**Parent**: [EPIC-20](./EPIC-20-person-limits-refactor.md)

---

## Описание

Перенести обобщаемую DOM-логику из `PersonLimitsBoardPageObject` в общий `BoardPagePageObject` (`src/page-objects/BoardPage.tsx`): расширить `IBoardPagePageObject` и реализацию методами, нужными для подсчёта issue, swimlane/columns, видимости задач и стилей (см. список в [target-design.md](./target-design.md), диаграмма AFTER). Это устраняет дублирование и готовит `BoardRuntimeModel` (TASK-197) к работе **только** через `IBoardPagePageObject`.

**В этой задаче не удалять** `PersonLimitsBoardPageObject` и папку `pageObject/` — удаление в [TASK-201](./TASK-201-board-page-delete-legacy.md).

## Файлы

```
src/page-objects/BoardPage.tsx              # изменение: новые методы + типы
src/page-objects/BoardPage.mock.ts          # изменение: моки для новых методов (если есть)
src/person-limits/BoardPage/pageObject/
├── PersonLimitsBoardPageObject.ts          # референс для переноса; не удалять
└── ...
```

## Что сделать

1. Свериться с [target-design.md](./target-design.md) (секция BoardPagePageObject / список методов в диаграмме) и с текущим `PersonLimitsBoardPageObject.ts`: перенести поведение без изменения семантики для потребителей.
2. Расширить `IBoardPagePageObject` и `BoardPagePageObject`; добавить/обновить unit-тесты page-object слоя, если они есть в проекте для `BoardPagePageObject`.
3. Обновить моки (`BoardPage.mock.ts` или аналог), чтобы `BoardRuntimeModel.test.ts` (TASK-197) мог использовать те же сигнатуры.
4. Не удалять `PersonLimitsBoardPageObject` до TASK-201.

## Критерии приёмки

- [ ] Все методы, необходимые BoardRuntimeModel по target-design, объявлены в `IBoardPagePageObject` и реализованы.
- [ ] DOM по-прежнему инкапсулирован в page-object; нет новых прямых обращений к `document` из person-limits models в этой задаче.
- [ ] `PersonLimitsBoardPageObject` не удалён (проверка объёма diff).
- [ ] Тесты проходят: `npm test`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Зависит от: нет (можно параллельно с TASK-194–195 до начала TASK-197).
- Референс: [TASK-181 column-limits](../column-limits-refactor/TASK-181-board-page-object.md)
- Последующая интеграция: [TASK-197](./TASK-197-board-runtime-model.md)

---

## Результаты

**Дата**: {YYYY-MM-DD}

**Агент**: {Coder / Architect / Manual}

**Статус**: VERIFICATION

**Что сделано**:

{Заполняется при завершении}

**Проблемы и решения**:

{Заполняется при завершении}
