# TASK-33: Обновить Storybook stories

**Status**: TODO

**Parent**: [EPIC-3](./EPIC-3-wiplimit-on-cells-refactoring.md)

---

## Описание

Обновить `WipLimitsOnCellsSettings.stories.tsx` для работы с новыми React-компонентами вместо DOM-рендеринга через `useEffect`. Добавить stories для отдельных компонентов если не были созданы ранее.

## Файлы

```
src/wiplimit-on-cells/
├── WipLimitsOnCellsSettings.stories.tsx     # изменение — переписать на React-компоненты
├── SettingsPage/components/
│   ├── SettingsButton/SettingsButton.stories.tsx    # проверить/дополнить
│   ├── SettingsModal/SettingsModal.stories.tsx      # проверить/дополнить
│   ├── RangeForm/RangeForm.stories.tsx              # проверить/дополнить
│   └── RangeTable/RangeTable.stories.tsx            # проверить/дополнить
```

## Что сделать

1. Обновить `WipLimitsOnCellsSettings.stories.tsx`:
   - Убрать `useEffect` + DOM-рендеринг
   - Рендерить `SettingsButtonContainer` с мок-данными
   - Stories: EmptyState, SingleRange, MultipleRanges, ComplexConfiguration

2. Проверить что все компонентные stories созданы в предыдущих задачах

3. Убедиться что все stories рендерятся без ошибок

## Критерии приёмки

- [ ] Все stories используют React-компоненты (не DOM)
- [ ] Stories покрывают основные состояния
- [ ] Storybook запускается без ошибок: `npm run storybook`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Зависит от: [TASK-27](./TASK-27-create-range-table-react.md), [TASK-28](./TASK-28-create-range-form.md), [TASK-29](./TASK-29-create-settings-modal.md), [TASK-30](./TASK-30-create-settings-button.md)
- Референс: `src/person-limits/SettingsPage/components/PersonalWipLimitContainer.stories.tsx`
