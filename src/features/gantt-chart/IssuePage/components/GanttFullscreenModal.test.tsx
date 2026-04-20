import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { GanttFullscreenModal } from './GanttFullscreenModal';

describe('GanttFullscreenModal', () => {
  it('renders children when visible is true', () => {
    render(
      <GanttFullscreenModal visible onClose={vi.fn()}>
        <span data-testid="gantt-fullscreen-child">content</span>
      </GanttFullscreenModal>
    );

    expect(screen.getByTestId('gantt-fullscreen-child')).toBeInTheDocument();
  });

  it('does not render children when visible is false', () => {
    render(
      <GanttFullscreenModal visible={false} onClose={vi.fn()}>
        <span data-testid="gantt-fullscreen-child">content</span>
      </GanttFullscreenModal>
    );

    expect(screen.queryByTestId('gantt-fullscreen-child')).not.toBeInTheDocument();
  });

  it('calls onClose when the modal close control is activated', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(
      <GanttFullscreenModal visible onClose={onClose}>
        <span>body</span>
      </GanttFullscreenModal>
    );

    await user.click(screen.getByRole('button', { name: 'Close' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
