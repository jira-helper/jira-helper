# TASK-7: Создать Storybook для SettingsButton

**Status**: TODO

**Parent**: [EPIC-1](./EPIC-1-fix-closing-group-limits.md)

**Target Design**: [target-design.md](./target-design.md)

**Depends on**: [TASK-6](./TASK-6-create-settings-button-view.md)

---

## Описание

Создать Storybook stories для компонента SettingsButton с разными состояниями.

## Файл для создания

```
src/column-limits/SettingsPage/components/SettingsButton/SettingsButton.stories.tsx
```

## Что сделать

### Создать `SettingsButton.stories.tsx`

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { SettingsButton } from './SettingsButton';

const meta: Meta<typeof SettingsButton> = {
  title: 'ColumnLimits/SettingsButton',
  component: SettingsButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof SettingsButton>;

export const Default: Story = {
  args: {
    onClick: () => console.log('Button clicked'),
  },
};

export const Disabled: Story = {
  args: {
    onClick: () => console.log('Button clicked'),
    disabled: true,
  },
};
```

## Как проверить

```bash
npm run storybook
```

Открыть в браузере: http://localhost:6006

Найти: ColumnLimits / SettingsButton

## Критерии приёмки

- [ ] Файл `SettingsButton.stories.tsx` создан
- [ ] Story `Default` отображает активную кнопку
- [ ] Story `Disabled` отображает заблокированную кнопку
- [ ] Storybook запускается без ошибок
- [ ] Тесты проходят: `npm test`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- src/column-limits/SettingsPage/components/SettingsButton/`

## Проблемы с линтером

```
(место для записи ошибок)
```

---

## Результаты

**Дата**: 

**Агент**: 

**Статус**: 

**Комментарии**:

```
(место для комментариев агента)
```
