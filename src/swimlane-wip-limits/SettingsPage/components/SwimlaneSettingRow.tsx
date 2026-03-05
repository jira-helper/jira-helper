import React from 'react';
import { InputNumber } from 'antd';
import type { SwimlaneSetting, Swimlane } from '../../types';

export interface SwimlaneSettingRowProps {
  swimlane: Swimlane;
  setting: SwimlaneSetting;
  onChange: (update: Partial<SwimlaneSetting>) => void;
  disabled?: boolean;
}

/**
 * Строка настройки лимита для одного swimlane.
 */
export const SwimlaneSettingRow: React.FC<SwimlaneSettingRowProps> = ({ swimlane, setting, onChange, disabled }) => {
  const handleLimitChange = (value: number | null) => {
    onChange({ limit: value ?? undefined });
  };

  return (
    <div data-testid={`swimlane-row-${swimlane.id}`}>
      <InputNumber
        min={0}
        value={setting.limit}
        onChange={handleLimitChange}
        disabled={disabled}
        data-testid="limit-input"
        placeholder="—"
        style={{ width: 80 }}
      />
    </div>
  );
};
