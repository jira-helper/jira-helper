# Review: TASK-96 — Migrate diagnostic → diagnostic-module folder

**Дата**: 2026-05-19
**TASK**: [TASK-96](./TASK-96-migrate-diagnostic-module-folder.md)
**Вердикт**: APPROVED

## Findings

### Critical

Нет.

### Warning

- **[git / workspace]**: Папка `src/features/diagnostic-module/` в статусе **untracked** (`??`), удаления в `diagnostic/` — **staged как D только после add**. До `git add src/features/diagnostic-module/` коммит будет неполным: сборка локально может проходить, в PR файлов не будет.
  - Предложение: `git add src/features/diagnostic-module/` и закоммитить вместе с удалениями.

- **[TASK-96 / критерии приёмки]**: В TASK чекбоксы build / test / lint не отмечены; в diff нет артефактов qa-check.
  - Предложение: перед merge выполнить `npm run build`, `npm test`, `npm run lint:eslint -- --fix` (этап qa-check).

### Nit

- **[src/features/diagnostic-module/JqlDebugDemo.stories.tsx:6]**: Storybook `title` изменён с `Diagnostic/JqlDebugDemo` на `DiagnosticModule/JqlDebugDemo` — единственное отличие от HEAD кроме путей; согласовано с переименованием папки.
- **[.agents/tasks/diagnostic-data-collection/handoff.md:51]**: Устаревшая строка «код ещё в `diagnostic/`» — вне scope TASK-96, обновить при следующем handoff.

## Соответствие задаче

| Пункт TASK | Статус |
|------------|--------|
| Перенос BoardPage, SettingsTab, JqlDebugDemo (+ stories) | ✅ Содержимое совпадает с HEAD (кроме title в stories) |
| Обновление imports в `content.ts` | ✅ `./features/diagnostic-module/BoardPage` |
| Другие потребители `features/diagnostic` | ✅ В `src/` ссылок на старый путь нет |
| Удаление `src/features/diagnostic/` | ✅ Файлы удалены из дерева |
| Поведение export без изменений (`createAction`) | ✅ `saveDiagnosticData` без изменений логики |
| Исключить `actions/saveDiagnosticData.ts` из переноса | ⚠️ См. SCOPE_DRIFT ниже |

## SCOPE_DRIFT: `saveDiagnosticData.ts`

**Факт:** файл перенесён в `src/features/diagnostic-module/actions/saveDiagnosticData.ts`; `SettingsTab` импортирует `./actions/saveDiagnosticData`. Логика и `createAction` не менялись; путь к `manifest.json` (`../../../../manifest.json`) корректен.

**Оценка: приемлемо.**

- TASK и target-design Phase 0 формулируют «не переносить» в смысле **логики в DiagnosticModel (TASK-98)**, а в списке файлов исключают action из миграции.
- Критерий «удалить `src/features/diagnostic/`» несовместим с оставлением единственного файла в старой папке.
- Физический перенос без рефакторинга — минимальный способ сохранить export до TASK-100; `actions/` всё равно уйдёт при переносе в модель (target-design changelog).

Рекомендация для TASK-98/100: не дублировать рефакторинг; удалить `actions/` при переносе в `DiagnosticModel`.

## Архитектура и requirements

- **Phase 0 only:** `module.ts` / `tokens.ts` / `DiagnosticModel` — ожидаемо в TASK-97–99; замечаний нет.
- **`diagnosticBoardPageToken` в BoardPage.ts** — по design перенос в `tokens.ts` в TASK-97.
- **FR-1…FR-7 (requirements):** не затрагиваются механической миграцией.
- **module-boundaries (`-module` suffix):** соблюдено.
- **Legacy `createAction` + `innerHTML` в export:** pre-existing; в scope TASK-96 (п.5 «поведение не менять»).

## Тесты

Новых тестов не требуется. Регрессия — build + существующие unit-тесты (qa-check).

## Резюме

Миграция выполнена корректно: один потребитель в `content.ts`, relative imports внутри модуля согласованы, legacy-папка убрана. Единственное осознанное отклонение от списка файлов TASK — перенос `saveDiagnosticData.ts` без смены логики; оно оправдано критерием удаления `diagnostic/`. Перед merge: добавить untracked файлы в git и прогнать build/test/lint.
