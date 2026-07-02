# TASK-96: Migrate diagnostic → diagnostic-module folder

**Status**: DONE
**Type**: refactoring

**Parent**: [EPIC-7](./EPIC-7-diagnostic-data-collection.md)

---

## Описание

Механическая миграция legacy `src/features/diagnostic/` в `src/features/diagnostic-module/`. Логика `saveDiagnosticData` action не переносится — будет реализована в DiagnosticModel (TASK-98).

## Файлы

```
src/features/diagnostic-module/     # новая папка
├── BoardPage.ts                    # migrate
├── SettingsTab.tsx                 # migrate
├── JqlDebugDemo.tsx                # migrate
└── JqlDebugDemo.stories.tsx        # migrate (если есть)

src/content.ts                      # update imports
src/features/diagnostic/            # удалить после миграции
```

## Что сделать

1. Перенести файлы из `diagnostic/` в `diagnostic-module/` (кроме `actions/saveDiagnosticData.ts`).
2. Обновить relative imports внутри перенесённых файлов.
3. Обновить импорты в `content.ts` и других потребителях.
4. Удалить пустую папку `src/features/diagnostic/`.
5. Поведение export пока не менять — временно оставить legacy `createAction` до TASK-100.

## Критерии приёмки

- [x] Папка `src/features/diagnostic/` удалена
- [x] Extension собирается: `npm run build`
- [x] Тесты проходят: `npm test`
- [x] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Референс: [target-design.md](./target-design.md) Phase 0

---

## Результаты

**Дата**: 2026-05-19

**Агент**: Coder → Code Review → QA

**Статус**: VERIFICATION

**Что сделано**:

- Миграция `src/features/diagnostic/` → `src/features/diagnostic-module/` (BoardPage, SettingsTab, JqlDebugDemo, stories)
- `actions/saveDiagnosticData.ts` перенесён без изменения логики (export работает до TASK-100)
- Обновлён импорт в `src/content.ts`
- Legacy-папка `diagnostic/` удалена

**Проблемы и решения**:

- **SCOPE_DRIFT (minor):** `saveDiagnosticData.ts` физически перенесён, хотя в списке TASK исключён — необходимо для удаления старой папки при сохранении export. Принято ревьюером как оправданное отклонение.

**Отчёты**: [REVIEW-TASK-96](./REVIEW-TASK-96.md) (APPROVED), [QA-TASK-96](./QA-TASK-96.md) (PASS)
