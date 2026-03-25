import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { Container } from 'dioma';
import { IssueTypeSelector } from './IssueTypeSelector';
import { WithDi } from '../diContext';
import { routingServiceToken, type IRoutingService } from 'src/routing';
import { issueTypeServiceToken, type IIssueTypeService } from '../issueType';

describe('IssueTypeSelector', () => {
  let container: Container;

  const defaultProps = {
    groupId: 'test-group',
    selectedTypes: [] as string[],
    onSelectionChange: vi.fn(),
    initialCountAllTypes: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    container = new Container();
    container.register({
      token: routingServiceToken,
      value: { getProjectKeyFromURL: vi.fn().mockReturnValue('TEST') } as unknown as IRoutingService,
    });
    container.register({
      token: issueTypeServiceToken,
      value: {
        loadForProject: vi.fn().mockResolvedValue([
          { id: '1', name: 'Task', subtask: false },
          { id: '2', name: 'Bug', subtask: false },
          { id: '3', name: 'Story', subtask: false },
        ]),
        clearCache: vi.fn(),
      } as IIssueTypeService,
    });
  });

  const renderWithDi = (ui: React.ReactElement) => render(<WithDi container={container}>{ui}</WithDi>);

  describe('IT1: Should sync countAllTypes state with initialCountAllTypes prop changes', () => {
    it('should update countAllTypes when initialCountAllTypes prop changes', async () => {
      const { rerender } = renderWithDi(<IssueTypeSelector {...defaultProps} />);

      const checkbox = screen.getByLabelText(/count all issue types/i);
      expect(checkbox).toBeChecked();

      rerender(
        <WithDi container={container}>
          <IssueTypeSelector {...defaultProps} initialCountAllTypes={false} />
        </WithDi>
      );

      await waitFor(() => {
        expect(checkbox).not.toBeChecked();
      });

      rerender(
        <WithDi container={container}>
          <IssueTypeSelector {...defaultProps} initialCountAllTypes />
        </WithDi>
      );

      await waitFor(() => {
        expect(checkbox).toBeChecked();
      });
    });
  });

  describe('IT2: Should sync selectedTypes state with initialSelectedTypes prop changes', () => {
    it('should initialize with selectedTypes prop', async () => {
      renderWithDi(
        <IssueTypeSelector {...defaultProps} initialCountAllTypes={false} selectedTypes={['Task', 'Bug']} />
      );

      await waitFor(() => {
        expect(screen.getByText(/selected issue types/i)).toBeInTheDocument();
        expect(screen.getByText('Task')).toBeInTheDocument();
        expect(screen.getByText('Bug')).toBeInTheDocument();
      });
    });

    it('should sync selectedTypes when selectedTypes prop changes', async () => {
      const { rerender } = renderWithDi(
        <IssueTypeSelector {...defaultProps} initialCountAllTypes={false} selectedTypes={[]} />
      );

      expect(screen.queryByText(/selected issue types/i)).not.toBeInTheDocument();

      rerender(
        <WithDi container={container}>
          <IssueTypeSelector {...defaultProps} selectedTypes={['Task']} initialCountAllTypes={false} />
        </WithDi>
      );

      await waitFor(
        () => {
          expect(screen.getByText(/selected issue types/i)).toBeInTheDocument();
          expect(screen.getByText('Task')).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });
  });

  describe('IT3: Should call onSelectionChange when state changes (not on mount)', () => {
    it('should not call onSelectionChange on mount', () => {
      const onSelectionChange = vi.fn();
      renderWithDi(<IssueTypeSelector {...defaultProps} onSelectionChange={onSelectionChange} />);

      expect(onSelectionChange).not.toHaveBeenCalled();
    });

    it('should call onSelectionChange when user unchecks countAllTypes', async () => {
      const user = userEvent.setup();
      const onSelectionChange = vi.fn();
      renderWithDi(<IssueTypeSelector {...defaultProps} onSelectionChange={onSelectionChange} initialCountAllTypes />);

      const checkbox = screen.getByLabelText(/count all issue types/i);
      await user.click(checkbox);

      await waitFor(() => {
        expect(onSelectionChange).toHaveBeenCalledWith([], false);
      });
    });

    it('should call onSelectionChange when user checks countAllTypes', async () => {
      const user = userEvent.setup();
      const onSelectionChange = vi.fn();
      renderWithDi(
        <IssueTypeSelector
          {...defaultProps}
          onSelectionChange={onSelectionChange}
          initialCountAllTypes={false}
          selectedTypes={['Task', 'Bug']}
        />
      );

      const checkbox = screen.getByLabelText(/count all issue types/i);
      await user.click(checkbox);

      await waitFor(() => {
        expect(onSelectionChange).toHaveBeenCalledWith([], true);
      });
    });

    it('should call onSelectionChange when selectedTypes change via props sync', async () => {
      const onSelectionChange = vi.fn();
      const { rerender } = renderWithDi(
        <IssueTypeSelector
          {...defaultProps}
          onSelectionChange={onSelectionChange}
          initialCountAllTypes={false}
          selectedTypes={[]}
        />
      );

      rerender(
        <WithDi container={container}>
          <IssueTypeSelector
            {...defaultProps}
            onSelectionChange={onSelectionChange}
            initialCountAllTypes={false}
            selectedTypes={['Task']}
          />
        </WithDi>
      );

      await waitFor(() => {
        expect(screen.getByText('Task')).toBeInTheDocument();
      });
    });
  });
});
