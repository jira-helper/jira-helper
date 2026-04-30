# TASK-78: Storage Utils

**Status**: VERIFICATION
**Type**: model

**Parent**: [EPIC-5](./EPIC-5-jira-comment-templates.md)

---

## Описание

Создать pure utils для storage domain: default templates и normalization. Эти функции используются storage model и settings/import paths, но не читают и не пишут `localStorage`.

## Файлы

```
src/features/jira-comment-templates-module/Storage/utils/
├── defaultTemplates.ts          # новый
├── normalizeTemplates.ts        # новый
└── normalizeTemplates.test.ts   # новый
```

## Что сделать

1. Добавить два generic default templates без CNT branding: `Взял в работу` и `Нужно уточнение`.
2. Реализовать normalization: trim label/text/watchers, убрать пустые watchers, восстановить missing/duplicate ids.
3. Сохранять совместимость с shape `{ id, label, color, text, watchers? }`.
4. Покрыть unit tests defaults, trimming, duplicate ids и watcher parsing.
5. Не добавлять JSON parse/stringify или localStorage I/O в utils.
6. Сохранять explicit ids из input, если они непустые и уникальные; generated ids не должны занимать explicit ids из того же input.

## Критерии приёмки

- [x] Defaults соответствуют `requirements.md`.
- [x] Normalization чистая, детерминированная, сохраняет explicit ids (включая mint-shaped позже в массиве) и покрыта unit tests.
- [x] Utils не импортируют models, DI или infrastructure storage.
- [x] Тесты проходят: `npm test`.
- [x] Нет ошибок линтера: `npm run lint:eslint -- --fix`.

## Зависимости

- Зависит от: [TASK-75](./TASK-75-domain-types-and-constants.md)
- Референс: [requirements.md](./requirements.md)

---

## Результаты

**Дата**: 2026-04-30

**Агент**: Coder

**Статус**: VERIFICATION

**Что сделано**:

- Добавлены `DEFAULT_COMMENT_TEMPLATES` (два дефолта из requirements, без watchers, нейтральные hex-цвета, стабильные ids через `toCommentTemplateId`).
- Реализованы `normalizeTemplates` и экспорт типа `NormalizableCommentTemplateInput` для переиспользования в TASK-80; mint ids `__jh-ct-*`, trim полей, очистка watchers (массив или строка с запятыми), без мутации входа; pre-scan всех непустых explicit id, чтобы сгенерированные id не отбирали mint-shaped explicit id у следующих строк.
- Unit-тесты: defaults, trimming, missing/duplicate ids, коллизия missing + поздний explicit `__jh-ct-0`, watchers, отсутствие мутации, пустой массив.

**Проблемы и решения**:

- ESLint `no-useless-assignment` на инициализации `pieces = []` — заменено на `let pieces: string[]` с присвоением по веткам.
- **MISSED_SCENARIO** (review): при проходе слева направо `mintId()` занимал `__jh-ct-0` до обработки строки с явным `__jh-ct-0`, из‑за чего валидный persisted id ошибочно считался дубликатом. Решение: множество всех непустых explicit id из всего `input` участвует в выборе mint-кандидата (`used.has || explicitIdsFromInput.has`).

**Проверки**:

- `npm test -- --run src/features/jira-comment-templates-module/Storage/utils/normalizeTemplates.test.ts`
- `npm test -- --run` (1476 tests)
- `npx eslint src/features/jira-comment-templates-module/Storage/utils/defaultTemplates.ts src/features/jira-comment-templates-module/Storage/utils/normalizeTemplates.ts src/features/jira-comment-templates-module/Storage/utils/normalizeTemplates.test.ts --fix`
