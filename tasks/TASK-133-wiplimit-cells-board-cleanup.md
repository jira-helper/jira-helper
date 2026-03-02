# TASK-133: Cleanup старых файлов BoardPage

**Status**: TODO  
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
