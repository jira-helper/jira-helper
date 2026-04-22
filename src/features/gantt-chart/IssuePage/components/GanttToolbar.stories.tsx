import type { Meta, StoryObj } from '@storybook/react-vite';
import { GanttToolbar } from './GanttToolbar';
import { BUILT_IN_QUICK_FILTERS } from '../../quickFilters/builtIns';

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

const baseQuickFilterArgs = {
  quickFilters: [
    ...BUILT_IN_QUICK_FILTERS,
    { id: 'qf-team-x', name: 'Team X', selector: { mode: 'jql' as const, jql: 'team = "X"' } },
  ],
  activeQuickFilterIds: [],
  quickFilterSearch: '',
  quickFilterSearchMode: 'text' as const,
  onQuickFilterSearchModeChange: noop,
  onSaveJqlAsQuickFilter: noop,
  quickFilterHiddenCount: 0,
  onToggleQuickFilter: noop,
  onQuickFilterSearchChange: noop,
  onClearQuickFilters: noop,
};

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
    ...baseQuickFilterArgs,
  },
};

export const WithActiveQuickFilters: Story = {
  args: {
    ...Default.args,
    activeQuickFilterIds: ['builtin:unresolved', 'qf-team-x'],
    quickFilterHiddenCount: 7,
  },
};

export const WithJqlSearch: Story = {
  args: {
    ...Default.args,
    quickFilterSearchMode: 'jql',
    quickFilterSearch: 'priority = High',
  },
};

export const WithJqlSearchInvalid: Story = {
  args: {
    ...Default.args,
    quickFilterSearchMode: 'jql',
    quickFilterSearch: '((( totally broken',
  },
};

export const WithMissingDateIssues: Story = {
  args: {
    ...Default.args,
    missingDateIssues: [
      { issueKey: 'TTP-100', summary: 'Bootstrap Avia search infra', reason: 'noStartDate' },
      { issueKey: 'TTP-101', summary: 'Add fallback for missing fares', reason: 'noEndDate' },
      { issueKey: 'TTP-102', summary: 'Backfill historical bookings', reason: 'noStartAndEndDate' },
      { issueKey: 'TTP-103', summary: 'Spike: contract validation', reason: 'excluded' },
    ],
  },
};

export const WithPartialStatusHistory: Story = {
  args: {
    ...Default.args,
    statusBreakdownEnabled: true,
    statusBreakdownAvailability: {
      total: 12,
      tasksWithoutHistory: [
        { key: 'TTP-100', summary: 'Bootstrap Avia search infra' },
        { key: 'TTP-101', summary: 'Add fallback for missing fares' },
        { key: 'TTP-102', summary: 'Backfill historical bookings' },
      ],
    },
  },
};

export const WithSavePopoverOpen: Story = {
  args: {
    ...Default.args,
    quickFilterSearchMode: 'jql',
    quickFilterSearch: 'team = "Alpha"',
  },
  play: async ({ canvasElement }) => {
    const btn = canvasElement.querySelector(
      '[data-testid="gantt-quick-filters-save-as-chip"]'
    ) as HTMLButtonElement | null;
    btn?.click();
  },
};
