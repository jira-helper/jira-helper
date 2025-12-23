import React from 'react';
import { Checkbox, InputNumber, Alert, Space, Typography } from 'antd';
import { useGetTextsByLocale } from 'src/shared/texts';
import { useAdditionalCardElementsBoardPropertyStore } from '../stores/additionalCardElementsBoardProperty';

const { Text } = Typography;

const TEXTS = {
  title: {
    en: 'Days in Column Badge',
    ru: 'Бейдж "Дней в колонке"',
  },
  enable: {
    en: 'Show days in column badge',
    ru: 'Показывать бейдж с днями в колонке',
  },
  warningThreshold: {
    en: 'Warning (yellow) after days:',
    ru: 'Предупреждение (жёлтый) после дней:',
  },
  dangerThreshold: {
    en: 'Danger (red) after days:',
    ru: 'Опасность (красный) после дней:',
  },
  thresholdHint: {
    en: 'Leave empty for no highlighting',
    ru: 'Оставьте пустым, чтобы не подсвечивать',
  },
  invalidThresholds: {
    en: 'Warning: "Danger" threshold is less than or equal to "Warning" threshold. The badge might not work as expected.',
    ru: 'Внимание: порог "Опасность" меньше или равен порогу "Предупреждение". Бейдж может работать не так, как ожидается.',
  },
} as const;

export const DaysInColumnSettings: React.FC = () => {
  const texts = useGetTextsByLocale(TEXTS);
  const { data, actions } = useAdditionalCardElementsBoardPropertyStore();
  const { daysInColumn } = data;

  const handleEnabledChange = (checked: boolean) => {
    actions.setDaysInColumn({ enabled: checked });
  };

  const handleWarningThresholdChange = (value: number | null) => {
    actions.setDaysInColumn({ warningThreshold: value ?? undefined });
  };

  const handleDangerThresholdChange = (value: number | null) => {
    actions.setDaysInColumn({ dangerThreshold: value ?? undefined });
  };

  const hasInvalidThresholds =
    daysInColumn.warningThreshold !== undefined &&
    daysInColumn.dangerThreshold !== undefined &&
    daysInColumn.dangerThreshold <= daysInColumn.warningThreshold;

  return (
    <div style={{ marginBottom: '24px' }}>
      <h3 style={{ marginBottom: '12px' }}>{texts.title}</h3>

      <Checkbox
        checked={daysInColumn.enabled}
        onChange={e => handleEnabledChange(e.target.checked)}
        data-testid="days-in-column-enabled-checkbox"
        style={{ marginBottom: '12px' }}
      >
        {texts.enable}
      </Checkbox>

      {daysInColumn.enabled && (
        <div style={{ marginLeft: '24px' }}>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <div>
              <Text>{texts.warningThreshold}</Text>
              <InputNumber
                min={1}
                value={daysInColumn.warningThreshold}
                onChange={handleWarningThresholdChange}
                placeholder=""
                data-testid="days-in-column-warning-threshold"
                style={{ marginLeft: '8px', width: '80px' }}
              />
              <Text type="secondary" style={{ marginLeft: '8px', fontSize: '12px' }}>
                {texts.thresholdHint}
              </Text>
            </div>

            <div>
              <Text>{texts.dangerThreshold}</Text>
              <InputNumber
                min={1}
                value={daysInColumn.dangerThreshold}
                onChange={handleDangerThresholdChange}
                placeholder=""
                data-testid="days-in-column-danger-threshold"
                style={{ marginLeft: '8px', width: '80px' }}
              />
              <Text type="secondary" style={{ marginLeft: '8px', fontSize: '12px' }}>
                {texts.thresholdHint}
              </Text>
            </div>

            {hasInvalidThresholds && (
              <Alert
                type="warning"
                message={texts.invalidThresholds}
                showIcon
                data-testid="days-in-column-invalid-thresholds-warning"
              />
            )}
          </Space>
        </div>
      )}
    </div>
  );
};
