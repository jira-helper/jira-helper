import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { SettingsButton } from './SettingsButton';
import { SettingsButtonContainer } from './SettingsButtonContainer';
import { useWipLimitCellsSettingsUIStore } from '../../stores/settingsUIStore';
import type { WipLimitRange } from '../../../types';

const meta: Meta<typeof SettingsButton> = {
  title: 'WipLimitOnCells/SettingsButton',
  component: SettingsButton,
  parameters: {
    layout: 'centered',
  },
  args: {
    onClick: fn(),
  },
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof SettingsButton>;

export const DefaultButton: Story = {
  args: {},
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

// Mock данные для Container stories
const mockSwimlanes = [
  { id: 'swimlane-1', name: 'Team A' },
  { id: 'swimlane-2', name: 'Team B' },
];

const mockColumns = [
  { id: 'column-1', name: 'To Do' },
  { id: 'column-2', name: 'In Progress' },
  { id: 'column-3', name: 'Done' },
];

const mockRanges: WipLimitRange[] = [
  {
    name: 'Development Range',
    wipLimit: 5,
    cells: [
      { swimlane: 'swimlane-1', column: 'column-1', showBadge: true },
      { swimlane: 'swimlane-1', column: 'column-2', showBadge: false },
    ],
  },
];

// Wrapper для сброса store перед каждым story
const ContainerWrapper: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  React.useEffect(() => {
    useWipLimitCellsSettingsUIStore.getState().actions.reset();
  }, []);
  return children;
};

// Container stories (без отдельного meta, используем тот же title)
export const WithModal: StoryObj<typeof SettingsButtonContainer> = {
  render: args => (
    <ContainerWrapper>
      <SettingsButtonContainer {...args} />
    </ContainerWrapper>
  ),
  args: {
    swimlanes: mockSwimlanes,
    columns: mockColumns,
    initialRanges: mockRanges,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onSaveToProperty: fn(async (ranges: WipLimitRange[]) => {
      // Storybook action will log this automatically via fn()
      return Promise.resolve();
    }),
  },
};
