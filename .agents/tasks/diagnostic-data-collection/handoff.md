# Handoff: diagnostic-data-collection

**Date:** 2026-05-19  
**Branch:** `master` (ahead of origin by 2 commits; **implementation uncommitted**)  
**Feature slug:** `diagnostic-data-collection`  
**Folder:** `.agents/tasks/diagnostic-data-collection/`

---

## Goal

DI-based mechanism for features to register synchronous read-only diagnostic callbacks. On export, `DiagnosticModel` collects all callbacks into `featureDiagnostics` and merges with legacy export payload. Fault-tolerant: one feature failure must not break export for others.

---

## Current state (where we stopped)

**Planning:** complete (requirements, target-design, developer-guide, EPIC-7, TASK-96…112).

**Implementation:** in progress — **Phase 1–2 done**, **Phase 3 started**, остановились **посередине TASK-102**.

| Phase | Tasks | Status |
|-------|-------|--------|
| 1 Foundation | 96–99 | **DONE** |
| 2 Export flow | 100–101 | **DONE** |
| 3 Module callbacks | 102 | **IN_PROGRESS** (coder done, review/QA **not run**) |
| 3 Module callbacks | 103–106 | TODO |
| 4 Legacy callbacks | 107–111 | TODO |
| 5 Docs | 112 | TODO |

### Что уже в коде (uncommitted)

**`src/features/diagnostic-module/`** — полный foundation:

- `types.ts`, `tokens.ts`, `module.ts`, `module.test.ts`
- `models/DiagnosticModel.ts` + `DiagnosticModel.test.ts`
- Migrated UI: `BoardPage.ts`, `SettingsTab.tsx`, `JqlDebugDemo*.tsx`
- `actions/saveDiagnosticData.ts` **удалён** (TASK-100); export через `model.saveDiagnosticData()`

**`src/content.ts`** — `diagnosticModule.ensure(container)` **первым** среди feature modules (строка ~115).

**`src/features/column-limits-module/`** (TASK-102, partial):

- `module.ts` — `registerDiagnosticData('column-limits-module', …)` с payload §5.3
- `module.diagnostic.test.ts` — unit-тесты callback (новый файл)
- Тестовые helpers обновлены: `diagnosticModule.ensure(globalContainer)` в ~7 файлах (чтобы column-limits тесты резолвили `diagnosticModelToken`)

**Удалено:** `src/features/diagnostic/` (legacy folder).

### Отчёты review/QA (есть на диске)

| Task | Review | QA |
|------|--------|-----|
| 96 | APPROVED | PASS |
| 97 | APPROVED | PASS |
| 98 | APPROVED | PASS |
| 99 | APPROVED | PASS |
| 100 | APPROVED | PASS |
| 101 | APPROVED | PASS |
| **102** | **нет** | **нет** |

EPIC-таблица для TASK-102 ещё `TODO` — **рассинхрон** с файлом задачи (`IN_PROGRESS`). Синхронизировать при завершении 102.

---

## Commits (do not re-read full diffs)

- `221b9bc` — EPIC-7, TASK-96…112, developer-guide
- `bb1828a` — requirements + target design

**Вся реализация (TASK-96…102) — только в working tree, не закоммичена.**

---

## Transfer to another PC

1. **Скопировать/синхронизировать** весь репозиторий с uncommitted changes:
   - `git stash push -u -m "diagnostic-data-collection WIP"` → pull на другом ПК → `git stash pop`, **или**
   - commit + push на feature-ветку (пользователь раньше просил коммитить только по явной просьбе).
2. На новом ПК: `npm install`, затем `npm test && npm run lint:eslint -- --fix && npm run build:dev`.
3. Открыть этот handoff + [EPIC-7](./EPIC-7-diagnostic-data-collection.md).

**Untracked (ignore unless needed):** `opencode.json.bak`, `.logs/qa-task-96-*.log`

---

## Next work (resume here)

### Immediate: finish TASK-102

Coder-работа выглядит завершённой; **пропущены этапы 5b–5c** feature-orchestrator workflow.

```
1. code-review  → REVIEW-TASK-102.md  (composer-2.5-fast, readonly)
2. qa-check     → QA-TASK-102.md      (composer-2.5-fast, shell)
3. если CHANGES_REQUESTED / FAIL → coder fix → повтор 5b–5c
4. user marks DONE → sync EPIC + TASK status + «Результаты»
```

Спека: [TASK-102](./TASK-102-column-limits-diagnostic.md)

### Then (sequential, one task at a time)

```
TASK-103 → 104 → 105 → 106   (module features)
TASK-107 → … → 111           (legacy features, mostly parallel in design)
TASK-112                     (JSDoc + developer-guide sync)
```

---

## Per-task workflow (user preference)

Для **каждой** TASK, **строго последовательно** (без параллельных саб-агентов):

1. **coder** — `composer-2.5-fast`, TDD, реализация
2. **code-review** — `composer-2.5-fast`, readonly → `REVIEW-TASK-N.md`
3. **qa-check** — `composer-2.5-fast` (shell) → `QA-TASK-N.md`
4. Fix loop if needed (max 3 iterations)
5. User confirms → status `DONE`

Оркестратор: [.agents/agents/feature-orchestrator.md](../../agents/feature-orchestrator.md)

---

## Key design decisions (summary)

Details in [requirements.md](./requirements.md) §5.10 and [target-design.md](./target-design.md).

- Legacy top-level export fields unchanged; additive `featureDiagnostics`
- Payload convention: `{ settings: { boardProperty, localStorage }, runtime }`
- `featureName`: folder name or `{subdir}-{file-base}` kebab
- `diagnosticModule.ensure()` first among feature modules in `content.ts` ✅ done
- Legacy registration in each feature's existing DI/init (not centralized)
- Per-feature `JSON.stringify` check + fallback to legacy-only fields
- `DiagnosticModel` via `modelEntry` → `proxy()`, token `diagnosticModelToken`
- No new UI v1; SettingsTab only triggers `model.saveDiagnosticData()` ✅ done
- Scope v1: 14 features in requirements §5

---

## Skills for next session

### Обязательно

| Skill / rule | Path |
|--------------|------|
| Handoff (this doc) | `.agents/skills/handoff/SKILL.md` |
| TDD | `.agents/skills/tdd/SKILL.md` |
| Task execution | `.cursor/rules/task-execution.mdc` |
| Developer guide | [developer-guide.md](./developer-guide.md) |
| Target design | [target-design.md](./target-design.md) |

### Для TASK-102 (finish review/QA)

| Skill | Path |
|-------|------|
| Code review | `.agents/skills/code-review/SKILL.md` |
| QA | `.agents/skills/qa-check/SKILL.md` |

### Для TASK-103…111 (registration)

| Skill | Path |
|-------|------|
| Developer guide | [developer-guide.md](./developer-guide.md) — **обязательный контекст** |
| Testing | `.agents/skills/testing/SKILL.md` |
| Architect | `.agents/skills/architect/SKILL.md` — при спорных контрактах |

### Subagents (в промпте)

- `coder` — реализация / fix
- `generalPurpose` readonly — code review
- `shell` — QA (lint, test, build)

### Не подключать

- BDD/cypress skills — `.feature` не создавали
- `feature-orchestrator`, `requirements`, `solution-design` — planning закрыт
- `storybook` — нового UI нет

---

## Open / deferred

- BDD `.feature` — not created; optional follow-up
- EPIC-7 header status still `TODO` (update when feature ships)
- Push to origin — not done
- **Commit implementation** — user decides; nothing pushed yet

---

## User preferences observed

- Workflow: coder → review → QA on **composer-2.5-fast**, **one TASK at a time**, sequential subagents
- Prefer model methods over separate actions (`collectDiagnosticReport`, `saveDiagnosticData` on `DiagnosticModel`)
- Commit only when explicitly asked
- Grill one question at a time (planning phase)

---

## Prompt for next agent

> Resume **diagnostic-data-collection** on another machine. Read this handoff and [EPIC-7](./EPIC-7-diagnostic-data-collection.md). **First:** complete TASK-102 — run code-review and qa-check (implementation appears done in `column-limits-module/module.ts` + `module.diagnostic.test.ts`). Then continue TASK-103… sequentially. Read [developer-guide.md](./developer-guide.md) before feature registrations. Follow TDD + task-execution workflow; subagents on composer-2.5-fast; no parallel subagents.
