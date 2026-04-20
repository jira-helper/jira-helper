import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { globalContainer } from 'dioma';
import { WithDi } from 'src/shared/diContext';
import { registerTestDependencies } from 'src/shared/testTools/registerTestDI';
import { useLocalSettingsStore } from 'src/features/local-settings/stores/localSettingsStore';
import { CopyFromDialog } from './CopyFromDialog';

const scopes = [
  { key: 'global', label: 'Global settings' },
  { key: 'project:PROJ', label: 'Project PROJ' },
];

function renderDialog(overrides: Partial<React.ComponentProps<typeof CopyFromDialog>> = {}) {
  const onCopy = vi.fn();
  const onCancel = vi.fn();
  const props = {
    visible: true,
    availableScopes: scopes,
    onCopy,
    onCancel,
    ...overrides,
  };
  render(
    <WithDi container={globalContainer}>
      <CopyFromDialog {...props} />
    </WithDi>
  );
  return props;
}

describe('CopyFromDialog', () => {
  beforeEach(() => {
    globalContainer.reset();
    useLocalSettingsStore.setState(useLocalSettingsStore.getInitialState());
    registerTestDependencies(globalContainer);
    vi.clearAllMocks();
  });

  it('does not show dialog when not visible', () => {
    renderDialog({ visible: false });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders available scopes as choices', () => {
    renderDialog();

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Global settings' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Project PROJ' })).toBeInTheDocument();
  });

  it('calls onCopy with the selected scope key when Copy is clicked', async () => {
    const user = userEvent.setup();
    const props = renderDialog();

    await user.click(screen.getByRole('radio', { name: 'Project PROJ' }));
    await user.click(screen.getByRole('button', { name: 'Copy' }));

    expect(props.onCopy).toHaveBeenCalledTimes(1);
    expect(props.onCopy).toHaveBeenCalledWith('project:PROJ');
  });

  it('calls onCancel when Cancel is clicked', async () => {
    const user = userEvent.setup();
    const props = renderDialog();

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(props.onCancel).toHaveBeenCalledTimes(1);
  });
});
