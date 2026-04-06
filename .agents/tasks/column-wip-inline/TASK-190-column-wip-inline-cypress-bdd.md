# TASK-190: Cypress BDD — column WIP inline (board tab)

**Status**: TODO

**Parent**: [EPIC-19](./EPIC-19-column-wip-inline-board-tab.md)

---

## Описание

Реализовать BDD-покрытие сценариев из [column-wip-inline-board-tab-lifecycle.feature](./column-wip-inline-board-tab-lifecycle.feature) и [column-wip-inline-board-tab-access-and-sync.feature](./column-wip-inline-board-tab-access-and-sync.feature): таб, empty/happy path, edit, cancel, закрытие панели без save, отсутствие таба без `canEdit`, совместимость с Board Settings. Сопоставить шаги с Cypress (`.cy.tsx` / page objects) по принятому в проекте стилю column-limits.

## Файлы

```
.agents/tasks/column-wip-inline/
├── column-wip-inline-board-tab-lifecycle.feature
├── column-wip-inline-board-tab-access-and-sync.feature

src/... (по конвенции проекта: cypress component tests, step definitions, page objects)
```

## Что сделать

1. Добавить/обновить Cypress-тесты и вспомогательные step definitions для тегов `@SC-JHTAB-1` … `@SC-JHTAB-8`.
2. Использовать стабильные селекторы: таб «Column WIP Limits», dropzone `jh-tab-column-dropzone`, кнопки Save/Cancel.
3. Заполнить таблицу покрытия (ниже) по мере реализации.

## Критерии приёмки

- [ ] Все сценарии из обоих `.feature` имеют автоматизированную проверку или явно задокументированный skip с причиной.
- [ ] Таблица покрытия актуальна.
- [ ] Тесты проходят: команды из раздела «Запуск» ниже.
- [ ] `npm test` и линтер без регрессий.
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Покрытие (Scenario → Cypress)

| Tag | Сценарий | Тест-файл / describe |
|-----|----------|----------------------|
| SC-JHTAB-1 | Empty state | {заполнить при реализации} |
| SC-JHTAB-2 | Happy path create + Save | |
| SC-JHTAB-3 | Редактирование группы | |
| SC-JHTAB-4 | Cancel | |
| SC-JHTAB-5 | Закрыть панель без Save | |
| SC-JHTAB-6 | Нет прав — таб скрыт | |
| SC-JHTAB-7 | Данные из Board Settings в табе | |
| SC-JHTAB-8 | Данные из таба в Board Settings | |

## Запуск

- `npm run cy:run` — component tests (CI)
- `npm run cy:open` — интерактивно (`cypress open --component`)

## Зависимости

- Зависит от: [TASK-189](./TASK-189-column-limits-settings-tab-and-register.md)
- Референс: [.cursor/skills/cypress-bdd-testing/SKILL.md](../../../.cursor/skills/cypress-bdd-testing/SKILL.md); существующие column-limits cypress-тесты

---

## Результаты

**Дата**: {YYYY-MM-DD}

**Агент**: {Coder / Architect / Manual}

**Статус**: VERIFICATION

**Что сделано**:

{Заполняется при завершении}

**Проблемы и решения**:

{ОБЯЗАТЕЛЬНО при завершении}
