/* eslint-disable local/no-inline-styles -- Storybook layout wrappers keep visual fixtures local. */
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { DEFAULT_COMMENT_TEMPLATES } from '../../Storage/utils/defaultTemplates';
import type { CommentTemplatesNotificationState, CommentTemplateSummary } from '../../types';
import { toCommentTemplateId } from '../../types';
import { CommentTemplatesNotification } from './CommentTemplatesNotification';
import { CommentTemplatesToolbar } from './CommentTemplatesToolbar';

const noop = () => {};

const defaultTemplates: CommentTemplateSummary[] = DEFAULT_COMMENT_TEMPLATES.map(({ id, label, color }) => ({
  id,
  label,
  color,
}));

const manyTemplates: CommentTemplateSummary[] = [
  ...defaultTemplates,
  {
    id: toCommentTemplateId('handoff-to-support'),
    label: 'Передано в поддержку',
    color: '#FFFAE6',
  },
  {
    id: toCommentTemplateId('release-note'),
    label: 'Очень длинное название шаблона для проверки переноса текста',
    color: '#EAE6FF',
  },
  {
    id: toCommentTemplateId('qa-ready'),
    label: 'Готово к QA',
    color: '#FFEBE6',
  },
];

const notificationByState: Record<string, CommentTemplatesNotificationState> = {
  success: {
    id: 'success',
    level: 'success',
    message: 'Watchers added',
    details: ['ivan.petrov: added', 'anna.smirnova: added'],
  },
  warning: {
    id: 'warning',
    level: 'warning',
    message: 'Template inserted, but watchers were not added because the issue key is unavailable',
  },
  error: {
    id: 'error',
    level: 'error',
    message: 'Some watchers were not added',
    details: ['qa.owner: added', 'backend.owner: failed - Jira returned 404'],
  },
};

const meta: Meta<typeof CommentTemplatesToolbar> = {
  title: 'JiraCommentTemplatesModule/Editor/CommentTemplatesToolbar',
  component: CommentTemplatesToolbar,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof CommentTemplatesToolbar>;

const baseArgs = {
  templates: defaultTemplates,
  isDisabled: false,
  toolbarLabel: 'Templates:',
  toolbarAriaLabel: 'Comment templates',
  insertAriaLabelPrefix: 'Insert comment template:',
  manageButtonLabel: 'Manage templates',
  onTemplateSelect: noop,
  onOpenSettings: noop,
};

function ToolbarWithNotification({
  notification,
  ...args
}: React.ComponentProps<typeof CommentTemplatesToolbar> & {
  notification: CommentTemplatesNotificationState;
}) {
  return (
    <div style={{ maxWidth: 720 }}>
      <CommentTemplatesToolbar {...args} />
      <div style={{ marginTop: 16, maxWidth: 420 }}>
        <CommentTemplatesNotification
          notification={notification}
          dismissButtonLabel="Dismiss comment templates notification"
          onDismiss={noop}
        />
      </div>
    </div>
  );
}

export const Default: Story = {
  args: baseArgs,
};

export const ManyTemplates: Story = {
  args: {
    ...baseArgs,
    templates: manyTemplates,
  },
};

export const PendingState: Story = {
  args: {
    ...baseArgs,
    isDisabled: true,
  },
};

export const SuccessNotification: Story = {
  args: baseArgs,
  render: args => <ToolbarWithNotification {...args} notification={notificationByState.success} />,
};

export const WarningNotification: Story = {
  args: baseArgs,
  render: args => <ToolbarWithNotification {...args} notification={notificationByState.warning} />,
};

export const ErrorNotification: Story = {
  args: baseArgs,
  render: args => <ToolbarWithNotification {...args} notification={notificationByState.error} />,
};
