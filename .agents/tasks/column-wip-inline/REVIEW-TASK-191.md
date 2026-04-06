# Review: TASK-191 — Fix — старая шапка не стирается при удалении колонки

**Дата**: 2026-04-06
**Вердикт**: **APPROVED**

## Findings
### Critical / Warning — нет

### Nit
- Mock `resetColumnHeaderStyles` — plain `() => {}` вместо `vi.fn()`
- Связь между reset и apply properties неявная

## Резюме
Минимальный, точный фикс. Reset всех header'ов перед re-apply. Тесты покрывают.
