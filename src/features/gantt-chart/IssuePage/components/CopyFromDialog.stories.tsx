import type { Meta, StoryObj } from '@storybook/react-vite';
import { CopyFromDialog } from './CopyFromDialog';

const noop = () => {};

const threeScopes = [
  { key: '_global', label: 'Global' },
  { key: 'DEMO', label: 'Project DEMO' },
  { key: 'DEMO:Bug', label: 'DEMO / Bug' },
];

const meta: Meta<typeof CopyFromDialog> = {
  title: 'GanttChart/IssuePage/CopyFromDialog',
  component: CopyFromDialog,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  args: {
    visible: true,
    onCopy: noop,
    onCancel: noop,
  },
};

export default meta;

type Story = StoryObj<typeof CopyFromDialog>;

export const Default: Story = {
  args: {
    availableScopes: threeScopes,
  },
};

export const NoScopes: Story = {
  args: {
    availableScopes: [],
  },
};
