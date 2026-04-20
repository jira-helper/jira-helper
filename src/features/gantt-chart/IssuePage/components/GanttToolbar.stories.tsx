import type { Meta, StoryObj } from '@storybook/react-vite';
import { GanttToolbar } from './GanttToolbar';

const noop = () => {};

const meta: Meta<typeof GanttToolbar> = {
  title: 'GanttChart/IssuePage/GanttToolbar',
  component: GanttToolbar,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof GanttToolbar>;

export const Default: Story = {
  args: {
    zoomLevel: 1.25,
    interval: 'days',
    statusBreakdownEnabled: true,
    onZoomIn: noop,
    onZoomOut: noop,
    onZoomReset: noop,
    onIntervalChange: noop,
    onToggleStatusBreakdown: noop,
    onOpenSettings: noop,
    onOpenFullscreen: noop,
  },
};
