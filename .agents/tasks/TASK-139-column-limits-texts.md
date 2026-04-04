# TASK-139: Вынести тексты column-limits в TEXTS

**Status**: DONE  
**Epic**: [EPIC-13](./EPIC-13-i18n-di-localization.md)  
**Phase**: 2 - column-limits i18n  
**Depends on**: TASK-138

---

## Цель

Вынести все hardcoded тексты в column-limits в локализуемые TEXTS объекты.

---

## Тексты для выноса

### ColumnLimitsForm.tsx

| Текст | Ключ |
|-------|------|
| "Limit for group:" | `limitForGroup` |
| "Swimlanes" | `swimlanes` |
| "All swimlanes" | `allSwimlanes` |
| "Without Group" | `withoutGroup` |
| "Drag column over here to create group" | `dragColumnToCreateGroup` |

### SettingsModalContainer.tsx

| Текст | Ключ |
|-------|------|
| "Limits for groups" | `modalTitle` |

### ColorPickerButton.tsx

| Текст | Ключ |
|-------|------|
| "Select color {color}" | `selectColor` (шаблон) |

### SettingsModal.tsx (общий)

| Текст | Ключ |
|-------|------|
| "Save" | `save` |
| "Cancel" | `cancel` |

---

## Реализация

### 1. Создать файл текстов

```typescript
// src/column-limits/SettingsPage/texts.ts
import type { Texts } from 'src/shared/texts';

export const COLUMN_LIMITS_TEXTS = {
  modalTitle: {
    en: 'Limits for groups',
    ru: 'Лимиты для групп',
  },
  limitForGroup: {
    en: 'Limit for group:',
    ru: 'Лимит для группы:',
  },
  swimlanes: {
    en: 'Swimlanes',
    ru: 'Свимлейны',
  },
  allSwimlanes: {
    en: 'All swimlanes',
    ru: 'Все свимлейны',
  },
  withoutGroup: {
    en: 'Without Group',
    ru: 'Без группы',
  },
  dragColumnToCreateGroup: {
    en: 'Drag column over here to create group',
    ru: 'Перетащите колонку сюда для создания группы',
  },
  selectColor: {
    en: 'Select color',
    ru: 'Выберите цвет',
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

export type ColumnLimitsTextKeys = keyof typeof COLUMN_LIMITS_TEXTS;
```

### 2. Обновить компоненты

В каждом компоненте:
```typescript
import { useGetTextsByLocale } from 'src/shared/texts';
import { COLUMN_LIMITS_TEXTS } from '../texts';

const MyComponent = () => {
  const texts = useGetTextsByLocale(COLUMN_LIMITS_TEXTS);
  
  return <span>{texts.limitForGroup}</span>;
};
```

---

## Acceptance Criteria

- [ ] Создан файл `src/column-limits/SettingsPage/texts.ts`
- [ ] Все тексты имеют en и ru версии
- [ ] `ColumnLimitsForm.tsx` использует `useGetTextsByLocale`
- [ ] `SettingsModalContainer.tsx` использует `useGetTextsByLocale`
- [ ] `ColorPickerButton.tsx` использует `useGetTextsByLocale`
- [ ] Все Cypress тесты column-limits проходят
- [ ] ESLint без ошибок

---

## Результаты

**Дата**: 2026-03-04

**Агент**: Coder

**Статус**: DONE

**Что сделано**:
- Создан `src/column-limits/SettingsPage/texts.ts` с COLUMN_LIMITS_TEXTS (modalTitle, limitForGroup, swimlanes, allSwimlanes, withoutGroup, dragColumnToCreateGroup, selectColor, save, cancel)
- `ColumnLimitsForm.tsx` — использует useGetTextsByLocale, передаёт texts в ColumnGroup и CreateGroupDropzone
- `SettingsModalContainer.tsx` — использует useGetTextsByLocale для modalTitle, save, cancel
- `SettingsModal.tsx` — добавлен cancelButtonText prop
- `ColorPickerButton.tsx` — добавлен selectColorText prop для aria-label
- Обёртка WithDi в `index.ts` (Settings page) и в Cypress helpers (mountModal, mountButton)
- SettingsModalContainer.test.tsx — обёрнут в WithDi, добавлен registerTestDependencies
- Все Cypress тесты (SettingsPage: 32, BoardPage: 14) и vitest (57) проходят
