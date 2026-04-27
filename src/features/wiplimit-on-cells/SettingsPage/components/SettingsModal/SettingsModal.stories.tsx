/* eslint-disable local/no-inline-styles -- Legacy inline styles; migrate to CSS classes when touching this file. */
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { SettingsModal } from './SettingsModal';
import { SettingsModalContainer } from './SettingsModalContainer';
import { useWipLimitCellsSettingsUIStore } from '../../stores/settingsUIStore';
import { RangeForm } from '../RangeForm/RangeForm';
import type { WipLimitRange } from '../../../types';

const meta: Meta<typeof SettingsModal> = {
  title: 'WiplimitOnCells/SettingsPage/SettingsModal',
  component: SettingsModal,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  decorators: [
    Story => (
      <div style={{ height: '100vh', width: '100vw' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof SettingsModal>;

export const EmptyModal: Story = {
  args: {
    title: 'Edit WipLimit on cells',
    onClose: fn(),
    onSave: fn(),
    children: null,
  },
};

export const WithRanges: Story = {
  args: {
    title: 'Edit WipLimit on cells',
    onClose: fn(),
    onSave: fn(),
    children: (
      <div style={{ padding: '20px' }}>
        <p>Settings content with ranges goes here</p>
      </div>
    ),
  },
};

export const WithForm: Story = {
  render: () => {
    const mockSwimlanes = [
      { id: '1', name: 'Swimlane 1' },
      { id: '2', name: 'Swimlane 2' },
    ];
    const mockColumns = [
      { id: '1', name: 'To Do' },
      { id: '2', name: 'In Progress' },
      { id: '3', name: 'Done' },
    ];

    return (
      <SettingsModal title="Edit WipLimit on cells" onClose={fn()} onSave={fn()}>
        <RangeForm
          swimlanes={mockSwimlanes}
          columns={mockColumns}
          onAddRange={fn()}
          onAddCell={fn()}
          existingRangeNames={[]}
        />
      </SettingsModal>
    );
  },
};

// Wrapper для сброса store перед каждым story
const ContainerWrapper: React.FC<{
  children: React.ReactNode;
  initialRanges?: WipLimitRange[];
  swimlanes?: Array<{ id: string; name: string }>;
  columns?: Array<{ id: string; name: string }>;
}> = ({ children, initialRanges = [], swimlanes = [], columns = [] }) => {
  React.useEffect(() => {
    useWipLimitCellsSettingsUIStore.getState().actions.reset();
    if (initialRanges.length > 0 || swimlanes.length > 0 || columns.length > 0) {
      const { actions } = useWipLimitCellsSettingsUIStore.getState();
      if (initialRanges.length > 0) {
        actions.setRanges(initialRanges);
      }
      if (swimlanes.length > 0) {
        actions.setSwimlanes(swimlanes);
      }
      if (columns.length > 0) {
        actions.setColumns(columns);
      }
    }
  }, [initialRanges, swimlanes, columns]);
  return children;
};

export const WithContainer: Story = {
  render: () => {
    const mockSwimlanes = [
      { id: '1', name: 'Swimlane 1' },
      { id: '2', name: 'Swimlane 2' },
    ];
    const mockColumns = [
      { id: '1', name: 'To Do' },
      { id: '2', name: 'In Progress' },
      { id: '3', name: 'Done' },
    ];

    const mockRanges: WipLimitRange[] = [
      {
        name: 'Development Range',
        wipLimit: 5,
        disable: false,
        cells: [
          { swimlane: '1', column: '1', showBadge: true },
          { swimlane: '1', column: '2', showBadge: false },
        ],
      },
      {
        name: 'QA Range',
        wipLimit: 3,
        disable: false,
        cells: [{ swimlane: '2', column: '2', showBadge: true }],
      },
    ];

    return (
      <ContainerWrapper initialRanges={mockRanges} swimlanes={mockSwimlanes} columns={mockColumns}>
        <SettingsModalContainer swimlanes={mockSwimlanes} columns={mockColumns} onClose={fn()} onSave={fn()} />
      </ContainerWrapper>
    );
  },
};
