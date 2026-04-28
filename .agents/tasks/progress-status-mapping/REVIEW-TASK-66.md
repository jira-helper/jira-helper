# Review: TASK-66 — Sub-Tasks Runtime Progress Mapping

**Дата**: 2026-04-28
**TASK**: [TASK-66](./TASK-66-subtasks-runtime-progress-mapping.md)
**Вердикт**: APPROVED

## Findings

### Critical

Нет.

### Warning

Нет.

### Nit

Нет.

## Резюме

Sub-tasks progress calculation now resolves progress buckets through the shared `resolveProgressBucket` helper using Jira status id, then applies existing flagged/link blocked overrides afterward. Tests cover id-only matching, default Jira statusCategory fallback, and blocked remaining outside custom mapping.
