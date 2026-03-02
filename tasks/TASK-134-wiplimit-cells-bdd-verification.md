# TASK-134: WipLimit Cells BDD Verification

**Status**: TODO  
**Epic**: [EPIC-12](./EPIC-12-wiplimit-cells-bdd-refactoring.md)  
**Phase**: 3 - Verification  
**Depends on**: TASK-123, TASK-133

---

## Цель

Верифицировать что все BDD тесты проходят после рефакторинга.

---

## Чеклист

### 1. SettingsPage тесты

```bash
npx cypress run --component --spec "src/wiplimit-on-cells/SettingsPage/features/**/*.cy.tsx"
```

| Feature | Сценарии | Статус |
|---------|----------|--------|
| modal-lifecycle | SC-MODAL-1..4 (4) | [ ] |
| add-range | SC-ADD-1..3, SC-CELL-1..4 (7) | [ ] |
| validation | SC-VALID-1..2 (2) | [ ] |
| edit-range | SC-EDIT-1..4 (4) | [ ] |
| delete | SC-DELETE-1..2, SC-CLEAR-1 (3) | [ ] |
| persistence | SC-PERSIST-1..2, SC-COMPAT-1 (3) | [ ] |
| show-badge | SC-BADGE-1..2, SC-EMPTY-1 (3) | [ ] |

**Всего SettingsPage**: 26 сценариев

### 2. BoardPage тесты

```bash
npx cypress run --component --spec "src/wiplimit-on-cells/BoardPage/features/**/*.cy.tsx"
```

| Feature | Сценарии | Статус |
|---------|----------|--------|
| badge-display | SC-BADGE-1..2 (2) | [ ] |
| color-indicators | SC-COLOR-1..3 (3) | [ ] |
| cell-background | SC-BG-1..2 (2) | [ ] |
| dashed-borders | SC-BORDER-1..4 (4) | [ ] |
| disabled-range | SC-DISABLE-1..2 (2) | [ ] |
| issue-type-filter | SC-FILTER-1..2 (2) | [ ] |
| multiple-ranges | SC-MULTI-1, SC-UPDATE-1..2 (3) | [ ] |
| edge-cases | SC-EDGE-1..2 (2) | [ ] |

**Всего BoardPage**: 20 сценариев

### 3. Старые файлы удалены

- [ ] `src/wiplimit-on-cells/SettingsPage/SettingsPage.feature` — удален
- [ ] `src/wiplimit-on-cells/SettingsPage/SettingsPage.feature.cy.tsx` — удален
- [ ] `src/wiplimit-on-cells/BoardPage/board.feature` — удален
- [ ] `src/wiplimit-on-cells/BoardPage/board.feature.cy.tsx` — удален

### 4. Lint

```bash
npm run lint:eslint -- src/wiplimit-on-cells/**/features/**
```

- [ ] Нет ошибок ESLint

### 5. TypeScript

```bash
npx tsc --noEmit
```

- [ ] Нет ошибок TypeScript

---

## Acceptance Criteria

- [ ] Все 46 сценариев проходят (26 + 20)
- [ ] Старые файлы удалены
- [ ] Нет ошибок lint/typescript
- [ ] CI проходит

---

## Результаты

**Дата**: _заполнить_

**Агент**: _Coder / Manual_

**Статус**: _TODO / DONE_

**Комментарии**:

_Результаты верификации_
