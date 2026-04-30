import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import type { CommentTemplatesNotificationState } from '../../types';
import { CommentTemplatesNotification } from './CommentTemplatesNotification';

const baseNotification: CommentTemplatesNotificationState = {
  id: 'notification-1',
  level: 'success',
  message: 'Watchers added',
};

describe('CommentTemplatesNotification', () => {
  it.each([
    { level: 'success' as const, role: 'status' },
    { level: 'warning' as const, role: 'status' },
    { level: 'error' as const, role: 'alert' },
  ])('renders $level level with accessible live region', ({ level, role }) => {
    render(
      <CommentTemplatesNotification
        notification={{ ...baseNotification, level, message: `${level} message` }}
        dismissButtonLabel="Dismiss notification"
        onDismiss={vi.fn()}
      />
    );

    const notification = screen.getByRole(role);
    expect(notification).toHaveTextContent(`${level} message`);
    expect(notification).toHaveAttribute('data-level', level);
    expect(notification).toHaveAttribute('aria-live', level === 'error' ? 'assertive' : 'polite');
  });

  it('renders optional details', () => {
    render(
      <CommentTemplatesNotification
        notification={{
          ...baseNotification,
          level: 'warning',
          message: 'Some watchers were not added',
          details: ['alice added', 'bob failed'],
        }}
        dismissButtonLabel="Dismiss notification"
        onDismiss={vi.fn()}
      />
    );

    expect(screen.getByText('Some watchers were not added')).toBeInTheDocument();
    expect(screen.getByText('alice added')).toBeInTheDocument();
    expect(screen.getByText('bob failed')).toBeInTheDocument();
  });

  it('calls onDismiss with notification id', async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    render(
      <CommentTemplatesNotification
        notification={baseNotification}
        dismissButtonLabel="Dismiss notification"
        onDismiss={onDismiss}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Dismiss notification' }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(onDismiss).toHaveBeenCalledWith(baseNotification.id);
  });

  it('renders nothing when notification is null', () => {
    const { container } = render(
      <CommentTemplatesNotification notification={null} dismissButtonLabel="Dismiss notification" onDismiss={vi.fn()} />
    );

    expect(container).toBeEmptyDOMElement();
  });
});
