import type { Meta, StoryObj } from '@storybook/react-vite';
import type { GanttBar } from '../../types';
import { GanttChartView } from './GanttChartView';

function makeBar(overrides: Partial<GanttBar> = {}): GanttBar {
  const startDate = new Date('2024-06-01T00:00:00.000Z');
  const endDate = new Date('2024-06-11T00:00:00.000Z');
  return {
    issueKey: 'PROJ-101',
    issueId: '10101',
    label: 'PROJ-101 · Design tokens',
    startDate,
    endDate,
    isOpenEnded: false,
    statusSections: [],
    tooltipFields: {},
    statusCategory: 'inProgress',
    ...overrides,
  };
}

const defaultBars: GanttBar[] = [
  makeBar({
    issueKey: 'PROJ-101',
    issueId: '1',
    label: 'PROJ-101 · Design tokens',
    startDate: new Date('2024-06-01T00:00:00.000Z'),
    endDate: new Date('2024-06-08T00:00:00.000Z'),
    statusCategory: 'todo',
  }),
  makeBar({
    issueKey: 'PROJ-102',
    issueId: '2',
    label: 'PROJ-102 · Checkout funnel',
    startDate: new Date('2024-06-03T00:00:00.000Z'),
    endDate: new Date('2024-06-14T00:00:00.000Z'),
    statusCategory: 'inProgress',
  }),
  makeBar({
    issueKey: 'PROJ-103',
    issueId: '3',
    label: 'PROJ-103 · Load test harness',
    startDate: new Date('2024-06-05T00:00:00.000Z'),
    endDate: new Date('2024-06-18T00:00:00.000Z'),
    statusCategory: 'inProgress',
  }),
  makeBar({
    issueKey: 'PROJ-104',
    issueId: '4',
    label: 'PROJ-104 · Release notes',
    startDate: new Date('2024-06-10T00:00:00.000Z'),
    endDate: new Date('2024-06-20T00:00:00.000Z'),
    statusCategory: 'done',
  }),
];

const meta: Meta<typeof GanttChartView> = {
  title: 'GanttChart/IssuePage/GanttChartView',
  component: GanttChartView,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof GanttChartView>;

export const Default: Story = {
  args: {
    bars: defaultBars,
    showStatusSections: false,
  },
};

export const Empty: Story = {
  args: {
    bars: [],
    showStatusSections: false,
  },
};

export const WithStatusSections: Story = {
  args: {
    bars: [
      makeBar({
        issueKey: 'PROJ-201',
        issueId: '201',
        label: 'PROJ-201 · Onboarding checklist',
        startDate: new Date('2024-06-01T00:00:00.000Z'),
        endDate: new Date('2024-06-12T00:00:00.000Z'),
        statusCategory: 'inProgress',
        statusSections: [
          {
            statusName: 'To Do',
            category: 'todo',
            startDate: new Date('2024-06-01T00:00:00.000Z'),
            endDate: new Date('2024-06-04T00:00:00.000Z'),
          },
          {
            statusName: 'In Progress',
            category: 'inProgress',
            startDate: new Date('2024-06-04T00:00:00.000Z'),
            endDate: new Date('2024-06-12T00:00:00.000Z'),
          },
        ],
      }),
      makeBar({
        issueKey: 'PROJ-202',
        issueId: '202',
        label: 'PROJ-202 · SSO rollout',
        startDate: new Date('2024-06-02T00:00:00.000Z'),
        endDate: new Date('2024-06-16T00:00:00.000Z'),
        statusCategory: 'inProgress',
        statusSections: [
          {
            statusName: 'To Do',
            category: 'todo',
            startDate: new Date('2024-06-02T00:00:00.000Z'),
            endDate: new Date('2024-06-05T00:00:00.000Z'),
          },
          {
            statusName: 'In Progress',
            category: 'inProgress',
            startDate: new Date('2024-06-05T00:00:00.000Z'),
            endDate: new Date('2024-06-14T00:00:00.000Z'),
          },
          {
            statusName: 'Done',
            category: 'done',
            startDate: new Date('2024-06-14T00:00:00.000Z'),
            endDate: new Date('2024-06-16T00:00:00.000Z'),
          },
        ],
      }),
    ],
    showStatusSections: true,
  },
};
