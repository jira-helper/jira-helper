import React from 'react';
import { Empty } from 'antd';
import { SwimlaneSettingRow } from './SwimlaneSettingRow';
import type { SwimlaneSettings, Swimlane, SwimlaneSetting } from '../../types';

export interface SwimlaneLimitsTableProps {
  swimlanes: Swimlane[];
  settings: SwimlaneSettings;
  onChange: (swimlaneId: string, update: Partial<SwimlaneSetting>) => void;
  disabled?: boolean;
}

const gridStyles: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr auto',
  gap: '8px 16px',
  alignItems: 'center',
};

const labelStyles: React.CSSProperties = {
  wordBreak: 'break-word',
};

export const SwimlaneLimitsTable: React.FC<SwimlaneLimitsTableProps> = ({
  swimlanes,
  settings,
  onChange,
  disabled,
}) => {
  if (swimlanes.length === 0) {
    return <Empty description="No swimlanes configured" data-testid="swimlane-limits-empty" />;
  }

  return (
    <div data-testid="swimlane-limits-table" style={gridStyles}>
      {swimlanes.map(swimlane => (
        <React.Fragment key={swimlane.id}>
          <span style={labelStyles}>{swimlane.name}</span>
          <SwimlaneSettingRow
            swimlane={swimlane}
            setting={settings[swimlane.id] ?? { columns: [] }}
            onChange={update => onChange(swimlane.id, update)}
            disabled={disabled}
          />
        </React.Fragment>
      ))}
    </div>
  );
};
