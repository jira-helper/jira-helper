import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { globalContainer } from 'dioma';
import { WithDi } from 'src/shared/diContext';
import { registerTestDependencies } from 'src/shared/testTools/registerTestDI';
import { useLocalSettingsStore } from 'src/features/local-settings/stores/localSettingsStore';
import { GanttToolbar } from './GanttToolbar';

const defaultProps = {
  zoomLevel: 1,
  interval: 'days' as const,
  statusBreakdownEnabled: false,
  onZoomIn: vi.fn(),
  onZoomOut: vi.fn(),
  onZoomReset: vi.fn(),
  onIntervalChange: vi.fn(),
  onToggleStatusBreakdown: vi.fn(),
  onOpenSettings: vi.fn(),
  onOpenFullscreen: vi.fn(),
};

function renderToolbar(overrides: Partial<typeof defaultProps> = {}) {
  const props = { ...defaultProps, ...overrides };
  render(
    <WithDi container={globalContainer}>
      <GanttToolbar {...props} />
    </WithDi>
  );
  return props;
}

describe('GanttToolbar', () => {
  beforeEach(() => {
    globalContainer.reset();
    useLocalSettingsStore.setState(useLocalSettingsStore.getInitialState());
    registerTestDependencies(globalContainer);
    vi.clearAllMocks();
  });

  it('renders zoom controls and settings', () => {
    renderToolbar();

    expect(screen.getByRole('button', { name: 'Zoom in' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Zoom out' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reset zoom' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Gantt settings' })).toBeInTheDocument();
  });

  it('shows current zoom level as percentage', () => {
    renderToolbar({ zoomLevel: 1.2 });

    expect(screen.getByText('120%')).toBeInTheDocument();
  });

  it('calls onZoomIn, onZoomOut, and onZoomReset', async () => {
    const user = userEvent.setup();
    const props = renderToolbar();

    await user.click(screen.getByRole('button', { name: 'Zoom in' }));
    await user.click(screen.getByRole('button', { name: 'Zoom out' }));
    await user.click(screen.getByRole('button', { name: 'Reset zoom' }));

    expect(props.onZoomIn).toHaveBeenCalledTimes(1);
    expect(props.onZoomOut).toHaveBeenCalledTimes(1);
    expect(props.onZoomReset).toHaveBeenCalledTimes(1);
  });

  it('renders interval options as radio group and reflects selection', () => {
    renderToolbar({ interval: 'weeks' });

    const group = screen.getByRole('radiogroup', { name: 'Time interval' });
    expect(group).toBeInTheDocument();

    const hours = screen.getByRole('radio', { name: 'Hours' });
    const days = screen.getByRole('radio', { name: 'Days' });
    const weeks = screen.getByRole('radio', { name: 'Weeks' });
    const months = screen.getByRole('radio', { name: 'Months' });

    expect(hours).not.toBeChecked();
    expect(days).not.toBeChecked();
    expect(weeks).toBeChecked();
    expect(months).not.toBeChecked();
  });

  it('calls onIntervalChange when a different interval is selected', async () => {
    const user = userEvent.setup();
    const props = renderToolbar({ interval: 'days' });

    await user.click(screen.getByRole('radio', { name: 'Months' }));

    expect(props.onIntervalChange).toHaveBeenCalledWith('months');
  });

  it('renders status breakdown switch and calls onToggleStatusBreakdown', async () => {
    const user = userEvent.setup();
    const props = renderToolbar({ statusBreakdownEnabled: false });

    const toggle = screen.getByRole('switch', { name: 'Status breakdown' });
    expect(toggle).toHaveAttribute('aria-checked', 'false');

    await user.click(toggle);

    expect(props.onToggleStatusBreakdown).toHaveBeenCalledTimes(1);
  });

  it('shows status breakdown switch as on when enabled', () => {
    renderToolbar({ statusBreakdownEnabled: true });

    expect(screen.getByRole('switch', { name: 'Status breakdown' })).toHaveAttribute('aria-checked', 'true');
  });

  it('calls onOpenSettings when settings is clicked', async () => {
    const user = userEvent.setup();
    const props = renderToolbar();

    await user.click(screen.getByRole('button', { name: 'Gantt settings' }));

    expect(props.onOpenSettings).toHaveBeenCalledTimes(1);
  });

  it('calls onOpenFullscreen when Open in modal is clicked', async () => {
    const user = userEvent.setup();
    const props = renderToolbar();

    await user.click(screen.getByRole('button', { name: 'Open in modal' }));

    expect(props.onOpenFullscreen).toHaveBeenCalledTimes(1);
  });
});
