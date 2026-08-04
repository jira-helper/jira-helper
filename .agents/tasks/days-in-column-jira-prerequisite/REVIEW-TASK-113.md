# Review: TASK-113 — Days in Column — EN + RU docs (Jira prerequisite)

**Дата**: 2026-08-04  
**TASK**: [TASK-113](./TASK-113-days-in-column-docs-en-ru.md)  
**Вердикт**: APPROVED

## Findings

### Critical

Нет.

### Warning

Нет.

### Nit

- **[website/docs/.../days-in-column.md:26]**: В Purpose mockup-текст про Green/orange/red расходится с «How to use» (blue/yellow/red). Это pre-existing, вне scope TASK-113; при следующем docs-pass можно выровнять.
- **[TASK-113:44]**: Чекбокс Acceptance checklist `.feature` ещё не отмечен — ожидаемо на этапе VERIFICATION; после ручной приёмки закрыть.

## Соответствие сценариям (.feature)

| ID | Сценарий | Статус |
|----|----------|--------|
| @SC-DOC-EN-1 | Prerequisites сразу после metadata; only if + label + полный path | ✅ |
| @SC-DOC-EN-2 | Bullet в How to configure + «cannot work correctly» + path | ✅ |
| @SC-DOC-EN-3 | Badge missing → Jira setting + path | ✅ |
| @SC-DOC-RU-1 | Требования сразу после metadata; только если + label + полный path | ✅ |
| @SC-DOC-RU-2 | Bullet в «Как настроить» + корректность бейджа + path | ✅ |
| @SC-DOC-RU-3 | Troubleshooting + бейдж не отображается + path | ✅ |
| @SC-DOC-PARITY-1 | Labels/paths как в Alert; `src/` не затронут задачей | ✅ |

Текст вставок совпадает с черновиком в [target-design.md](./target-design.md) § «Текст-черновик». FR-1…FR-4 закрыты содержимым markdown; FR-5 (деплой после merge в `master`) — вне diff этой задачи.

## Резюме

Docs-only diff ровно по scope: три точки заметности в EN и RU, формулировки и пути паритетны Alert (`jiraSettingsRequired`). Critical/Warning нет — **APPROVED**.
