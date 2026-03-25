import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Container } from 'dioma';
import { SettingsModal } from './SettingsModal';
import { WithDi } from 'src/shared/diContext';
import { boardPagePageObjectToken } from 'src/page-objects/BoardPage';
import { BoardPagePageObjectMock } from 'src/page-objects/BoardPage.mock';
import { settingsUIModelToken } from '../../tokens';
import { registerTestDependencies } from 'src/shared/testTools/registerTestDI';
import { routingServiceToken, type IRoutingService } from 'src/routing';
import { issueTypeServiceToken, type IIssueTypeService } from 'src/shared/issueType';
import type { SettingsUIModel } from '../models/SettingsUIModel';
import type { SwimlaneSetting } from '../../types';

const createMockSettingsUIModel = (overrides = {}) => {
  const defaultModel = {
    isOpen: false,
    isLoading: false,
    isSaving: false,
    error: null as string | null,
    swimlanes: [] as { id: string; name: string }[],
    draft: {} as Record<string, SwimlaneSetting>,
    editingSwimlaneId: null as string | null,
    save: vi.fn().mockResolvedValue({ ok: true }),
    close: vi.fn(),
    updateDraft: vi.fn(),
    open: vi.fn(),
    setEditingSwimlaneId: vi.fn(),
    reset: vi.fn(),
    get hasUnsavedChanges() {
      return false;
    },
    ...overrides,
  };

  return {
    model: defaultModel,
    useModel: () => defaultModel,
  };
};

describe('SettingsModal', () => {
  let container: Container;

  beforeEach(() => {
    container = new Container();
    registerTestDependencies(container);
    container.register({ token: boardPagePageObjectToken, value: BoardPagePageObjectMock });
    container.register({
      token: issueTypeServiceToken,
      value: { loadForProject: vi.fn().mockResolvedValue([]), clearCache: vi.fn() } as IIssueTypeService,
    });
    container.register({
      token: routingServiceToken,
      value: { getProjectKeyFromURL: vi.fn().mockReturnValue('TEST') } as unknown as IRoutingService,
    });
  });

  const renderWithProvider = (modelOverrides = {}) => {
    const mock = createMockSettingsUIModel(modelOverrides);
    container.register({
      token: settingsUIModelToken,
      value: mock as { model: Readonly<SettingsUIModel>; useModel: () => Readonly<SettingsUIModel> },
    });

    return render(
      <WithDi container={container}>
        <SettingsModal />
      </WithDi>
    );
  };

  it('should render modal when isOpen is true', () => {
    renderWithProvider({ isOpen: true });
    expect(screen.getByText('Swimlane WIP Limits')).toBeInTheDocument();
  });

  it('should not render modal content when isOpen is false', () => {
    renderWithProvider({ isOpen: false });
    const modal = screen.queryByTestId('settings-modal');
    expect(modal).not.toBeInTheDocument();
  });

  it('should call save on OK button click', async () => {
    const saveMock = vi.fn().mockResolvedValue({ ok: true });
    renderWithProvider({ isOpen: true, save: saveMock });

    fireEvent.click(screen.getByText('OK'));

    await waitFor(() => {
      expect(saveMock).toHaveBeenCalled();
    });
  });

  it('should call close on Cancel button click', () => {
    const closeMock = vi.fn();
    renderWithProvider({ isOpen: true, close: closeMock });

    fireEvent.click(screen.getByText('Cancel'));

    expect(closeMock).toHaveBeenCalled();
  });

  it('should display error alert when error exists', () => {
    renderWithProvider({ isOpen: true, error: 'Save failed' });

    expect(screen.getByTestId('error-alert')).toBeInTheDocument();
    expect(screen.getByText('Save failed')).toBeInTheDocument();
  });

  it('should show loading spinner when isLoading is true', () => {
    renderWithProvider({ isOpen: true, isLoading: true });

    expect(screen.getByTestId('settings-modal-loading')).toBeInTheDocument();
  });

  it('should display swimlanes in table', () => {
    renderWithProvider({
      isOpen: true,
      swimlanes: [
        { id: 'sw-1', name: 'Frontend' },
        { id: 'sw-2', name: 'Backend' },
      ],
      draft: {},
    });

    expect(screen.getByText('Frontend')).toBeInTheDocument();
    expect(screen.getByText('Backend')).toBeInTheDocument();
  });
});
