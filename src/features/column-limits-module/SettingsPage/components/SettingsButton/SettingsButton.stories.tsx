import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { SettingsButton } from './SettingsButton';

const meta: Meta<typeof SettingsButton> = {
  title: 'ColumnLimitsModule/SettingsPage/SettingsButton',
  component: SettingsButton,
  parameters: {
    layout: 'centered',
  },
  args: {
    onClick: fn(),
  },
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof SettingsButton>;

export const Default: Story = {
  args: {},
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};
