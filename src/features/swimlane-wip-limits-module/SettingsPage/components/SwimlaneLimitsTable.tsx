import React from 'react';
import { Empty } from 'antd';
import { SwimlaneSettingRow } from './SwimlaneSettingRow';
import type { SwimlaneSettings, Swimlane, SwimlaneSetting } from '../../types';
import type { IssueTypeSelectorTexts } from 'src/shared/components/IssueTypeSelector';

export interface SwimlaneLimitsTableProps {
  swimlanes: Swimlane[];
  settings: SwimlaneSettings;
  onChange: (swimlaneId: string, update: Partial<SwimlaneSetting>) => void;
  disabled?: boolean;
  texts?: IssueTypeSelectorTexts;
}

const gridStyles: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'auto 1fr',
  gap: '12px 16px',
  alignItems: 'start',
};

const labelStyles: React.CSSProperties = {
  wordBreak: 'break-word',
  paddingTop: 5,
  fontWeight: 500,
};

export const SwimlaneLimitsTable: React.FC<SwimlaneLimitsTableProps> = ({
  swimlanes,
  settings,
  onChange,
  disabled,
  texts,
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
            texts={texts}
          />
        </React.Fragment>
      ))}
    </div>
  );
};
