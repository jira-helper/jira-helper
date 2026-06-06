import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { ErrorState } from './ErrorState';

const meta: Meta<typeof ErrorState> = {
  title: 'GanttChart/IssuePage/ErrorState',
  component: ErrorState,
  parameters: {
    layout: 'padded',
  },
  args: {
    onRetry: fn(),
  },
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof ErrorState>;

export const Default: Story = {
  args: {},
};

export const WithErrorMessage: Story = {
  args: {
    errorMessage:
      'TypeError: Failed to fetch\n    at loadGanttData (ganttData.ts:42:15)\n    at async GanttChartIssuePage.mount (GanttChartIssuePage.ts:118:7)',
  },
};
