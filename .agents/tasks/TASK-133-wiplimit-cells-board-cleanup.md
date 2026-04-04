# TASK-133: Cleanup старых файлов BoardPage

**Status**: DONE  
**Epic**: [EPIC-12](./EPIC-12-wiplimit-cells-bdd-refactoring.md)  
**Phase**: 2 - BoardPage Refactoring  
**Depends on**: TASK-125..132

---

## Цель

Удалить старые файлы BoardPage после успешного рефакторинга.

## Удаляемые файлы

```bash
rm src/wiplimit-on-cells/BoardPage/board.feature
rm src/wiplimit-on-cells/BoardPage/board.feature.cy.tsx
```

## Pre-conditions

- [ ] Все 20 сценариев в новых feature файлах проходят
- [ ] Нет дублирования кода

## Acceptance Criteria

- [ ] Старые файлы удалены
- [ ] CI проходит

---

## Результаты

**Дата**: 2026-03-04

**Агент**: Coder

**Статус**: DONE

**Что сделано**:

- Проверены все 20 новых сценариев — все прошли
- Удалены старые файлы: `board.feature`, `board.feature.cy.tsx`
- Повторный прогон тестов — успешен
- ESLint — без ошибок

**Проблемы и решения**:

Проблем не возникло.
