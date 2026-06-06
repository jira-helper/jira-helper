import type { Meta, StoryObj } from '@storybook/react-vite';
import { Histogram } from './Histogram';

const meta: Meta<typeof Histogram> = {
  title: 'SwimlaneHistogramModule/Histogram',
  component: Histogram,
};

export default meta;
type Story = StoryObj<typeof Histogram>;

export const Normal: Story = {
  args: {
    data: {
      swimlaneId: 'swim-1',
      totalIssues: 15,
      columns: [
        { columnName: 'To Do', issueCount: 5 },
        { columnName: 'In Progress', issueCount: 8 },
        { columnName: 'Review', issueCount: 2 },
        { columnName: 'Done', issueCount: 0 },
      ],
    },
  },
};

export const Empty: Story = {
  args: {
    data: {
      swimlaneId: 'swim-1',
      totalIssues: 0,
      columns: [
        { columnName: 'To Do', issueCount: 0 },
        { columnName: 'In Progress', issueCount: 0 },
        { columnName: 'Done', issueCount: 0 },
      ],
    },
  },
};

export const SingleColumn: Story = {
  args: {
    data: {
      swimlaneId: 'swim-1',
      totalIssues: 10,
      columns: [{ columnName: 'All', issueCount: 10 }],
    },
  },
};

export const ManyColumns: Story = {
  args: {
    data: {
      swimlaneId: 'swim-1',
      totalIssues: 30,
      columns: [
        { columnName: 'Backlog', issueCount: 10 },
        { columnName: 'To Do', issueCount: 5 },
        { columnName: 'In Progress', issueCount: 8 },
        { columnName: 'Review', issueCount: 4 },
        { columnName: 'Testing', issueCount: 2 },
        { columnName: 'Done', issueCount: 1 },
      ],
    },
  },
};
