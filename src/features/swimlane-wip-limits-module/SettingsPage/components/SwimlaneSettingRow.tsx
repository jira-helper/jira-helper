/* eslint-disable local/no-inline-styles -- Legacy inline styles; migrate to CSS classes when touching this file. */
import React, { useCallback } from 'react';
import { InputNumber } from 'antd';
import { IssueTypeSelector } from 'src/shared/components/IssueTypeSelector';
import type { IssueTypeSelectorTexts } from 'src/shared/components/IssueTypeSelector';
import type { SwimlaneSetting, Swimlane } from '../../types';

export interface SwimlaneSettingRowProps {
  swimlane: Swimlane;
  setting: SwimlaneSetting;
  onChange: (update: Partial<SwimlaneSetting>) => void;
  disabled?: boolean;
  texts?: IssueTypeSelectorTexts;
}

/**
 * Строка настройки лимита для одного swimlane.
 *
 * Layout:
 *   [ InputNumber ]  [ ☑ Count all issue types ]
 *                    [ expanded selector area   ]
 */
export const SwimlaneSettingRow: React.FC<SwimlaneSettingRowProps> = ({
  swimlane,
  setting,
  onChange,
  disabled,
  texts,
}) => {
  const handleLimitChange = (value: number | null) => {
    onChange({ limit: value ?? undefined });
  };

  const handleIssueTypesChange = useCallback(
    (selectedTypes: string[], countAllTypes: boolean) => {
      onChange({ includedIssueTypes: countAllTypes ? undefined : selectedTypes });
    },
    [onChange]
  );

  const countAllTypes = !setting.includedIssueTypes || setting.includedIssueTypes.length === 0;

  return (
    <div data-testid={`swimlane-row-${swimlane.id}`} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
      <InputNumber
        min={0}
        value={setting.limit}
        onChange={handleLimitChange}
        disabled={disabled}
        data-testid="limit-input"
        placeholder="—"
        style={{ width: 80, flexShrink: 0 }}
      />
      <IssueTypeSelector
        groupId={swimlane.id}
        selectedTypes={setting.includedIssueTypes ?? []}
        initialCountAllTypes={countAllTypes}
        onSelectionChange={handleIssueTypesChange}
        texts={texts}
      />
    </div>
  );
};
