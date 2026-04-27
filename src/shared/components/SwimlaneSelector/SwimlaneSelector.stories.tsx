/* eslint-disable local/no-inline-styles -- Legacy inline styles; migrate to CSS classes when touching this file. */
import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { SwimlaneSelector } from './SwimlaneSelector';
import type { Swimlane } from './SwimlaneSelector';

const meta: Meta<typeof SwimlaneSelector> = {
  title: 'Shared/SwimlaneSelector',
  component: SwimlaneSelector,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
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

const allModeRender = () => <SwimlaneSelectorWrapper swimlanes={defaultSwimlanes} initialValue={[]} />;

/** `[]` — all swimlanes: All checked, list hidden. */
export const AllMode: Story = {
  render: allModeRender,
};

export const Default: Story = {
  render: allModeRender,
};

/** Partial ids — manual mode: All unchecked, list visible. */
export const ManualSelection: Story = {
  render: () => <SwimlaneSelectorWrapper swimlanes={defaultSwimlanes} initialValue={['frontend', 'backend']} />,
};

/**
 * Starts in all mode; play unchecks **All swimlanes** so the individual list opens (manual mode).
 * Final canvas shows the list + unchanged `[]` in JSON until user picks checkboxes.
 */
export const AllMode_UncheckOpensManual: Story = {
  render: allModeRender,
  play: async ({ canvasElement }) => {
    const allCheckbox = canvasElement.querySelector('[data-testid="swimlane-all-checkbox"]') as HTMLElement | null;
    expect(allCheckbox).toBeTruthy();
    allCheckbox!.click();
    const list = canvasElement.querySelector('[data-testid="swimlane-list"]');
    await expect(list).toBeInTheDocument();
  },
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
