/* eslint-disable local/no-inline-styles -- Legacy inline styles; migrate to CSS classes when touching this file. */
import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { SwimlaneSelector } from './SwimlaneSelector';
import type { Swimlane } from './SwimlaneSelector';

const meta: Meta<typeof SwimlaneSelector> = {
  title: 'Shared/SwimlaneSelector',
  component: SwimlaneSelector,
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof SwimlaneSelector>;

const defaultSwimlanes: Swimlane[] = [
  { id: 'frontend', name: 'Frontend' },
  { id: 'backend', name: 'Backend' },
  { id: 'expedite', name: 'Expedite' },
];

const SwimlaneSelectorWrapper: React.FC<{
  swimlanes: Swimlane[];
  initialValue?: string[];
}> = ({ swimlanes, initialValue = [] }) => {
  const [value, setValue] = useState<string[]>(initialValue);
  return (
    <div style={{ width: 400 }}>
      <SwimlaneSelector swimlanes={swimlanes} value={value} onChange={setValue} />
      <pre style={{ marginTop: 16, fontSize: 12 }}>{JSON.stringify(value, null, 2)}</pre>
    </div>
  );
};

export const Default: Story = {
  render: () => <SwimlaneSelectorWrapper swimlanes={defaultSwimlanes} />,
};

export const Expanded: Story = {
  render: () => <SwimlaneSelectorWrapper swimlanes={defaultSwimlanes} initialValue={['frontend', 'backend']} />,
};

export const EmptySwimlanes: Story = {
  render: () => <SwimlaneSelectorWrapper swimlanes={[]} />,
};

export const SingleSwimlane: Story = {
  render: () => <SwimlaneSelectorWrapper swimlanes={[{ id: 'default', name: 'Default' }]} />,
};

export const CustomLabels: Story = {
  render: () => {
    const [value, setValue] = useState<string[]>([]);
    return (
      <div style={{ width: 400 }}>
        <SwimlaneSelector
          swimlanes={defaultSwimlanes}
          value={value}
          onChange={setValue}
          label="Custom label"
          allLabel="Custom all"
        />
      </div>
    );
  },
};
