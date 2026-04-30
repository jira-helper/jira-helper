# TASK-80: Settings Import Export Utils

**Status**: VERIFICATION
**Type**: model

**Parent**: [EPIC-5](./EPIC-5-jira-comment-templates.md)

---

## Описание

Создать pure utils для импорта и экспорта шаблонов в Settings domain. Utils должны принимать current payload v1 и legacy JSON массив старого расширения, возвращая нормализованный draft без записи в storage.

## Файлы

```
src/features/jira-comment-templates-module/Settings/utils/
├── validateImportedTemplates.ts       # новый
├── serializeTemplates.ts              # новый
└── validateImportedTemplates.test.ts  # новый
```

## Что сделать

1. Реализовать validation для current `{ version: 1, templates }` payload.
2. Реализовать validation для legacy array `{ id, label, color, text, watchers? }[]`.
3. Возвращать понятные `TemplateValidationError` для file/schema/template field ошибок.
4. Реализовать export serializer для текущих templates в JSON v1.
5. Покрыть unit tests valid current, valid legacy, invalid JSON/schema и сохранение текущих данных вне utils.

## Критерии приёмки

- [x] Import utils не пишут в `localStorage` и не мутируют persisted templates.
- [x] Legacy JSON старого расширения поддерживается как compatible input.
- [x] Ошибки импорта пригодны для показа пользователю в Settings UI.
- [x] Тесты проходят: `npm test`.
- [x] Нет ошибок линтера: `npm run lint:eslint -- --fix`.

## Зависимости

- Зависит от: [TASK-75](./TASK-75-domain-types-and-constants.md)
- Зависит от: [TASK-78](./TASK-78-storage-utils.md)
- Референс: [comment-templates.feature](./comment-templates.feature)

---

## Результаты

**Дата**: 2026-04-30

**Агент**: Coder

**Статус**: VERIFICATION

**Что сделано**:

- Добавлены pure utils: `Settings/utils/validateImportedTemplates.ts` (`Result<CommentTemplate[], TemplateValidationError[]>`, v1 payload и legacy root-array), `Settings/utils/serializeTemplates.ts` (v1 JSON + `COMMENT_TEMPLATES_STORAGE_PAYLOAD_VERSION`, pretty-print + trailing newline).
- После проверки полей вызывается `normalizeTemplates` для trim/id/watchers; импорт не трогает storage и не мутирует исходные объекты до парсинга.
- **Импорт**: `label`, `color`, `text` — только `string` с непустым `.trim()`; иначе `TemplateValidationError` по соответствующему полю (не допускаются числа/boolean/object до нормализации).
- **Импорт watchers**: `undefined`/`null`/CSV-строка/массив строк; элемент массива не строка → `field: 'watchers'`; прочие типы корня — как раньше.
- **Экспорт**: `serializeTemplates` собирает канонический объект `{ id, label, color, text }` и добавляет `watchers` только при непустом массиве (соответствует опциональному `CommentTemplate.watchers`).
- Unit tests: `validateImportedTemplates.test.ts` — расширены кейсы по review ([REVIEW-TASK-80](./REVIEW-TASK-80.md)); всего 20 тестов на файл.

**Проблемы и решения**:

- **Review Critical**: числа принимались как непустые `label`/`color`/`text` и коэрцились в `normalizeTemplates` — исправлено строгой проверкой типа строки + trim (см. `validateImportedTemplates.ts`).
- **Review Warning (watchers)**: массив не проверял элементы — добавлена поэлементная проверка `typeof === 'string'`.
- **Review Warning (export)**: в JSON утекали enumerable поля черновика (`isNew` и др.) — экспорт через явное отображение в канонический ряд без лишних ключей.
- **MISSED_SCENARIO (QA)**: `.feature` явно покрывал legacy import, invalid import и export, но не current v1 import `{ version: 1, templates }`. Решение: добавлен сценарий `Import current v1 JSON into settings draft`; код менять не потребовалось, поведение уже покрыто unit-тестом.

**Проверки**:

- `npm test -- --run src/features/jira-comment-templates-module/Settings/utils/validateImportedTemplates.test.ts` (2026-04-30, 5d-fix)
- `npx eslint src/features/jira-comment-templates-module/Settings/utils/validateImportedTemplates.ts src/features/jira-comment-templates-module/Settings/utils/serializeTemplates.ts src/features/jira-comment-templates-module/Settings/utils/validateImportedTemplates.test.ts --fix`
- `npm test -- --run` (полный Vitest, 2026-04-30)
