# TASK-7: Переписать Stories на React-компоненты

**Status**: DONE

**Parent**: [EPIC-2](./EPIC-2-person-limits-react-migration.md)

---

## Описание

Переписать `PersonLimitsSettings.stories.tsx` — заменить legacy HTML-based stories (использующие `tablePersonalWipLimit()` и `addPersonalWipLimit()`) на React-компоненты. Stories должны демонстрировать `PersonalWipLimitContainer` с подготовленными данными в store.

## Файлы

```
src/person-limits/SettingsPage/
└── PersonLimitsSettings.stories.tsx    # изменение (полная перезапись)
```

## Что сделать

1. Удалить импорты из `htmlTemplates`:
   ```typescript
   // Удалить:
   import { tablePersonalWipLimit, addPersonalWipLimit } from './htmlTemplates';
   ```

2. Заменить `PersonLimitsSettingsDemo` (DOM-based) на React-компонент:
   ```typescript
   import React from 'react';
   import type { Meta, StoryObj } from '@storybook/react';
   import { fn } from '@storybook/test';
   import { PersonalWipLimitContainer } from './components/PersonalWipLimitContainer';
   import { useSettingsUIStore } from './stores/settingsUIStore';
   import type { PersonLimit } from './state/types';
   ```

3. Создать обёртку для stories, которая инициализирует store:
   ```typescript
   const PersonLimitsDemo: React.FC<{ limits?: PersonLimit[] }> = ({ limits = [] }) => {
     React.useEffect(() => {
       useSettingsUIStore.getState().actions.reset();
       if (limits.length > 0) {
         useSettingsUIStore.getState().actions.setData(limits);
       }
     }, [limits]);

     return (
       <PersonalWipLimitContainer
         columns={defaultColumns}
         swimlanes={defaultSwimlanes}
         onAddLimit={fn()}
       />
     );
   };
   ```

4. Создать stories:
   - `EmptyState` — пустой store
   - `SingleLimit` — один лимит
   - `MultipleLimits` — несколько лимитов
   - `WithIssueTypeFilter` — лимиты с фильтром по типам задач

## Код до/после

```typescript
// До — DOM manipulation:
const PersonLimitsSettingsDemo: React.FC<Props> = ({ limits }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    container.innerHTML = tablePersonalWipLimit();
    limits.forEach(limit => {
      tbody.innerHTML += addPersonalWipLimit(limit, false);
    });
  }, [limits]);
  return <div ref={containerRef} />;
};

// После — React компоненты:
const PersonLimitsDemo: React.FC<Props> = ({ limits = [] }) => {
  useEffect(() => {
    useSettingsUIStore.getState().actions.reset();
    useSettingsUIStore.getState().actions.setData(limits);
  }, [limits]);
  return <PersonalWipLimitContainer columns={columns} swimlanes={swimlanes} onAddLimit={fn()} />;
};
```

## Критерии приёмки

- [ ] Stories не используют `htmlTemplates`
- [ ] Stories используют React-компоненты (`PersonalWipLimitContainer`)
- [ ] Нет DOM-manipulation (`innerHTML`, `insertAdjacentHTML`)
- [ ] Stories: EmptyState, SingleLimit, MultipleLimits, WithIssueTypeFilter
- [ ] Storybook отображает все stories корректно
- [ ] Тесты проходят: `npm test`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Зависит от: [TASK-1](./TASK-1-extract-constants.md) (для корректных импортов в компонентах)
- Блокирует: [TASK-8](./TASK-8-delete-html-templates.md)
- Референс: `src/column-limits/SettingsPage/ColumnLimitsSettings.stories.tsx`

---

## Результаты

**Дата**: 2026-02-11

**Агент**: Coder

**Статус**: DONE

**Комментарии**:

Переписан файл `PersonLimitsSettings.stories.tsx`:
- Удалены импорты из `htmlTemplates` (`tablePersonalWipLimit`, `addPersonalWipLimit`)
- Удалена DOM-manipulation логика (`innerHTML`, `insertAdjacentHTML`)
- Создан React-компонент `PersonLimitsDemo`, использующий `PersonalWipLimitContainer`
- Компонент инициализирует `useSettingsUIStore` через `useEffect`
- Созданы stories: `EmptyState`, `SingleLimit`, `MultipleLimits`, `WithIssueTypeFilter`
- Все stories используют React-компоненты вместо HTML templates
- Добавлены mock данные для `columns` и `swimlanes`
- Используется `fn()` из `@storybook/test` для callbacks
