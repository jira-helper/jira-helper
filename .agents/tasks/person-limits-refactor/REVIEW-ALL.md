# Review: EPIC-20 — Рефакторинг person-limits (zustand → valtio + DI Module)

**Дата**: 2026-04-06
**Вердикт**: **APPROVED**

---

## Findings

### Warning

**W1. `BoardRuntimeModel` — прямой DOM-запрос в Model**
- Файл: `src/person-limits/BoardPage/models/BoardRuntimeModel.ts`
- `column.querySelectorAll(...)` — прямое обращение к DOM из Model
- Architecture guideline: монополия PageObject на DOM
- Предложение: добавить метод в PageObject или использовать существующий `getIssueElements`

**W2. `BoardRuntimeModel.test.ts` — недостаточное покрытие**
- Только 2 теста (calculateStats). Нет тестов для: `apply()`, `showOnlyChosen()`, `toggleActiveLimitId()`, `reset()`, custom swimlanes, скрытие пустых агрегаций
- Предложение: дописать тесты

**W3. Избыточные type assertions `as Model` в containers (10+ мест)**
- `model as SettingsUIModel`, `model as PropertyModel`, etc.
- `ModelEntry<T>` уже типизирует `model` как `T`
- Предложение: убрать `as Model`

### Nit

**N1.** `SettingsPage/index.tsx:64` — `(i: any)` вместо типизации
**N2.** `module.test.ts:48` — ненужный type assertion
**N3.** `PersonalWipLimitContainer.tsx` — 387 строк, можно вынести hooks
**N4.** `BoardPage/index.ts:64` — двойная миграция (внешний `migrateProperty` + внутренний в `setData`)

## Что сделано хорошо

1. Точное следование target-design и architecture_guideline
2. Чистое удаление legacy — 0 ссылок на zustand stores/actions/PersonLimitsBoardPageObject
3. Качественные тесты PropertyModel и SettingsUIModel
