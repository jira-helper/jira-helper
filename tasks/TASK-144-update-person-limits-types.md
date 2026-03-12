# TASK-144: Обновить типы Person Limits

**Status**: DONE

**Parent**: [EPIC-15](./EPIC-15-dynamic-avatars.md)

---

## Описание

Обновить типы в person-limits: сделать `avatar` optional в property типах, удалить из runtime и settings типов. Это позволит постепенно перейти на динамическую генерацию URL.

## Файлы

```
src/person-limits/
├── property/
│   └── types.ts                          # изменение
├── BoardPage/stores/
│   └── runtimeStore.types.ts             # изменение
└── SettingsPage/stores/
    └── settingsUIStore.types.ts          # изменение
```

## Что сделать

1. В `property/types.ts` — сделать `avatar` optional с JSDoc:
   ```typescript
   person: {
     name: string;
     displayName?: string;
     self: string;
     /** 
      * @deprecated Avatar URL is now generated dynamically from `name`.
      * Kept optional for backward compatibility.
      */
     avatar?: string;  // было: avatar: string
   };
   ```

2. В `runtimeStore.types.ts` — удалить `avatar` из `PersonLimitStats.person`:
   ```typescript
   person: {
     name: string;
     displayName?: string;
     // avatar удалён
   };
   ```

3. В `settingsUIStore.types.ts` — удалить `avatar` из `SelectedPerson`:
   ```typescript
   export type SelectedPerson = {
     name: string;
     displayName: string;
     // avatar удалён
     self: string;
   };
   ```

4. Исправить TypeScript ошибки в затронутых файлах (если появятся)

## Критерии приёмки

- [ ] `PersonLimit.person.avatar` — optional с @deprecated
- [ ] `PersonLimitStats.person` — без avatar
- [ ] `SelectedPerson` — без avatar
- [ ] TypeScript компилируется без ошибок
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Блокирует: [TASK-145](./TASK-145-avatars-container-di.md)
- Блокирует: [TASK-146](./TASK-146-person-name-select-no-avatar.md)

---

## Результаты

**Дата**: 2026-03-10

**Агент**: Coder

**Статус**: DONE

**Что сделано**:

- `PersonLimit.person.avatar` сделан optional с @deprecated JSDoc в `property/types.ts`
- `PersonLimitStats.person` — удалён avatar в `runtimeStore.types.ts`
- `SelectedPerson` — удалён avatar в `settingsUIStore.types.ts`
- Обновлены зависимые файлы: `settingsUIStore.ts`, `createPersonLimit.ts`, `updatePersonLimit.ts`, `SettingsModalContainer.tsx`, `PersonNameSelect.tsx`, `AvatarsContainer.tsx`, `BoardPage/index.ts`, `features/helpers.tsx`
- `AvatarsContainer` временно передаёт пустую строку в `AvatarBadge` (до TASK-145 с динамической генерацией URL)
- Исправлены тесты и stories: `createPersonLimit.test.ts`, `updatePersonLimit.test.ts`, `initFromProperty.test.ts`, `personalWipLimitsStore.test.ts`, `PersonNameSelect.stories.tsx`

**Проблемы и решения**:

- Удаление avatar из SelectedPerson потребовало обновления всех мест, где создаётся или передаётся FormData.person
