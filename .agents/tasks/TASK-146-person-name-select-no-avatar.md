# TASK-146: PersonNameSelect — не сохранять avatar в onChange

**Status**: DONE

**Parent**: [EPIC-15](./EPIC-15-dynamic-avatars.md)

---

## Описание

Обновить `PersonNameSelect` чтобы он не сохранял `avatar` при выборе пользователя. Avatar теперь генерируется динамически, сохранение не нужно.

## Файлы

```
src/person-limits/SettingsPage/components/
├── PersonNameSelect.tsx              # изменение
├── PersonNameSelect.stories.tsx      # изменение (моки)
└── PersonalWipLimitContainer.cy.tsx  # изменение (моки)

src/person-limits/SettingsPage/features/
└── helpers.tsx                       # изменение (моки)
```

## Что сделать

1. В `PersonNameSelect.tsx` — убрать `avatar` из `handleSelect`:
   ```typescript
   const handleSelect = useCallback(
     (_: unknown, option: any) => {
       const user = options.find(u => u.name === option.key);
       if (user && onChange) {
         onChange({
           name: user.name,
           displayName: user.displayName,
           // avatar НЕ сохраняем
           self: user.self,
         });
       }
     },
     [options, onChange]
   );
   ```

2. Обновить моки в stories и тестах — убрать `avatar` из `SelectedPerson`:
   ```typescript
   // Было:
   { name: 'john', displayName: 'John', avatar: 'url', self: '...' }
   
   // Стало:
   { name: 'john', displayName: 'John', self: '...' }
   ```

## Код до/после

**До:**
```typescript
onChange({
  name: user.name,
  displayName: user.displayName,
  avatar: user.avatarUrls?.['32x32'] || user.avatarUrls?.['16x16'] || '',
  self: user.self,
});
```

**После:**
```typescript
onChange({
  name: user.name,
  displayName: user.displayName,
  self: user.self,
});
```

## Критерии приёмки

- [ ] `handleSelect` не сохраняет `avatar`
- [ ] Моки в stories обновлены
- [ ] Моки в Cypress тестах обновлены
- [ ] Моки в helpers.tsx обновлены
- [ ] Тесты проходят
- [ ] Нет ошибок линтера

## Зависимости

- Зависит от: [TASK-144](./TASK-144-update-person-limits-types.md) — `SelectedPerson` без avatar

---

## Результаты

**Дата**: 2026-03-10

**Агент**: Coder

**Статус**: DONE

**Что сделано**:
- Проверено: `handleSelect` в PersonNameSelect уже не передаёт avatar (было исправлено ранее)
- Удалён avatar из моков PersonLimit в PersonalWipLimitContainer.cy.tsx (12 мест)
- Удалён avatar из mockPerson в onAddLimitMock callback
- Удалён avatar из common.steps.ts (person в Given step)
- TypeScript, ESLint, unit-тесты person-limits, Cypress PersonalWipLimitContainer — все проходят

**Проблемы и решения**:
