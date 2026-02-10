# TASK-14: Создать ColorPickerButton (View)

**Status**: TODO

**Parent**: [EPIC-1](./EPIC-1-fix-closing-group-limits.md)

**Target Design**: [target-design.md](./target-design.md)

**Depends on**: [TASK-13](./TASK-13-remove-html-templates.md)

---

## Описание

Создать React-компонент для выбора цвета группы. Заменяет legacy `ColorPickerTooltip`.

## Файлы для создания

```
src/column-limits/SettingsPage/components/ColorPickerButton/
├── ColorPickerButton.tsx
├── ColorPickerButton.module.css
├── ColorPickerButton.stories.tsx
└── index.ts
```

## Что сделать

### 1. Создать `ColorPickerButton.tsx`

```typescript
import React, { useState, useRef, useEffect } from 'react';
import styles from './ColorPickerButton.module.css';

export type ColorPickerButtonProps = {
  groupId: string;
  currentColor?: string;
  onColorChange: (color: string) => void;
};

const PRESET_COLORS = [
  '#ff5722', '#e91e63', '#9c27b0', '#673ab7',
  '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4',
  '#009688', '#4caf50', '#8bc34a', '#cddc39',
  '#ffeb3b', '#ffc107', '#ff9800', '#795548',
];

export const ColorPickerButton: React.FC<ColorPickerButtonProps> = ({
  groupId,
  currentColor = '#ffffff',
  onColorChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleColorSelect = (color: string) => {
    onColorChange(color);
    setIsOpen(false);
  };

  return (
    <div className={styles.container} ref={containerRef}>
      <button
        type="button"
        className={styles.button}
        onClick={() => setIsOpen(!isOpen)}
        data-group-id={groupId}
      >
        <span 
          className={styles.colorPreview} 
          style={{ backgroundColor: currentColor }}
        />
        Change color
      </button>
      
      {isOpen && (
        <div className={styles.popover}>
          <div className={styles.colorGrid}>
            {PRESET_COLORS.map(color => (
              <button
                key={color}
                type="button"
                className={styles.colorOption}
                style={{ backgroundColor: color }}
                onClick={() => handleColorSelect(color)}
                aria-label={`Select color ${color}`}
              />
            ))}
          </div>
          <div className={styles.customColor}>
            <label>
              Custom:
              <input
                type="color"
                value={currentColor}
                onChange={e => handleColorSelect(e.target.value)}
              />
            </label>
          </div>
        </div>
      )}
    </div>
  );
};
```

### 2. Создать `ColorPickerButton.module.css`

```css
.container {
  position: relative;
  display: inline-block;
}

.button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: #f4f5f7;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
}

.colorPreview {
  width: 16px;
  height: 16px;
  border-radius: 2px;
  border: 1px solid #ccc;
}

.popover {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 4px;
  padding: 12px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  z-index: 1000;
}

.colorGrid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-bottom: 12px;
}

.colorOption {
  width: 24px;
  height: 24px;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  padding: 0;
}

.colorOption:hover {
  transform: scale(1.1);
}

.customColor {
  border-top: 1px solid #eee;
  padding-top: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.customColor input[type="color"] {
  width: 40px;
  height: 24px;
  padding: 0;
  border: none;
  cursor: pointer;
}
```

### 3. Создать `ColorPickerButton.stories.tsx`

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { ColorPickerButton } from './ColorPickerButton';

const meta: Meta<typeof ColorPickerButton> = {
  title: 'ColumnLimits/ColorPickerButton',
  component: ColorPickerButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof ColorPickerButton>;

export const Default: Story = {
  args: {
    groupId: 'group-1',
    currentColor: '#ffffff',
    onColorChange: (color) => console.log('Color changed:', color),
  },
};

export const WithColor: Story = {
  args: {
    groupId: 'group-1',
    currentColor: '#4caf50',
    onColorChange: (color) => console.log('Color changed:', color),
  },
};
```

### 4. Создать `index.ts`

```typescript
export { ColorPickerButton } from './ColorPickerButton';
export type { ColorPickerButtonProps } from './ColorPickerButton';
```

## Критерии приёмки

- [ ] Файл `ColorPickerButton.tsx` создан
- [ ] Компонент показывает текущий цвет
- [ ] При клике открывается popover с палитрой
- [ ] При выборе цвета вызывается `onColorChange`
- [ ] Popover закрывается при клике вне
- [ ] Storybook stories созданы
- [ ] Тесты проходят: `npm test`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- src/column-limits/SettingsPage/components/ColorPickerButton/`

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
