import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Container } from 'dioma';
import { WithDi } from 'src/shared/diContext';
import { SettingsButton } from './SettingsButton';
import { settingsUIModelToken } from '../../tokens';
import { boardPagePageObjectToken } from 'src/page-objects/BoardPage';
import { BoardPagePageObjectMock } from 'src/page-objects/BoardPage.mock';
import { registerTestDependencies } from 'src/shared/testTools/registerTestDI';
import type { SettingsUIModel } from '../models/SettingsUIModel';

describe('SettingsButton', () => {
  let container: Container;

  beforeEach(() => {
    container = new Container();
    registerTestDependencies(container);
    container.register({ token: boardPagePageObjectToken, value: BoardPagePageObjectMock });
  });

  const renderWithDi = (openMock = vi.fn().mockResolvedValue({ ok: true })) => {
    const mock = {
      model: { open: openMock } as unknown as SettingsUIModel,
      useModel: () => ({}) as unknown as SettingsUIModel,
    };
    container.register({
      token: settingsUIModelToken,
      value: mock as { model: Readonly<SettingsUIModel>; useModel: () => Readonly<SettingsUIModel> },
    });

    return render(
      <WithDi container={container}>
        <SettingsButton />
      </WithDi>
    );
  };

  it('should render Configure WIP Limits button', () => {
    renderWithDi();
    expect(screen.getByRole('button', { name: /Configure WIP Limits/i })).toBeInTheDocument();
  });

  it('should have data-testid swimlane-settings-button', () => {
    renderWithDi();
    expect(screen.getByTestId('swimlane-settings-button')).toBeInTheDocument();
  });

  it('should call uiModel.open() on click', async () => {
    const openMock = vi.fn().mockResolvedValue({ ok: true });
    renderWithDi(openMock);

    await userEvent.click(screen.getByRole('button', { name: /Configure WIP Limits/i }));

    expect(openMock).toHaveBeenCalledOnce();
  });
});
