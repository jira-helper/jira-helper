import type { Meta, StoryObj } from '@storybook/react';
import {Checkbox} from './Checkbox';

// Дефолтные настройки для компонента
const meta: Meta<typeof Checkbox> = {
  title: 'Components/Checkbox', // Категория и название компонента в Storybook
  component: Checkbox,
  tags: ['autodocs'], // Автогенерация документации в Storybook
  argTypes: {
    label: {
      control: 'text', // Опция для изменения текста через интерфейс Storybook
      description: 'Label text for the checkbox',
    },
  },
};
export default meta;

// Истории для разных вариантов использования компонента
type Story = StoryObj<typeof Checkbox>;

// Дефолтная история
export const Default: Story = {
  args: {
    label: 'Default Checkbox',
  },
};

// История с кастомной меткой
export const CustomLabel: Story = {
  args: {
    label: 'Custom Checkbox Label',
  },
};

// История без метки
export const NoLabel: Story = {
  args: {
    label: '',
  },
};
