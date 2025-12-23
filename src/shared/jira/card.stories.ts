import type { Meta, StoryObj } from '@storybook/react';
import { IssueCard } from './card';

// Дефолтные настройки для компонента
const meta: Meta<typeof IssueCard> = {
  title: 'Components/Jira/Card', // Категория и название компонента в Storybook
  component: IssueCard,
  tags: ['autodocs'], // Автогенерация документации в Storybook
  args: {
    issueKey: 'JIRA-1337',
    summary: 'Some Feature',
  },
};
export default meta;

// Истории для разных вариантов использования компонента
type Story = StoryObj<typeof IssueCard>;

// Дефолтная история
export const Default: Story = {};
