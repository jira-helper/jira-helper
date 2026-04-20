import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { globalContainer } from 'dioma';
import { WithDi } from 'src/shared/diContext';
import { registerTestDependencies } from 'src/shared/testTools/registerTestDI';
import { useLocalSettingsStore } from 'src/features/local-settings/stores/localSettingsStore';
import { EmptyState } from './EmptyState';

const EN_MESSAGE =
  'No subtasks found for this issue. The Gantt chart requires subtasks, epic children, or linked issues.';

describe('EmptyState', () => {
  beforeEach(() => {
    globalContainer.reset();
    useLocalSettingsStore.setState(useLocalSettingsStore.getInitialState());
    registerTestDependencies(globalContainer);
  });

  it('shows empty-state message without settings button when no callback', () => {
    render(
      <WithDi container={globalContainer}>
        <EmptyState />
      </WithDi>
    );

    expect(screen.getByText(EN_MESSAGE)).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('shows settings button when onOpenSettings is provided', () => {
    const onOpenSettings = vi.fn();

    render(
      <WithDi container={globalContainer}>
        <EmptyState onOpenSettings={onOpenSettings} />
      </WithDi>
    );

    expect(screen.getByText(EN_MESSAGE)).toBeInTheDocument();
    const btn = screen.getByRole('button', { name: /open settings/i });
    expect(btn).toBeInTheDocument();
  });

  it('calls onOpenSettings when button is clicked', async () => {
    const onOpenSettings = vi.fn();
    const user = userEvent.setup();

    render(
      <WithDi container={globalContainer}>
        <EmptyState onOpenSettings={onOpenSettings} />
      </WithDi>
    );

    await user.click(screen.getByRole('button', { name: /open settings/i }));
    expect(onOpenSettings).toHaveBeenCalledOnce();
  });
});
