import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { globalContainer } from 'dioma';
import { WithDi } from 'src/infrastructure/di/diContext';
import { registerTestDependencies } from 'src/shared/testTools/registerTestDI';
import { useLocalSettingsStore } from 'src/features/local-settings/stores/localSettingsStore';
import { FirstRunState } from './FirstRunState';

const EN_MESSAGE = 'Gantt chart is not configured yet. Please configure start and end date mappings.';

describe('FirstRunState', () => {
  beforeEach(() => {
    globalContainer.reset();
    useLocalSettingsStore.setState(useLocalSettingsStore.getInitialState());
    registerTestDependencies(globalContainer);
  });

  it('shows first-run message and calls onOpenSettings when Open Settings is clicked', () => {
    const onOpenSettings = vi.fn();

    render(
      <WithDi container={globalContainer}>
        <FirstRunState onOpenSettings={onOpenSettings} />
      </WithDi>
    );

    expect(screen.getByText(EN_MESSAGE)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Open Settings' }));
    expect(onOpenSettings).toHaveBeenCalledTimes(1);
  });
});
