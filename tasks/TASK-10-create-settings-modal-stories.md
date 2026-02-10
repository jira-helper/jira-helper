# TASK-10: Создать Storybook для SettingsModal

**Status**: TODO

**Parent**: [EPIC-1](./EPIC-1-fix-closing-group-limits.md)

**Target Design**: [target-design.md](./target-design.md)

**Depends on**: [TASK-9](./TASK-9-create-settings-modal-view.md)

---

## Описание

Создать Storybook stories для компонента SettingsModal с разными состояниями.

## Файл для создания

```
src/column-limits/SettingsPage/components/SettingsModal/SettingsModal.stories.tsx
```

## Что сделать

### Создать `SettingsModal.stories.tsx`

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { SettingsModal } from './SettingsModal';

const meta: Meta<typeof SettingsModal> = {
  title: 'ColumnLimits/SettingsModal',
  component: SettingsModal,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof SettingsModal>;

const MockContent = () => (
  <div style={{ padding: '20px', background: '#f5f5f5', minHeight: '200px' }}>
    <p>Modal content goes here</p>
  </div>
);

export const Default: Story = {
  args: {
    title: 'Limits for groups',
    onClose: () => console.log('Close clicked'),
    onSave: () => console.log('Save clicked'),
    children: <MockContent />,
  },
};

export const Saving: Story = {
  args: {
    title: 'Limits for groups',
    onClose: () => console.log('Close clicked'),
    onSave: () => console.log('Save clicked'),
    isSaving: true,
    children: <MockContent />,
  },
};

export const CustomButtonText: Story = {
  args: {
    title: 'Edit Settings',
    onClose: () => console.log('Close clicked'),
    onSave: () => console.log('Save clicked'),
    okButtonText: 'Apply Changes',
    children: <MockContent />,
  },
};

export const LongContent: Story = {
  args: {
    title: 'Limits for groups',
    onClose: () => console.log('Close clicked'),
    onSave: () => console.log('Save clicked'),
    children: (
      <div style={{ padding: '20px' }}>
        {Array.from({ length: 20 }).map((_, i) => (
          <p key={i}>Long content line {i + 1}</p>
        ))}
      </div>
    ),
  },
};
```

## Как проверить

```bash
npm run storybook
```

Открыть в браузере: http://localhost:6006

Найти: ColumnLimits / SettingsModal

## Критерии приёмки

- [ ] Файл `SettingsModal.stories.tsx` создан
- [ ] Story `Default` отображает модалку в обычном состоянии
- [ ] Story `Saving` отображает модалку в состоянии сохранения
- [ ] Story `CustomButtonText` отображает модалку с кастомным текстом кнопки
- [ ] Story `LongContent` проверяет скролл при длинном контенте
- [ ] Storybook запускается без ошибок
- [ ] Тесты проходят: `npm test`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- src/column-limits/SettingsPage/components/SettingsModal/`

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
