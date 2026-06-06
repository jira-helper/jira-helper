import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { FirstRunState } from './FirstRunState';

const meta: Meta<typeof FirstRunState> = {
  title: 'GanttChart/IssuePage/FirstRunState',
  component: FirstRunState,
  parameters: {
    layout: 'padded',
  },
  args: {
    onOpenSettings: fn(),
  },
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof FirstRunState>;

export const Default: Story = {
  args: {},
};
