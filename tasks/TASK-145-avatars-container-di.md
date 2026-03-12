# TASK-145: AvatarsContainer — использовать DI для генерации avatar URL

**Status**: DONE

**Parent**: [EPIC-15](./EPIC-15-dynamic-avatars.md)

---

## Описание

Обновить `AvatarsContainer` чтобы он получал функцию `buildAvatarUrl` через DI и генерировал URL аватарок, вместо использования сохранённого `stat.person.avatar`. `AvatarBadge` остаётся презентационным компонентом.

## Файлы

```
src/person-limits/BoardPage/components/
└── AvatarsContainer.tsx    # изменение
```

## Что сделать

1. Импортировать DI:
   ```typescript
   import { useDi } from 'src/shared/di';
   import { buildAvatarUrlToken } from 'src/shared/di/jiraApiTokens';
   ```

2. Получить функцию через DI в компоненте:
   ```typescript
   export const AvatarsContainer: React.FC = () => {
     const container = useDi();
     const buildAvatarUrl = container.inject(buildAvatarUrlToken);
     // ...
   };
   ```

3. Генерировать avatar URL при рендере:
   ```typescript
   <AvatarBadge
     avatar={buildAvatarUrl(stat.person.name)}  // вместо stat.person.avatar
     // ...остальные props
   />
   ```

4. `AvatarBadge.tsx` — **без изменений** (уже принимает `avatar` prop)

## Код до/после

**До:**
```typescript
<AvatarBadge
  avatar={stat.person.avatar}
  personName={stat.person.name}
  // ...
/>
```

**После:**
```typescript
const buildAvatarUrl = container.inject(buildAvatarUrlToken);
// ...
<AvatarBadge
  avatar={buildAvatarUrl(stat.person.name)}
  personName={stat.person.name}
  // ...
/>
```

## Критерии приёмки

- [ ] `AvatarsContainer` использует `useDi()` для получения `buildAvatarUrlToken`
- [ ] Avatar URL генерируется динамически из `person.name`
- [ ] `stat.person.avatar` больше не используется
- [ ] `AvatarBadge` остаётся без изменений
- [ ] Тесты проходят
- [ ] Нет ошибок линтера

## Зависимости

- Зависит от: [TASK-143](./TASK-143-build-avatar-url-utility.md) — токен должен быть создан
- Зависит от: [TASK-144](./TASK-144-update-person-limits-types.md) — типы обновлены

---

## Результаты

**Дата**: 2025-03-10

**Агент**: Coder

**Статус**: DONE

**Что сделано**:
- `AvatarsContainer.tsx` — добавлены `useDi()` и `buildAvatarUrlToken`, avatar URL генерируется через `buildAvatarUrl(stat.person.name)`
- `BoardPage/index.ts` — AvatarsContainer обёрнут в `WithDi` с `globalContainer` для DI-контекста
- `BoardPage/features/helpers.tsx` — добавлены `WithDi` и `registerJiraApiInDI` для Cypress-тестов

**Проблемы и решения**:
- AvatarsContainer требует DiContext — BoardPage и Cypress helpers обёрнуты в WithDi
