import type { Meta, StoryObj } from '@storybook/react-vite';
import type { MissingDateIssue } from '../../types';
import { MissingDatesSection } from './MissingDatesSection';

const threeIssues: MissingDateIssue[] = [
  {
    issueKey: 'PROJ-301',
    summary: 'Spike: dependency graph export',
    reason: 'noStartDate',
  },
  {
    issueKey: 'PROJ-302',
    summary: 'Harden session refresh on mobile',
    reason: 'noEndDate',
  },
  {
    issueKey: 'PROJ-303',
    summary: 'Archive legacy onboarding experiment',
    reason: 'excluded',
  },
];

const meta: Meta<typeof MissingDatesSection> = {
  title: 'GanttChart/IssuePage/MissingDatesSection',
  component: MissingDatesSection,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof MissingDatesSection>;

export const Default: Story = {
  args: {
    issues: threeIssues,
  },
};

export const Empty: Story = {
  args: {
    issues: [],
  },
};
