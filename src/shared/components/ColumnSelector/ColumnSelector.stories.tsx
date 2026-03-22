import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ColumnSelectorPure } from './ColumnSelector';

const meta: Meta<typeof ColumnSelectorPure> = {
  title: 'Shared/ColumnSelector',
  component: ColumnSelectorPure,
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof ColumnSelectorPure>;

const defaultColumns = [
  { name: 'To Do', enabled: true },
  { name: 'In Progress', enabled: false },
  { name: 'Done', enabled: true },
];

const ColumnSelectorWrapper: React.FC<{
  columns: { name: string; enabled: boolean }[];
  disabled?: boolean;
  showWarning?: boolean;
  extraContent?: React.ReactNode;
}> = ({ columns: initialColumns, disabled, showWarning = true, extraContent }) => {
  const [columns, setColumns] = useState(initialColumns);
  return (
    <div style={{ width: 400 }}>
      <ColumnSelectorPure
        columns={columns}
        onUpdate={setColumns}
        disabled={disabled}
        showWarning={showWarning}
        extraContent={extraContent}
      />
      <pre style={{ marginTop: 16, fontSize: 12 }}>{JSON.stringify(columns, null, 2)}</pre>
    </div>
  );
};

export const Default: Story = {
  render: () => <ColumnSelectorWrapper columns={defaultColumns} />,
};

export const WithColumns: Story = {
  render: () => (
    <ColumnSelectorWrapper
      columns={[
        { name: 'To Do', enabled: true },
        { name: 'In Progress', enabled: true },
        { name: 'Done', enabled: false },
      ]}
    />
  ),
};

export const Disabled: Story = {
  render: () => <ColumnSelectorWrapper columns={defaultColumns} disabled />,
};

export const NoWarning: Story = {
  render: () => <ColumnSelectorWrapper columns={defaultColumns} showWarning={false} />,
};

export const WithExtraContent: Story = {
  render: () => (
    <ColumnSelectorWrapper
      columns={defaultColumns}
      extraContent={<div style={{ padding: 8, background: '#f5f5f5', borderRadius: 4 }}>Additional settings here</div>}
    />
  ),
};

export const EmptyColumns: Story = {
  render: () => <ColumnSelectorWrapper columns={[]} />,
};
