# TASK-141: Вынести тексты wiplimit-on-cells в TEXTS

**Status**: DONE  
**Epic**: [EPIC-13](./EPIC-13-i18n-di-localization.md)  
**Phase**: 4 - wiplimit-on-cells i18n  
**Depends on**: TASK-138

---

## Цель

Вынести все hardcoded тексты в wiplimit-on-cells в локализуемые TEXTS объекты.

---

## Тексты для выноса

### RangeForm.tsx

| Текст | Ключ |
|-------|------|
| "Add range" | `addRange` |
| "name" (placeholder) | `namePlaceholder` |
| "Add cell" | `addCell` |
| "swimlane" | `swimlane` |
| "Column" | `column` |
| "show indicator" | `showIndicator` |
| "Select swimlane" | `selectSwimlane` |
| "Select Column" | `selectColumn` |
| "Enter range name" | `enterRangeName` |

### RangeTable.tsx

| Текст | Ключ |
|-------|------|
| "Edit column" (aria-label) | `editColumn` |
| "Range name" | `rangeName` |
| "WIP limit" | `wipLimit` |
| "Disable" | `disable` |
| "Cells (swimlane/column)" | `cellsHeader` |

### RangeRow.tsx

| Текст | Ключ |
|-------|------|
| "Select range {name} for editing" | `selectRangeForEditing` |
| "Range name for {name}" | `rangeNameFor` |
| "Delete range {name}" | `deleteRange` |
| "WIP limit for {name}" | `wipLimitFor` |
| "Disable range {name}" | `disableRange` |

### SettingsModalContainer.tsx

| Текст | Ключ |
|-------|------|
| "Edit WipLimit on cells" | `modalTitle` |

### SettingsModal.tsx

| Текст | Ключ |
|-------|------|
| "Save" | `save` |
| "Cancel" | `cancel` |

---

## Реализация

### 1. Создать файл текстов

```typescript
// src/wiplimit-on-cells/SettingsPage/texts.ts
import type { Texts } from 'src/shared/texts';

export const WIPLIMIT_CELLS_TEXTS = {
  modalTitle: {
    en: 'Edit WipLimit on cells',
    ru: 'Редактирование WIP-лимитов на ячейки',
  },
  addRange: {
    en: 'Add range',
    ru: 'Добавить диапазон',
  },
  namePlaceholder: {
    en: 'name',
    ru: 'название',
  },
  addCell: {
    en: 'Add cell',
    ru: 'Добавить ячейку',
  },
  swimlane: {
    en: 'Swimlane',
    ru: 'Свимлейн',
  },
  column: {
    en: 'Column',
    ru: 'Колонка',
  },
  showIndicator: {
    en: 'show indicator',
    ru: 'показывать индикатор',
  },
  selectSwimlane: {
    en: 'Select swimlane',
    ru: 'Выберите свимлейн',
  },
  selectColumn: {
    en: 'Select Column',
    ru: 'Выберите колонку',
  },
  enterRangeName: {
    en: 'Enter range name',
    ru: 'Введите название диапазона',
  },
  rangeName: {
    en: 'Range name',
    ru: 'Название диапазона',
  },
  wipLimit: {
    en: 'WIP limit',
    ru: 'WIP-лимит',
  },
  disable: {
    en: 'Disable',
    ru: 'Отключить',
  },
  cellsHeader: {
    en: 'Cells (swimlane/column)',
    ru: 'Ячейки (свимлейн/колонка)',
  },
  save: {
    en: 'Save',
    ru: 'Сохранить',
  },
  cancel: {
    en: 'Cancel',
    ru: 'Отмена',
  },
} as const satisfies Texts;
```

---

## Acceptance Criteria

- [ ] Создан файл `src/wiplimit-on-cells/SettingsPage/texts.ts`
- [ ] Все тексты имеют en и ru версии
- [ ] `RangeForm.tsx` использует `useGetTextsByLocale`
- [ ] `RangeTable.tsx` использует `useGetTextsByLocale`
- [ ] `RangeRow.tsx` использует `useGetTextsByLocale`
- [ ] `SettingsModalContainer.tsx` использует `useGetTextsByLocale`
- [ ] Все Cypress тесты wiplimit-on-cells проходят
- [ ] ESLint без ошибок

---

## Результаты

**Дата**: 2026-03-04

**Агент**: Coder

**Статус**: DONE

**Что сделано**:
- Создан `src/wiplimit-on-cells/SettingsPage/texts.ts` с WIPLIMIT_CELLS_TEXTS (en/ru)
- RangeForm.tsx: useGetTextsByLocale для addRange, namePlaceholder, addCell, swimlane, column, showIndicator, selectSwimlane, selectColumn, enterRangeName
- RangeTable.tsx: useGetTextsByLocale для rangeName, wipLimit, disable, cellsHeader, editColumn
- RangeRow.tsx: aria-labels оставлены на английском (accessibility)
- SettingsModalContainer.tsx: texts.modalTitle, texts.save, texts.cancel
- SettingsModal.tsx: добавлен cancelButtonText prop
- index.tsx: WithDi обёртка с globalContainer
- Cypress helpers: WithDi, globalContainer.reset(), registerLogger, MockLocaleProvider('en')
- RangeForm.cy.tsx, RangeTable.cy.tsx: WithDi + beforeEach DI setup
- Feature файлы: "swimlane" → "Swimlane" для соответствия texts
- common.steps.ts: "swimlane" → "Swimlane" в When step
- Cypress тесты: 52 SettingsPage + 20 BoardPage = 72 passing
- ESLint без ошибок, build проходит
