# TASK-140: Вынести тексты person-limits в TEXTS

**Status**: DONE  
**Epic**: [EPIC-13](./EPIC-13-i18n-di-localization.md)  
**Phase**: 3 - person-limits i18n  
**Depends on**: TASK-138

---

## Цель

Вынести все hardcoded тексты в person-limits в локализуемые TEXTS объекты.

---

## Тексты для выноса

### PersonalWipLimitContainer.tsx

| Текст | Ключ |
|-------|------|
| "Person JIRA name" | `personJiraName` |
| "Max issues at work" | `maxIssuesAtWork` |
| "Select a person" | `selectPerson` |
| "Limit must be at least 1" | `limitMinError` |
| "Columns" | `columns` |
| "Swimlanes" | `swimlanes` |
| (уже есть avatarWarning) | `avatarWarning` |

### PersonalWipLimitTable.tsx

| Текст | Ключ |
|-------|------|
| "Person" | `person` |
| "Limit" | `limit` |
| "Columns" | `columns` |
| "Swimlanes" | `swimlanes` |
| "Issue Types" | `issueTypes` |
| "Actions" | `actions` |
| "Edit" | `edit` |
| "Delete" | `delete` |
| "All columns" | `allColumns` |
| "All swimlanes" | `allSwimlanes` |
| "All types" | `allTypes` |

### SettingsModalContainer.tsx

| Текст | Ключ |
|-------|------|
| "Personal WIP Limit" | `modalTitle` |

### SettingsModal.tsx (общий)

| Текст | Ключ |
|-------|------|
| "Save" | `save` |
| "Cancel" | `cancel` |

---

## Реализация

### 1. Создать файл текстов

```typescript
// src/person-limits/SettingsPage/texts.ts
import type { Texts } from 'src/shared/texts';

export const PERSON_LIMITS_TEXTS = {
  modalTitle: {
    en: 'Personal WIP Limit',
    ru: 'WIP-лимиты на человека',
  },
  personJiraName: {
    en: 'Person JIRA name',
    ru: 'Имя пользователя в JIRA',
  },
  maxIssuesAtWork: {
    en: 'Max issues at work',
    ru: 'Максимум задач в работе',
  },
  selectPerson: {
    en: 'Select a person',
    ru: 'Выберите человека',
  },
  limitMinError: {
    en: 'Limit must be at least 1',
    ru: 'Лимит должен быть не меньше 1',
  },
  columns: {
    en: 'Columns',
    ru: 'Колонки',
  },
  swimlanes: {
    en: 'Swimlanes',
    ru: 'Свимлейны',
  },
  avatarWarning: {
    en: 'To work correctly, the person must have a Jira avatar.',
    ru: 'Чтобы WIP-лимиты на человека работали корректно, у пользователя должен быть установлен аватар.',
  },
  person: {
    en: 'Person',
    ru: 'Человек',
  },
  limit: {
    en: 'Limit',
    ru: 'Лимит',
  },
  issueTypes: {
    en: 'Issue Types',
    ru: 'Типы задач',
  },
  actions: {
    en: 'Actions',
    ru: 'Действия',
  },
  edit: {
    en: 'Edit',
    ru: 'Редактировать',
  },
  delete: {
    en: 'Delete',
    ru: 'Удалить',
  },
  allColumns: {
    en: 'All columns',
    ru: 'Все колонки',
  },
  allSwimlanes: {
    en: 'All swimlanes',
    ru: 'Все свимлейны',
  },
  allTypes: {
    en: 'All types',
    ru: 'Все типы',
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

- [ ] Создан файл `src/person-limits/SettingsPage/texts.ts`
- [ ] Все тексты имеют en и ru версии
- [ ] `PersonalWipLimitContainer.tsx` использует `useGetTextsByLocale`
- [ ] `PersonalWipLimitTable.tsx` использует `useGetTextsByLocale`
- [ ] `SettingsModalContainer.tsx` использует `useGetTextsByLocale`
- [ ] Все Cypress тесты person-limits проходят
- [ ] ESLint без ошибок

---

## Результаты

**Дата**: 2026-03-04

**Агент**: Coder

**Статус**: DONE

**Что сделано**:
- Создан `src/person-limits/SettingsPage/texts.ts` с PERSON_LIMITS_TEXTS (modalTitle, personJiraName, maxIssuesAtWork, selectPerson, limitMinError, columns, swimlanes, avatarWarning, person, limit, issueTypes, actions, edit, delete, allColumns, allSwimlanes, allTypes, save, cancel, addLimit, updateLimit)
- PersonalWipLimitContainer.tsx: заменены все hardcoded тексты на useGetTextsByLocale(PERSON_LIMITS_TEXTS)
- PersonalWipLimitTable.tsx: принимает texts как props, использует для заголовков и кнопок
- SettingsModalContainer.tsx: modalTitle, save, cancel через useGetTextsByLocale
- SettingsModal.tsx: добавлен cancelButtonText prop
- person-limits index.tsx: обёртка WithDi для SettingsButtonContainer
- helpers.tsx: WithDi при mountComponent и mountSettingsButton
- Cypress тесты: WithDi + globalContainer setup в PersonalWipLimitContainer.cy.tsx и SettingsModalContainer.cy.tsx
- Feature steps: colDisplay/swimDisplay/issueDisplay для "all" → "All columns"/"All swimlanes"/"All types"
- edit-limit.feature: "Edit limit" → "Update limit"
- Все 76 Cypress тестов SettingsPage + 15 BoardPage проходят
- ESLint без ошибок
