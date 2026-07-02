# TASK-79: Templates Storage Model

**Status**: VERIFICATION
**Type**: model

**Parent**: [EPIC-5](./EPIC-5-jira-comment-templates.md)

---

## Описание

Реализовать `TemplatesStorageModel`, который владеет persisted templates, fallback к defaults, load/save/reset и JSON payload v1. Модель использует generic `LocalStorageService` через DI и остаётся единственным владельцем storage key и payload shape.

## Файлы

```
src/features/jira-comment-templates-module/Storage/models/
├── TemplatesStorageModel.ts       # новый
└── TemplatesStorageModel.test.ts  # новый
```

## Что сделать

1. Создать Valtio model state: `templates`, `loadState`, `error`, computed `templateSummaries`, `hasTemplates`.
2. Реализовать `load`, `saveTemplates`, `resetToDefaults`, `getTemplate`, `reset`.
3. Читать и писать payload `{ version: 1, templates }` по key из constants через `LocalStorageService`.
4. При пустом storage использовать defaults, при invalid JSON показывать error и fallback без перезаписи storage.
5. Покрыть unit tests empty storage, invalid JSON, save/reset, localStorage errors и normalization.
6. Corrupted v1 payload с невалидной строкой внутри `templates` должен возвращать `Err` и fallback defaults без throw и без overwrite.

## Критерии приёмки

- [x] Модель не обращается к browser `localStorage` напрямую.
- [x] Invalid stored JSON/schema/row shape (включая `null`/примитив/массив в элементе `templates`) не ломает toolbar/settings и не перезаписывает данные до явного save/reset — `load` возвращает `Err`, `loadState: 'error'`, в памяти defaults, storage не трогается.
- [x] Unit tests покрывают основные load/save/default/error paths и corrupted row внутри v1 (`templates: [null]`, примитивная строка, массив-элемент `templates: [[]]` — QA MISSED_SCENARIO).
- [x] Тесты проходят: `npm test`.
- [x] Нет ошибок линтера: `npm run lint:eslint -- --fix`.

## Зависимости

- Зависит от: [TASK-77](./TASK-77-local-storage-service.md)
- Зависит от: [TASK-78](./TASK-78-storage-utils.md)
- Референс: [target-design.md](./target-design.md)

---

## Результаты

**Дата**: 2026-04-30

**Агент**: Coder

**Статус**: VERIFICATION — после REVIEW-TASK-79 и QA-TASK-79 (MISSED_SCENARIO `templates: [[]]` закрыт array-row тестом); ожидается финальное ревью/merging.

**Что сделано**:

- Добавлены `Storage/models/TemplatesStorageModel.ts` и `TemplatesStorageModel.test.ts`.
- Состояние: `templates`, `loadState`, `error`; геттеры `templateSummaries`, `hasTemplates`.
- DI: конструктор принимает только `ILocalStorageService`.
- Ключ и версия payload из `COMMENT_TEMPLATES_LOCAL_STORAGE_KEY`, `COMMENT_TEMPLATES_STORAGE_PAYLOAD_VERSION`.
- `load()`: `loading` → пустой ключ → дефолты без записи; валидный v1 → нормализация; битый JSON / неверная схема / версия / невалидный элемент массива `templates` (`null`, примитив, массив) / `getItem` Err → дефолты в памяти, `error` + `loadState: 'error'`, `Err` (storage не трогается при ошибках чтения/парсинга).
- `parseStoredPayload`: перед `normalizeTemplates` проверка, что каждая строка — non-null plain object (не массив), иначе `Err(Error)` без throw.
- `saveTemplates` / `resetToDefaults`: JSON `{ version: 1, templates }`, обновление `templates` только при успешном `setItem`; при ошибке — `error`, `Err`, список не меняется.
- `reset()`: в памяти пустой список, `loadState: 'initial'`, `error: null`.
- Тесты: fake `ILocalStorageService`, без браузера; добавлены сценарии v1 с `templates: [null]`, примитивной строкой и массивом-строкой `templates: [[]]` (BDD / QA: «Fallback when stored templates payload is corrupted»).

**Проблемы и решения**:

- REVIEW-TASK-79 **MISSED_SCENARIO**: корневой v1 с `templates: [null]` давал throw в `normalizeTemplates` при доступе к полям строки; UI не получал контролируемый fallback. Исправлено валидацией shape строк в `parseStoredPayload`; unit-тесты фиксируют `Err`, error state, defaults, отсутствие `setItem`.
- QA-TASK-79 **MISSED_SCENARIO** (array row): v1 с `templates: [[]]` отклонялся реализацией, но не был покрыт unit-тестом; добавлен тест с assert `Err`, `loadState: 'error'`, truthy `error`, defaults в памяти, сырой storage без изменений, ноль вызовов `setItem`.
- Несогласованность «`load` при ошибке чтения возвращает `Err`, но в UI уже дефолты»: зафиксировано в target design как допустимое; поведение покрыто тестом.

**Проверки**:

- `npx vitest run src/features/jira-comment-templates-module/Storage/models/TemplatesStorageModel.test.ts` — passed (17 scenarios, включая `templates: [[]]`).
- `npm run lint:eslint -- --fix -- src/features/jira-comment-templates-module/Storage/models/TemplatesStorageModel.ts src/features/jira-comment-templates-module/Storage/models/TemplatesStorageModel.test.ts` — без ошибок.
- `npm test -- --run` — 137 test files / 1513 tests passed.
