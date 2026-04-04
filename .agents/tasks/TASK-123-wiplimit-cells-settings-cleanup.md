# TASK-123: Cleanup старых файлов SettingsPage

**Status**: TODO  
**Epic**: [EPIC-12](./EPIC-12-wiplimit-cells-bdd-refactoring.md)  
**Phase**: 1 - SettingsPage Refactoring  
**Depends on**: TASK-116..122

---

## Цель

Удалить старые файлы SettingsPage после успешного рефакторинга.

## Удаляемые файлы

```bash
rm src/wiplimit-on-cells/SettingsPage/SettingsPage.feature
rm src/wiplimit-on-cells/SettingsPage/SettingsPage.feature.cy.tsx
```

## Pre-conditions

- [ ] Все 26 сценариев в новых feature файлах проходят
- [ ] Нет дублирования кода

## Acceptance Criteria

- [ ] Старые файлы удалены
- [ ] CI проходит
