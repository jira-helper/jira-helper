# План реализации: Отображение связей в беклоге

## Обзор изменений

Добавление возможности отображать связи между задачами не только на доске, но и в беклоге с отдельной настройкой `showInBacklog` и горизонтальным расположением бейджей.

## Этапы реализации

### Этап 1: Обновление типов и хранилища

#### 1.1. Обновление типа `AdditionalCardElementsBoardProperty`
**Файл**: `src/features/additional-card-elements/types.ts`

- [ ] Добавить поле `showInBacklog?: boolean` в тип `AdditionalCardElementsBoardProperty`
- [ ] Обновить документацию типа

**Пример**:
```typescript
export type AdditionalCardElementsBoardProperty = {
  enabled?: boolean;
  columnsToTrack?: string[];
  showInBacklog?: boolean; // NEW
  issueLinks?: IssueLink[];
};
```

#### 1.2. Обновление начального состояния стора
**Файл**: `src/features/additional-card-elements/stores/additionalCardElementsBoardProperty.ts`

- [ ] Добавить `showInBacklog: false` в `initialData`
- [ ] Добавить action `setShowInBacklog` в стор
- [ ] Обновить метод `setData` для поддержки `showInBacklog`
- [ ] Обновить `getInitialState` для тестов

**Пример**:
```typescript
const initialData: Required<AdditionalCardElementsBoardProperty> = {
  enabled: false,
  columnsToTrack: [],
  showInBacklog: false, // NEW
  issueLinks: [],
};

// Добавить action:
setShowInBacklog: (showInBacklog: boolean) =>
  set(
    produce((state: State) => {
      state.data.showInBacklog = showInBacklog;
    })
  ),
```

#### 1.3. Обновление загрузки данных
**Файл**: `src/features/additional-card-elements/BoardSettings/actions/loadAdditionalCardElementsBoardProperty.ts`

- [ ] Убедиться, что `showInBacklog` корректно загружается из Board Property
- [ ] Убедиться, что значение по умолчанию `false` применяется, если поле отсутствует

### Этап 2: Обновление UI настроек

#### 2.1. Добавление чекбокса "Показывать в беклоге"
**Файл**: `src/features/additional-card-elements/BoardSettings/AdditionalCardElementsSettings.tsx`

- [ ] Добавить тексты для чекбокса (en/ru)
- [ ] Добавить чекбокс после блока выбора колонок
- [ ] Связать чекбокс с `data.showInBacklog` и `actions.setShowInBacklog`
- [ ] Добавить tooltip с описанием функции
- [ ] Добавить `data-testid` для тестирования

**Расположение**: После блока `ColumnSelectorContainer`, перед `Divider` перед `IssueLinkSettings`

**Пример структуры**:
```tsx
{/* Column Settings */}
<div style={{ marginBottom: '24px' }}>
  <ColumnSelectorContainer ... />
</div>

{/* Show in Backlog */}
<div style={{ marginBottom: '24px' }}>
  <Checkbox
    checked={data.showInBacklog}
    onChange={() => actions.setShowInBacklog(!data.showInBacklog)}
    data-testid="show-in-backlog-checkbox"
  >
    {texts.showInBacklog}
    <Tooltip title={texts.showInBacklogTooltip}>
      <InfoCircleOutlined style={{ marginLeft: '4px' }} />
    </Tooltip>
  </Checkbox>
</div>

<Divider />
```

#### 2.2. Обновление текстов
**Файл**: `src/features/additional-card-elements/BoardSettings/AdditionalCardElementsSettings.tsx`

- [ ] Добавить в `TEXTS`:
  - `showInBacklog` (en/ru)
  - `showInBacklogTooltip` (en/ru)

**Пример**:
```typescript
showInBacklog: {
  en: 'Show links in backlog',
  ru: 'Показывать связи в беклоге',
},
showInBacklogTooltip: {
  en: 'If enabled, issue links will be displayed on cards in the backlog view',
  ru: 'Если включено, связи задач будут отображаться на карточках в беклоге',
},
```

#### 2.3. Обновление сброса настроек
**Файл**: `src/features/additional-card-elements/BoardSettings/AdditionalCardElementsSettings.tsx`

- [ ] Добавить `showInBacklog: false` в `handleResetSettings`

### Этап 3: Создание компонента для беклога

#### 3.1. Создание `AdditionalCardElementsBacklogContainer`
**Файл**: `src/features/additional-card-elements/AdditionalCardElementsBacklogContainer/AdditionalCardElementsBacklogContainer.tsx`

- [ ] Создать компонент аналогично `AdditionalCardElementsContainer`
- [ ] Проверять `settings.enabled` и `settings.showInBacklog`
- [ ] Не проверять колонки (в беклоге нет колонок)
- [ ] Использовать `IssueLinkBadges` с пропом для горизонтального отображения

**Структура**:
```tsx
const AdditionalCardElementsBacklog = (props: { issueId: string }) => {
  const { settings } = useGetSettings();
  const { issueId } = props;
  
  const shouldDisplay = settings?.enabled && settings?.showInBacklog;
  
  // Загрузка данных аналогично BoardPage
  
  if (!shouldDisplay) {
    return null;
  }
  
  return <IssueLinkBadges issueKey={issueId} horizontal />;
};

export const AdditionalCardElementsBacklogContainer = (props: { issueId: string }) => {
  // WithDi wrapper
};
```

#### 3.2. Обновление `IssueLinkBadges` для поддержки горизонтального режима
**Файл**: `src/features/additional-card-elements/IssueLinkBadges/IssueLinkBadges.tsx`

- [ ] Добавить опциональный проп `horizontal?: boolean`
- [ ] Передать проп в `IssueLinkBadge` или обернуть в контейнер с `display: flex; flex-direction: row`
- [ ] Обновить стили для горизонтального отображения (gap, wrap)

**Пример**:
```tsx
export interface IssueLinkBadgesProps {
  issueKey: string;
  horizontal?: boolean; // NEW
}

// В рендере:
<div style={{ 
  display: 'flex', 
  flexDirection: horizontal ? 'row' : 'column',
  gap: '4px',
  flexWrap: horizontal ? 'wrap' : 'nowrap'
}}>
  {links.map(link => (
    <IssueLinkBadge key={link.link} {...link} />
  ))}
</div>
```

### Этап 4: Интеграция в беклог

#### 4.1. Обновление `AdditionalCardElementsBoardBacklogPage`
**Файл**: `src/features/additional-card-elements/BoardBacklogPage.ts`

- [ ] Заменить импорт `AdditionalCardElementsContainer` на `AdditionalCardElementsBacklogContainer`
- [ ] Убедиться, что компонент прикрепляется к карточкам в беклоге

**Изменение**:
```typescript
const { AdditionalCardElementsBacklogContainer } = await import(
  './AdditionalCardElementsBacklogContainer/AdditionalCardElementsBacklogContainer'
);
```

### Этап 5: Тестирование

#### 5.1. Unit тесты для стора
**Файл**: `src/features/additional-card-elements/stores/additionalCardElementsBoardProperty.test.ts`

- [ ] Добавить тест для `setShowInBacklog`
- [ ] Добавить тест для загрузки `showInBacklog` из Board Property
- [ ] Добавить тест для сброса настроек с `showInBacklog`

#### 5.2. Unit тесты для UI
**Файл**: `src/features/additional-card-elements/BoardSettings/AdditionalCardElementsSettings.test.tsx`

- [ ] Добавить тест для отображения чекбокса "Показывать в беклоге"
- [ ] Добавить тест для переключения `showInBacklog`
- [ ] Добавить тест для сброса настроек с `showInBacklog`

#### 5.3. Интеграционные тесты
- [ ] Проверить отображение связей в беклоге при `showInBacklog = true`
- [ ] Проверить отсутствие связей в беклоге при `showInBacklog = false`
- [ ] Проверить горизонтальное расположение бейджей в беклоге

### Этап 6: Документация и стили

#### 6.1. Обновление стилей
- [ ] Убедиться, что горизонтальное отображение корректно работает
- [ ] Проверить адаптивность на разных размерах экрана
- [ ] Убедиться, что бейджи не перекрываются

#### 6.2. Обновление документации
- [ ] Обновить `user-documentation.md` с информацией о беклоге
- [ ] Обновить `release-notes.md` (если необходимо)

## Порядок выполнения

1. **Этап 1** - Обновление типов и хранилища (фундамент)
2. **Этап 2** - Обновление UI настроек (пользовательский интерфейс)
3. **Этап 3** - Создание компонента для беклога (логика отображения)
4. **Этап 4** - Интеграция в беклог (подключение)
5. **Этап 5** - Тестирование (проверка)
6. **Этап 6** - Документация и стили (финализация)

## Важные замечания

1. **Обратная совместимость**: При загрузке старых данных без `showInBacklog` должно использоваться значение по умолчанию `false`

2. **Производительность**: В беклоге может быть много карточек, нужно убедиться, что загрузка данных оптимизирована

3. **Стили**: Горизонтальное отображение должно корректно работать с длинными названиями задач (с учетом `multilineSummary`)

4. **Позиционирование**: В беклоге компонент должен прикрепляться в конец карточки (`.ghx-end`), как указано в `BoardBacklogPagePageObject`

## Файлы для изменения

### Новые файлы:
- `src/features/additional-card-elements/AdditionalCardElementsBacklogContainer/AdditionalCardElementsBacklogContainer.tsx`

### Изменяемые файлы:
- `src/features/additional-card-elements/types.ts`
- `src/features/additional-card-elements/stores/additionalCardElementsBoardProperty.ts`
- `src/features/additional-card-elements/stores/additionalCardElementsBoardProperty.test.ts`
- `src/features/additional-card-elements/BoardSettings/AdditionalCardElementsSettings.tsx`
- `src/features/additional-card-elements/BoardSettings/AdditionalCardElementsSettings.test.tsx`
- `src/features/additional-card-elements/IssueLinkBadges/IssueLinkBadges.tsx`
- `src/features/additional-card-elements/BoardBacklogPage.ts`
- `src/features/additional-card-elements/BoardSettings/actions/loadAdditionalCardElementsBoardProperty.ts`

## Критерии готовности

- [ ] Все типы обновлены
- [ ] Стор поддерживает `showInBacklog`
- [ ] UI настроек содержит чекбокс
- [ ] Компонент для беклога создан и работает
- [ ] Интеграция в беклог выполнена
- [ ] Все тесты проходят
- [ ] Горизонтальное отображение работает корректно
- [ ] Документация обновлена

