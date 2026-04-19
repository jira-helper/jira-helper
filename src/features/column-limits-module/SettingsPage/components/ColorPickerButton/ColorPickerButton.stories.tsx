import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { ColorPickerButton } from './ColorPickerButton';

const meta: Meta<typeof ColorPickerButton> = {
  title: 'ColumnLimitsModule/SettingsPage/ColorPickerButton',
  component: ColorPickerButton,
  parameters: {
    layout: 'centered',
  },
  args: {
    selectColorText: 'Select color',
    onColorChange: fn(),
  },
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof ColorPickerButton>;

export const Default: Story = {
  args: {
    groupId: 'group-1',
    currentColor: '#ffffff',
    selectColorText: 'Select color',
  },
};

export const WithColor: Story = {
  args: {
    groupId: 'group-1',
    currentColor: '#4caf50',
    selectColorText: 'Select color',
  },
};
