# TASK-50: Align SwimlaneSelector behavior

**Status**: VERIFICATION
**Type**: view

**Parent**: [EPIC-2](./EPIC-2-all-swimlanes-behavior.md)

---

## Описание

Выровнять UI-state `SwimlaneSelector` под issue #23: checked **All swimlanes** не должен отображаться вместе со списком individual swimlanes. Компонент должен сохранять existing contract `[] = all swimlanes`.

## Файлы

```text
src/shared/components/SwimlaneSelector/
├── SwimlaneSelector.tsx      # изменение
└── SwimlaneSelector.cy.tsx   # изменение
```

## Контекст

Текущий компонент уже использует локальный `expanded` state и нормализует полный manual selection в `[]`. Нужно проверить и, если требуется, поправить edge case после снятия **All swimlanes**, чтобы checkbox становился unchecked while list is visible, а all mode не показывал список.

## Что сделать

1. Написать/обновить Cypress component tests по сценариям из [swimlane-selector.feature](./swimlane-selector.feature).
2. В Cypress обязательно проверить реальный click по **All swimlanes**: после снятия checkbox становится unchecked, список появляется; после включения список скрывается.
3. Проверить текущее поведение `allChecked`, `showList`, `displayValue` после uncheck **All swimlanes**.
4. Если текущая формула `allChecked` оставляет checkbox checked при manual mode без выбранных ids, заменить вычисление на режим, который учитывает локальный manual state.
5. Сохранить normalization: при выборе всех individual swimlanes вызвать `onChange([])` и скрыть список.
6. Не менять props API и persisted convention.

## Критерии приёмки

- [ ] Test: `value=[]` показывает checked **All swimlanes** и не показывает `[data-testid="swimlane-list"]`.
- [ ] Test: uncheck **All swimlanes** показывает список и делает checkbox unchecked.
- [ ] Test: check **All swimlanes** из manual mode вызывает `onChange([])` и скрывает список.
- [ ] Test: выбор всех individual swimlanes нормализуется в `[]` и скрывает список.
- [ ] Cypress-тесты проверяют видимость через DOM, а не только вызовы callback/store.
- [ ] Нет изменений в contract `SwimlaneSelectorProps`.

## Зависимости

- Зависит от: [requirements.md](./requirements.md), [target-design.md](./target-design.md).
- Референс: `src/shared/components/SwimlaneSelector/SwimlaneSelector.tsx`.

---

## Результаты

**Дата**: 2026-04-27

**Агент**: Coder

**Статус**: VERIFICATION

**Что сделано**:

- Обновлён `SwimlaneSelector`: all mode теперь определяется только `value=[]` и не открытым manual UI.
- Добавлен manual mode после снятия **All swimlanes** без немедленного `onChange`.
- Сохранена нормализация полного manual selection в `onChange([])`.
- Добавлены Cypress component tests для all/manual переходов, stale ids и full non-empty value.

**Проблемы и решения**:

- Cypress сначала падал из-за селектора Ant Design Checkbox. Исправлено helper-ами для фактического DOM.
- Проверки: ESLint PASS, TypeScript PASS, focused Cypress PASS (`9 passing, 0 failing` под `xvfb-run`).
